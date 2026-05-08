import { projectId, publicAnonKey } from "../../../utils/supabase/info.tsx";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2d50666c`;

let userToken: string | null = null;
export function setAuthToken(token: string | null) {
  userToken = token;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = userToken || publicAnonKey;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export type Collection = "products" | "orders" | "campaigns";

export const api = {
  list: <T>(c: Collection) => req<{ items: T[] }>(`/${c}`).then((r) => r.items),
  create: <T>(c: Collection, body: any) =>
    req<{ item: T }>(`/${c}`, { method: "POST", body: JSON.stringify(body) }).then((r) => r.item),
  update: <T>(c: Collection, id: string, body: any) =>
    req<{ item: T }>(`/${c}/${id}`, { method: "PUT", body: JSON.stringify(body) }).then(
      (r) => r.item
    ),
  remove: (c: Collection, id: string) =>
    req<{ ok: true }>(`/${c}/${id}`, { method: "DELETE" }),
};

export const customerApi = {
  signup: (email: string, password: string, name: string) =>
    req<{ user: any }>("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
};
