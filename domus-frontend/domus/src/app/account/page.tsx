"use client";

import { ArrowRight, Bookmark, Clock3, Mail, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SavedPropertyCard } from "@/components/account/SavedPropertyCard";
import { accountRequest } from "@/lib/api/client";
import type { ClientDashboardData } from "@/types/account";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AccountOverviewPage() {
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    accountRequest<ClientDashboardData>("dashboard")
      .then((result) => { if (active) setData(result); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your dashboard."); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="account-error" role="alert">{error}</div>;
  if (!data) return <div className="account-skeleton" aria-label="Loading dashboard" />;

  const name = data.profile.first_name || "there";
  return (
    <>
      <div className="account-page-heading account-welcome">
        <div>
          <p className="account-eyebrow">YOUR PROPERTY JOURNEY</p>
          <h1>Welcome back, {name}.</h1>
          <p>Keep track of the homes you love and the conversations you&apos;ve started.</p>
        </div>
        <Link className="account-primary-button" href="/properties"><Search size={17} /> Explore properties</Link>
      </div>

      <section className="account-metrics" aria-label="Account summary">
        <article className="account-metric-card"><span className="metric-icon"><Bookmark size={18} /></span><strong>{data.overview.saved_properties}</strong><span>Saved properties</span><Link href="/account/saved-properties" aria-label="View saved properties"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card"><span className="metric-icon"><Mail size={18} /></span><strong>{data.overview.total_enquiries}</strong><span>My enquiries</span><Link href="/account/enquiries" aria-label="View enquiries"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card"><span className="metric-icon"><Clock3 size={18} /></span><strong>{data.overview.active_enquiries}</strong><span>Active enquiries</span><Link href="/account/enquiries" aria-label="View active enquiries"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card metric-action"><span className="metric-icon"><Plus size={18} /></span><strong>Find</strong><span>Your next home</span><Link href="/properties" aria-label="Browse properties"><ArrowRight size={16} /></Link></article>
      </section>

      <section className="account-section">
        <div className="account-section-heading">
          <div><p className="account-eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Recently saved</h2></div>
          <Link href="/account/saved-properties">View all <ArrowRight size={16} /></Link>
        </div>
        {data.saved_listings.length ? (
          <div className="account-saved-grid">
            {data.saved_listings.slice(0, 3).map((listing) => <SavedPropertyCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <div className="account-empty-state">
            <span className="empty-state-icon"><Bookmark size={22} /></span>
            <h3>Your saved properties will appear here</h3>
            <p>Save the homes you love and compare them whenever you like.</p>
            <Link href="/properties" className="account-secondary-button">Explore properties <ArrowRight size={16} /></Link>
          </div>
        )}
      </section>

      <section className="account-section account-enquiry-section">
        <div className="account-section-heading">
          <div><p className="account-eyebrow">STAY IN THE LOOP</p><h2>Recent enquiries</h2></div>
          <Link href="/account/enquiries">View all <ArrowRight size={16} /></Link>
        </div>
        {data.enquiries.length ? (
          <div className="enquiry-list">
            {data.enquiries.slice(0, 4).map((enquiry) => (
              <article className="enquiry-row" key={enquiry.id}>
                <span className="enquiry-property-icon"><Mail size={18} /></span>
                <div className="enquiry-main"><strong>{enquiry.property_title}</strong><span>Enquiry sent {dateLabel(enquiry.created_at)}</span></div>
                <span className={`enquiry-status status-${enquiry.status.toLowerCase()}`}>{statusLabel(enquiry.status)}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="account-empty-inline">
            <p>You haven&apos;t made an enquiry yet.</p>
            <Link href="/properties">Find a property to enquire about <ArrowRight size={15} /></Link>
          </div>
        )}
      </section>
    </>
  );
}
