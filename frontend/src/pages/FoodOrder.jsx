import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import FoodOrderTable from "../components/FoodOrderTable";
import AddFoodOrderModal from "../components/AddFoodOrderModal";
import {
  getFoodOrders,
  createFoodOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteFoodOrder,
} from "../api/foodorder";

export default function FoodOrder() {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setFetching(true);
    setError("");
    try {
      const res = await getFoodOrders();
      setOrders(res.data || res.foodOrders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  const handleCreateOrder = async (orderData) => {
    setLoading(true);
    setError("");
    try {
      await createFoodOrder(orderData);
      setShowModal(false);
      setSuccessMsg("Food order created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
    } fontally: {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setError("");
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus: status } : o))
      );
      setSuccessMsg("Order status updated!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePayment = async (id, paymentStatus) => {
    setError("");
    try {
      await updatePaymentStatus(id, paymentStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, paymentStatus } : o))
      );
      setSuccessMsg("Payment status updated!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food order?")) return;
    setError("");
    try {
      await deleteFoodOrder(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setSuccessMsg("Food order deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guestName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.orderStatus === filterStatus;

    const matchesPayment =
      filterPayment === "all" || order.paymentStatus === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Dynamic Dashboard Card Counts
  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "Pending").length,
    preparing: orders.filter((o) => o.orderStatus === "Preparing").length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Room Service & Dining
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Food Orders
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Manage room service orders, track preparation status, and handle guest dining billings.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowModal(true);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Food Order
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {successMsg}
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#17384F]/50">
              Total Orders
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.total}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">All logged orders</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              Pending Orders
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.pending}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">Awaiting prep</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E6F8E]">
              Preparing Orders
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.preparing}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">In kitchen</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
              Delivered Orders
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.delivered}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">Completed</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by Room Number or Guest Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending">Payment Pending</option>
              <option value="Paid">Payment Paid</option>
            </select>
          </div>
        </div>

        {/* Table Component */}
        <FoodOrderTable
          orders={filteredOrders}
          fetching={fetching}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
          onDeleteOrder={handleDeleteOrder}
        />

        {/* Add Food Order Modal */}
        {showModal && (
          <AddFoodOrderModal
            onClose={() => setShowModal(false)}
            onSubmit={handleCreateOrder}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
