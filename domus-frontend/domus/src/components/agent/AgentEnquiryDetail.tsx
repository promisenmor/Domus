"use client";

import { ArrowLeft, Mail, Phone, Save } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { agentRequest } from "@/lib/api/agent";
import type { AgentEnquiry } from "@/types/agent";

type Props = { enquiryId: string };
const enquiryStatuses: AgentEnquiry["status"][] = ["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED", "SPAM"];

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function AgentEnquiryDetail({ enquiryId }: Props) {
  const [enquiry, setEnquiry] = useState<AgentEnquiry | null>(null);
  const [status, setStatus] = useState<AgentEnquiry["status"]>("NEW");
  const [internalNotes, setInternalNotes] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    agentRequest<AgentEnquiry>(`enquiries/${enquiryId}`)
      .then((result) => {
        if (!active) return;
        setEnquiry(result);
        setStatus(result.status);
        setInternalNotes(result.internal_notes);
        setFollowUpAt(localDateTime(result.follow_up_at));
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load this enquiry."); });
    return () => { active = false; };
  }, [enquiryId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await agentRequest<AgentEnquiry>(`enquiries/${enquiryId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          internal_notes: internalNotes,
          follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
        }),
      });
      setEnquiry(updated);
      setNotice("Enquiry updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update this enquiry.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !enquiry) return <div className="account-error" role="alert">{error}</div>;
  if (!enquiry) return <div className="account-skeleton" aria-label="Loading enquiry" />;

  return (
    <>
      <Link href="/agent/enquiries" className="agent-back-link"><ArrowLeft size={16} /> Back to enquiries</Link>
      <div className="account-page-heading agent-enquiry-heading">
        <div><p className="account-eyebrow">ENQUIRY #{enquiry.id}</p><h1>{enquiry.name}</h1><p>About <Link href={`/agent/listings/${enquiry.property}/edit`}>{enquiry.property_title}</Link></p></div>
        <span className={`enquiry-status status-${enquiry.status.toLowerCase()}`}>{enquiry.status.replaceAll("_", " ")}</span>
      </div>
      <div className="agent-enquiry-detail-grid">
        <section className="agent-detail-card">
          <div className="agent-detail-card-heading"><span className="agent-enquiry-icon"><Mail size={18} /></span><div><h2>Message from {enquiry.name}</h2><p>Received {new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(new Date(enquiry.created_at))}</p></div></div>
          <p className="agent-full-message">{enquiry.message}</p>
          <div className="agent-contact-details">
            <a href={`mailto:${enquiry.email}`}><Mail size={16} />{enquiry.email}</a>
            {enquiry.phone_number && <a href={`tel:${enquiry.phone_number}`}><Phone size={16} />{enquiry.phone_number}</a>}
          </div>
        </section>
        <form className="agent-detail-card agent-enquiry-update" onSubmit={save}>
          <div><p className="account-eyebrow">FOLLOW-UP</p><h2>Update enquiry</h2></div>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as AgentEnquiry["status"])}>{enquiryStatuses.map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label>Follow-up date<input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} /></label>
          <label>Internal notes<textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={7} placeholder="Notes visible only to your team" /></label>
          {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
          {notice && <p className="agent-notice" role="status">{notice}</p>}
          <button type="submit" className="account-primary-button" disabled={saving}>{saving ? "Saving…" : <><Save size={16} /> Save updates</>}</button>
        </form>
      </div>
    </>
  );
}
