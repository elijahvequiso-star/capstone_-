import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Edit, Loader2, Users, ChevronDown, ChevronRight, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE from "@/lib/config";

const API_SITES = `${API_BASE}/sites/`;
const API_EMP = `${API_BASE}/employees/`;

type Site = { id: number; name: string; location: string; status: "Active" | "Ongoing" | "Completed"; employee_count: number };
type Employee = { id: number; name: string; position: string; status: string; site: number | null };
const STATUSES = ["Active", "Ongoing", "Completed"] as const;

const statusStyle = (s: string) => {
  if (s === "Active") return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (s === "Ongoing") return { background: "rgba(234,179,8,0.15)", color: "#eab308" };
  return { background: "rgba(59,130,246,0.15)", color: "#3b82f6" };
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

// Generate Site ID like VEQ-001
const generateSiteId = (id: number) => `VEQ-${String(id).padStart(3, "0")}`;

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl animate-fade-in-up"
    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", minWidth: "260px" }}>
    <CheckCircle className="h-5 w-5 shrink-0" />
    <span className="text-sm font-semibold">{message}</span>
    <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
  </div>
);

const Sites = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const canAdd = !isAdmin;
  
  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Site | null>(null);
  const [form, setForm] = useState({ name: "", location: "", status: "Active" as Site["status"] });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedSite, setExpandedSite] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ name?: string; location?: string }>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([fetch(API_SITES), fetch(API_EMP)]);
      setSites(await sRes.json());
      setEmployees(await eRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const validate = () => {
    const e: { name?: string; location?: string } = {};
    if (!form.name.trim()) e.name = "Site name is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setEditTarget(null); setForm({ name: "", location: "", status: "Active" }); setErrors({}); setShowModal(true); };
  const openEdit = (s: Site) => { setEditTarget(s); setForm({ name: s.name, location: s.location, status: s.status }); setErrors({}); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    if (editTarget) {
      await fetch(`${API_SITES}${editTarget.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      showToast(`✓ Site "${form.name}" updated successfully!`);
    } else {
      await fetch(API_SITES, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      showToast(`✓ Site "${form.name}" added successfully!`);
    }
    await fetchAll();
    setSaving(false);
    setShowModal(false);
    // Redirect to dashboard after 1.5s
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleDelete = async (site: Site) => {
    if (!confirm(`Delete "${site.name}"?\n\nEmployees assigned to this site will be moved to Unassigned.`)) return;
    await fetch(`${API_SITES}${site.id}/`, { method: "DELETE" });
    setSites(prev => prev.filter(s => s.id !== site.id));
    showToast(`✓ Site "${site.name}" deleted. Employees moved to Unassigned.`);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const getSiteEmployees = (siteId: number) => employees.filter(e => e.site === siteId);

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Construction Sites</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>{isAdmin ? "View all construction sites and their teams" : "Manage all construction sites and their teams"}</p>
        </div>
        {canAdd && (
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            <Plus className="h-4 w-4" /> Add Site
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Sites", value: sites.length, color: "#ff7f50" },
          { label: "Active", value: sites.filter(s => s.status === "Active").length, color: "#22c55e" },
          { label: "Ongoing", value: sites.filter(s => s.status === "Ongoing").length, color: "#eab308" },
          { label: "Completed", value: sites.filter(s => s.status === "Completed").length, color: "#3b82f6" },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sites list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading sites...
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <MapPin className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p className="mb-4" style={{ color: "#475569" }}>{canAdd ? "No sites yet. Add your first construction site." : "No sites available."}</p>
          {canAdd && (
            <button onClick={openAdd} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>+ Add First Site</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Loop through all sites */}
          {sites.map(site => {
            const siteEmps = getSiteEmployees(site.id);
            const isExpanded = expandedSite === site.id;
            return (
              <div key={site.id} className="rounded-2xl overflow-hidden transition-all" style={card}>
                {/* Site card header */}
                <div className="flex items-center gap-4 p-5">
                  {/* Site icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,127,80,0.15)" }}>
                    <MapPin className="h-6 w-6" style={{ color: "#ff7f50" }} />
                  </div>

                  {/* Site info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{site.name}</p>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-lg" style={{ background: "#1e2535", color: "#64748b" }}>
                        {generateSiteId(site.id)}
                      </span>
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={statusStyle(site.status)}>{site.status}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>📍 {site.location}</p>
                    <div className="flex items-center gap-1 mt-1" style={{ color: "#475569" }}>
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">{siteEmps.length} member{siteEmps.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpandedSite(isExpanded ? null : site.id)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:brightness-110"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
                      <Users className="h-3.5 w-3.5" />
                      View Team
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {!isAdmin && (
                      <>
                        <button onClick={() => openEdit(site)}
                          className="rounded-xl p-2 transition-all hover:brightness-110"
                          style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }} title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(site)}
                          className="rounded-xl p-2 transition-all hover:brightness-110"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* View Team panel — collapsible */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1e2535" }}>
                    <div className="px-5 py-3" style={{ background: "#1e2535" }}>
                      <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
                        TEAM MEMBERS — {site.name}
                      </p>
                    </div>
                    {siteEmps.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-sm" style={{ color: "#475569" }}>No employees assigned to this site yet.</p>
                        <p className="text-xs mt-1" style={{ color: "#334155" }}>Go to Employees → assign them to this site.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1e2535" }}>
                            {["Name", "Position", "Status"].map(h => (
                              <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Loop through employees assigned to this site */}
                          {siteEmps.map(emp => (
                            <tr key={emp.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                              <td className="px-5 py-3 text-sm font-medium text-white">{emp.name}</td>
                              <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{emp.position}</td>
                              <td className="px-5 py-3">
                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={
                                  emp.status === "Active"
                                    ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" }
                                    : { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                                }>{emp.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{editTarget ? "Edit Site" : "Add New Site"}</h2>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {editTarget ? `Editing: ${generateSiteId(editTarget.id)}` : "Site ID will be auto-generated"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Site Name *</label>
                <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: "" })); }}
                  placeholder="e.g. Project Alpha"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: "#0f1117", border: `1px solid ${errors.name ? "#ef4444" : "#1e2535"}` }} />
                {errors.name && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Location *</label>
                <input value={form.location} onChange={e => { setForm({ ...form, location: e.target.value }); setErrors(p => ({ ...p, location: "" })); }}
                  placeholder="e.g. Cebu City"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: "#0f1117", border: `1px solid ${errors.location ? "#ef4444" : "#1e2535"}` }} />
                {errors.location && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.location}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Status Label</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                      className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all"
                      style={form.status === s ? statusStyle(s) : { background: "#0f1117", color: "#64748b", border: "1px solid #1e2535" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Site"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
