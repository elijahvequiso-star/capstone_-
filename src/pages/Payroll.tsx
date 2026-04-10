import { useEffect, useState } from "react";
import { Printer, Edit, Trash2, Loader2, Plus, DollarSign, Clock, ChevronDown, ChevronRight } from "lucide-react";

const API_PAYROLL = "http://localhost:8000/api/payroll/";
const API_EMPLOYEES = "http://localhost:8000/api/employees/";
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type PayrollRecord = {
  id: number;
  employee: number;
  employee_name: string;
  employee_position: string;
  site_name: string;
  week_start: string;
  hourly_rate: number;
  mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number;
  deductions: number;
  total_hours: number;
  gross_pay: number;
  net_pay: number;
};

type Employee = { id: number; name: string; position: string; site_name: string };

const emptyForm = {
  employee: "", week_start: "", hourly_rate: "",
  mon: "0", tue: "0", wed: "0", thu: "0", fri: "0", sat: "0", sun: "0",
  deductions: "0",
};

const card = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

// Get Monday of current week
const getMonday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
};

const Payroll = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = user.role === "hr";

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PayrollRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm, week_start: getMonday() });
  const [saving, setSaving] = useState(false);
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [weekFilter, setWeekFilter] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([fetch(API_PAYROLL), fetch(API_EMPLOYEES)]);
      setPayrolls(await pRes.json());
      setEmployees(await eRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Compute live preview
  const previewHours = DAYS.reduce((s, d) => s + Number((form as any)[d] || 0), 0);
  const previewGross = Number(form.hourly_rate || 0) * previewHours;
  const previewNet = previewGross - Number(form.deductions || 0);

  // Filter by week
  const filtered = weekFilter ? payrolls.filter(p => p.week_start === weekFilter) : payrolls;

  // Group by site
  const grouped: Record<string, PayrollRecord[]> = {};
  filtered.forEach(p => {
    const key = p.site_name || "Unassigned";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  // Unique weeks for filter
  const weeks = [...new Set(payrolls.map(p => p.week_start))].sort((a, b) => b.localeCompare(a));

  const openAdd = () => { setEditTarget(null); setForm({ ...emptyForm, week_start: getMonday() }); setShowModal(true); };
  const openEdit = (p: PayrollRecord) => {
    setEditTarget(p);
    setForm({
      employee: String(p.employee), week_start: p.week_start,
      hourly_rate: String(p.hourly_rate),
      mon: String(p.mon), tue: String(p.tue), wed: String(p.wed),
      thu: String(p.thu), fri: String(p.fri), sat: String(p.sat), sun: String(p.sun),
      deductions: String(p.deductions),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = {
      employee: form.employee, week_start: form.week_start,
      hourly_rate: form.hourly_rate,
      mon: form.mon, tue: form.tue, wed: form.wed,
      thu: form.thu, fri: form.fri, sat: form.sat, sun: form.sun,
      deductions: form.deductions,
    };
    if (editTarget) {
      await fetch(`${API_PAYROLL}${editTarget.id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch(API_PAYROLL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    await fetchAll(); setSaving(false); setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payroll record?")) return;
    await fetch(`${API_PAYROLL}${id}/`, { method: "DELETE" });
    setPayrolls(prev => prev.filter(p => p.id !== id));
  };

  const totalNet = filtered.reduce((s, p) => s + Number(p.net_pay), 0);
  const totalHours = filtered.reduce((s, p) => s + Number(p.total_hours), 0);

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll System</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {canManage ? "HR Panel — Weekly timesheet & payroll computation" : "View-only — Payroll records"}
          </p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            <Plus className="h-4 w-4" /> Add Payroll
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Records", value: filtered.length, color: "#ff7f50" },
          { label: "Total Hours", value: `${totalHours}h`, color: "#3b82f6" },
          { label: "Total Net Pay", value: `₱${totalNet.toLocaleString()}`, color: "#22c55e" },
          { label: "Sites", value: Object.keys(grouped).length, color: "#a855f7" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={card}>
            <p className="text-xs mb-1" style={{ color: "#64748b" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Week filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium" style={{ color: "#64748b" }}>Filter by week:</span>
        <button onClick={() => setWeekFilter("")}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
          style={!weekFilter ? { background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" } : { background: "#1e2535", color: "#64748b" }}>
          All Weeks
        </button>
        {weeks.map(w => (
          <button key={w} onClick={() => setWeekFilter(w)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
            style={weekFilter === w ? { background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" } : { background: "#1e2535", color: "#64748b" }}>
            Week of {w}
          </button>
        ))}
      </div>

      {/* Payroll table grouped by site */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading payroll...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={card}>
          <DollarSign className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No payroll records yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([siteName, records]) => {
            const siteNet = records.reduce((s, r) => s + Number(r.net_pay), 0);
            const isCollapsed = collapsed[siteName];
            return (
              <div key={siteName} className="rounded-2xl overflow-hidden" style={card}>
                {/* Site header */}
                <button onClick={() => setCollapsed(p => ({ ...p, [siteName]: !p[siteName] }))}
                  className="flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/5"
                  style={{ background: "#1e2535" }}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" style={{ color: "#ff7f50" }} />
                    <p className="font-semibold text-white">{siteName}</p>
                    <span className="text-xs" style={{ color: "#64748b" }}>{records.length} employee{records.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{ color: "#22c55e" }}>₱{siteNet.toLocaleString()}</span>
                    {isCollapsed ? <ChevronRight className="h-4 w-4" style={{ color: "#64748b" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#64748b" }} />}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ minWidth: "900px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1e2535" }}>
                          {["Employee", "Week", "Rate/hr", ...DAY_LABELS, "Total Hrs", "Gross", "Deduct", "Net Pay", ""].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap" style={{ color: "#64748b" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {records.map(r => (
                          <tr key={r.id} className="transition-colors hover:bg-white/5" style={{ borderTop: "1px solid #1e2535" }}>
                            <td className="px-3 py-3">
                              <p className="text-sm font-medium text-white whitespace-nowrap">{r.employee_name}</p>
                              <p className="text-xs" style={{ color: "#64748b" }}>{r.employee_position}</p>
                            </td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>{r.week_start}</td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>₱{Number(r.hourly_rate).toLocaleString()}</td>
                            {DAYS.map(d => (
                              <td key={d} className="px-3 py-3 text-center text-xs" style={{ color: Number(r[d]) > 0 ? "#e2e8f0" : "#334155" }}>
                                {Number(r[d]) > 0 ? `${r[d]}h` : "—"}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-xs font-semibold text-center" style={{ color: "#3b82f6" }}>{r.total_hours}h</td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>₱{Number(r.gross_pay).toLocaleString()}</td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "#ef4444" }}>-₱{Number(r.deductions).toLocaleString()}</td>
                            <td className="px-3 py-3 text-sm font-bold whitespace-nowrap" style={{ color: "#22c55e" }}>₱{Number(r.net_pay).toLocaleString()}</td>
                            <td className="px-3 py-3">
                              <div className="flex gap-1.5">
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{editTarget ? "Edit Payroll" : "Add Weekly Payroll"}</h2>
                <p className="text-xs" style={{ color: "#64748b" }}>Enter daily hours worked (Mon–Sun)</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee + Week */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Employee</label>
                  <select required value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.site_name || "Unassigned"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Week Start (Monday)</label>
                  <input required type="date" value={form.week_start} onChange={e => setForm({ ...form, week_start: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                </div>
              </div>

              {/* Hourly rate */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Hourly Rate (₱)</label>
                <input required type="number" min="0" step="0.01" value={form.hourly_rate}
                  onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
                  placeholder="e.g. 75.00" className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
              </div>

              {/* Daily hours Mon-Sun */}
              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: "#94a3b8" }}>Daily Hours Worked</label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((d, i) => (
                    <div key={d} className="text-center">
                      <p className="text-xs mb-1 font-semibold" style={{
                        color: d === "sat" || d === "sun" ? "#ff7f50" : "#64748b"
                      }}>{DAY_LABELS[i]}</p>
                      <input type="number" min="0" max="24" step="0.5"
                        value={(form as any)[d]}
                        onChange={e => setForm({ ...form, [d]: e.target.value })}
                        className="w-full rounded-xl px-2 py-2 text-sm text-white text-center outline-none"
                        style={{
                          background: "#0f1117",
                          border: `1px solid ${Number((form as any)[d]) > 0 ? "#ff7f50" : "#1e2535"}`
                        }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: "#94a3b8" }}>Deductions (₱)</label>
                <input type="number" min="0" step="0.01" value={form.deductions}
                  onChange={e => setForm({ ...form, deductions: e.target.value })}
                  placeholder="e.g. 500" className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
              </div>

              {/* Live computation preview */}
              <div className="rounded-xl p-4" style={{ background: "#0f1117", border: "1px solid #1e2535" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748b" }}>LIVE COMPUTATION PREVIEW</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs" style={{ color: "#64748b" }}>Total Hours</p>
                    <p className="text-lg font-bold" style={{ color: "#3b82f6" }}>{previewHours}h</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748b" }}>Gross Pay</p>
                    <p className="text-lg font-bold" style={{ color: "#94a3b8" }}>₱{previewGross.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#64748b" }}>Net Pay</p>
                    <p className="text-lg font-bold" style={{ color: "#22c55e" }}>₱{Math.max(0, previewNet).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: "#334155" }}>
                  ₱{form.hourly_rate || 0}/hr × {previewHours}h − ₱{form.deductions || 0} deductions
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                  {saving ? "Saving..." : editTarget ? "Save Changes" : "Save Payroll"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5 transition-all"
                  style={{ border: "1px solid #1e2535", color: "#64748b" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setPayslip(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">VEQUISO Construction</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Weekly Payroll Slip</p>
              </div>
            </div>

            {/* Employee info */}
            <div className="rounded-xl p-3 mb-4" style={{ background: "#0f1117" }}>
              <p className="font-semibold text-white">{payslip.employee_name}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>{payslip.employee_position} · {payslip.site_name}</p>
              <p className="text-xs mt-1" style={{ color: "#475569" }}>Week of {payslip.week_start}</p>
            </div>

            {/* Daily breakdown */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>DAILY HOURS</p>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d, i) => (
                  <div key={d} className="text-center rounded-lg py-2" style={{ background: Number(payslip[d]) > 0 ? "rgba(255,127,80,0.15)" : "#0f1117" }}>
                    <p className="text-xs" style={{ color: "#64748b" }}>{DAY_LABELS[i]}</p>
                    <p className="text-xs font-semibold" style={{ color: Number(payslip[d]) > 0 ? "#ff7f50" : "#334155" }}>
                      {Number(payslip[d]) > 0 ? `${payslip[d]}h` : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Computation */}
            <div className="space-y-2 pb-4" style={{ borderBottom: "1px solid #1e2535" }}>
              {[
                { label: "Hourly Rate", value: `₱${Number(payslip.hourly_rate).toLocaleString()}/hr` },
                { label: "Total Hours", value: `${payslip.total_hours}h` },
                { label: "Gross Pay", value: `₱${Number(payslip.gross_pay).toLocaleString()}` },
                { label: "Deductions", value: `-₱${Number(payslip.deductions).toLocaleString()}`, red: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span style={{ color: "#64748b" }}>{row.label}</span>
                  <span style={{ color: (row as any).red ? "#ef4444" : "#e2e8f0" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 mb-5">
              <span className="font-bold text-white">Net Pay</span>
              <span className="text-xl font-bold" style={{ color: "#22c55e" }}>₱{Number(payslip.net_pay).toLocaleString()}</span>
            </div>

            <button onClick={() => setPayslip(null)} className="w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
