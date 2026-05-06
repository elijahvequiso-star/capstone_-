import { useEffect, useState } from "react";
import { FileText, CalendarDays, DollarSign, Clock, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE from "@/lib/config";
import { getStoredEmployeeId, isSameEmployee, mergeEmployeeProfile, normalizeEmployeeId } from "@/lib/employeeIdentity";

const card = {
  background: "#161b27",
  border: "1px solid #1e2535",
  borderRadius: "16px",
  padding: "24px",
};

const badge = (status: string) => {
  if (status === "Approved") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (status === "Rejected") return { background: "rgba(239,68,68,0.15)", color: "#ef4444" };
  return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
};

const getDisplayName = (user: any) => {
  const fullName = (user.full_name || "").trim();
  const employeeId = (user.employee_id || user.username || "").trim();
  if (fullName && fullName.toUpperCase() !== employeeId.toUpperCase()) return fullName;
  return user.name || "Employee";
};

const MyDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [employeeProfile, setEmployeeProfile] = useState<any | null>(null);
  const profile = employeeProfile || user;
  const displayName = getDisplayName(profile);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ requests: 0, leaves: 0, netSalary: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rRes, lRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/requests/`),
          fetch(`${API_BASE}/leaves/`),
          fetch(`${API_BASE}/payroll/`),
        ]);
        const [allRequests, allLeaves, allPayroll] = await Promise.all([rRes.json(), lRes.json(), sRes.json()]);
        const employeesRes = await fetch(`${API_BASE}/employees/`);
        const employees = await employeesRes.json();
        const employee = Array.isArray(employees)
          ? employees.find((item: any) => isSameEmployee(item, user))
          : null;
        if (employee) {
          const mergedUser = mergeEmployeeProfile(user, employee);
          localStorage.setItem("user", JSON.stringify(mergedUser));
          setEmployeeProfile(mergedUser);
        }

        const myEmployeeId = normalizeEmployeeId(employee?.employee_id || getStoredEmployeeId(user));
        const requests = Array.isArray(allRequests) ? allRequests.filter((r: any) => normalizeEmployeeId(r.employee_id) === myEmployeeId) : [];
        const leaves = Array.isArray(allLeaves) ? allLeaves.filter((l: any) => normalizeEmployeeId(l.employee_id) === myEmployeeId) : [];
        const payroll = Array.isArray(allPayroll) ? allPayroll.filter((p: any) => normalizeEmployeeId(p.employee_id) === myEmployeeId) : [];

        // Latest week net pay as current salary
        const latestPay = payroll.length > 0
          ? payroll.sort((a: any, b: any) => b.week_start.localeCompare(a.week_start))[0]
          : null;

        const all = [...requests, ...leaves];
        setStats({
          requests: requests.length,
          leaves: leaves.length,
          netSalary: latestPay ? Number(latestPay.net_pay) : 0,
          pending: all.filter(i => i.status === "Pending").length,
          approved: all.filter(i => i.status === "Approved").length,
          rejected: all.filter(i => i.status === "Rejected").length,
        });
        setRecentRequests(requests.slice(0, 3));
        setRecentLeaves(leaves.slice(0, 3));
      } catch { }
    };
    fetchStats();
  }, []);

  const summaryCards = [
    { label: "My Requests", value: stats.requests, icon: FileText, color: "#3b82f6", bg: "rgba(59,130,246,0.15)", path: "/my-dashboard/requests" },
    { label: "My Leaves", value: stats.leaves, icon: CalendarDays, color: "#22c55e", bg: "rgba(34,197,94,0.15)", path: "/my-dashboard/leaves" },
    { label: "Latest Week Pay", value: `₱${stats.netSalary.toLocaleString()}`, icon: DollarSign, color: "#ff7f50", bg: "rgba(255,127,80,0.15)", path: "/my-dashboard/salary" },
    { label: "Pending Items", value: stats.pending, icon: Clock, color: "#eab308", bg: "rgba(234,179,8,0.15)", path: "/my-dashboard/requests" },
  ];

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1a1f2e, #1e2535)", border: "1px solid #1e2535" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {displayName.split(" ")[0]}</h1>
            <p className="mt-1 text-sm capitalize" style={{ color: "#94a3b8" }}>
              {profile.position || profile.role?.replace("_", " ")} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>{stats.approved}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#eab308" }}>{stats.pending}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>{stats.rejected}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Full Name", value: displayName },
          { label: "Employee ID", value: profile.employee_id || "-" },
          { label: "Role / Position", value: profile.position || profile.role || "-" },
          { label: "Status", value: profile.status === "ACTIVE" ? "Active" : profile.status === "PENDING" ? "Pending" : profile.status || "-" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{item.label}</p>
            <p className="text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <button key={c.label} onClick={() => navigate(c.path)}
            className="flex items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
            style={{ background: "#161b27", border: "1px solid #1e2535" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: c.bg }}>
              <c.icon className="h-6 w-6" style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#64748b" }}>{c.label}</p>
              <p className="text-2xl font-bold text-white">{c.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Requests</h2>
            <button onClick={() => navigate("/my-dashboard/requests")}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:brightness-110"
              style={{ color: "#ff7f50" }}>
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "#475569" }}>No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "#0f1117" }}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" style={{ color: "#3b82f6" }} />
                    <div>
                      <p className="text-sm font-medium text-white">{r.type}</p>
                      <p className="text-xs" style={{ color: "#475569" }}>{r.date}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={badge(r.status)}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/my-dashboard/requests")}
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            + New Request
          </button>
        </div>

        {/* Recent Leaves */}
        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Leaves</h2>
            <button onClick={() => navigate("/my-dashboard/leaves")}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:brightness-110"
              style={{ color: "#ff7f50" }}>
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {recentLeaves.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: "#475569" }}>No leaves yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: "#0f1117" }}>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4" style={{ color: "#22c55e" }} />
                    <div>
                      <p className="text-sm font-medium text-white">{l.type}</p>
                      <p className="text-xs" style={{ color: "#475569" }}>{l.start_date} → {l.end_date}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={badge(l.status)}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/my-dashboard/leaves")}
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            + Apply Leave
          </button>
        </div>
      </div>

      {/* Salary Card */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1a1f2e, #1e2535)", border: "1px solid #1e2535" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(255,127,80,0.15)" }}>
              <DollarSign className="h-6 w-6" style={{ color: "#ff7f50" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "#64748b" }}>Latest Week Net Pay</p>
              <p className="text-3xl font-bold text-white">₱{stats.netSalary.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={() => navigate("/my-dashboard/salary")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            View Details <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;
