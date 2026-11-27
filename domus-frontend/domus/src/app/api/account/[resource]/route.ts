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
import { fetchBackend } from "@/lib/api/backend";

type Resource = "dashboard" | "saved-properties" | "profile" | "password";
type RouteContext = { params: Promise<{ resource: string }> };

const resourceEndpoints: Record<Resource, string> = {
  dashboard: "/api/dashboard/client/",
  "saved-properties": "/api/saved-listings/",
  profile: "/api/me/",
  password: "/api/auth/password/change/",
};

async function handleRequest(request: NextRequest, context: RouteContext) {
  const { resource } = await context.params;
  if (!(resource in resourceEndpoints)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  if (request.method !== "GET" && !hasSameOrigin(request)) {
    return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  }

  const allowedMethods: Record<Resource, string[]> = {
    dashboard: ["GET"],
    "saved-properties": ["GET", "POST", "DELETE"],
    profile: ["GET", "PATCH"],
    password: ["POST"],
  };
  const selectedResource = resource as Resource;
  if (!allowedMethods[selectedResource].includes(request.method)) {
    return NextResponse.json({ detail: "Method not allowed." }, { status: 405 });
  }

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) {
    return NextResponse.json({ detail: "Sign in to continue." }, { status: 401 });
  }

  const endpoint = `${resourceEndpoints[selectedResource]}${request.nextUrl.search}`;
  const body =
    request.method === "GET" ? undefined : await request.text();
  const send = (token: string) =>
    fetchBackend(endpoint, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
    });

  let backendResponse = access ? await send(access) : null;
  let rotatedTokens: { access: string; refresh: string } | null = null;
  if ((!backendResponse || backendResponse.status === 401) && refresh) {
    rotatedTokens = await refreshTokens(refresh);
    if (rotatedTokens) {
      access = rotatedTokens.access;
      backendResponse = await send(access);
    }
  }

  if (!backendResponse) {
    const response = NextResponse.json({ detail: "Authentication has expired." }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  if (backendResponse.ok && selectedResource !== "password") {
    const profileResponse = await fetchCurrentUser(access!);
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      if (profile.role !== "CLIENT") {
        const response = NextResponse.json({ detail: "This area is for client accounts." }, { status: 403 });
        clearAuthCookies(response);
        return response;
      }
    }
  }

  const responseBody = await backendResponse.text();
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("Content-Type") ?? "application/json",
    },
  });
  if (rotatedTokens) {
    setAuthCookies(response, rotatedTokens.access, rotatedTokens.refresh);
  } else if (backendResponse.status === 401) {
    clearAuthCookies(response);
  }
  return response;
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
