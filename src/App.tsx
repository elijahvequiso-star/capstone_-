import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Requests from "./pages/Requests";
import Leaves from "./pages/Leaves";
import Sites from "./pages/Sites";
import Payroll from "./pages/Payroll";

import EmployeeLayout from "./components/EmployeeLayout";
import MyDashboard from "./pages/MyDashboard";
import MyRequests from "./pages/MyRequests";
import MyLeaves from "./pages/MyLeaves";
import MySalary from "./pages/MySalary";

const queryClient = new QueryClient();

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

const ADMIN_ROLES = ["admin", "hr"];
const EMPLOYEE_ROLES = ["employee", "mason", "electrician", "driver", "foreman"];

const isAdmin = (user: any) => user && ADMIN_ROLES.includes(user.role);
const isEmployee = (user: any) => user && EMPLOYEE_ROLES.includes(user.role);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(user)) return <Navigate to="/my-dashboard" replace />;
  return <>{children}</>;
};

const EmployeeRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!isEmployee(user)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUser();
  if (user) return isAdmin(user) ? <Navigate to="/dashboard" replace /> : <Navigate to="/my-dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

          <Route path="/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="sites" element={<Sites />} />
            <Route path="employees" element={<Employees />} />
            <Route path="requests" element={<Requests />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="payroll" element={<Payroll />} />
          </Route>

          <Route path="/my-dashboard" element={<EmployeeRoute><EmployeeLayout /></EmployeeRoute>}>
            <Route index element={<MyDashboard />} />
            <Route path="requests" element={<MyRequests />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="salary" element={<MySalary />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
