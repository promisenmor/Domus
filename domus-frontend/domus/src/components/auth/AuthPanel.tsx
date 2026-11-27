"use client";

import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AuthMode = "login" | "register" | "forgot" | "reset" | "verify";

type AuthPanelProps = {
  mode: AuthMode;
  uid?: string;
  token?: string;
};

function payloadMessage(data: unknown, ok: boolean) {
  if (typeof data === "object" && data !== null) {
    const values = Object.values(data);
    const text = values.flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === "string")
      .join(" ");
    if (text) return text;
  }
  return ok ? "Request completed." : "We couldn't complete that request. Please try again.";
}

async function responseMessage(response: Response) {
  const data: unknown = await response.json().catch(() => null);
  return payloadMessage(data, response.ok);
}

const headings: Record<AuthMode, { title: string; description: string }> = {
  login: { title: "Welcome back", description: "Sign in to pick up where you left off." },
  register: { title: "Create your account", description: "Save properties and keep your enquiries in one place." },
  forgot: { title: "Reset your password", description: "Enter your email and we'll send recovery instructions if an account exists." },
  reset: { title: "Choose a new password", description: "Create a new password for your Domus account." },
  verify: { title: "Verify your email", description: "Confirm your email address to start using your Domus account." },
};

const endpointByMode: Partial<Record<AuthMode, string>> = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  forgot: "/api/auth/forgot-password",
  reset: "/api/auth/reset-password",
  verify: "/api/auth/verify-email",
};

export function AuthPanel({ mode, uid, token }: AuthPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    if (mode === "register" && values.password !== values.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (mode === "reset" && values.new_password !== values.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    const payload: Record<string, FormDataEntryValue> = { ...values };
    delete payload.confirm_password;
    if (mode === "reset") {
      payload.uid = uid ?? "";
      payload.token = token ?? "";
    }
    if (mode === "verify") payload.token = token ?? "";

    setBusy(true);
    try {
      const response = await fetch(endpointByMode[mode]!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (mode === "login") {
        const loginResult: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          setError(payloadMessage(loginResult, false));
          return;
        }
        const destination =
          typeof loginResult === "object" &&
          loginResult !== null &&
          "user" in loginResult &&
          typeof loginResult.user === "object" &&
          loginResult.user !== null &&
          "role" in loginResult.user &&
          loginResult.user.role === "AGENT"
            ? "/agent"
            : "/account";
        router.push(destination);
        router.refresh();
        return;
      }
      const result = await responseMessage(response);
      if (!response.ok) {
        setError(result);
        return;
      }

      if (mode === "register") {
        setEmail(String(values.email));
        setMessage("Your account is ready. Check your inbox for the verification link before signing in.");
      } else if (mode === "forgot") {
        setMessage(result);
      } else if (mode === "reset") {
        setMessage("Your password has been updated. You can now sign in.");
      } else {
        setMessage("Your email is verified. You can now sign in.");
      }
    } catch {
      setError("Unable to reach Domus right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await responseMessage(response);
      if (response.ok) setMessage(result);
      else setError(result);
    } catch {
      setError("Unable to reach Domus right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const { title, description } = headings[mode];

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <Link href="/" className="auth-brand" aria-label="Domus home">
          <span className="brand-mark" aria-hidden="true" />
          <span>DOMUS</span>
        </Link>
        <div className="auth-card-heading">
          <span className="auth-icon" aria-hidden="true">
            {mode === "verify" ? <ShieldCheck size={21} /> : mode === "reset" ? <KeyRound size={20} /> : <Mail size={20} />}
          </span>
          <h1 id="auth-heading">{title}</h1>
          <p>{description}</p>
        </div>

        {message ? (
          <div className="auth-feedback auth-success" role="status">
            <p>{message}</p>
            {mode === "register" && (
              <button type="button" className="auth-inline-button" onClick={resendVerification} disabled={busy}>
                Resend verification email
              </button>
            )}
            {(mode === "register" || mode === "reset" || mode === "verify") && (
              <Link className="auth-submit auth-submit-link" href="/login">Go to sign in <ArrowRight size={17} /></Link>
            )}
          </div>
        ) : mode === "verify" && !token ? (
          <div className="auth-feedback auth-error" role="alert">
            <p>This verification link is missing its token.</p>
            <Link href="/register">Create an account</Link>
          </div>
        ) : mode === "reset" && (!uid || !token) ? (
          <div className="auth-feedback auth-error" role="alert">
            <p>This password reset link is incomplete or invalid.</p>
            <Link href="/forgot-password">Request another reset link</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <label>
                Full name
                <input name="full_name" type="text" autoComplete="name" required maxLength={301} />
              </label>
            )}
            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={mode === "forgot" ? email : undefined}
                  onChange={mode === "forgot" ? (event) => setEmail(event.target.value) : undefined}
                />
              </label>
            )}
            {(mode === "login" || mode === "register") && (
              <label>
                Password
                <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
              </label>
            )}
            {(mode === "register" || mode === "reset") && (
              <>
                {mode === "reset" && (
                  <label>
                    New password
                    <input name="new_password" type="password" autoComplete="new-password" required />
                  </label>
                )}
                <label>
                  Confirm password
                  <input name="confirm_password" type="password" autoComplete="new-password" required />
                </label>
              </>
            )}
            {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "verify" ? "Verify email" : "Update password"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {mode === "login" && (
            <>
              <Link href="/forgot-password">Forgot password?</Link>
              <span>New to Domus? <Link href="/register">Create an account</Link></span>
            </>
          )}
          {mode === "register" && <span>Already have an account? <Link href="/login">Sign in</Link></span>}
          {(mode === "forgot" || mode === "reset" || mode === "verify") && <Link href="/login"><ArrowLeft size={15} /> Back to sign in</Link>}
        </div>
      </section>
    </main>
  );
}
