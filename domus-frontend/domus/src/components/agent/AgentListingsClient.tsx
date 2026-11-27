"use client";

import { ArrowDownUp, ArrowRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { agentRequest } from "@/lib/api/agent";
import type { AgentListingPage } from "@/types/agent";
import Image from "next/image";

const statusOptions = [
  ["", "All statuses"],
  ["DRAFT", "Draft"],
  ["PENDING_REVIEW", "Pending review"],
  ["PUBLISHED", "Published"],
  ["SOLD", "Sold"],
  ["LET", "Let"],
  ["WITHDRAWN", "Withdrawn"],
  ["ARCHIVED", "Archived"],
];

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(price: string, currency: string) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(price));
  } catch {
    return `${currency} ${Number(price).toLocaleString("en")}`;
  }
}

export function AgentListingsClient({ initialStatus }: { initialStatus: string }) {
  const [result, setResult] = useState<AgentListingPage | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ ordering, page: String(page) });
    if (status) query.set("status", status);
    if (submittedSearch) query.set("search", submittedSearch);
    agentRequest<AgentListingPage>(`listings?${query.toString()}`)
      .then((data) => {
        if (active) {
          setResult(data);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load listings.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ordering, page, status, submittedSearch]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSearch = search.trim();
    if (nextSearch === submittedSearch) return;
    setLoading(true);
    setError("");
    setPage(1);
    setSubmittedSearch(nextSearch);
  }

  return (
    <>
      <div className="account-page-heading">
        <div>
          <p className="account-eyebrow">YOUR PORTFOLIO</p>
          <h1>My listings</h1>
          <p>Manage property details and track each listing through review.</p>
        </div>
        <Link className="account-primary-button" href="/agent/listings/new"><Plus size={17} /> Add a listing</Link>
      </div>
      <section className="account-section agent-listing-section">
        <div className="agent-listing-toolbar">
          <form className="agent-search-form" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="agent-listing-search">Search your listings</label>
            <Search size={17} aria-hidden="true" />
            <input id="agent-listing-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or location" />
            <button type="submit">Search</button>
          </form>
          <label className="agent-filter-control"><SlidersHorizontal size={16} /><span className="sr-only">Filter by status</span>
            <select value={status} onChange={(event) => { setLoading(true); setError(""); setPage(1); setStatus(event.target.value); }}>
              {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="agent-filter-control"><ArrowDownUp size={16} /><span className="sr-only">Sort listings</span>
            <select value={ordering} onChange={(event) => { setLoading(true); setError(""); setPage(1); setOrdering(event.target.value); }}>
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
              <option value="price">Price: low to high</option>
              <option value="-price">Price: high to low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </label>
        </div>
        {error && <div className="account-error" role="alert">{error}</div>}
        {loading ? <div className="account-skeleton" aria-label="Loading listings" /> : result?.results.length ? (
          <>
            <div className="agent-listing-table-wrap">
              <table className="agent-listing-table">
                <thead><tr><th>Property</th><th>Location</th><th>Price</th><th>Type</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {result.results.map((listing) => (
                    <tr key={listing.id}>
                      <td><div className="agent-table-property"><span className="agent-table-thumb">{listing.image && <Image src={listing.image} alt="" width={48} height={42} unoptimized />}</span><span><strong>{listing.title}</strong><small>{listing.property_type.replaceAll("_", " ")}</small></span></div></td>
                      <td>{listing.location}</td>
                      <td>{formatPrice(listing.price, listing.currency)}{listing.price_frequency ? <small className="agent-price-frequency"> / {listing.price_frequency.toLowerCase()}</small> : null}</td>
                      <td>{listing.listing_type === "TO_RENT" ? "Rent" : "Sale"}</td>
                      <td><span className={`enquiry-status status-${listing.status.toLowerCase()}`}>{statusLabel(listing.status)}</span></td>
                      <td>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(listing.updated_at))}</td>
                      <td><Link className="agent-row-link" href={`/agent/listings/${listing.id}/edit`}>Manage<ArrowRight size={15} /><span className="sr-only"> {listing.title}</span></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="agent-listing-cards">
              {result.results.map((listing) => (
                <article className="agent-listing-card" key={listing.id}>
                  <div className="agent-listing-card-image">
                    {listing.image && <Image src={listing.image} alt="" width={600} height={420} unoptimized />}
                  </div>
                  <div className="agent-listing-card-content">
                    <span className={`enquiry-status status-${listing.status.toLowerCase()}`}>{statusLabel(listing.status)}</span>
                    <h2>{listing.title}</h2>
                    <p>{listing.location} · {listing.property_type.replaceAll("_", " ")}</p>
                    <strong>{formatPrice(listing.price, listing.currency)}{listing.price_frequency ? ` / ${listing.price_frequency.toLowerCase()}` : ""}</strong>
                    <Link className="account-primary-button" href={`/agent/listings/${listing.id}/edit`}>Manage listing<ArrowRight size={15} /></Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="agent-pagination">
              <span>{result.count} {result.count === 1 ? "listing" : "listings"}</span>
              <div>
                <button type="button" disabled={!result.previous || loading} onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }}>Previous</button>
                <span>Page {page}</span>
                <button type="button" disabled={!result.next || loading} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>Next</button>
              </div>
            </div>
          </>
        ) : !error ? (
          <div className="account-empty-state">
            <span className="empty-state-icon"><Search size={22} /></span>
            <h2>{submittedSearch || status ? "No listings match these filters" : "No listings yet"}</h2>
            <p>{submittedSearch || status ? "Try changing the status or search terms." : "Create your first listing to get started."}</p>
            <Link href="/agent/listings/new" className="account-secondary-button"><Plus size={16} /> Add a listing</Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
