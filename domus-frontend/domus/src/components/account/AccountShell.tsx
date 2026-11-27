"use client";

import {
  Bookmark,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ClientProfile } from "@/types/account";

const navigation = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/saved-properties", label: "Saved properties", icon: Bookmark },
  { href: "/account/enquiries", label: "My enquiries", icon: Mail },
  { href: "/account/profile", label: "My profile", icon: UserRound },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (active) setProfile(data.user);
      })
      .catch(() => {
        if (active) setError("We couldn't connect to your account. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [pathname, router]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return <main className="account-loading"><span className="loading-indicator" />Loading your account…</main>;
  }
  if (error) {
    return (
      <main className="account-loading account-load-error">
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </main>
    );
  }
  if (!profile) return null;

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Domus client";

  return (
    <div className="account-app">
      <header className="account-topbar">
        <Link href="/" className="brand account-brand" aria-label="Domus home">
          <span className="brand-mark" aria-hidden="true" />
          <span>DOMUS</span>
        </Link>
        <div className="account-topbar-actions">
          <Link href="/properties" className="browse-link">Browse properties</Link>
          <div className="account-user">
            <span className="user-avatar">{displayName.slice(0, 1).toUpperCase()}</span>
            <span className="account-user-name">{displayName}</span>
            <ChevronDown size={15} />
          </div>
          <button
            type="button"
            className="account-menu-toggle"
            aria-label={menuOpen ? "Close account navigation" : "Open account navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <div className="account-layout">
        <aside className={`account-sidebar${menuOpen ? " account-sidebar-open" : ""}`}>
          <div className="sidebar-intro">
            <span>YOUR ACCOUNT</span>
            <strong>My Domus</strong>
          </div>
          <nav aria-label="Account navigation">
            {navigation.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={isActive ? "account-nav-link active" : "account-nav-link"}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <Link href="/contact" className="account-nav-link"><CircleHelp size={18} /><span>Help & support</span></Link>
            <button type="button" className="account-nav-link sidebar-logout" onClick={signOut}>
              <LogOut size={18} /><span>Sign out</span>
            </button>
            <p>DOMUS CLIENT PORTAL<br />A better way to find home.</p>
          </div>
        </aside>
        <main className="account-main">
          <div className="account-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
