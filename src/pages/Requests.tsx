import { Check, X } from "lucide-react";

const requests = [
  { id: 1, employee: "Juan Dela Cruz", type: "Equipment", date: "2026-02-28", status: "Pending" },
  { id: 2, employee: "Maria Santos", type: "Material", date: "2026-02-27", status: "Approved" },
  { id: 3, employee: "Pedro Reyes", type: "Leave", date: "2026-02-26", status: "Pending" },
  { id: 4, employee: "Ana Garcia", type: "Budget", date: "2026-02-25", status: "Rejected" },
  { id: 5, employee: "Carlos Lopez", type: "Equipment", date: "2026-02-24", status: "Pending" },
];

const Requests = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Requests</h1>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Employee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Request Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-border transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">{req.employee}</td>
                <td className="px-6 py-4 text-muted-foreground">{req.type}</td>
                <td className="px-6 py-4 text-muted-foreground">{req.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    req.status === "Approved" ? "bg-success/10 text-success"
                    : req.status === "Rejected" ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="flex gap-2 px-6 py-4">
                  {req.status === "Pending" && (
                    <>
                      <button className="rounded-lg bg-success/10 p-2 text-success transition-colors hover:bg-success/20">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;
