const API = "http://localhost:8000/api";

// localStorage keys
const KEYS = {
  employees: "vequiso_employees",
  requests: "vequiso_requests",
  leaves: "vequiso_leaves",
  salary: "vequiso_salary",
};

// Generic helpers
function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Try backend, fall back to localStorage
async function apiFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// ── EMPLOYEES ──────────────────────────────────────────────
export type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
  status: "Active" | "Inactive";
};

export const employeeStore = {
  getAll: async (): Promise<Employee[]> => {
    try { return await apiFetch(`${API}/employees/`); }
    catch { return load<Employee>(KEYS.employees); }
  },
  add: async (data: Omit<Employee, "id">): Promise<void> => {
    try {
      await fetch(`${API}/employees/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Employee>(KEYS.employees);
      list.unshift({ id: Date.now(), ...data });
      save(KEYS.employees, list);
    }
  },
  update: async (id: number, data: Omit<Employee, "id">): Promise<void> => {
    try {
      await fetch(`${API}/employees/${id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Employee>(KEYS.employees).map(e => e.id === id ? { ...e, ...data } : e);
      save(KEYS.employees, list);
    }
  },
  delete: async (id: number): Promise<void> => {
    try { await fetch(`${API}/employees/${id}/`, { method: "DELETE" }); }
    catch {
      save(KEYS.employees, load<Employee>(KEYS.employees).filter(e => e.id !== id));
    }
  },
};

// ── REQUESTS ───────────────────────────────────────────────
export type Request = {
  id: number;
  employee_name: string;
  type: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const requestStore = {
  getAll: async (): Promise<Request[]> => {
    try { return await apiFetch(`${API}/requests/`); }
    catch { return load<Request>(KEYS.requests); }
  },
  add: async (data: Omit<Request, "id">): Promise<void> => {
    try {
      await fetch(`${API}/requests/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Request>(KEYS.requests);
      list.unshift({ id: Date.now(), ...data });
      save(KEYS.requests, list);
    }
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    try {
      await fetch(`${API}/requests/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    } catch {
      const list = load<Request>(KEYS.requests).map(r => r.id === id ? { ...r, status: status as Request["status"] } : r);
      save(KEYS.requests, list);
    }
  },
  delete: async (id: number): Promise<void> => {
    try { await fetch(`${API}/requests/${id}/`, { method: "DELETE" }); }
    catch { save(KEYS.requests, load<Request>(KEYS.requests).filter(r => r.id !== id)); }
  },
};

// ── LEAVES ─────────────────────────────────────────────────
export type Leave = {
  id: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const leaveStore = {
  getAll: async (): Promise<Leave[]> => {
    try { return await apiFetch(`${API}/leaves/`); }
    catch { return load<Leave>(KEYS.leaves); }
  },
  add: async (data: Omit<Leave, "id">): Promise<void> => {
    try {
      await fetch(`${API}/leaves/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Leave>(KEYS.leaves);
      list.unshift({ id: Date.now(), ...data });
      save(KEYS.leaves, list);
    }
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    try {
      await fetch(`${API}/leaves/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    } catch {
      const list = load<Leave>(KEYS.leaves).map(l => l.id === id ? { ...l, status: status as Leave["status"] } : l);
      save(KEYS.leaves, list);
    }
  },
  delete: async (id: number): Promise<void> => {
    try { await fetch(`${API}/leaves/${id}/`, { method: "DELETE" }); }
    catch { save(KEYS.leaves, load<Leave>(KEYS.leaves).filter(l => l.id !== id)); }
  },
};

// ── SALARY ─────────────────────────────────────────────────
export type Salary = {
  id: number;
  employee_name: string;
  employee_position: string;
  basic: number;
  deductions: number;
};

export const salaryStore = {
  getAll: async (): Promise<Salary[]> => {
    try { return await apiFetch(`${API}/salary/`); }
    catch { return load<Salary>(KEYS.salary); }
  },
  add: async (data: Omit<Salary, "id">): Promise<void> => {
    try {
      await fetch(`${API}/salary/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Salary>(KEYS.salary);
      list.unshift({ id: Date.now(), ...data });
      save(KEYS.salary, list);
    }
  },
  update: async (id: number, data: Omit<Salary, "id">): Promise<void> => {
    try {
      await fetch(`${API}/salary/${id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } catch {
      const list = load<Salary>(KEYS.salary).map(s => s.id === id ? { ...s, ...data } : s);
      save(KEYS.salary, list);
    }
  },
  delete: async (id: number): Promise<void> => {
    try { await fetch(`${API}/salary/${id}/`, { method: "DELETE" }); }
    catch { save(KEYS.salary, load<Salary>(KEYS.salary).filter(s => s.id !== id)); }
  },
};

// ── AUTH ───────────────────────────────────────────────────
export type User = { id: number; username: string; full_name: string; role: string };

export const authStore = {
  register: async (form: { full_name: string; role: string; username: string; password: string }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API}/auth/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };

      // Also save employee to localStorage for offline display
      const ROLE_MAP: Record<string, [string, string]> = {
        mason: ["Mason", "Construction"],
        electrician: ["Electrician", "Engineering"],
        team_member: ["Team Member", "Operations"],
      };
      const [position, department] = ROLE_MAP[form.role] || [form.role, "General"];
      const list = load<Employee>(KEYS.employees);
      list.unshift({ id: Date.now(), name: form.full_name, position, department, status: "Active" });
      save(KEYS.employees, list);

      return { ok: true };
    } catch {
      // Offline fallback — save locally
      const ROLE_MAP: Record<string, [string, string]> = {
        mason: ["Mason", "Construction"],
        electrician: ["Electrician", "Engineering"],
        team_member: ["Team Member", "Operations"],
      };
      const [position, department] = ROLE_MAP[form.role] || [form.role, "General"];
      const list = load<Employee>(KEYS.employees);
      if (list.find(e => e.name === form.full_name)) return { ok: false, error: "Account already exists." };
      list.unshift({ id: Date.now(), name: form.full_name, position, department, status: "Active" });
      save(KEYS.employees, list);

      // Save user credentials locally
      const users = load<any>("vequiso_users");
      users.push({ username: form.username, password: form.password, full_name: form.full_name, role: form.role });
      save("vequiso_users", users);

      return { ok: true };
    }
  },

  login: async (form: { username: string; password: string; role: string }): Promise<{ ok: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      return { ok: true, user: data.user };
    } catch {
      // Offline fallback
      const users = load<any>("vequiso_users");
      const found = users.find((u: any) => u.username === form.username && u.password === form.password && u.role === form.role);
      if (!found) return { ok: false, error: "Invalid credentials or role mismatch." };
      return { ok: true, user: { id: 1, username: found.username, full_name: found.full_name, role: found.role } };
    }
  },
};
