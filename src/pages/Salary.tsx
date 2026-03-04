import { Printer } from "lucide-react";
import { useState } from "react";

const salaryData = [
  { id: 1, name: "Juan Dela Cruz", position: "Site Engineer", basic: 45000, deductions: 5000 },
  { id: 2, name: "Maria Santos", position: "Project Manager", basic: 55000, deductions: 6500 },
  { id: 3, name: "Pedro Reyes", position: "Foreman", basic: 35000, deductions: 4000 },
  { id: 4, name: "Ana Garcia", position: "HR Manager", basic: 50000, deductions: 5500 },
  { id: 5, name: "Carlos Lopez", position: "Safety Officer", basic: 40000, deductions: 4500 },
];

const Salary = () => {
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null);
  const selected = salaryData.find((s) => s.id === selectedPayroll);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Manage Salary</h1>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Employee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Position</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Basic Salary</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Deductions</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">Net Salary</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-muted-foreground">Payslip</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((emp) => (
              <tr key={emp.id} className="border-b border-border transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{emp.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                <td className="px-6 py-4 text-right">₱{emp.basic.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-destructive">-₱{emp.deductions.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-semibold">₱{(emp.basic - emp.deductions).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setSelectedPayroll(emp.id)} className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
                    <Printer className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payroll Summary */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-semibold">Payroll Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Total Basic</p>
            <p className="font-heading text-xl font-bold">₱{salaryData.reduce((s, e) => s + e.basic, 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="font-heading text-xl font-bold text-destructive">₱{salaryData.reduce((s, e) => s + e.deductions, 0).toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Total Net Salary</p>
            <p className="font-heading text-xl font-bold text-success">₱{salaryData.reduce((s, e) => s + (e.basic - e.deductions), 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setSelectedPayroll(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 font-heading text-xl font-bold text-primary">VEQUISO Construction</h2>
            <p className="mb-6 text-sm text-muted-foreground">Payroll Slip — March 2026</p>
            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Employee</span><span className="font-medium">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span className="font-medium">{selected.position}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Basic Salary</span><span>₱{selected.basic.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Deductions</span><span className="text-destructive">-₱{selected.deductions.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between pt-4">
              <span className="font-heading font-bold">Net Salary</span>
              <span className="font-heading text-lg font-bold text-success">₱{(selected.basic - selected.deductions).toLocaleString()}</span>
            </div>
            <button onClick={() => setSelectedPayroll(null)} className="mt-6 w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
