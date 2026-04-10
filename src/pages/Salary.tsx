import { useEffect, useState } from "react";
import { Printer, Edit, Trash2, Loader2, Plus, DollarSign } from "lucide-react";

const API_SALARY = "http://localhost:8000/api/salary/";
const API_EMPLOYEES = "http://localhost:8000/api/employees/";

type SalaryRecord = { id: number; employee: number; employee_name: string; employee_position: string; site_name: string; hourly_rate: number; hours_worked: number; deductions: number; computed_salary: number };
type Employee = { id: number; name: string; position: string; site_name: string };

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };
const emptyForm = { employee: "", hourly_rate: "", hours_worked: "", deductions: "0" };

const Salary = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isHR = user.role === "hr";
  const isAdmin = user.role === "admin";
  const canManage = isHR; // Only HR manages salary

  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SalaryRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [payslip, setPayslip] = useState<SalaryRecord | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, eRes] = await Promise.all([fetch(API_SALARY), fetch(API_EMPLOYEES)]);
      setSalaries(await sRes.json());
      setEmployees(await eRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Group salaries by site
  const grouped: Record<string, SalaryRecord[]> = {};
  salaries.forEach(s => {
    const key = s.site_name || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: SalaryRecord) => {
    setEditTarget(s);
    setForm({ employee: String(s.employee), hourly_rate: String(s.hourly_rate), hours_worked: String(s.hours_worked), deductions: String(s.deductions) });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = { employee: form.employee, hourly_rate: form.hourly_rate, hours_worked: form.hours_worked, deductions: form.deductions };
    if (editTarget) {
      await fetch(`${API_SALARY}${editTarget.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(API_SALARY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    await fetchAll(); setSaving(false); setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this salary record?")) return;
    await fetch(`${API_SALARY}${id}/`, { method: "DELETE" });
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  const totalSalary = salaries.reduce((s, e) => s + Number(e.computed_salary), 0);

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Salary Management</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {canManage ? "HR Panel — Manage employee salaries" : "View-only — Salary records"}
          </p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            <Plus className="h-4 w-4" /> Assign Salary
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Employees on Payroll</p>
          <p className="text-2xl font-bold text-white">{salaries.length}</p>
        </div>
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Total Computed Salary</p>
          <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>₱{totalSalary.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>Sites on Payroll</p>
          <p className="text-2xl font-bold" style={{ color: "#ff7f50" }}>{Object.keys(grouped).length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : salaries.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <DollarSign className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No salary records yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loop through each site group */}
          {Object.entries(grouped).map(([siteName, records]) => {
            const siteTotal = records.reduce((s, r) => s + Number(r.computed_salary), 0);
            return (
              <div key={siteName} className="rounded-2xl overflow-hidden" style={card}>
                {/* Site header */}
                <div className="flex items-center justify-between px-5 py-3" style={{ background: "#1e2535" }}>
                  <div>
                    <p className="font-semibold text-white">{siteName}</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>{records.length} employee{records.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#64748b" }}>Site Total</p>
                    <p className="font-bold" style={{ color: "#22c55e" }}>₱{siteTotal.toLocaleString()}</p>
                  </div>
                </div>

                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e2535" }}>
                      {["Employee", "Position", "Hourly Rate", "Hours Worked", "Deductions", "Computed Salary", "Actions"].map(h => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold" style={{ color: "#64748b" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                        <td className="px-5 py-3 text-sm font-medium text-white">{r.employee_name}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.employee_position}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>₱{Number(r.hourly_rate).toLocaleString()}/hr</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "#94a3b8" }}>{r.hours_worked}h</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "#ef4444" }}>-₱{Number(r.deductions).toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm font-bold" style={{ color: "#22c55e" }}>₱{Number(r.computed_salary).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setPayslip(r)} className="rounded-lg p-1.5 hover:bg-white/10" style={{ color: "#ff7f50" }} title="Payslip"><Printer className="h-3.5 w-3.5" /></button>
                            {canManage && <>
                              <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 hover:bg-white/10" style={{ color: "#3b82f6" }} title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 hover:bg-red-500/10" style={{ color: "#ef4444" }} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 font-bold text-white text-lg">{editTarget ? "Edit Salary" : "Assign Salary"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Employee</label>
                <select required value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.site_name || "Unassigned"}</option>)}
                </select>
              </div>
              {[
                { label: "Hourly Rate (₱)", key: "hourly_rate", placeholder: "e.g. 75" },
                { label: "Hours Worked", key: "hours_worked", placeholder: "e.g. 160" },
                { label: "Deductions (₱)", key: "deductions", placeholder: "e.g. 500" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>{f.label}</label>
                  <input required type="number" min="0" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                </div>
              ))}
              {/* Live preview */}
              {form.hourly_rate && form.hours_worked && (
                <div className="rounded-xl p-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p className="text-xs" style={{ color: "#64748b" }}>Computed Salary Preview</p>
                  <p className="text-lg font-bold" style={{ color: "#22c55e" }}>
                    ₱{Math.max(0, (Number(form.hourly_rate) * Number(form.hours_worked)) - Number(form.deductions || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    {form.hourly_rate} × {form.hours_worked}h − {form.deductions || 0} deductions
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Assign Salary"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setPayslip(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">VEQUISO Construction</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Payroll Slip</p>
              </div>
            </div>
            <div className="space-y-2.5 pb-4" style={{ borderBottom: "1px solid #1e2535" }}>
              {[
                { label: "Employee", value: payslip.employee_name },
                { label: "Position", value: payslip.employee_position },
                { label: "Site", value: payslip.site_name },
                { label: "Hourly Rate", value: `₱${Number(payslip.hourly_rate).toLocaleString()}/hr` },
                { label: "Hours Worked", value: `${payslip.hours_worked}h` },
                { label: "Gross", value: `₱${(Number(payslip.hourly_rate) * Number(payslip.hours_worked)).toLocaleString()}` },
                { label: "Deductions", value: `-₱${Number(payslip.deductions).toLocaleString()}`, red: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span style={{ color: "#64748b" }}>{row.label}</span>
                  <span style={{ color: row.red ? "#ef4444" : "#e2e8f0" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <span className="font-bold text-white">Net Salary</span>
              <span className="text-lg font-bold" style={{ color: "#22c55e" }}>₱{Number(payslip.computed_salary).toLocaleString()}</span>
            </div>
            <button onClick={() => setPayslip(null)} className="mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
