export async function agentRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/agent/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      const message = Object.values(data)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === "string")
        .join(" ");
      if (message) throw new Error(message);
    }
    throw new Error(`Request failed (${response.status}).`);
  }
  return data as T;
}
