import { ArrowUpRight, BriefcaseBusiness, Camera } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand brand-light" aria-label="Domus home">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span>DOMUS</span>
          </Link>
          <p>Thoughtfully connecting people with places that feel like home.</p>
          <div className="social-links">
            <a href="#" aria-label="Instagram"><Camera size={18} /></a>
            <a href="#" aria-label="LinkedIn"><BriefcaseBusiness size={18} /></a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/properties">Properties</Link>
          <Link href="/properties?listing_type=rent">For rent</Link>
          <Link href="/properties?listing_type=sale">For sale</Link>
          <Link href="/about">Our story</Link>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <Link href="/services">Services</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/register">List a property</Link>
        </div>

        <div className="footer-contact">
          <h3>Let&apos;s talk</h3>
          <a href="mailto:hello@domus.com">hello@domus.com <ArrowUpRight size={16} /></a>
          <a href="tel:+442079460580">+44 (0)20 7946 0580</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Domus. All rights reserved.</span>
        <div><Link href="#">Privacy</Link><Link href="#">Terms</Link></div>
      </div>
    </footer>
  );
}
