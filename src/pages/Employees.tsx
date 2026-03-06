import { Edit, Trash2 } from "lucide-react";

const employees = [
  { id: 1, name: "Prince Elijah Vequiso", position: "Site Engineer", department: "Engineering", status: "Active" },
  { id: 2, name: "Joshua Tahanlagnit", position: "Project Manager", department: "Operations", status: "Active" },
  { id: 3, name: "Clyde Tan", position: "Foreman", department: "Construction", status: "Inactive" },
  { id: 4, name: "Rhigo Villahermosa", position: "HR Manager", department: "Admin", status: "Active" },
  { id: 5, name: "Pearl Amania", position: "Safety Officer", department: "Operations", status: "Active" },
  { id: 6, name: "Jenny Fernandez", position: "Architect", department: "Engineering", status: "Inactive" },
];

const Employees = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Employees</h1>
        <button className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
          + Add Employee
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className={`border-b border-border transition-colors hover:bg-muted/30 ${emp.status === "Inactive" ? "bg-destructive/5" : ""}`}>
                <td className="px-6 py-4 font-medium">{emp.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    emp.status === "Active"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="flex gap-2 px-6 py-4">
                  <button className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
