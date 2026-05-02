import { useEffect, useState } from "react";
import { Check, X, Trash2, Loader2, FileText } from "lucide-react";
import API_BASE from "@/lib/config";

const API_REQ = `${API_BASE}/requests/`;

type Request = {
  id: number;
  employee_id?: string;
  employee_name: string;
  employee_position: string;
  site_name: string;
  type: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

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
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_REQ);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); }
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
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={filterStatus === status
              ? { background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" }
              : { background: "#1e2535", color: "#64748b" }}>
            {status} {status === "All" ? `(${requests.length})` : status === "Pending" ? `(${requests.filter(r => r.status === "Pending").length})` : status === "Approved" ? `(${requests.filter(r => r.status === "Approved").length})` : `(${requests.filter(r => r.status === "Rejected").length})`}
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
                    {["Employee", "Position", "Site", "Details", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reqs.map(r => (
                    <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-white">{r.employee_name}</p>
                        {r.employee_id && <p className="text-xs" style={{ color: "#64748b" }}>{r.employee_id}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "#64748b" }}>{r.employee_position}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "rgba(255,127,80,0.15)", color: "#ff7f50" }}>
                          {r.site_name || "Unassigned"}
                        </span>
                      </td>
                      <td className="max-w-xs whitespace-pre-wrap px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.type}</td>
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

    </div>
  );
};

export default Requests;
