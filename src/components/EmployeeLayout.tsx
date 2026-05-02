import { Outlet, useNavigate } from "react-router-dom";
import { FileText, CalendarDays, DollarSign, LogOut, HardHat, LayoutDashboard, MessageCircle, X, Send, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState, useEffect } from "react";
import { messageStore, notificationStore } from "@/lib/notificationStore";

const getDisplayName = (user: any) => {
  const fullName = (user.full_name || "").trim();
  const employeeId = (user.employee_id || user.username || "").trim();
  if (fullName && fullName.toUpperCase() !== employeeId.toUpperCase()) return fullName;
  return user.name || "Employee";
};

const EmployeeLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = getDisplayName(user);
  const [showMsg, setShowMsg] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const refreshMessages = () => {
    // Get full conversation between this employee and admin/hr
    const all = messageStore.getAll();
    const conv = all.filter(m =>
      (m.from === user.username && (m.to === "admin" || m.to_role === "admin" || m.to_role === "hr")) ||
      (m.to === user.username)
    ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    setConversation(conv);
    setUnreadMsg(messageStore.unreadCount(user.username));
    setNotifications(notificationStore.getForUser(user.username, user.role));
    setUnreadNotif(notificationStore.unreadCount(user.username, user.role));
  };

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;

    // Send to admin — stored in localStorage so admin can see it
    messageStore.send({
      from: user.username,
      from_role: user.role,
      to: "admin",
      to_role: "admin",
      text: subject ? `[${subject}] ${msg}` : msg,
    });

    setMsg("");
    setSubject("");
    setSent(true);
    refreshMessages();
    setTimeout(() => setSent(false), 2000);
  };

  const navItems = [
    { title: "My Dashboard", url: "/my-dashboard", icon: LayoutDashboard },
    { title: "My Requests", url: "/my-dashboard/requests", icon: FileText },
    { title: "My Leaves", url: "/my-dashboard/leaves", icon: CalendarDays },
    { title: "My Salary", url: "/my-dashboard/salary", icon: DollarSign },
  ];

  const initials = (displayName || user.username || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen w-full" style={{ background: "#0f1117", color: "#e2e8f0" }}>

      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col" style={{ background: "#161b27", borderRight: "1px solid #1e2535" }}>
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #1e2535" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            <HardHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">VEQUISO</span>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 mx-3 mt-4 rounded-xl" style={{ background: "#1e2535" }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs capitalize" style={{ color: "#ff7f50" }}>{user.role?.replace("_", " ")}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.title} to={item.url} end={item.url === "/my-dashboard"}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
              style={{ color: "#94a3b8" }}
              activeClassName="font-semibold"
              activeStyle={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)", color: "#fff" }}>
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "#64748b" }}>
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between px-6" style={{ background: "#161b27", borderBottom: "1px solid #1e2535" }}>
          <div>
            <p className="text-sm" style={{ color: "#64748b" }}>Welcome back,</p>
            <p className="font-semibold text-white">{displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold capitalize" style={{ background: "rgba(255,127,80,0.15)", color: "#ff7f50" }}>
              {user.role?.replace("_", " ")}
            </span>

            {/* Notification bell */}
            <button onClick={() => { setShowNotif(!showNotif); setShowMsg(false); }}
              className="relative rounded-full p-2 transition-colors hover:bg-white/10" style={{ color: "#94a3b8" }}>
              <Bell className="h-5 w-5" />
              {unreadNotif > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>{unreadNotif}</span>}
            </button>

            {/* Message Admin button */}
            <button onClick={() => { setShowMsg(!showMsg); setShowNotif(false); }}
              className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
              <MessageCircle className="h-4 w-4" />
              Message Admin
              {unreadMsg > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#fff", color: "#ff5722" }}>{unreadMsg}</span>}
            </button>
          </div>
        </header>

        {/* Notification Dropdown */}
        {showNotif && (
          <div className="absolute right-4 top-16 z-50 w-80 rounded-2xl shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e2535" }}>
              <span className="font-semibold text-white text-sm">Notifications</span>
              <button onClick={() => { notificationStore.markAllRead(user.username, user.role); refreshMessages(); }}
                className="text-xs" style={{ color: "#ff7f50" }}>Mark all read</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-sm" style={{ color: "#475569" }}>No notifications</p>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => { notificationStore.markRead(n.id); refreshMessages(); }}
                  className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5" style={{ borderBottom: "1px solid #1e2535", opacity: n.read ? 0.5 : 1 }}>
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: n.read ? "#475569" : "#ff7f50" }} />
                  <div>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Chat Panel */}
        {showMsg && (
          <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowMsg(false)}>
            <div className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col" style={{ background: "#161b27", border: "1px solid #1e2535", maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #1e2535" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>A</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Admin / HR</p>
                    <p className="text-xs" style={{ color: "#22c55e" }}>● Online</p>
                  </div>
                </div>
                <button onClick={() => setShowMsg(false)} style={{ color: "#64748b" }}><X className="h-4 w-4" /></button>
              </div>

              {/* Conversation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "200px" }}>
                {conversation.length === 0 ? (
                  <p className="text-center text-sm py-8" style={{ color: "#475569" }}>No messages yet. Send a message to Admin.</p>
                ) : conversation.map(m => {
                  const isMine = m.from === user.username;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%] rounded-2xl px-4 py-2.5" style={{
                        background: isMine ? "linear-gradient(135deg, #ff7f50, #ff5722)" : "#1e2535",
                        color: isMine ? "#fff" : "#e2e8f0",
                      }}>
                        {!isMine && <p className="text-xs font-semibold mb-1" style={{ color: "#ff7f50" }}>{m.from}</p>}
                        <p className="text-sm">{m.text}</p>
                        <p className="text-xs mt-1 text-right" style={{ color: isMine ? "rgba(255,255,255,0.6)" : "#475569" }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {sent && (
                  <p className="text-center text-xs" style={{ color: "#22c55e" }}>✓ Message sent!</p>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 shrink-0" style={{ borderTop: "1px solid #1e2535" }}>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (optional)"
                  className="w-full rounded-xl px-3 py-2 text-xs text-white outline-none mb-2"
                  style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                <div className="flex gap-2">
                  <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message to Admin..."
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                  <button type="submit" disabled={!msg.trim()}
                    className="rounded-xl px-4 py-2.5 text-white transition-all hover:brightness-110 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6" style={{ background: "#0f1117" }}>
          <Outlet />
        </main>

        <footer className="px-6 py-3 text-center text-xs" style={{ background: "#161b27", borderTop: "1px solid #1e2535", color: "#475569" }}>
          © {new Date().getFullYear()} VEQUISO Construction. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default EmployeeLayout;
