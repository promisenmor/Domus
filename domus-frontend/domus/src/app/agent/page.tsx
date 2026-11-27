"use client";

import { ArrowRight, Building2, Clock3, Mail, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { agentRequest } from "@/lib/api/agent";
import type { AgentDashboardData, AgentEnquiry, AgentEnquiryPage } from "@/types/agent";

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priceLabel(price: string, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price));
  } catch {
    return `${currency} ${Number(price).toLocaleString("en")}`;
  }
}

export default function AgentDashboardPage() {
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [enquiries, setEnquiries] = useState<AgentEnquiry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      agentRequest<AgentDashboardData>("dashboard"),
      agentRequest<AgentEnquiryPage>("enquiries?page_size=5"),
    ])
      .then(([dashboard, enquiryPage]) => {
        if (active) {
          setData(dashboard);
          setEnquiries(enquiryPage.results.slice(0, 5));
        }
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your dashboard."); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="account-error" role="alert">{error}</div>;
  if (!data) return <div className="account-skeleton" aria-label="Loading agent dashboard" />;

  return (
    <>
      <div className="account-page-heading account-welcome">
        <div>
          <p className="account-eyebrow">YOUR PROPERTY BUSINESS</p>
          <h1>Welcome back, {data.profile.first_name || "there"}.</h1>
          <p>Manage your properties, keep listings up to date, and follow up with new enquiries.</p>
        </div>
        <Link className="account-primary-button" href="/agent/listings/new"><Plus size={17} /> Add a listing</Link>
      </div>

      <section className="account-metrics agent-metrics" aria-label="Agent workspace summary">
        <article className="account-metric-card"><span className="metric-icon"><Building2 size={18} /></span><strong>{data.overview.total_listings}</strong><span>Total listings</span><Link href="/agent/listings" aria-label="View all listings"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card"><span className="metric-icon"><Building2 size={18} /></span><strong>{data.overview.published_listings}</strong><span>Published</span><Link href="/agent/listings?status=PUBLISHED" aria-label="View published listings"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card"><span className="metric-icon"><Clock3 size={18} /></span><strong>{data.overview.pending_listings}</strong><span>Awaiting review</span><Link href="/agent/listings?status=PENDING_REVIEW" aria-label="View listings awaiting review"><ArrowRight size={16} /></Link></article>
        <article className="account-metric-card"><span className="metric-icon"><Mail size={18} /></span><strong>{data.overview.total_enquiries}</strong><span>Total enquiries</span><Link href="/agent/enquiries" aria-label="View enquiries"><ArrowRight size={16} /></Link></article>
      </section>

      <section className="account-section">
        <div className="account-section-heading">
          <div><p className="account-eyebrow">RECENT ACTIVITY</p><h2>Latest listings</h2></div>
          <Link href="/agent/listings">Manage listings <ArrowRight size={16} /></Link>
        </div>
        {data.properties.length ? (
          <div className="agent-recent-listings">
            {data.properties.slice(0, 5).map((listing) => (
              <article className="agent-recent-row" key={listing.id}>
                <div className="agent-recent-image">
                  {listing.image && <Image src={listing.image} alt="" width={78} height={56} unoptimized />}
                </div>
                <div className="agent-recent-main">
                  <strong>{listing.title}</strong>
                  <span>{listing.location} · {priceLabel(listing.price, listing.currency)}</span>
                </div>
                <span className={`enquiry-status status-${listing.status.toLowerCase()}`}>{statusLabel(listing.status)}</span>
                <Link href={`/agent/listings/${listing.id}/edit`} className="agent-row-link">Edit<span className="sr-only"> {listing.title}</span></Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="account-empty-state">
            <span className="empty-state-icon"><Building2 size={22} /></span>
            <h3>Your listings will appear here</h3>
            <p>Create a listing and submit it for review to get started.</p>
            <Link href="/agent/listings/new" className="account-secondary-button">Create a listing <ArrowRight size={16} /></Link>
          </div>
        )}
      </section>
      <section className="account-section agent-quick-links">
        <div className="account-section-heading">
          <div><p className="account-eyebrow">KEEP THINGS MOVING</p><h2>Quick links</h2></div>
        </div>
        <div className="agent-quick-grid">
          <Link href="/agent/enquiries?status=NEW"><Mail size={20} /><span><strong>Follow up on enquiries</strong><small>{data.overview.new_enquiries} new to review</small></span><ArrowRight size={17} /></Link>
          <Link href="/agent/profile"><Building2 size={20} /><span><strong>Update your profile</strong><small>Keep your contact details current</small></span><ArrowRight size={17} /></Link>
        </div>
      </section>
      <section className="account-section">
        <div className="account-section-heading">
          <div><p className="account-eyebrow">CLIENT CONVERSATIONS</p><h2>Recent enquiries</h2></div>
          <Link href="/agent/enquiries">Open inbox <ArrowRight size={16} /></Link>
        </div>
        {enquiries.length ? (
          <div className="agent-enquiry-list">
            {enquiries.map((enquiry: AgentEnquiry) => (
              <article className="agent-enquiry-row agent-dashboard-enquiry" key={enquiry.id}>
                <span className="agent-enquiry-icon"><Mail size={18} /></span>
                <div className="agent-enquiry-main">
                  <div className="agent-enquiry-title"><strong>{enquiry.name}</strong><span className={`enquiry-status status-${enquiry.status.toLowerCase()}`}>{statusLabel(enquiry.status)}</span></div>
                  <p>{enquiry.property_title}</p>
                  <span className="agent-enquiry-meta">{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(enquiry.created_at))}</span>
                </div>
                <Link className="agent-row-link" href={`/agent/enquiries/${enquiry.id}`}>Review<ArrowRight size={15} /><span className="sr-only"> enquiry from {enquiry.name}</span></Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="account-empty-inline"><p>No enquiries have come in yet.</p><Link href="/agent/listings">View your listings <ArrowRight size={15} /></Link></div>
        )}
      </section>
    </>
  );
}
