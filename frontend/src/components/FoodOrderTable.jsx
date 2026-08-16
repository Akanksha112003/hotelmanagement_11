import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

const thCls = "px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";

const ORDER_STATUSES = ["Pending", "Preparing", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Pending", "Paid"];

export default function FoodOrderTable({
  orders,
  fetching,
  onUpdateStatus,
  onUpdatePayment,
  onDeleteOrder,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
      <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Food Order Ledger</h3>
        <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-[#17384F]/10 bg-white">
              <th className={thCls}>Room / Guest</th>
              <th className={thCls}>Ordered Items</th>
              <th className={thCls}>Total Amount</th>
              <th className={thCls}>Order Status</th>
              <th className={thCls}>Payment Status</th>
              <th className={thCls}>Created At</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17384F]/5">
            {fetching ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                    <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin"></div>
                    Fetching food orders...
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <p className="text-[15px] text-[#17384F]/40 font-medium">No food orders found.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-[#F8F7F4]/50 transition-colors group">
                  {/* Room & Guest */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#17384F] text-[15px]">Room {order.roomNumber}</span>
                      <span className="text-[13px] text-[#17384F]/70 font-medium">{order.guestName}</span>
                    </div>
                  </td>

                  {/* Ordered Items */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 max-w-xs">
                      {order.orderedItems && order.orderedItems.length > 0 ? (
                        order.orderedItems.map((item, idx) => (
                          <div key={idx} className="text-[13px] text-[#17384F] flex justify-between gap-3">
                            <span className="font-medium">{item.itemName}</span>
                            <span className="text-[#17384F]/50 font-mono text-[12px]">
                              {item.quantity}x @ ${item.price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[#17384F]/40 italic text-[13px]">No items</span>
                      )}
                      {order.remarks && (
                        <p className="text-[11px] text-[#1E6F8E] italic mt-1" title={order.remarks}>
                          Note: {order.remarks}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="px-6 py-5">
                    <span className="font-bold text-[#17384F] text-[15px] font-display">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* Order Status */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      <OrderStatusBadge status={order.orderStatus} />
                      <select
                        value={order.orderStatus}
                        onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                        className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            Set: {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Payment Status */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      <PaymentStatusBadge status={order.paymentStatus} />
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => onUpdatePayment(order._id, e.target.value)}
                        className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            Set: {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-[#17384F]/60 font-medium">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right space-x-2">

                    <button
                      onClick={() => onDeleteOrder(order._id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
