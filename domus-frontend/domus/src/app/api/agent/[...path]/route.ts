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

type RouteContext = { params: Promise<{ path: string[] }> };
type AgentEndpoint = { endpoint: string; methods: string[] };

function resolveEndpoint(path: string[]): AgentEndpoint | null {
  if (path.length === 1 && path[0] === "dashboard") {
    return { endpoint: "/api/dashboard/agent/", methods: ["GET"] };
  }
  if (path.length === 1 && path[0] === "listings") {
    return { endpoint: "/api/my-listings/", methods: ["GET", "POST"] };
  }
  if (path.length === 2 && path[0] === "listings" && /^\d+$/.test(path[1])) {
    return { endpoint: `/api/my-listings/${path[1]}/`, methods: ["GET", "PATCH", "DELETE"] };
  }
  if (
    path.length === 3 &&
    path[0] === "listings" &&
    /^\d+$/.test(path[1]) &&
    path[2] === "submit"
  ) {
    return { endpoint: `/api/my-listings/${path[1]}/submit/`, methods: ["POST"] };
  }
  if (path.length === 1 && path[0] === "listing-images") {
    return { endpoint: "/api/my-listing-images/", methods: ["GET", "POST"] };
  }
  if (path.length === 2 && path[0] === "listing-images" && /^\d+$/.test(path[1])) {
    return { endpoint: `/api/my-listing-images/${path[1]}/`, methods: ["PATCH", "DELETE"] };
  }
  if (path.length === 1 && path[0] === "enquiries") {
    return { endpoint: "/api/my-enquiries/", methods: ["GET"] };
  }
  if (path.length === 2 && path[0] === "enquiries" && /^\d+$/.test(path[1])) {
    return { endpoint: `/api/my-enquiries/${path[1]}/`, methods: ["GET", "PATCH"] };
  }
  if (path.length === 1 && path[0] === "profile") {
    return { endpoint: "/api/me/", methods: ["GET", "PATCH"] };
  }
  return null;
}

async function handleRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const resource = resolveEndpoint(path);
  if (!resource) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  if (!resource.methods.includes(request.method)) {
    return NextResponse.json({ detail: "Method not allowed." }, { status: 405 });
  }
  if (request.method !== "GET" && !hasSameOrigin(request)) {
    return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  }

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!access && !refresh) {
    return NextResponse.json({ detail: "Sign in to continue." }, { status: 401 });
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const contentType = request.headers.get("content-type");
  if (hasBody && contentType && !/^(application\/json|multipart\/form-data)(;|$)/i.test(contentType)) {
    return NextResponse.json({ detail: "Unsupported content type." }, { status: 415 });
  }
  const body = hasBody ? new Uint8Array(await request.arrayBuffer()) : undefined;
  const endpoint = `${resource.endpoint}${request.nextUrl.search}`;
  const send = (token: string) =>
    fetchBackend(endpoint, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
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

  const profileResponse = await fetchCurrentUser(access!);
  if (!profileResponse.ok) {
    const response = NextResponse.json(
      { detail: profileResponse.status === 401 ? "Authentication has expired." : "Unable to verify this account." },
      { status: profileResponse.status === 401 ? 401 : 502 },
    );
    clearAuthCookies(response);
    return response;
  }
  const profile = await profileResponse.json();
  if (profile.role !== "AGENT") {
    const response = NextResponse.json({ detail: "This area is for agent accounts." }, { status: 403 });
    clearAuthCookies(response);
    return response;
  }

  const response = new NextResponse(await backendResponse.text(), {
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
