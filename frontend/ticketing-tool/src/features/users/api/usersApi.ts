import type { User } from "../models/user.model";

const BASE_URL = "http://localhost:8000/user";

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

export const UsersApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${BASE_URL}/agents`, {method: "GET", credentials: "include"});
    return handleResponse<User[]>(res);
  },
};
