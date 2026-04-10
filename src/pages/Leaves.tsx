import { useEffect, useState } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";

const API_LEAVES = "http://localhost:8000/api/leaves/";
const API_EMPLOYEES = "http://localhost:8000/api/employees/";
const LEAVE_TYPES = ["Sick Leave", "Vacation", "Emergency", "Maternity", "Paternity", "Other"];

type Leave = {
  id: number;
  employee: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
};

type Employee = { id: number; name: string };

const Leaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee: "", type: LEAVE_TYPES[0], start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [lRes, eRes] = await Promise.all([fetch(API_LEAVES), fetch(API_EMPLOYEES)]);
    setLeaves(await lRes.json());
    setEmployees(await eRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(API_LEAVES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee: form.employee, type: form.type, start_date: form.start_date, end_date: form.end_date, status: "Pending" }),
    });
    await fetchAll();
    setSaving(false);
    setForm({ employee: "", type: LEAVE_TYPES[0], start_date: "", end_date: "" });
    setShowModal(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API_LEAVES}${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, status: status as Leave["status"] } : l));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this leave?")) return;
    await fetch(`${API_LEAVES}${id}/`, { method: "DELETE" });
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Manage Leaves</h1>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
          + Add Leave
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No leaves found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Leave Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Start</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">End</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-border transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{leave.employee_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{leave.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{leave.start_date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{leave.end_date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${leave.status === "Approved" ? "bg-success/10 text-success" : leave.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="flex gap-2 px-6 py-4">
                    {leave.status === "Pending" && (
                      <>
                        <button onClick={() => updateStatus(leave.id, "Approved")} className="rounded-lg bg-success/10 p-2 text-success transition-colors hover:bg-success/20" title="Approve"><Check className="h-4 w-4" /></button>
                        <button onClick={() => updateStatus(leave.id, "Rejected")} className="rounded-lg bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20" title="Reject"><X className="h-4 w-4" /></button>
                      </>
                    )}
                    <button onClick={() => handleDelete(leave.id)} className="rounded-lg bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold">Add Leave</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Employee</label>
                <select required value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select employee</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Leave Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Start Date</label>
                  <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">End Date</label>
                  <input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60">
                  {saving ? "Saving..." : "Add Leave"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-border py-2.5 font-semibold hover:bg-muted">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
