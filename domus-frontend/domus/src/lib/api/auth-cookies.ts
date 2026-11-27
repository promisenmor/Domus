import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "./backend";

export const ACCESS_COOKIE = "domus_access";
export const REFRESH_COOKIE = "domus_refresh";

const accessCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60,
};

const refreshCookieOptions = {
  ...accessCookieOptions,
  maxAge: 60 * 60 * 24,
};

export function setAuthCookies(
  response: NextResponse,
  access: string,
  refresh: string,
) {
  response.cookies.set(ACCESS_COOKIE, access, accessCookieOptions);
  response.cookies.set(REFRESH_COOKIE, refresh, refreshCookieOptions);
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...accessCookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions, maxAge: 0 });
}

export function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export async function fetchCurrentUser(access: string) {
  return fetchBackend("/api/me/", {
    headers: { Authorization: `Bearer ${access}` },
  });
}

export async function refreshTokens(refresh: string) {
  const response = await fetchBackend("/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) return null;
  const tokens: unknown = await response.json();
  if (
    typeof tokens !== "object" ||
    tokens === null ||
    !("access" in tokens) ||
    typeof tokens.access !== "string"
  ) {
    throw new Error("The token refresh endpoint returned an invalid response.");
  }
  const nextRefresh =
    "refresh" in tokens && typeof tokens.refresh === "string"
      ? tokens.refresh
      : refresh;
  return { access: tokens.access, refresh: nextRefresh };
}
