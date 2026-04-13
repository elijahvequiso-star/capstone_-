import { useEffect, useState } from "react";
import { Check, X, Trash2, Loader2, CalendarDays } from "lucide-react";
import API_BASE from "@/lib/config";

const API_LEAVES = `${API_BASE}/leaves/`;

type Leave = {
  id: number;
  employee_name: string;
  employee_position: string;
  site_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const statusStyle = (s: string) => {
  if (s === "Approved") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (s === "Rejected") return { background: "rgba(239,68,68,0.15)", color: "#ef4444" };
  return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const Leaves = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = user.role === "admin" || user.role === "hr";

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_LEAVES);
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch { setLeaves([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API_LEAVES}${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: status as Leave["status"] } : l));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this leave record?")) return;
    await fetch(`${API_LEAVES}${id}/`, { method: "DELETE" });
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  const filtered = filterStatus === "All" ? leaves : leaves.filter(l => l.status === filterStatus);

  // Group by site
  const grouped: Record<string, Leave[]> = {};
  filtered.forEach(l => {
    const key = l.site_name || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  const countDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div>
        <h1 className="text-2xl font-bold text-white">Leave Management</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          All employee leave applications — {leaves.filter(l => l.status === "Pending").length} pending approval
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: leaves.filter(l => l.status === "Pending").length, color: "#eab308" },
          { label: "Approved", value: leaves.filter(l => l.status === "Approved").length, color: "#22c55e" },
          { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={card}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-3">
        {["All", "Pending", "Approved", "Rejected"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={filterStatus === s
              ? { background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" }
              : { background: "#1e2535", color: "#64748b" }}>
            {s} ({s === "All" ? leaves.length : leaves.filter(l => l.status === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No leave records found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([siteName, records]) => (
            <div key={siteName} className="rounded-2xl overflow-hidden" style={card}>
              {/* Site header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ background: "#1e2535" }}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" style={{ color: "#ff7f50" }} />
                  <p className="font-semibold text-white">{siteName}</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                  {records.filter(l => l.status === "Pending").length} pending
                </span>
              </div>

              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e2535" }}>
                    {["Employee", "Position", "Site", "Leave Type", "Start", "End", "Days", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map(l => (
                    <tr key={l.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{l.employee_name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>{l.employee_position}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: "rgba(255,127,80,0.15)", color: "#ff7f50" }}>
                          {l.site_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#94a3b8" }}>{l.type}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#94a3b8" }}>{l.start_date}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#94a3b8" }}>{l.end_date}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#3b82f6" }}>
                        {countDays(l.start_date, l.end_date)}d
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={statusStyle(l.status)}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canManage && l.status === "Pending" && <>
                            <button onClick={() => updateStatus(l.id, "Approved")}
                              className="rounded-lg p-1.5 hover:bg-green-500/10 transition-colors"
                              style={{ color: "#22c55e" }} title="Approve">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => updateStatus(l.id, "Rejected")}
                              className="rounded-lg p-1.5 hover:bg-red-500/10 transition-colors"
                              style={{ color: "#ef4444" }} title="Reject">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>}
                          <button onClick={() => handleDelete(l.id)}
                            className="rounded-lg p-1.5 hover:bg-red-500/10 transition-colors"
                            style={{ color: "#ef4444" }} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

export default Leaves;
