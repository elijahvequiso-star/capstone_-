import API_BASE from "@/lib/config";

const API_BASE_URL = API_BASE;

export const api = {
  employees: {
    getAll: () => fetch(`${API_BASE_URL}/employees/`).then(r => r.json()),
    get: (id: number) => fetch(`${API_BASE_URL}/employees/${id}/`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/employees/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE_URL}/employees/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id: number) => fetch(`${API_BASE_URL}/employees/${id}/`, { method: 'DELETE' })
  },
  requests: {
    getAll: () => fetch(`${API_BASE_URL}/requests/`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE_URL}/requests/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  },
  leaves: {
    getAll: () => fetch(`${API_BASE_URL}/leaves/`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/leaves/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id: number, data: any) => fetch(`${API_BASE_URL}/leaves/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  },
  salaryPayments: {
    getAll: () => fetch(`${API_BASE_URL}/salary-payments/`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/salary-payments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  }
};
