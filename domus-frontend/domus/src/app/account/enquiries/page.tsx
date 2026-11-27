"use client";

import { ArrowRight, Mail, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { accountRequest } from "@/lib/api/client";
import type { ClientDashboardData } from "@/types/account";

function statusText(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function EnquiriesPage() {
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    accountRequest<ClientDashboardData>("dashboard")
      .then((result) => { if (active) setData(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your enquiries."); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="account-page-heading">
        <div><p className="account-eyebrow">YOUR CONVERSATIONS</p><h1>My enquiries</h1><p>Follow up on the properties you&apos;ve asked us about.</p></div>
        <Link className="account-primary-button" href="/properties"><Search size={17} /> Browse properties</Link>
      </div>
      {error && <div className="account-error" role="alert">{error}</div>}
      {!data && !error && <div className="account-skeleton" aria-label="Loading enquiries" />}
      {data && (data.enquiries.length ? (
        <div className="enquiries-table">
          <div className="enquiries-table-head"><span>Property</span><span>Date sent</span><span>Status</span><span /></div>
          {data.enquiries.map((enquiry) => (
            <article className="enquiries-table-row" key={enquiry.id}>
              <div className="enquiry-main">
                <span className="enquiry-property-icon"><Mail size={18} /></span>
                <div><strong>{enquiry.property_title}</strong><span>Enquiry #{enquiry.id}</span></div>
              </div>
              <span className="enquiry-date">{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(enquiry.created_at))}</span>
              <span className={`enquiry-status status-${enquiry.status.toLowerCase()}`}>{statusText(enquiry.status)}</span>
              <span aria-hidden="true" />
            </article>
          ))}
        </div>
      ) : (
        <div className="account-empty-state saved-empty-state">
          <span className="empty-state-icon"><Mail size={22} /></span>
          <h2>No enquiries yet</h2>
          <p>When you enquire about a home, you&apos;ll find the updates here.</p>
          <Link href="/properties" className="account-secondary-button">Explore properties <ArrowRight size={16} /></Link>
        </div>
      ))}
    </>
  );
}
