"use client";

import { ArrowRight, Mail, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { agentRequest } from "@/lib/api/agent";
import type { AgentEnquiryPage } from "@/types/agent";

const statuses = [
  ["", "All enquiries"],
  ["NEW", "New"],
  ["CONTACTED", "Contacted"],
  ["IN_PROGRESS", "In progress"],
  ["CLOSED", "Closed"],
  ["SPAM", "Spam"],
];

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function AgentEnquiriesClient({ initialStatus }: { initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AgentEnquiryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: String(page) });
    if (status) query.set("status", status);
    agentRequest<AgentEnquiryPage>(`enquiries?${query.toString()}`)
      .then((data) => {
        if (active) {
          setResult(data);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load enquiries.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, status]);

  return (
    <>
      <div className="account-page-heading">
        <div><p className="account-eyebrow">CLIENT CONVERSATIONS</p><h1>Enquiries</h1><p>Review incoming interest and keep your follow-ups moving.</p></div>
      </div>
      <section className="account-section agent-listing-section">
        <div className="agent-enquiry-toolbar">
          <div className="agent-inbox-intro"><span className="metric-icon"><Mail size={18} /></span><span>Enquiries assigned to you</span></div>
          <label className="agent-filter-control"><Search size={16} /><span className="sr-only">Filter enquiries by status</span><select value={status} onChange={(event) => { setLoading(true); setError(""); setPage(1); setStatus(event.target.value); }}>
            {statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select></label>
        </div>
        {error && <div className="account-error" role="alert">{error}</div>}
        {loading ? <div className="account-skeleton" aria-label="Loading enquiries" /> : result?.results.length ? (
          <>
            <div className="agent-enquiry-list">
              {result.results.map((enquiry) => (
                <article className="agent-enquiry-row" key={enquiry.id}>
                  <span className="agent-enquiry-icon"><Mail size={18} /></span>
                  <div className="agent-enquiry-main">
                    <div className="agent-enquiry-title"><strong>{enquiry.name}</strong><span className={`enquiry-status status-${enquiry.status.toLowerCase()}`}>{statusLabel(enquiry.status)}</span></div>
                    <p>{enquiry.property_title}</p>
                    <span className="agent-enquiry-meta">{enquiry.email}{enquiry.phone_number ? ` · ${enquiry.phone_number}` : ""} · Received {dateLabel(enquiry.created_at)}</span>
                    <p className="agent-enquiry-excerpt">{enquiry.message}</p>
                  </div>
                  <Link className="agent-row-link" href={`/agent/enquiries/${enquiry.id}`}>Open<ArrowRight size={15} /><span className="sr-only"> enquiry from {enquiry.name}</span></Link>
                </article>
              ))}
            </div>
            <div className="agent-pagination">
              <span>{result.count} {result.count === 1 ? "enquiry" : "enquiries"}</span>
              <div><button type="button" disabled={!result.previous || loading} onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }}>Previous</button><span>Page {page}</span><button type="button" disabled={!result.next || loading} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next</button></div>
            </div>
          </>
        ) : !error ? (
          <div className="account-empty-state">
            <span className="empty-state-icon"><Mail size={22} /></span>
            <h2>{status ? "No enquiries with this status" : "Your inbox is clear"}</h2>
            <p>New enquiries about your published listings will appear here.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
