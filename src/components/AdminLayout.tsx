import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Bell, MessageCircle, X, Send, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { notificationStore, messageStore } from "@/lib/notificationStore";

const AdminLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const isAdmin = user.role === "admin";
  const isHR = user.role === "hr";
  const isAdminOrHR = isAdmin || isHR;

  const [showNotif, setShowNotif] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);

  // Messaging state
  const [threads, setThreads] = useState<{ username: string; lastMsg: string; unread: number; time: string }[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");

  const refreshAll = () => {
    setNotifications(notificationStore.getForUser(user.username, user.role));
    setUnreadNotif(notificationStore.unreadCount(user.username, user.role));

    const all = messageStore.getAll();
    const adminMessages = all.filter(m =>
      m.to === user.username || m.from === user.username || (isAdminOrHR && m.to === "admin")
    );

    const threadMap: Record<string, any[]> = {};
    adminMessages.forEach(m => {
      const other = m.from === user.username ? m.to : m.from;
      if (!threadMap[other]) threadMap[other] = [];
      threadMap[other].push(m);
    });

    const threadList = Object.entries(threadMap).map(([username, msgs]) => {
      const sorted = msgs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const unread = msgs.filter(m => (m.to === user.username || (isAdminOrHR && m.to === "admin")) && !m.read).length;
      return { username, lastMsg: sorted[0].text.slice(0, 40), unread, time: sorted[0].timestamp };
    }).sort((a, b) => b.time.localeCompare(a.time));

    setThreads(threadList);
    setUnreadMsg(threadList.reduce((s, t) => s + t.unread, 0));

    if (activeThread) {
      const conv = all.filter(m =>
        (m.from === activeThread && (m.to === user.username || (isAdminOrHR && m.to === "admin"))) ||
        (m.from === user.username && m.to === activeThread)
      ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      setConversation(conv);
      all.filter(m => (m.from === activeThread && (m.to === user.username || (isAdminOrHR && m.to === "admin")) && !m.read))
        .forEach(m => messageStore.markRead(m.id));
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 2000);
    return () => clearInterval(interval);
  }, [activeThread]);

  const openThread = (username: string) => {
    setActiveThread(username);
    const all = messageStore.getAll();
    const conv = all.filter(m =>
      (m.from === username && (m.to === user.username || (isAdminOrHR && m.to === "admin"))) ||
      (m.from === user.username && m.to === username)
    ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    setConversation(conv);
    messageStore.getAll()
      .filter(m => (m.from === username && (m.to === user.username || (isAdminOrHR && m.to === "admin")) && !m.read))
      .forEach(m => messageStore.markRead(m.id));
    refreshAll();
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    messageStore.send({
      from: user.username,
      from_role: user.role,
      to: activeThread,
      to_role: "employee",
      text: replyText,
    });
    setReplyText("");
    refreshAll();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "#0f1117" }}>
        <AdminSidebar />
        <div className="flex flex-1 flex-col min-w-0">

          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between px-4" style={{ background: "#161b27", borderBottom: "1px solid #1e2535" }}>
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-gray-400 hover:text-white" />
              <span className="text-sm font-semibold text-white hidden sm:block">
                {isAdmin ? "Admin Dashboard" : "HR Panel"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{
                background: isAdmin ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                color: isAdmin ? "#ef4444" : "#22c55e",
              }}>
                {isAdmin ? "🔴 Admin" : "🟢 HR"}
              </span>

              {/* Message button */}
              <button onClick={() => { setShowMsg(!showMsg); setShowNotif(false); }}
                className="relative rounded-full p-2 transition-colors hover:bg-white/10" style={{ color: "#94a3b8" }}>
                <MessageCircle className="h-5 w-5" />
                {unreadMsg > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#ff7f50" }}>{unreadMsg}</span>}
              </button>

              {/* Notification bell */}
              <button onClick={() => { setShowNotif(!showNotif); setShowMsg(false); }}
                className="relative rounded-full p-2 transition-colors hover:bg-white/10" style={{ color: "#94a3b8" }}>
                <Bell className="h-5 w-5" />
                {unreadNotif > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>{unreadNotif}</span>}
              </button>

              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                {(user.full_name || user.username || "U").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Notification Dropdown */}
          {showNotif && (
            <div className="absolute right-4 top-14 z-50 w-80 rounded-2xl shadow-2xl" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e2535" }}>
                <span className="font-semibold text-white text-sm">Notifications</span>
                <button onClick={() => { notificationStore.markAllRead(user.username, user.role); refreshAll(); }}
                  className="text-xs" style={{ color: "#ff7f50" }}>Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-sm" style={{ color: "#475569" }}>No notifications</p>
                ) : notifications.map(n => (
                  <div key={n.id} onClick={() => { notificationStore.markRead(n.id); refreshAll(); }}
                    className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5" style={{ borderBottom: "1px solid #1e2535", opacity: n.read ? 0.5 : 1 }}>
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: n.read ? "#475569" : "#ff7f50" }} />
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: "#334155" }}>{new Date(n.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messaging Panel */}
          {showMsg && (
            <div className="absolute right-4 top-14 z-50 w-80 rounded-2xl shadow-2xl flex flex-col" style={{ background: "#161b27", border: "1px solid #1e2535", maxHeight: "520px" }}>

              {/* Thread list view */}
              {!activeThread ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #1e2535" }}>
                    <span className="font-semibold text-white text-sm">Messages</span>
                    <button onClick={() => setShowMsg(false)} style={{ color: "#64748b" }}><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                      <p className="py-8 text-center text-sm" style={{ color: "#475569" }}>No messages yet.<br />Employees will appear here when they message you.</p>
                    ) : threads.map(t => (
                      <button key={t.username} onClick={() => openThread(t.username)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5" style={{ borderBottom: "1px solid #1e2535" }}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                          {t.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">{t.username}</p>
                            {t.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#ff7f50" }}>{t.unread}</span>}
                          </div>
                          <p className="truncate text-xs mt-0.5" style={{ color: "#64748b" }}>{t.lastMsg}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Conversation view */
                <>
                  <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #1e2535" }}>
                    <button onClick={() => setActiveThread(null)} style={{ color: "#64748b" }}><ChevronLeft className="h-4 w-4" /></button>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                      {activeThread.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-white flex-1">{activeThread}</p>
                    <button onClick={() => setShowMsg(false)} style={{ color: "#64748b" }}><X className="h-4 w-4" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "200px" }}>
                    {conversation.length === 0 ? (
                      <p className="text-center text-xs py-6" style={{ color: "#475569" }}>No messages yet</p>
                    ) : conversation.map(m => {
                      const isMine = m.from === user.username;
                      return (
                        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[80%] rounded-2xl px-3 py-2" style={{
                            background: isMine ? "linear-gradient(135deg, #ff7f50, #ff5722)" : "#1e2535",
                            color: "#fff",
                          }}>
                            {!isMine && <p className="text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>{m.from}</p>}
                            <p className="text-sm">{m.text}</p>
                            <p className="text-xs mt-1 text-right" style={{ color: "rgba(255,255,255,0.5)" }}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleReply} className="flex gap-2 p-3 shrink-0" style={{ borderTop: "1px solid #1e2535" }}>
                    <input value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${activeThread}...`}
                      className="flex-1 rounded-xl px-3 py-2 text-sm text-white outline-none"
                      style={{ background: "#0f1117", border: "1px solid #1e2535" }} />
                    <button type="submit" disabled={!replyText.trim()}
                      className="rounded-xl px-3 py-2 text-white disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #ff7f50, #ff5722)" }}>
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
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
    </SidebarProvider>
  );
};

export default AdminLayout;
