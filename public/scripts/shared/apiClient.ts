// public/shared/apiClient.ts

// ----------------------------
// 本番 / ローカル自動切り替え
// ----------------------------
const API_BASE_URL =
  window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://step-8-dashboard-f93w.vercel.app"; 
export class APIClient {
  constructor(private base: string = API_BASE_URL) {}

  async get<T>(url: string): Promise<T> {
    const res = await fetch(this.base + url);
    if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
    return await res.json();
  }

  async post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(this.base + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${url} failed (${res.status})`);
    return await res.json();
  }

  async put<T>(url: string, body: any): Promise<T> {
    const res = await fetch(this.base + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed (${res.status})`);
    return await res.json();
  }

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(this.base + url, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE ${url} failed (${res.status})`);
    return await res.json();
  }
}
