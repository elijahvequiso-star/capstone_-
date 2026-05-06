import { useEffect, useState } from "react";
import { Edit, Trash2, Loader2, ChevronDown, ChevronRight, Users, MapPin, Plus, AlertCircle } from "lucide-react";
import API_BASE from "@/lib/config";
import { fetchList } from "@/lib/apiData";

const API_EMP = `${API_BASE}/employees/`;
const API_SITES = `${API_BASE}/sites/`;

type Employee = {
  id: number;
  employee_id: string; // custom HR employee ID e.g. "100-234-105"
  first_name: string;
  last_name: string;
  middle_name: string;
  role: string;
  is_registered: boolean;
  name: string;
  position: string;
  department: string;
  status: "PENDING" | "ACTIVE";
  site: number | null;
  site_name: string;
  site_location?: string;
};
type Site = { id: number; name: string; location: string; status: string };

const emptyForm = {
  employee_id: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  role: "employee",
  department: "",
  site: "",
};

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee", department: "Operations" },
  { value: "mason", label: "Mason", department: "Construction" },
  { value: "electrician", label: "Electrician", department: "Engineering" },
  { value: "driver", label: "Driver", department: "Operations" },
  { value: "foreman", label: "Foreman", department: "Construction" },
];

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const normalizeEmployeeId = (value: string) => value.trim().toUpperCase();

const getEmployeeIdLabel = (employee: Pick<Employee, "id" | "employee_id">) =>
  employee.employee_id?.trim() || "Not set";

const getEmployeeSiteKey = (employee: Employee) =>
  employee.site ? `site-${employee.site}` : "unassigned";

const getApiError = (data: any, fallback: string) => {
  if (!data) return fallback;
  if (typeof data.error === "string") return data.error;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.employee_id)) return data.employee_id[0];
  if (typeof data.employee_id === "string") return data.employee_id;
  const firstField = Object.values(data)[0];
  if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0];
  if (typeof firstField === "string") return firstField;
  return fallback;
};

const Employees = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const canAdd = !isAdmin;
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [empIdError, setEmpIdError] = useState("");
  const [loadError, setLoadError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [employeeData, siteData] = await Promise.all([
        fetchList<Employee>(API_EMP),
        fetchList<Site>(API_SITES),
      ]);
      setEmployees(employeeData);
      setSites(siteData);
    } catch (error) {
      setEmployees([]);
      setSites([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load employees and sites.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Group employees by site
  const grouped: Record<string, Employee[]> = {};
  employees.forEach((emp) => {
    const key = getEmployeeSiteKey(emp);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(emp);
  });

  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setEmpIdError("");
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setForm({
      employee_id: emp.employee_id || "",
      first_name: emp.first_name || "",
      last_name: emp.last_name || "",
      middle_name: emp.middle_name || "",
      role: emp.role || "employee",
      department: emp.department,
      site: emp.site ? String(emp.site) : "",
    });
    setEmpIdError("");
    setShowModal(true);
  };

  // Validate uniqueness of employee_id
  const validateEmployeeId = (value: string): string => {
    const normalized = normalizeEmployeeId(value);
    if (!normalized) return "Employee ID is required.";
    const duplicate = employees.find(
      (e) =>
        normalizeEmployeeId(e.employee_id || "") === normalized &&
        (!editTarget || e.id !== editTarget.id)
    );
    if (duplicate) return `Invalid existing ID number. Employee ID "${normalized}" is already registered.`;
    return "";
  };

  const handleEmployeeIdChange = (value: string) => {
    setForm({ ...form, employee_id: value });
    if (empIdError) setEmpIdError(validateEmployeeId(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate employee_id before submit
    const idErr = validateEmployeeId(form.employee_id);
    if (idErr) {
      setEmpIdError(idErr);
      return;
    }

    setSaving(true);
    const body = {
      ...form,
      employee_id: normalizeEmployeeId(form.employee_id),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      middle_name: form.middle_name.trim(),
      name: [form.first_name, form.middle_name, form.last_name].map((value) => value.trim()).filter(Boolean).join(" "),
      position: ROLE_OPTIONS.find((role) => role.value === form.role)?.label || "Employee",
      department: form.department.trim() || ROLE_OPTIONS.find((role) => role.value === form.role)?.department || "Operations",
      status: editTarget ? editTarget.status : "PENDING",
      site: form.site || null,
    };

    try {
      const res = await fetch(editTarget ? `${API_EMP}${editTarget.id}/` : API_EMP, {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmpIdError(getApiError(data, "Unable to save employee."));
        return;
      }

      await fetchAll();
      setShowModal(false);
    } catch {
      setEmpIdError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employee?")) return;
    await fetch(`${API_EMP}${id}/`, { method: "DELETE" });
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const siteStatusMap: Record<string, string> = {};
  sites.forEach((s) => {
    siteStatusMap[`site-${s.id}`] = s.status;
  });

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {isAdmin ? "View all construction site team members" : "Grouped by construction site team"}
          </p>
        </div>
        {canAdd && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}
          >
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Summary */}
      {loadError && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Employees</p>
          <p className="text-2xl font-bold text-white">{employees.length}</p>
        </div>
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Active</p>
          <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>
            {employees.filter((e) => e.status === "ACTIVE").length}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Sites</p>
          <p className="text-2xl font-bold" style={{ color: "#ff7f50" }}>
            {Object.keys(grouped).filter((k) => k !== "unassigned").length}
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center py-16 gap-2"
          style={{ color: "#64748b" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No employees yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([siteKey, emps]) => {
            const isCollapsed = collapsed[siteKey];
            const siteStatus = siteStatusMap[siteKey];
            const firstEmployee = emps[0];
            const siteName = firstEmployee?.site_name || "Unassigned";
            const siteLocation = firstEmployee?.site_location;
            return (
              <div
                key={siteKey}
                className="rounded-2xl overflow-hidden"
                style={card}
              >
                {/* Site header — collapsible */}
                <button
                  onClick={() => toggleCollapse(siteKey)}
                  className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "rgba(255,127,80,0.15)" }}
                    >
                      <MapPin className="h-4 w-4" style={{ color: "#ff7f50" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{siteName}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>
                        {siteLocation ? `${siteLocation} - ` : ""}{emps.length} employee{emps.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {siteStatus && (
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold ml-2"
                        style={
                          siteStatus === "Active"
                            ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" }
                            : siteStatus === "Ongoing"
                            ? { background: "rgba(234,179,8,0.15)", color: "#eab308" }
                            : { background: "rgba(59,130,246,0.15)", color: "#3b82f6" }
                        }
                      >
                        {siteStatus}
                      </span>
                    )}
                    {siteKey === "unassigned" && (
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold ml-2"
                        style={{ background: "rgba(100,116,139,0.15)", color: "#64748b" }}
                      >
                        Unassigned
                      </span>
                    )}
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" style={{ color: "#64748b" }} />
                  ) : (
                    <ChevronDown className="h-4 w-4" style={{ color: "#64748b" }} />
                  )}
                </button>

                {/* Employee rows */}
                {!isCollapsed && (
                  <div style={{ borderTop: "1px solid #1e2535" }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: "#1e2535" }}>
                          {["Employee ID", "Name", "Role / Position", "Status", "Registered", "Actions"].map(
                            (h) => (
                              <th
                                key={h}
                                className="px-5 py-2.5 text-left text-xs font-semibold"
                                style={{ color: "#64748b" }}
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {emps.map((emp) => (
                          <tr
                            key={emp.id}
                            className="transition-colors hover:bg-white/5"
                            style={{ borderTop: "1px solid #1e2535" }}
                          >
                            {/* Custom Employee ID — displayed exactly as entered */}
                            <td className="px-5 py-3">
                              <span
                                className="rounded-lg px-2.5 py-1 text-xs font-mono font-semibold"
                                style={{ background: "rgba(255,127,80,0.12)", color: "#ff7f50" }}
                              >
                                {getEmployeeIdLabel(emp)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm font-medium text-white">
                              {emp.name || [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}
                            </td>
                            <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>
                              {emp.position}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={
                                  emp.status === "ACTIVE"
                                    ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" }
                                    : { background: "rgba(234,179,8,0.15)", color: "#eab308" }
                                }
                              >
                                {emp.status === "ACTIVE" ? "Active" : "Pending"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={
                                  emp.is_registered
                                    ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" }
                                    : { background: "rgba(100,116,139,0.15)", color: "#94a3b8" }
                                }
                              >
                                {emp.is_registered ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-2">
                                {!isAdmin && (
                                  <>
                                    <button
                                      onClick={() => openEdit(emp)}
                                      className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                                      style={{ color: "#3b82f6" }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(emp.id)}
                                      className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10"
                                      style={{ color: "#ef4444" }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
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

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: "#161b27", border: "1px solid #1e2535" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 font-bold text-white text-lg">
              {editTarget ? "Edit Employee" : "Add Employee"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Employee ID — custom, unique, not tied to backend PK */}
              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#94a3b8" }}
                >
                  Employee ID <span style={{ color: "#ff7f50" }}>*</span>
                </label>
                <input
                  required
                  value={form.employee_id}
                  onChange={(e) => handleEmployeeIdChange(e.target.value)}
                  onBlur={() => setEmpIdError(validateEmployeeId(form.employee_id))}
                  placeholder="e.g. 100-234-105"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none"
                  style={{
                    background: "#0f1117",
                    border: `1px solid ${empIdError ? "#ef4444" : "#1e2535"}`,
                  }}
                />
                {empIdError && (
                  <div
                    className="flex items-center gap-1.5 mt-1.5 text-xs"
                    style={{ color: "#ef4444" }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {empIdError}
                  </div>
                )}
              </div>

              {[
                { label: "First Name", key: "first_name", placeholder: "First name", required: true },
                { label: "Last Name", key: "last_name", placeholder: "Last name", required: true },
                { label: "Middle Name", key: "middle_name", placeholder: "Middle name (optional)", required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: "#94a3b8" }}
                  >
                    {f.label}
                  </label>
                  <input
                    required={f.required}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }}
                  />
                </div>
              ))}

              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#94a3b8" }}
                >
                  Role / Position <span style={{ color: "#ff7f50" }}>*</span>
                </label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => {
                    const selected = ROLE_OPTIONS.find((role) => role.value === e.target.value);
                    setForm({ ...form, role: e.target.value, department: selected?.department || "Operations" });
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: "#94a3b8" }}
                >
                  Site Assignment
                </label>
                <select
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}
                >
                  <option value="">— Unassigned —</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id} disabled={s.status === "Completed"}>
                      {s.name} ({s.location || "No location"}) {s.status === "Completed" ? "- Completed" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {!editTarget && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#facc15" }}>
                  Status will be Pending until the employee registers with this ID.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}
                >
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Add Employee"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}
                >
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

export default Employees;
