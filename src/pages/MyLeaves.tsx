import { useEffect, useState } from "react";
import { Trash2, Loader2, Plus, CalendarDays } from "lucide-react";
import API_BASE from "@/lib/config";
import { isSameEmployee, mergeEmployeeProfile } from "@/lib/employeeIdentity";

const API_LEAVES = `${API_BASE}/leaves/`;
const API_EMP = `${API_BASE}/employees/`;

type Leave = {
  id: number;
  employee: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const badge = (s: string) => {
  if (s === "Approved") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (s === "Rejected") return { background: "rgba(239,68,68,0.15)", color: "#ef4444" };
  return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const MyLeaves = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const eRes = await fetch(API_EMP);
      const employees = await eRes.json();
      const me = Array.isArray(employees)
        ? employees.find((e: any) => isSameEmployee(e, user))
        : null;
      if (me) {
        setEmployeeId(me.id);
        localStorage.setItem("user", JSON.stringify(mergeEmployeeProfile(user, me)));
      }

      const lRes = await fetch(API_LEAVES);
      const data = await lRes.json();
      setLeaves(
        Array.isArray(data)
          ? data.filter((l: Leave) => l.employee === me?.id || l.employee_name === user.full_name)
          : []
      );
    } catch { setLeaves([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    if (form.end_date < form.start_date) {
      alert("End date cannot be before start date.");
      return;
    }
    setSaving(true);
    try {
      await fetch(API_LEAVES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: employeeId,
          type: form.type,
          start_date: form.start_date,
          end_date: form.end_date,
          status: "Pending",
        }),
      });
      await fetchAll();
      setForm({ type: "", start_date: "", end_date: "" });
      setShowModal(false);
    } catch { }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this leave application?")) return;
    await fetch(`${API_LEAVES}${id}/`, { method: "DELETE" });
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  // Count days between two dates
  const countDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Leaves</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {leaves.length} total · {leaves.filter(l => l.status === "Pending").length} pending
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
          <Plus className="h-4 w-4" /> Apply Leave
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: leaves.filter(l => l.status === "Pending").length, color: "#eab308", bg: "rgba(234,179,8,0.15)" },
          { label: "Approved", value: leaves.filter(l => l.status === "Approved").length, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
          { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={card}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Leaves list */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
            <p style={{ color: "#475569" }}>No leave applications yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "#1e2535" }}>
                {["Details", "Start", "End", "Days", "Status", "Action"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                  <td className="px-5 py-3 text-sm font-medium text-white">{l.type}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{l.start_date}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{l.end_date}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: "#3b82f6" }}>
                    {countDays(l.start_date, l.end_date)}d
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={badge(l.status)}>{l.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {l.status === "Pending" && (
                      <button onClick={() => handleDelete(l.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10"
                        style={{ color: "#ef4444" }} title="Cancel">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 font-bold text-white text-lg">Apply for Leave</h2>
            {!employeeId && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                Your employee profile was not found. Contact your HR.
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Leave Details</label>
                <textarea required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  placeholder="Describe your leave reason in detail"
                  className="min-h-28 w-full resize-y rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Start Date</label>
                  <input required type="date" value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>End Date</label>
                  <input required type="date" value={form.end_date}
                    min={form.start_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                </div>
              </div>
              {/* Days preview */}
              {form.start_date && form.end_date && (
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <p className="text-xs" style={{ color: "#64748b" }}>Duration</p>
                  <p className="text-lg font-bold" style={{ color: "#3b82f6" }}>
                    {countDays(form.start_date, form.end_date)} day{countDays(form.start_date, form.end_date) !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || !employeeId}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  {saving ? "Submitting..." : "Apply Leave"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;
