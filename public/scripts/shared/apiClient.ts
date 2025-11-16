// public/scripts/shared/apiClient.ts

export class APIClient {
  baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async get<T>(url: string): Promise<T> {
    const res = await fetch(this.baseUrl + url);
    if (!res.ok) {
      throw new Error(`GET ${url} failed: ${res.status}`);
    }
    return res.json();
  }

  async post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(this.baseUrl + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`POST ${url} failed: ${res.status}`);
    }
    return res.json();
  }

  async put<T>(url: string, body: any): Promise<T> {
    const res = await fetch(this.baseUrl + url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`PUT ${url} failed: ${res.status}`);
    }
    return res.json();
  }

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(this.baseUrl + url, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`DELETE ${url} failed: ${res.status}`);
    }
    return res.json();
  }
}
