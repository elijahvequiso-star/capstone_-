import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { month: "Jan", employees: 12 },
  { month: "Feb", employees: 15 },
  { month: "Mar", employees: 18 },
  { month: "Apr", employees: 22 },
  { month: "May", employees: 20 },
  { month: "Jun", employees: 25 },
];

const pieData = [
  { name: "Engineering", value: 40 },
  { name: "Operations", value: 30 },
  { name: "Admin", value: 15 },
  { name: "HR", value: 15 },
];

const PIE_COLORS = ["hsl(28, 90%, 55%)", "hsl(20, 95%, 45%)", "hsl(36, 60%, 70%)", "hsl(28, 40%, 80%)"];

const summaryCards = [
  { label: "Total Employees", value: "48", icon: Users, color: "bg-primary" },
  { label: "Pending Requests", value: "12", icon: FileText, color: "bg-warning" },
  { label: "Total Salary", value: "₱1.2M", icon: DollarSign, color: "bg-success" },
  { label: "Growth", value: "+8%", icon: TrendingUp, color: "bg-primary" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="font-heading text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-lg font-semibold">Employee Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 20%, 88%)" />
              <XAxis dataKey="month" stroke="hsl(20, 10%, 45%)" />
              <YAxis stroke="hsl(20, 10%, 45%)" />
              <Tooltip />
              <Bar dataKey="employees" fill="hsl(28, 90%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-heading text-lg font-semibold">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
