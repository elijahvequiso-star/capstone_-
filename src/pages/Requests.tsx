import { useEffect, useState } from "react";
import { Check, X, Trash2, Loader2, Plus, FileText } from "lucide-react";

const API_REQ = "http://localhost:8000/api/requests/";
const API_EMP = "http://localhost:8000/api/employees/";
const API_SITES = "http://localhost:8000/api/sites/";
const REQUEST_TYPES = ["General", "Equipment", "Material", "Budget", "Other"];

type Request = { id: number; employee: number; employee_name: string; site: number | null; site_name: string; type: string; date: string; status: "Pending" | "Approved" | "Rejected" };
type Employee = { id: number; name: string; site_name: string };
type Site = { id: number; name: string };

const statusStyle = (s: string) => {
  if (s === "Approved") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (s === "Rejected") return { background: "rgba(239,68,68,0.15)", color: "#ef4444" };
  return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const Requests = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = user.role === "admin" || user.role === "hr";

  const [requests, setRequests] = useState<Request[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee: "", site: "", type: REQUEST_TYPES[0], date: "" });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, eRes, sRes] = await Promise.all([fetch(API_REQ), fetch(API_EMP), fetch(API_SITES)]);
      setRequests(await rRes.json());
      setEmployees(await eRes.json());
      setSites(await sRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterStatus === "All" ? requests : requests.filter(r => r.status === filterStatus);

  // Group by site
  const grouped: Record<string, Request[]> = {};
  filtered.forEach(r => {
    const key = r.site_name || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch(API_REQ, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee: form.employee, site: form.site || null, type: form.type, date: form.date, status: "Pending" }),
    });
    await fetchAll(); setSaving(false);
    setForm({ employee: "", site: "", type: REQUEST_TYPES[0], date: "" });
    setShowModal(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API_REQ}${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as Request["status"] } : r));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this request?")) return;
    await fetch(`${API_REQ}${id}/`, { method: "DELETE" });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const pending = requests.filter(r => r.status === "Pending").length;

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Requests</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Grouped by site — {pending} pending</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
          <Plus className="h-4 w-4" /> Add Request
        </button>
      </div>

      {/* Stats + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        {["All", "Pending", "Approved", "Rejected"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={filterStatus === s
              ? { background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" }
              : { background: "#1e2535", color: "#64748b" }}>
            {s} {s === "All" ? `(${requests.length})` : s === "Pending" ? `(${requests.filter(r => r.status === "Pending").length})` : s === "Approved" ? `(${requests.filter(r => r.status === "Approved").length})` : `(${requests.filter(r => r.status === "Rejected").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No requests found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([siteName, reqs]) => (
            <div key={siteName} className="rounded-2xl overflow-hidden" style={card}>
              <div className="flex items-center justify-between px-5 py-3" style={{ background: "#1e2535" }}>
                <p className="font-semibold text-white">{siteName}</p>
                <div className="flex gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                    {reqs.filter(r => r.status === "Pending").length} pending
                  </span>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e2535" }}>
                    {["Employee", "Type", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reqs.map(r => (
                    <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                      <td className="px-5 py-3 text-sm font-medium text-white">{r.employee_name}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.type}</td>
                      <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.date}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={statusStyle(r.status)}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {canManage && r.status === "Pending" && <>
                            <button onClick={() => updateStatus(r.id, "Approved")} className="rounded-lg p-1.5 hover:bg-green-500/10" style={{ color: "#22c55e" }} title="Approve"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => updateStatus(r.id, "Rejected")} className="rounded-lg p-1.5 hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Reject"><X className="h-3.5 w-3.5" /></button>
                          </>}
                          <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 font-bold text-white text-lg">Add Request</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Employee</label>
                <select required value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.site_name || "Unassigned"}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Site</label>
                <select value={form.site} onChange={e => setForm({ ...form, site: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <option value="">— No site —</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
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
                <button type="submit" disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Saving..." : "Submit Request"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
