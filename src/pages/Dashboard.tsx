import { useEffect, useState } from "react";
import { Users, FileText, DollarSign, MapPin, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE from "@/lib/config";

const COLORS = ["#ff7f50", "#3b82f6", "#22c55e", "#a855f7", "#eab308", "#ef4444", "#06b6d4"];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eRes, sRes, rRes, salRes] = await Promise.all([
          fetch(`${API_BASE}/employees/`), fetch(`${API_BASE}/sites/`),
          fetch(`${API_BASE}/requests/`), fetch(`${API_BASE}/salary/`),
        ]);
        const [e, s, r, sal] = await Promise.all([eRes.json(), sRes.json(), rRes.json(), salRes.json()]);
        setEmployees(Array.isArray(e) ? e : []);
        setSites(Array.isArray(s) ? s : []);
        setRequests(Array.isArray(r) ? r : []);
        setSalaries(Array.isArray(sal) ? sal : []);
      } catch { }
      setLoading(false);
    };
    fetchAll();
  }, [location.key]); // re-fetch every time dashboard is navigated to

  const totalSalary = salaries.reduce((s, e) => s + Number(e?.computed_salary ?? 0), 0);
  const pendingRequests = requests.filter(r => r.status === "Pending").length;

  // Employees per site (for bar chart)
  const empPerSite = sites.map(s => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    employees: employees.filter(e => e.site === s.id).length,
  }));
  // Add unassigned
  const unassigned = employees.filter(e => !e.site).length;
  if (unassigned > 0) empPerSite.push({ name: "Unassigned", employees: unassigned });

  // Salary per site (for pie chart)
  const salPerSite = sites.map(s => {
    const siteEmps = employees.filter(e => e.site === s.id).map(e => e.id);
    const total = salaries.filter(sal => siteEmps.includes(sal.employee)).reduce((sum, sal) => sum + Number(sal?.computed_salary ?? 0), 0);
    return { name: s.name, value: total };
  }).filter(s => s.value > 0);

  const s = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px", padding: "24px" };

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{ color: "#64748b" }}>
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
        <p>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{isAdmin ? "Admin Dashboard" : "HR Panel"}</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{
          background: isAdmin ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
          color: isAdmin ? "#ef4444" : "#22c55e",
          border: `1px solid ${isAdmin ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
        }}>
          {isAdmin ? "🔴 Admin" : "🟢 HR Panel"}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Employees", value: employees.length, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
          { label: "Total Sites", value: sites.length, icon: MapPin, color: "#ff7f50", bg: "rgba(255,127,80,0.15)" },
          { label: "Pending Requests", value: pendingRequests, icon: Clock, color: "#eab308", bg: "rgba(234,179,8,0.15)" },
          { label: "Total Salary", value: `₱${totalSalary.toLocaleString()}`, icon: DollarSign, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
        ].map(card => (
          <div key={card.label} className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:scale-[1.02]" style={s}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: card.bg }}>
              <card.icon className="h-6 w-6" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#64748b" }}>{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Employees per site bar chart */}
        <div style={s}>
          <h3 className="font-semibold text-white mb-5">Employees per Site</h3>
          {empPerSite.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "#475569" }}>No site data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={empPerSite}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: "8px", color: "#e2e8f0" }} />
                <Bar dataKey="employees" fill="#ff7f50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Salary per site pie chart */}
        <div style={s}>
          <h3 className="font-semibold text-white mb-5">Salary Distribution by Site</h3>
          {salPerSite.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: "#475569" }}>No salary data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={salPerSite} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {salPerSite.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₱${Number(v).toLocaleString()}`}
                  contentStyle={{ background: "#161b27", border: "1px solid #1e2535", borderRadius: "8px", color: "#e2e8f0" }} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sites overview */}
      <div style={s}>
        <h3 className="font-semibold text-white mb-4">Sites Overview</h3>
        {sites.length === 0 ? (
          <p className="text-center py-6 text-sm" style={{ color: "#475569" }}>No sites yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map(site => {
              const siteEmps = employees.filter(e => e.site === site.id);
              const siteSalTotal = salaries.filter(sal => siteEmps.map(e => e.id).includes(sal.employee))
                .reduce((sum, sal) => sum + Number(sal.computed_salary), 0);
              const sitePending = requests.filter(r => r.site === site.id && r.status === "Pending").length;
              return (
                <div key={site.id} className="rounded-xl p-4" style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white text-sm">{site.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={
                      site.status === "Active" ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } :
                      site.status === "Ongoing" ? { background: "rgba(234,179,8,0.15)", color: "#eab308" } :
                      { background: "rgba(59,130,246,0.15)", color: "#3b82f6" }
                    }>{site.status}</span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: "#64748b" }}>{site.location}</p>
                  <div className="flex justify-between mt-3 text-xs" style={{ color: "#475569" }}>
                    <span>{siteEmps.length} employees</span>
                    <span>{sitePending} pending</span>
                    <span style={{ color: "#22c55e" }}>₱{siteSalTotal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div style={s}>
        <h3 className="font-semibold text-white mb-4">Recent Requests</h3>
        {requests.length === 0 ? (
          <p className="text-center py-6 text-sm" style={{ color: "#475569" }}>No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "#0f1117" }}>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0" style={{ color: "#ff7f50" }} />
                  <div>
                    <p className="text-sm font-medium text-white">{r.employee_name}</p>
                    <p className="text-xs" style={{ color: "#475569" }}>{r.type} · {r.site_name || "No site"} · {r.date}</p>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={
                  r.status === "Approved" ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } :
                  r.status === "Rejected" ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" } :
                  { background: "rgba(234,179,8,0.15)", color: "#eab308" }
                }>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
