import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

const API = "http://localhost:8000/api/leaves/";
const LEAVE_TYPES = ["Sick Leave", "Vacation", "Emergency", "Maternity", "Paternity", "Other"];

type Leave = {
  id: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const MyLeaves = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: LEAVE_TYPES[0], start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setLeaves(data.filter((l: Leave) => l.employee_name === user.full_name));
    } catch { setLeaves([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, employee_name: user.full_name, status: "Pending" }),
      });
      await fetchLeaves();
    } catch { }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Cancel this leave?")) return;
    await fetch(`${API}${id}/`, { method: "DELETE" });
    setLeaves(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Leaves</h1>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
          + Apply Leave
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No leave applications yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Start</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">End</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{l.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{l.start_date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{l.end_date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${l.status === "Approved" ? "bg-success/10 text-success" : l.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {l.status === "Pending" && (
                      <button onClick={() => handleDelete(l.id)} className="rounded-lg bg-destructive/10 p-2 text-destructive hover:bg-destructive/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold">Apply for Leave</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Leave Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Start Date</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">End Date</label>
                  <input required type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60">
                  {saving ? "Saving..." : "Apply"}
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

export default MyLeaves;
