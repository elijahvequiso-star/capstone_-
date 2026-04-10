import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

const API = "http://localhost:8000/api/requests/";
const REQUEST_TYPES = ["Equipment", "Material", "Leave", "Budget", "Other"];

type Request = {
  id: number;
  employee: number;
  employee_name: string;
  type: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

const MyRequests = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: REQUEST_TYPES[0], date: "" });
  const [saving, setSaving] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setRequests(data.filter((r: Request) => r.employee_name === user.full_name));
    } catch { setRequests([]); }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, employee_name: user.full_name, status: "Pending" }),
      });
      await fetchRequests();
    } catch { }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this request?")) return;
    await fetch(`${API}${id}/`, { method: "DELETE" });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">My Requests</h1>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
          + New Request
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No requests yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{r.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${r.status === "Approved" ? "bg-success/10 text-success" : r.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.status === "Pending" && (
                      <button onClick={() => handleDelete(r.id)} className="rounded-lg bg-destructive/10 p-2 text-destructive hover:bg-destructive/20">
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
            <h2 className="mb-6 font-heading text-xl font-bold">New Request</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Request Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Date</label>
                <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60">
                  {saving ? "Saving..." : "Submit Request"}
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

export default MyRequests;
