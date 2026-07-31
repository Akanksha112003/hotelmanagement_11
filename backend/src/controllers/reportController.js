import Guest from "../models/Guest.js";
import Room from "../models/room.js";
import Booking from "../models/Booking.js";
import Checkin from "../models/Checkin.js";
import FoodOrder from "../models/FoodOrder.js";
import Invoice from "../models/Invoice.js";
import HouseKeepingTask from "../models/housekeepingTask.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a Mongoose date range query from query params { period, start, end }.
 * period: "daily" | "weekly" | "monthly" | "yearly"
 * start/end: ISO date strings for custom range.
 */
function buildDateRange(query) {
  const { period, start, end } = query;
  const now = new Date();

  if (start && end) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    return { $gte: s, $lte: e };
  }

  const from = new Date();
  switch (period) {
    case "daily":
      from.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      from.setFullYear(now.getFullYear() - 1);
      from.setHours(0, 0, 0, 0);
      break;
    case "monthly":
    default:
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
  }
  return { $gte: from, $lte: now };
}

// ─── 1. Dashboard Summary ────────────────────────────────────────────────────

/**
 * GET /api/reports/dashboard
 * Master KPI aggregation from all collections.
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalGuests,
      rooms,
      totalBookings,
      activeBookings,
      checkins,
      pendingTasks,
      invoices,
    ] = await Promise.all([
      Guest.countDocuments(),
      Room.find(),
      Booking.countDocuments(),
      Booking.countDocuments({
        bookingStatus: { $in: ["Pending", "Confirmed", "Checked-In"] },
      }),
      Checkin.find(),
      HouseKeepingTask.countDocuments({ status: { $in: ["pending", "in-progress"] } }),
      Invoice.find({ invoiceStatus: { $ne: "Cancelled" } }),
    ]);

    // Room stats
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === "available").length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const reservedRooms = rooms.filter((r) => r.status === "reserved").length;
    const maintenanceRooms = rooms.filter((r) => r.status === "maintenance").length;
    const dirtyRooms = rooms.filter((r) => r.status === "dirty").length;
    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Today's check-ins / check-outs
    const todaysCheckins = checkins.filter(
      (c) =>
        c.checkInDate >= todayStart &&
        c.checkInDate <= todayEnd &&
        c.status === "checked-in"
    ).length;
    const todaysCheckouts = checkins.filter(
      (c) =>
        c.checkOutDate >= todayStart &&
        c.checkOutDate <= todayEnd &&
        c.status === "checked-out"
    ).length;

    // Revenue
    const totalRevenue = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const outstandingPayments = invoices.reduce(
      (sum, i) => sum + (i.balanceAmount || 0),
      0
    );
    const pendingInvoicesCount = invoices.filter(
      (i) => i.paymentStatus !== "Paid"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalGuests,
        totalRooms,
        availableRooms,
        occupiedRooms,
        reservedRooms,
        maintenanceRooms,
        dirtyRooms,
        occupancyRate,
        totalBookings,
        activeBookings,
        todaysCheckins,
        todaysCheckouts,
        pendingHousekeeping: pendingTasks,
        totalRevenue,
        outstandingPayments,
        pendingInvoicesCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 2. Revenue Report ───────────────────────────────────────────────────────

/**
 * GET /api/reports/revenue?period=monthly&start=&end=
 */
export const getRevenueReport = async (req, res, next) => {
  try {
    const dateRange = buildDateRange(req.query);

    const invoices = await Invoice.find({
      issuedAt: dateRange,
      invoiceStatus: { $ne: "Cancelled" },
    })
      .populate("guest", "fullName email")
      .populate("room", "roomNumber type")
      .sort({ issuedAt: 1 });

    const totalRevenue = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const totalAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const outstandingBalance = invoices.reduce(
      (sum, i) => sum + (i.balanceAmount || 0),
      0
    );
    const roomRevenue = invoices.reduce((sum, i) => sum + (i.roomCharges || 0), 0);
    const foodRevenue = invoices.reduce((sum, i) => sum + (i.foodCharges || 0), 0);
    const extraRevenue = invoices.reduce((sum, i) => sum + (i.extraCharges || 0), 0);
    const totalTax = invoices.reduce((sum, i) => sum + (i.taxAmount || 0), 0);
    const totalDiscount = invoices.reduce((sum, i) => sum + (i.discount || 0), 0);

    const avgRevenuePerInvoice =
      invoices.length > 0
        ? Math.round((totalRevenue / invoices.length) * 100) / 100
        : 0;

    // Group by day for trend line
    const dailyMap = {};
    invoices.forEach((inv) => {
      const day = new Date(inv.issuedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyMap[day] = (dailyMap[day] || 0) + (inv.amountPaid || 0);
    });
    const trend = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // Revenue growth: compare current period vs previous equal period
    const periodMs =
      (new Date(dateRange.$lte || new Date()) -
        new Date(dateRange.$gte || new Date())) || 1;
    const prevStart = new Date(new Date(dateRange.$gte).getTime() - periodMs);
    const prevEnd = new Date(dateRange.$gte);
    const previousInvoices = await Invoice.find({
      issuedAt: { $gte: prevStart, $lte: prevEnd },
      invoiceStatus: { $ne: "Cancelled" },
    });
    const prevRevenue = previousInvoices.reduce(
      (sum, i) => sum + (i.amountPaid || 0),
      0
    );
    const revenueGrowth =
      prevRevenue > 0
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
        : null;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalAmount,
        outstandingBalance,
        roomRevenue,
        foodRevenue,
        extraRevenue,
        totalTax,
        totalDiscount,
        avgRevenuePerInvoice,
        revenueGrowth,
        invoiceCount: invoices.length,
        trend,
        invoices: invoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          guestName: i.guest?.fullName || "—",
          roomNumber: i.room?.roomNumber || "—",
          totalAmount: i.totalAmount,
          amountPaid: i.amountPaid,
          balanceAmount: i.balanceAmount,
          paymentStatus: i.paymentStatus,
          invoiceStatus: i.invoiceStatus,
          issuedAt: i.issuedAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 3. Occupancy Report ─────────────────────────────────────────────────────

/**
 * GET /api/reports/occupancy
 */
export const getOccupancyReport = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    const checkins = await Checkin.find({ status: "checked-in" });

    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const available = rooms.filter((r) => r.status === "available").length;
    const reserved = rooms.filter((r) => r.status === "reserved").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const dirty = rooms.filter((r) => r.status === "dirty").length;

    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // By room type
    const typeBreakdown = {};
    rooms.forEach((r) => {
      if (!typeBreakdown[r.type]) {
        typeBreakdown[r.type] = { total: 0, occupied: 0, available: 0 };
      }
      typeBreakdown[r.type].total += 1;
      if (r.status === "occupied") typeBreakdown[r.type].occupied += 1;
      if (r.status === "available") typeBreakdown[r.type].available += 1;
    });

    // Average stay duration from check-ins (in days)
    let totalStayDays = 0;
    let completedStays = 0;
    checkins.forEach((c) => {
      if (c.checkInDate && c.checkOutDate) {
        const diff =
          (new Date(c.checkOutDate) - new Date(c.checkInDate)) /
          (1000 * 60 * 60 * 24);
        if (diff > 0) {
          totalStayDays += diff;
          completedStays++;
        }
      }
    });
    const avgStayDuration =
      completedStays > 0
        ? Math.round((totalStayDays / completedStays) * 10) / 10
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalRooms: total,
        occupied,
        available,
        reserved,
        maintenance,
        dirty,
        occupancyRate,
        typeBreakdown,
        avgStayDuration,
        currentOccupants: checkins.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 4. Booking Report ───────────────────────────────────────────────────────

/**
 * GET /api/reports/bookings?period=monthly&start=&end=
 */
export const getBookingReport = async (req, res, next) => {
  try {
    const dateRange = buildDateRange(req.query);

    const bookings = await Booking.find({ createdAt: dateRange })
      .populate("guest", "fullName email phone")
      .populate("room", "roomNumber type pricePerNight")
      .sort({ createdAt: -1 });

    const total = bookings.length;
    const pending = bookings.filter((b) => b.bookingStatus === "Pending").length;
    const confirmed = bookings.filter((b) => b.bookingStatus === "Confirmed").length;
    const checkedIn = bookings.filter((b) => b.bookingStatus === "Checked-In").length;
    const cancelled = bookings.filter((b) => b.bookingStatus === "Cancelled").length;
    const completed = bookings.filter((b) => b.bookingStatus === "Completed").length;

    // Source breakdown
    const sourceMap = { "Walk-in": 0, Website: 0, Phone: 0, OTA: 0 };
    bookings.forEach((b) => {
      if (sourceMap[b.bookingSource] !== undefined) {
        sourceMap[b.bookingSource] += 1;
      }
    });

    // Total booking value
    const totalBookingValue = bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );
    const avgBookingValue =
      total > 0 ? Math.round((totalBookingValue / total) * 100) / 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        checkedIn,
        cancelled,
        completed,
        totalBookingValue,
        avgBookingValue,
        sourceBreakdown: sourceMap,
        bookings: bookings.map((b) => ({
          bookingNumber: b.bookingNumber,
          guestName: b.guest?.fullName || "—",
          roomNumber: b.room?.roomNumber || "—",
          roomType: b.room?.type || "—",
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          bookingStatus: b.bookingStatus,
          paymentStatus: b.paymentStatus,
          totalAmount: b.totalAmount,
          bookingSource: b.bookingSource,
          createdAt: b.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 5. Guest Report ─────────────────────────────────────────────────────────

/**
 * GET /api/reports/guests
 */
export const getGuestReport = async (req, res, next) => {
  try {
    const [guests, bookings] = await Promise.all([
      Guest.find().sort({ totalVisits: -1 }),
      Booking.find().populate("guest", "fullName"),
    ]);

    const totalGuests = guests.length;
    const returningGuests = guests.filter((g) => g.totalVisits > 1).length;
    const newGuests = guests.filter((g) => g.totalVisits <= 1).length;

    // Top 10 guests by visits
    const topGuests = guests.slice(0, 10).map((g) => ({
      fullName: g.fullName,
      email: g.email,
      totalVisits: g.totalVisits,
      totalSpent: g.totalSpent,
      nationality: g.nationality,
      lastStayDate: g.lastStayDate,
    }));

    // Nationality breakdown
    const nationalityMap = {};
    guests.forEach((g) => {
      const nat = g.nationality || "Unknown";
      nationalityMap[nat] = (nationalityMap[nat] || 0) + 1;
    });

    // Average stay duration from bookings
    let totalDays = 0;
    let bookingCount = 0;
    bookings.forEach((b) => {
      if (b.checkInDate && b.checkOutDate) {
        const days =
          (new Date(b.checkOutDate) - new Date(b.checkInDate)) /
          (1000 * 60 * 60 * 24);
        if (days > 0) {
          totalDays += days;
          bookingCount++;
        }
      }
    });
    const avgStayDuration =
      bookingCount > 0 ? Math.round((totalDays / bookingCount) * 10) / 10 : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalGuests,
        returningGuests,
        newGuests,
        avgStayDuration,
        topGuests,
        nationalityBreakdown: nationalityMap,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 6. Food Sales Report ────────────────────────────────────────────────────

/**
 * GET /api/reports/food?period=monthly&start=&end=
 */
export const getFoodReport = async (req, res, next) => {
  try {
    const dateRange = buildDateRange(req.query);

    const orders = await FoodOrder.find({ createdAt: dateRange });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (o) => o.orderStatus === "Delivered"
    ).length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === "Cancelled"
    ).length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingPayments = orders
      .filter((o) => o.paymentStatus === "Pending" && o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Top items by order count
    const itemMap = {};
    orders.forEach((order) => {
      (order.orderedItems || []).forEach((item) => {
        if (!itemMap[item.itemName]) {
          itemMap[item.itemName] = { count: 0, revenue: 0 };
        }
        itemMap[item.itemName].count += item.quantity;
        itemMap[item.itemName].revenue += item.quantity * item.price;
      });
    });
    const topItems = Object.entries(itemMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        pendingPayments,
        topItems,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 7. Payment Report ───────────────────────────────────────────────────────

/**
 * GET /api/reports/payments?period=monthly&start=&end=
 */
export const getPaymentReport = async (req, res, next) => {
  try {
    const dateRange = buildDateRange(req.query);

    const [invoices, foodOrders] = await Promise.all([
      Invoice.find({
        issuedAt: dateRange,
        invoiceStatus: { $ne: "Cancelled" },
      }),
      FoodOrder.find({ createdAt: dateRange, paymentStatus: "Paid" }),
    ]);

    // Invoice payment breakdown by method
    const methodMap = { Cash: 0, Card: 0, UPI: 0, "Bank Transfer": 0 };

    // From invoice primary payment method (amountPaid)
    invoices.forEach((inv) => {
      const method = inv.paymentMethod || "Cash";
      if (methodMap[method] !== undefined) {
        // Also account for payment transactions array
        if (inv.payments && inv.payments.length > 0) {
          inv.payments.forEach((p) => {
            const pm = p.paymentMethod || "Cash";
            methodMap[pm] = (methodMap[pm] || 0) + (p.amount || 0);
          });
        } else {
          methodMap[method] += inv.amountPaid || 0;
        }
      }
    });

    // Food order payments (simple Cash assumed if no method stored)
    const foodRevenue = foodOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    const totalCollected = invoices.reduce(
      (sum, i) => sum + (i.amountPaid || 0),
      0
    );
    const totalOutstanding = invoices.reduce(
      (sum, i) => sum + (i.balanceAmount || 0),
      0
    );
    const paidInvoices = invoices.filter((i) => i.paymentStatus === "Paid").length;
    const partialInvoices = invoices.filter(
      (i) => i.paymentStatus === "Partial"
    ).length;
    const pendingInvoices = invoices.filter(
      (i) => i.paymentStatus === "Pending"
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalCollected,
        totalOutstanding,
        foodRevenue,
        paidInvoices,
        partialInvoices,
        pendingInvoices,
        methodBreakdown: methodMap,
        totalInvoices: invoices.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── 8. Housekeeping Report ──────────────────────────────────────────────────

/**
 * GET /api/reports/housekeeping
 */
export const getHousekeepingReport = async (req, res, next) => {
  try {
    const tasks = await HouseKeepingTask.find().sort({ createdAt: -1 });

    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;

    // Priority breakdown
    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const normalPriority = tasks.filter((t) => t.priority === "normal").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;

    // Task type breakdown
    const typeMap = { cleaning: 0, inspection: 0, maintenance: 0, turndown: 0 };
    tasks.forEach((t) => {
      if (typeMap[t.taskType] !== undefined) typeMap[t.taskType] += 1;
    });

    // Average completion time (in hours) for done tasks
    let totalHours = 0;
    let doneWithTime = 0;
    tasks
      .filter((t) => t.status === "done" && t.createdAt && t.updatedAt)
      .forEach((t) => {
        const diff =
          (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        if (diff > 0) {
          totalHours += diff;
          doneWithTime++;
        }
      });
    const avgCompletionHours =
      doneWithTime > 0 ? Math.round((totalHours / doneWithTime) * 10) / 10 : 0;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        done,
        completionRate,
        avgCompletionHours,
        highPriority,
        normalPriority,
        lowPriority,
        typeBreakdown: typeMap,
        tasks: tasks.slice(0, 50).map((t) => ({
          roomNumber: t.roomNumber,
          taskType: t.taskType,
          status: t.status,
          priority: t.priority,
          assignedTo: t.assignedTo,
          dueDate: t.dueDate,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
