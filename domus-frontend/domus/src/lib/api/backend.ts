const configuredApiBase =
  process.env.DOMUS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export const backendBaseUrl = configuredApiBase.replace(/\/+$/, "");

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${backendBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
}

export async function readBackendError(response: Response) {
  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return `The service returned an unexpected response (${response.status}).`;
  }

  const messages = Object.values(data)
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value): value is string => typeof value === "string");
  return messages.join(" ") || `Request failed (${response.status}).`;
}
