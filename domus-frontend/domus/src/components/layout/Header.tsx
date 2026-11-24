import { Menu, UserRound } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Domus home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>DOMUS</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className="active" href="/">Home</Link>
          <Link href="/properties">Properties</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="account-link">
            <UserRound size={18} strokeWidth={1.8} />
            <span>Sign in</span>
          </Link>
          <Link href="/register" className="header-cta">List a property</Link>
          <button className="menu-button" type="button" aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
