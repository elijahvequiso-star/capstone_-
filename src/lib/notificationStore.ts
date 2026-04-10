// Lightweight in-memory + localStorage store for notifications and messages

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: string;
  for_role?: string; // 'admin' | 'hr' | 'employee' | 'all'
};

export type Message = {
  id: string;
  from: string;
  from_role: string;
  to: string;
  to_role: string;
  text: string;
  timestamp: string;
  read: boolean;
};

const load = <T>(key: string): T[] => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const save = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

export const notificationStore = {
  getAll: (): Notification[] => load("vequiso_notifications"),
  getForUser: (username: string, role: string): Notification[] =>
    load<Notification>("vequiso_notifications").filter(
      n => n.for_role === "all" || n.for_role === role || n.to === username
    ),
  add: (n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const list = load<Notification>("vequiso_notifications");
    list.unshift({ ...n, id: Date.now().toString(), timestamp: new Date().toISOString(), read: false });
    save("vequiso_notifications", list);
  },
  markRead: (id: string) => {
    const list = load<Notification>("vequiso_notifications").map(n => n.id === id ? { ...n, read: true } : n);
    save("vequiso_notifications", list);
  },
  markAllRead: (username: string, role: string) => {
    const list = load<Notification>("vequiso_notifications").map(n =>
      (n.for_role === "all" || n.for_role === role || n.to === username) ? { ...n, read: true } : n
    );
    save("vequiso_notifications", list);
  },
  unreadCount: (username: string, role: string): number =>
    load<Notification>("vequiso_notifications").filter(
      n => !n.read && (n.for_role === "all" || n.for_role === role || n.to === username)
    ).length,
};

export const messageStore = {
  getAll: (): Message[] => load("vequiso_messages"),
  getConversation: (userA: string, userB: string): Message[] =>
    load<Message>("vequiso_messages").filter(
      m => (m.from === userA && m.to === userB) || (m.from === userB && m.to === userA)
    ).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
  getInbox: (username: string): Message[] =>
    load<Message>("vequiso_messages").filter(m => m.to === username)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  send: (msg: Omit<Message, "id" | "timestamp" | "read">) => {
    const list = load<Message>("vequiso_messages");
    list.push({ ...msg, id: Date.now().toString(), timestamp: new Date().toISOString(), read: false });
    save("vequiso_messages", list);
    // Also create a notification for recipient
    notificationStore.add({
      title: `New message from ${msg.from}`,
      message: msg.text.slice(0, 60),
      type: "info",
      for_role: msg.to_role,
      to: msg.to,
    });
  },
  markRead: (id: string) => {
    const list = load<Message>("vequiso_messages").map(m => m.id === id ? { ...m, read: true } : m);
    save("vequiso_messages", list);
  },
  unreadCount: (username: string): number =>
    load<Message>("vequiso_messages").filter(m => m.to === username && !m.read).length,
};
