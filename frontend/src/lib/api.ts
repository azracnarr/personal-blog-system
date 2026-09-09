const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: init.cache ?? "no-store",
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init.headers
    }
  });
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const message = (await response.text()).trim();
    throw new Error(message || `İstek başarısız (${response.status})`);
  }
  return response.json();
}
