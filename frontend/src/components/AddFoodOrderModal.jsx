import { useState } from "react";

const labelCls = "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls = "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all";

export default function AddFoodOrderModal({ onClose, onSubmit, loading, error }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [items, setItems] = useState([
    { itemName: "", quantity: 1, price: "" },
  ]);
  const [formError, setFormError] = useState("");

  const handleAddItem = () => {
    setItems((prev) => [...prev, { itemName: "", quantity: 1, price: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setFormError("At least one food item is required");
      return;
    }
    setFormError("");
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setFormError("");
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.price) || 0;
      return sum + q * p;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!roomNumber.trim() || !guestName.trim()) {
      setFormError("Room number and guest name are required.");
      return;
    }

    if (items.length === 0) {
      setFormError("Please add at least one item to the order.");
      return;
    }

    const formattedItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const qty = Number(item.quantity);
      const prc = Number(item.price);

      if (!item.itemName.trim()) {
        setFormError(`Item #${i + 1} name is required.`);
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        setFormError(`Item #${i + 1} quantity must be greater than 0.`);
        return;
      }
      if (isNaN(prc) || prc < 0) {
        setFormError(`Item #${i + 1} price cannot be negative.`);
        return;
      }

      formattedItems.push({
        itemName: item.itemName.trim(),
        quantity: qty,
        price: prc,
      });
    }

    onSubmit({
      roomNumber: roomNumber.trim(),
      guestName: guestName.trim(),
      orderedItems: formattedItems,
      orderStatus,
      paymentStatus,
      remarks: remarks.trim(),
    });
  };

  const totalAmount = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-3xl w-full shadow-[0_20px_50px_rgba(23,56,79,0.2)] border border-[#D9B77A]/20 transition-all duration-300 animate-[acg-fade-up_0.4s_ease_forwards] my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[24px] font-bold text-[#17384F] font-display">New Food Order</h3>
            <p className="text-[#17384F]/60 text-[14px] mt-1">Create room service or restaurant order for guest.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#17384F]/5 hover:bg-[#17384F]/10 text-[#17384F] flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-[14px] font-medium mb-6">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Room Number & Guest Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Room Number</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Guest Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Initial Status selections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className={inputCls}
              >
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={inputCls}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelCls}>Ordered Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[12px] font-bold text-[#1E6F8E] hover:text-[#17384F] flex items-center gap-1 transition-all"
              >
                + Add Item
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center bg-[#F8F7F4] p-3 rounded-2xl border border-[#17384F]/5"
                >
                  <div className="col-span-5 md:col-span-6">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Burger)"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                      required
                      className="w-full bg-white border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      required
                      className="w-full bg-white border border-[#17384F]/10 rounded-xl px-3 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                      required
                      className="w-full bg-white border border-[#17384F]/10 rounded-xl px-3 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Special Instructions / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, deliver at 8:00 PM"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Total display & actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#17384F]/10">
            <div className="text-left">
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60">Total Amount:</span>
              <span className="text-[24px] font-bold text-[#17384F] font-display ml-3">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#D9B77A] to-[#c4a162] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
