import { useEffect, useState } from "react";
import { Printer, Loader2, DollarSign, Clock, TrendingUp } from "lucide-react";
import API_BASE from "@/lib/config";

const API_PAYROLL = `${API_BASE}/payroll/`;
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type PayrollRecord = {
  id: number;
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

const s = { background: "#161b27", border: "1px solid #1e2535", borderRadius: "16px" };

const MySalary = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_PAYROLL);
        const data = await res.json();
        // Filter only this employee's records
        const mine = Array.isArray(data)
          ? data.filter((r: PayrollRecord) => r.employee_name === user.full_name)
          : [];
        // Sort by week descending
        mine.sort((a: PayrollRecord, b: PayrollRecord) => b.week_start.localeCompare(a.week_start));
        setRecords(mine);
      } catch { setRecords([]); }
      setLoading(false);
    };
    fetchPayroll();
  }, []);

  const totalNet = records.reduce((s, r) => s + Number(r.net_pay), 0);
  const totalHours = records.reduce((s, r) => s + Number(r.total_hours), 0);
  const latestRate = records.length > 0 ? Number(records[0].hourly_rate) : 0;

  return (
    <div className="space-y-6" style={{ color: "#e2e8f0" }}>
      <div>
        <h1 className="text-2xl font-bold text-white">My Salary</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Your weekly payroll records</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl p-5" style={s}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(34,197,94,0.15)" }}>
            <DollarSign className="h-6 w-6" style={{ color: "#22c55e" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#64748b" }}>Total Net Pay</p>
            <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>₱{totalNet.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl p-5" style={s}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Clock className="h-6 w-6" style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#64748b" }}>Total Hours Worked</p>
            <p className="text-2xl font-bold" style={{ color: "#3b82f6" }}>{totalHours}h</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl p-5" style={s}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(255,127,80,0.15)" }}>
            <TrendingUp className="h-6 w-6" style={{ color: "#ff7f50" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#64748b" }}>Current Hourly Rate</p>
            <p className="text-2xl font-bold" style={{ color: "#ff7f50" }}>₱{latestRate.toLocaleString()}/hr</p>
          </div>
        </div>
      </div>

      {/* Payroll records */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#64748b" }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading payroll...
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={s}>
          <DollarSign className="h-10 w-10 mx-auto mb-3" style={{ color: "#1e2535" }} />
          <p style={{ color: "#475569" }}>No payroll records yet.</p>
          <p className="text-xs mt-1" style={{ color: "#334155" }}>Your HR will assign your weekly payroll.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => (
            <div key={r.id} className="rounded-2xl overflow-hidden" style={s}>
              {/* Week header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ background: "#1e2535" }}>
                <div>
                  <p className="font-semibold text-white">Week of {r.week_start}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{r.site_name} · ₱{Number(r.hourly_rate).toLocaleString()}/hr</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#64748b" }}>Net Pay</p>
                    <p className="font-bold" style={{ color: "#22c55e" }}>₱{Number(r.net_pay).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setPayslip(r)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                    <Printer className="h-3.5 w-3.5" /> Payslip
                  </button>
                </div>
              </div>

              {/* Daily hours grid */}
              <div className="p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748b" }}>DAILY HOURS</p>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {DAYS.map((d, i) => (
                    <div key={d} className="rounded-xl py-3 text-center" style={{
                      background: Number(r[d]) > 0 ? "rgba(255,127,80,0.15)" : "#0f1117",
                      border: `1px solid ${Number(r[d]) > 0 ? "rgba(255,127,80,0.3)" : "#1e2535"}`
                    }}>
                      <p className="text-xs font-medium mb-1" style={{ color: d === "sat" || d === "sun" ? "#ff7f50" : "#64748b" }}>
                        {DAY_LABELS[i]}
                      </p>
                      <p className="text-sm font-bold" style={{ color: Number(r[d]) > 0 ? "#ff7f50" : "#334155" }}>
                        {Number(r[d]) > 0 ? `${r[d]}h` : "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Computation row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Hours", value: `${r.total_hours}h`, color: "#3b82f6" },
                    { label: "Gross Pay", value: `₱${Number(r.gross_pay).toLocaleString()}`, color: "#94a3b8" },
                    { label: "Deductions", value: `-₱${Number(r.deductions).toLocaleString()}`, color: "#ef4444" },
                    { label: "Net Pay", value: `₱${Number(r.net_pay).toLocaleString()}`, color: "#22c55e" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: "#0f1117" }}>
                      <p className="text-xs mb-1" style={{ color: "#64748b" }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payslip Modal */}
      {payslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setPayslip(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">VEQUISO Construction</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Weekly Payroll Slip</p>
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "#0f1117" }}>
              <p className="font-semibold text-white">{payslip.employee_name}</p>
              <p className="text-xs" style={{ color: "#64748b" }}>{payslip.employee_position} · {payslip.site_name}</p>
              <p className="text-xs mt-1" style={{ color: "#475569" }}>Week of {payslip.week_start}</p>
            </div>

            <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>DAILY HOURS</p>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {DAYS.map((d, i) => (
                <div key={d} className="text-center rounded-lg py-2" style={{ background: Number(payslip[d]) > 0 ? "rgba(255,127,80,0.15)" : "#0f1117" }}>
                  <p className="text-xs" style={{ color: "#64748b" }}>{DAY_LABELS[i]}</p>
                  <p className="text-xs font-semibold" style={{ color: Number(payslip[d]) > 0 ? "#ff7f50" : "#334155" }}>
                    {Number(payslip[d]) > 0 ? `${payslip[d]}h` : "—"}
                  </p>
                </div>
              ))}
            </div>

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

export default MySalary;
