import { LayoutDashboard, Users, FileText, LogOut, HardHat, MapPin, Clock } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const isHR = user.role === "hr";

  // Admin sees all but cannot add salary/leaves/requests (enforced in those pages)
  // HR sees all and can manage salary, requests, leaves
  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, show: true },
    { title: "Sites", url: "/dashboard/sites", icon: MapPin, show: true },
    { title: "Employees", url: "/dashboard/employees", icon: Users, show: true },
    { title: "Requests", url: "/dashboard/requests", icon: FileText, show: true },
    { title: "Payroll", url: "/dashboard/payroll", icon: Clock, show: true },
  ].filter(i => i.show);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = (user.full_name || user.username || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sidebar collapsible="icon" style={{ background: "#161b27", borderRight: "1px solid #1e2535" }}>
      <SidebarContent style={{ background: "#161b27" }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5" style={{ borderBottom: "1px solid #1e2535" }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            <HardHat className="h-5 w-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-white tracking-wide">VEQUISO</span>}
        </div>

        {/* Profile */}
        {!collapsed && (
          <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl p-3" style={{ background: "#1e2535" }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.full_name || user.username}</p>
              <p className="text-xs capitalize" style={{ color: isAdmin ? "#ef4444" : "#22c55e" }}>
                {isAdmin ? "🔴 Admin" : "🟢 HR"}
              </p>
            </div>
          </div>
        )}

        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
                      style={{ color: "#94a3b8" }}
                      activeClassName="font-semibold"
                      activeStyle={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" }}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-3 pb-5">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "#64748b" }}>
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
