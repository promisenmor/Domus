import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  clearAuthCookies,
  fetchCurrentUser,
  hasSameOrigin,
  refreshTokens,
  REFRESH_COOKIE,
  setAuthCookies,
} from "@/lib/api/auth-cookies";
import { fetchBackend, readBackendError } from "@/lib/api/backend";

type AuthAction =
  | "login"
  | "register"
  | "logout"
  | "session"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "resend-verification";

type RouteContext = { params: Promise<{ action: string }> };

function jsonError(message: string, status: number) {
  return NextResponse.json({ detail: message }, { status });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;
  if (action !== "session") return jsonError("Not found.", 404);

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  let refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let rotatedTokens: { access: string; refresh: string } | null = null;
  let userResponse = access ? await fetchCurrentUser(access) : null;

  if ((!userResponse || userResponse.status === 401) && refresh) {
    rotatedTokens = await refreshTokens(refresh);
    if (rotatedTokens) {
      access = rotatedTokens.access;
      refresh = rotatedTokens.refresh;
      userResponse = await fetchCurrentUser(access);
    }
  }

  if (!userResponse || userResponse.status === 401) {
    const response = NextResponse.json({ user: null });
    clearAuthCookies(response);
    return response;
  }
  if (!userResponse.ok) {
    return jsonError(await readBackendError(userResponse), 502);
  }

  const user = await userResponse.json();
  if (!["CLIENT", "AGENT"].includes(user.role)) {
    const response = jsonError("This account cannot access the frontend portal.", 403);
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ user });
  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens.access, rotatedTokens.refresh);
  }
  return response;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;
  const allowed: AuthAction[] = [
    "login",
    "register",
    "logout",
    "forgot-password",
    "reset-password",
    "verify-email",
    "resend-verification",
  ];
  if (!allowed.includes(action as AuthAction)) return jsonError("Not found.", 404);
  if (!hasSameOrigin(request)) return jsonError("Invalid request origin.", 403);

  if (action === "login") {
    const payload = await request.json();
    const login = await fetchBackend("/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!login.ok) return jsonError(await readBackendError(login), login.status);

    const tokens = await login.json();
    if (typeof tokens.access !== "string" || typeof tokens.refresh !== "string") {
      return jsonError("The login endpoint returned an invalid response.", 502);
    }
    const profile = await fetchCurrentUser(tokens.access);
    if (!profile.ok) return jsonError(await readBackendError(profile), profile.status);
    const user = await profile.json();
    if (!["CLIENT", "AGENT"].includes(user.role)) {
      return jsonError("This account cannot access the frontend portal.", 403);
    }

    const response = NextResponse.json({ user });
    setAuthCookies(response, tokens.access, tokens.refresh);
    return response;
  }

  if (action === "logout") {
    let refresh = request.cookies.get(REFRESH_COOKIE)?.value;
    let access = request.cookies.get(ACCESS_COOKIE)?.value;
    if (refresh && access) {
      let logoutResponse = await fetchBackend("/api/auth/logout/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });
      if (logoutResponse.status === 401) {
        const rotatedTokens = await refreshTokens(refresh);
        if (rotatedTokens) {
          access = rotatedTokens.access;
          refresh = rotatedTokens.refresh;
          logoutResponse = await fetchBackend("/api/auth/logout/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh }),
          });
        }
      }
      if (!logoutResponse.ok && logoutResponse.status !== 401) {
        const response = jsonError(await readBackendError(logoutResponse), logoutResponse.status);
        clearAuthCookies(response);
        return response;
      }
    }
    const response = NextResponse.json({ detail: "Signed out." });
    clearAuthCookies(response);
    return response;
  }

  const endpointByAction: Record<Exclude<AuthAction, "login" | "logout" | "session">, string> = {
    register: "/api/register/",
    "forgot-password": "/api/auth/password/forgot/",
    "reset-password": "/api/auth/password/reset/",
    "verify-email": "/api/auth/email/verify/",
    "resend-verification": "/api/auth/email/verification/resend/",
  };
  const endpoint = endpointByAction[action as keyof typeof endpointByAction];
  if (!endpoint) return jsonError("Not found.", 404);

  const backendResponse = await fetchBackend(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  const data = await backendResponse.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: backendResponse.status });
}
