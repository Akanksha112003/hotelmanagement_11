import Checkin from "../models/checkin.js";
import Room from "../models/room.js";
import HouseKeepingTask from "../models/housekeepingTask.js";
import User from "../models/user.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch Base Data
    const [rooms, checkins, housekeepingTasks, users] = await Promise.all([
      Room.find(),
      Checkin.find(),
      HouseKeepingTask.find(),
      User.find({ role: "user" }), // Staff only
    ]);

    // 1. Calculate KPIs
    const todaysCheckins = checkins.filter(
      (c) => c.checkInDate >= today && c.checkInDate < tomorrow && c.status === "checked-in"
    ).length;

    const todaysCheckouts = checkins.filter(
      (c) => c.checkOutDate >= today && c.checkOutDate < tomorrow && c.status === "checked-out"
    ).length;

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Revenue (Mock calculated from occupied rooms price)
    const todaysRevenue = rooms
      .filter((r) => r.status === "occupied")
      .reduce((sum, r) => sum + r.pricePerNight, 0);

    const pendingHousekeeping = housekeepingTasks.filter(
      (t) => t.status === "pending" || t.status === "in-progress"
    ).length;

    const maintenanceRooms = rooms.filter((r) => r.status === "maintenance").length;

    const staffAvailable = users.length; // Simplified mock availability
    const vipGuests = checkins.filter((c) => c.status === "checked-in" && c.numberOfGuests >= 4).length; // Mock VIP logic

    // 2. Calculate Housekeeping Progress
    const calcProgress = (type) => {
      const tasks = housekeepingTasks.filter((t) => t.taskType === type);
      if (tasks.length === 0) return 100;
      const done = tasks.filter((t) => t.status === "done").length;
      return Math.round((done / tasks.length) * 100);
    };

    const housekeepingProgress = {
      cleaning: calcProgress("cleaning"),
      laundry: 85, // Mock default as no laundry schema exists
      inspection: calcProgress("inspection"),
    };

    // 3. Generate Recent Activity Feed (Mix of Checkins & Tasks)
    const recentActivity = [];
    checkins.slice(0, 3).forEach((c) => {
      recentActivity.push({
        id: `chk-${c._id}`,
        type: c.status === "checked-in" ? "check-in" : "reservation",
        title: c.status === "checked-in" ? "Guest Checked In" : "New Reservation",
        room: c.roomNumber,
        timeAgo: "2 hours ago", // Mock relative time
      });
    });
    housekeepingTasks.slice(0, 3).forEach((t) => {
      recentActivity.push({
        id: `tsk-${t._id}`,
        type: t.status === "done" ? "task-done" : "task-pending",
        title: t.status === "done" ? "Housekeeping Completed" : "Maintenance Request",
        room: t.roomNumber,
        timeAgo: "4 hours ago",
      });
    });

    // 4. Generate Alerts
    const activeAlerts = [];
    if (maintenanceRooms > 0) {
      activeAlerts.push(`Maintenance pending for ${maintenanceRooms} rooms`);
    }
    if (vipGuests > 0) {
      activeAlerts.push(`${vipGuests} VIP Guests currently in-house`);
    }
    if (pendingHousekeeping > 5) {
      activeAlerts.push(`High volume of pending housekeeping tasks (${pendingHousekeeping})`);
    }

    // 5. Staff Availability Details
    const staffBreakdown = {
      reception: { online: 2, busy: 1, offDuty: 1 },
      housekeeping: { online: 3, busy: 2, offDuty: 0 },
      managers: { online: 1, busy: 0, offDuty: 1 },
      maintenance: { online: 1, busy: 1, offDuty: 0 },
    };

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          todaysCheckins,
          todaysCheckouts,
          occupancyRate,
          todaysRevenue,
          pendingHousekeeping,
          vipGuests,
          maintenanceRooms,
          staffAvailable,
        },
        housekeepingProgress,
        recentActivity,
        activeAlerts,
        staffBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
