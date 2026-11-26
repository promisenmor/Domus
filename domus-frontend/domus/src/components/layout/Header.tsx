"use client";

import { Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Domus home">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-top" />
            <span className="brand-mark-bottom" />
          </span>
          <span>DOMUS</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/properties">Properties</Link>
          <Link href="/properties?listing_type=buy">Buy</Link>
          <Link href="/properties?listing_type=rent">Rent</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="login-link">
            <UserRound size={17} />
            <span>Login</span>
          </Link>
          <Link href="/register" className="register-link">Register</Link>
          <ThemeToggle />
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/properties" onClick={() => setMenuOpen(false)}>Properties</Link>
          <Link href="/properties?listing_type=buy" onClick={() => setMenuOpen(false)}>Buy</Link>
          <Link href="/properties?listing_type=rent" onClick={() => setMenuOpen(false)}>Rent</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Journal</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link className="mobile-register" href="/register" onClick={() => setMenuOpen(false)}>Register</Link>
        </nav>
      )}
    </header>
  );
}
