// FlashClean API client
import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
export const API_BASE = `${BASE}/api`;

const TOKEN_KEY = "fc_auth_token";

export async function getToken(): Promise<string | null> {
  return (await storage.secureGet(TOKEN_KEY, "" as string)) || null;
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await storage.secureSet(TOKEN_KEY, token);
  else await storage.secureRemove(TOKEN_KEY);
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: any; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth) {
    const tok = await getToken();
    if (tok) headers.Authorization = `Bearer ${tok}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      detail = j.detail ?? detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  picture?: string | null;
  auth_providers: string[];
};

export type AuthResp = { access_token: string; token_type: string; user: User };

export const api = {
  register: (email: string, password: string, full_name?: string) =>
    request<AuthResp>("/auth/register", {
      method: "POST",
      body: { email, password, full_name },
    }),
  login: (email: string, password: string) =>
    request<AuthResp>("/auth/login", { method: "POST", body: { email, password } }),
  googleSession: (session_id: string) =>
    request<AuthResp>("/auth/session", { method: "POST", body: { session_id } }),
  me: () => request<User>("/auth/me", { auth: true }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST", auth: true }),
  createBooking: (b: {
    service_type: string;
    plan_type?: string;
    date: string;
    time?: string;
    address: string;
    notes?: string;
  }) => request<any>("/bookings", { method: "POST", auth: true, body: b }),
  listBookings: () => request<any[]>("/bookings", { auth: true }),
};
