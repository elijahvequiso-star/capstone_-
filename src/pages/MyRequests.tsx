import { useEffect, useState } from "react";
import { Trash2, Loader2, Plus, FileText } from "lucide-react";
import API_BASE from "@/lib/config";

const API_REQ = `${API_BASE}/requests/`;
const API_EMP = `${API_BASE}/employees/`;
const REQUEST_TYPES = ["Equipment", "Material", "Leave", "Budget", "Other"];

type Request = {
  id: number;
  employee: number;
  employee_name: string;
  type: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const badge = (s: string) => {
  if (s === "Approved") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (s === "Rejected") return { background: "rgba(239,68,68,0.15)", color: "#ef4444" };
  return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const MyRequests = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [requests, setRequests] = useState<Request[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: REQUEST_TYPES[0], date: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Get employee ID matching this user's full name
      const eRes = await fetch(API_EMP);
      const employees = await eRes.json();
      const me = Array.isArray(employees)
        ? employees.find((e: any) => e.name === user.full_name)
        : null;
      if (me) setEmployeeId(me.id);

      // Get requests filtered by employee name
      const rRes = await fetch(API_REQ);
      const data = await rRes.json();
      setRequests(
        Array.isArray(data)
          ? data.filter((r: Request) => r.employee_name === user.full_name)
          : []
      );
    } catch { setRequests([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setSaving(true);
    try {
      await fetch(API_REQ, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: employeeId,
          type: form.type,
          date: form.date,
          status: "Pending",
        }),
      });
      await fetchAll();
      setForm({ type: REQUEST_TYPES[0], date: "" });
      setShowModal(false);
    } catch { }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this request?")) return;
    await fetch(`${API_REQ}${id}/`, { method: "DELETE" });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Requests</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {requests.length} total · {pending} pending · {approved} approved
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: requests.filter(r => r.status === "Pending").length, color: "#eab308", bg: "rgba(234,179,8,0.15)" },
          { label: "Approved", value: requests.filter(r => r.status === "Approved").length, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
          { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={card}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Requests list */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
            <p style={{ color: "#475569" }}>No requests yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "#1e2535" }}>
                {["Type", "Date", "Status", "Action"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                  <td className="px-5 py-3 text-sm font-medium text-white">{r.type}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.date}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={badge(r.status)}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "Pending" && (
                      <button onClick={() => handleDelete(r.id)}
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
            <h2 className="mb-5 font-bold text-white text-lg">New Request</h2>
            {!employeeId && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                Your employee profile was not found. Contact your HR.
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Request Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Date</label>
                <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || !employeeId}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Submitting..." : "Submit Request"}
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

export default MyRequests;
