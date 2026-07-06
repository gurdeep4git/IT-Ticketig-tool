import type { Ticket } from "../models/ticket.model";

const BASE_URL = "http://localhost:8000/ticket";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} ${errorBody}`,
    );
  }
  // handle empty responses (e.g. DELETE with 204 No Content)
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const ticketsApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
  }): Promise<Ticket[]> => {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const res = await fetch(`${BASE_URL}${query}`, {method: "GET", credentials: "include"});
    return handleResponse<Ticket[]>(res);
  },

  // GET /api/tickets/:id
  getById: async (id: string): Promise<Ticket> => {
    const res = await fetch(`${BASE_URL}/${id}`);
    return handleResponse<Ticket>(res);
  },

  // POST /api/tickets
  create: async (payload: any): Promise<Ticket> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      credentials:'include',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Ticket>(res);
  },

  // PATCH /api/tickets/:id
  update: async (id: string, payload: any): Promise<Ticket> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Ticket>(res);
  },

  // DELETE /api/tickets/:id
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    return handleResponse<void>(res);
  },

  addAssignee: async (ticketId: number, agentId: number): Promise<Ticket> => {
    const res = await fetch(`${BASE_URL}/${ticketId}/assign`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({'assigned_to': agentId}),
    });
    return handleResponse<Ticket>(res);
  },

  getStatutes: async (): Promise<string[]> => {
    const res = await fetch(`${BASE_URL}/statuses`, {
      method: "GET",
    });
    return handleResponse<string[]>(res);
  },

  changeStatus: async (ticketId: number, status: string): Promise<Ticket> => {
    const res = await fetch(`${BASE_URL}/${ticketId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({'status': status}),
    });
    return handleResponse<Ticket>(res);
  },
};
