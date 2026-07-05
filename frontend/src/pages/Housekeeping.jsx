import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../api/housekeeping";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  "in-progress": "bg-[#1E6F8E]/10 text-[#1E6F8E] border border-[#1E6F8E]/20",
  done: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const PRIORITY_STYLES = {
  low: "bg-gray-100 text-gray-500 border border-gray-200",
  normal: "bg-[#1E6F8E]/10 text-[#1E6F8E] border border-[#1E6F8E]/20",
  high: "bg-red-50 text-red-600 border border-red-200",
};

const EMPTY_FORM = {
  roomNumber: "",
  taskType: "cleaning",
  assignedTo: "",
  priority: "normal",
  notes: "",
  dueDate: "",
};

export default function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setFetching(true);
    try {
      const d = await getTasks();
      setTasks(d.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createTask(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id, status) {
    try {
      await updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status } : t))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const filtered = tasks.filter((t) => {
    const ms = filterStatus === "all" || t.status === filterStatus;
    const mp = filterPriority === "all" || t.priority === filterPriority;
    return ms && mp;
  });

  const counts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Property Management
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Housekeeping
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Oversee cleaning schedules, assign tasks to staff, and monitor room readiness.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={showForm ? "M18 6 6 18M6 6l12 12" : "M12 5v14M5 12h14"} />
              </svg>
              {showForm ? "Cancel Assignment" : "Assign Task"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.06)] border border-[#D9B77A]/20 transition-all duration-500 ease-out animate-[acg-fade-up_0.5s_ease_forwards]">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-[24px] font-bold text-[#17384F] font-display">New Assignment</h3>
                <p className="text-[#17384F]/60 text-[14px] mt-1">Create a new housekeeping or maintenance task.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div>
                    <label className={labelCls}>Room Number</label>
                    <input name="roomNumber" value={form.roomNumber} onChange={handleChange} required placeholder="e.g. 101" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Task Type</label>
                    <select name="taskType" value={form.taskType} onChange={handleChange} className={inputCls}>
                      {["cleaning", "inspection", "maintenance", "turndown"].map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Assigned Staff</label>
                    <input name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="Staff Name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Target Completion</label>
                    <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Special Instructions</label>
                    <input name="notes" value={form.notes} onChange={handleChange} placeholder="Add notes here..." className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-4 pt-8 border-t border-[#17384F]/5">
                  <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#D9B77A] to-[#c4a162] text-white px-10 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(217,183,122,0.3)] transition-all disabled:opacity-50 hover:-translate-y-0.5">
                    {loading ? "Assigning..." : "Assign Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dashboard & Filters */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex gap-4">
            {Object.entries(counts).map(([s, n]) => (
              <div key={s} className={`rounded-xl px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider ${STATUS_STYLES[s]}`}>
                {n} {s.replace("-", " ")}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#F8F7F4] rounded-full p-1 border border-[#17384F]/5">
              {["all", "pending", "in-progress", "done"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                    filterStatus === s
                      ? "bg-[#17384F] text-white shadow-md"
                      : "text-[#17384F]/50 hover:text-[#17384F]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#F8F7F4] border border-[#17384F]/5 rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
            <h3 className="text-[20px] font-bold text-[#17384F] font-display">Task Ledger</h3>
            <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
              {filtered.length} total assignment{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#17384F]/10 bg-white">
                  <th className={thCls}>Room / Task</th>
                  <th className={thCls}>Assigned To</th>
                  <th className={thCls}>Priority</th>
                  <th className={thCls}>Target Date</th>
                  <th className={thCls}>Details</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17384F]/5">
                {fetching ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-16 text-center">
                      <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                        <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin"></div>
                        Fetching tasks...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-16 text-center">
                      <p className="text-[15px] text-[#17384F]/40 font-medium">No tasks found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-[#F8F7F4]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[#17384F] text-[15px]">Room {t.roomNumber}</span>
                          <span className="text-[12px] font-bold uppercase tracking-wider text-[#1E6F8E]">{t.taskType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] text-[#17384F] font-medium">{t.assignedTo || <span className="text-[#17384F]/30 italic">Unassigned</span>}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${PRIORITY_STYLES[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[14px] text-[#17384F] font-medium">{formatDate(t.dueDate)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] text-[#17384F]/50 max-w-xs block truncate" title={t.notes}>{t.notes || "—"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {t.status === "pending" && (
                            <button onClick={() => handleStatus(t._id, "in-progress")} className="text-[10px] font-bold uppercase tracking-widest text-[#1E6F8E] border border-[#1E6F8E]/20 bg-[#1E6F8E]/5 hover:bg-[#1E6F8E] hover:text-white px-3 py-1.5 rounded-lg transition-all">
                              Start Task
                            </button>
                          )}
                          {t.status === "in-progress" && (
                            <button onClick={() => handleStatus(t._id, "done")} className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-all">
                              Complete
                            </button>
                          )}
                          <button onClick={() => handleDelete(t._id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            Drop
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

const labelCls = "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls = "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all appearance-none";
const thCls = "px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";
