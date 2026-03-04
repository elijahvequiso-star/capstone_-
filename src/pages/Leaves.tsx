import { Check, X } from "lucide-react";

const leaves = [
  { id: 1, employee: "Juan Dela Cruz", type: "Sick Leave", startDate: "2026-03-01", endDate: "2026-03-03", status: "Pending" },
  { id: 2, employee: "Maria Santos", type: "Vacation", startDate: "2026-03-05", endDate: "2026-03-10", status: "Approved" },
  { id: 3, employee: "Pedro Reyes", type: "Emergency", startDate: "2026-02-28", endDate: "2026-02-28", status: "Approved" },
  { id: 4, employee: "Ana Garcia", type: "Maternity", startDate: "2026-04-01", endDate: "2026-06-01", status: "Pending" },
  { id: 5, employee: "Carlos Lopez", type: "Vacation", startDate: "2026-03-15", endDate: "2026-03-20", status: "Rejected" },
];

const Leaves = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Manage Leaves</h1>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
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
                <td className="px-6 py-4 font-medium">{leave.employee}</td>
                <td className="px-6 py-4 text-muted-foreground">{leave.type}</td>
                <td className="px-6 py-4 text-muted-foreground">{leave.startDate}</td>
                <td className="px-6 py-4 text-muted-foreground">{leave.endDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    leave.status === "Approved" ? "bg-success/10 text-success"
                    : leave.status === "Rejected" ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
                  }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="flex gap-2 px-6 py-4">
                  {leave.status === "Pending" && (
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

export default Leaves;
