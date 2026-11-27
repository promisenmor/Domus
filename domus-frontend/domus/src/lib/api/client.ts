export async function accountRequest<T>(
  resource: "dashboard" | "saved-properties" | "profile" | "password",
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/account/${resource}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(readApiMessage(data, response.status));
  }
  return data as T;
}

export function readApiMessage(data: unknown, status: number) {
  if (typeof data === "object" && data !== null) {
    const messages = Object.values(data)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === "string");
    if (messages.length) return messages.join(" ");
  }
  return `Request failed (${status}).`;
}

export function imageUrl(path: string | null) {
  if (!path) return "/window.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  return `${new URL(apiBase).origin}${path.startsWith("/") ? path : `/${path}`}`;
}
