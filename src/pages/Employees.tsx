import { useEffect, useState } from "react";
import { Edit, Trash2, Loader2, ChevronDown, ChevronRight, Users, MapPin, Plus } from "lucide-react";

const API_EMP = "http://localhost:8000/api/employees/";
const API_SITES = "http://localhost:8000/api/sites/";

type Employee = { id: number; name: string; position: string; department: string; status: "Active" | "Inactive"; site: number | null; site_name: string };
type Site = { id: number; name: string; status: string };

const emptyForm = { name: "", position: "", department: "", status: "Active" as "Active" | "Inactive", site: "" };
const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([fetch(API_EMP), fetch(API_SITES)]);
      setEmployees(await eRes.json());
      setSites(await sRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Group employees by site
  const grouped: Record<string, Employee[]> = {};
  employees.forEach(emp => {
    const key = emp.site_name || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(emp);
  });

  const toggleCollapse = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({ name: emp.name, position: emp.position, department: emp.department, status: emp.status, site: emp.site ? String(emp.site) : "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { ...form, site: form.site || null };
    if (editTarget) {
      await fetch(`${API_EMP}${editTarget.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(API_EMP, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    await fetchAll(); setSaving(false); setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employee?")) return;
    await fetch(`${API_EMP}${id}/`, { method: "DELETE" });
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const siteStatusMap: Record<string, string> = {};
  sites.forEach(s => { siteStatusMap[s.name] = s.status; });

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Grouped by construction site team</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Employees</p>
          <p className="text-2xl font-bold text-white">{employees.length}</p>
        </div>
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Active</p>
          <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>{employees.filter(e => e.status === "Active").length}</p>
        </div>
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Sites</p>
          <p className="text-2xl font-bold" style={{ color: "#ff7f50" }}>{Object.keys(grouped).filter(k => k !== "Unassigned").length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No employees yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Loop through each site group */}
          {Object.entries(grouped).map(([siteName, emps]) => {
            const isCollapsed = collapsed[siteName];
            const siteStatus = siteStatusMap[siteName];
            return (
              <div key={siteName} className="rounded-2xl overflow-hidden" style={card}>
                {/* Site header — collapsible */}
                <button onClick={() => toggleCollapse(siteName)}
                  className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(255,127,80,0.15)" }}>
                      <MapPin className="h-4 w-4" style={{ color: "#ff7f50" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{siteName}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{emps.length} employee{emps.length !== 1 ? "s" : ""}</p>
                    </div>
                    {siteStatus && (
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold ml-2" style={
                        siteStatus === "Active" ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } :
                        siteStatus === "Ongoing" ? { background: "rgba(234,179,8,0.15)", color: "#eab308" } :
                        { background: "rgba(59,130,246,0.15)", color: "#3b82f6" }
                      }>{siteStatus}</span>
                    )}
                    {siteName === "Unassigned" && (
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold ml-2" style={{ background: "rgba(100,116,139,0.15)", color: "#64748b" }}>Unassigned</span>
                    )}
                  </div>
                  {isCollapsed ? <ChevronRight className="h-4 w-4" style={{ color: "#64748b" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#64748b" }} />}
                </button>

                {/* Employee rows */}
                {!isCollapsed && (
                  <div style={{ borderTop: "1px solid #1e2535" }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: "#1e2535" }}>
                          {["Name", "Position", "Department", "Status", "Actions"].map(h => (
                            <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {emps.map(emp => (
                          <tr key={emp.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                            <td className="px-5 py-3 text-sm font-medium text-white">{emp.name}</td>
                            <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{emp.position}</td>
                            <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{emp.department}</td>
                            <td className="px-5 py-3">
                              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={
                                emp.status === "Active" ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } :
                                { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                              }>{emp.status}</span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => openEdit(emp)} className="rounded-lg p-1.5 transition-colors hover:bg-white/10" style={{ color: "#3b82f6" }}><Edit className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleDelete(emp.id)} className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10" style={{ color: "#ef4444" }}><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 font-bold text-white text-lg">{editTarget ? "Edit Employee" : "Add Employee"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Full Name", key: "name", placeholder: "Full name" },
                { label: "Position", key: "position", placeholder: "e.g. Foreman" },
                { label: "Department", key: "department", placeholder: "e.g. Construction" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>{f.label}</label>
                  <input required value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Site Assignment</label>
                <select value={form.site} onChange={e => setForm({ ...form, site: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <option value="">— Unassigned —</option>
                  {/* Conditionally disable inactive sites */}
                  {sites.map(s => (
                    <option key={s.id} value={s.id} disabled={s.status === "Completed"}>
                      {s.name} {s.status === "Completed" ? "(Completed)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Employee"}
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

export default Employees;
