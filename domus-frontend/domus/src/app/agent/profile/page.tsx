"use client";

import { Camera, Save } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { agentRequest } from "@/lib/api/agent";
import type { AgentProfile } from "@/types/agent";

type ProfileFields = Pick<AgentProfile, "first_name" | "last_name" | "phone_number" | "company" | "license_number" | "biography" | "email_notifications">;

function profileFields(profile: AgentProfile): ProfileFields {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone_number: profile.phone_number,
    company: profile.company,
    license_number: profile.license_number,
    biography: profile.biography,
    email_notifications: profile.email_notifications,
  };
}

export default function AgentProfilePage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [fields, setFields] = useState<ProfileFields | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    agentRequest<AgentProfile>("profile")
      .then((result) => {
        if (!active) return;
        setProfile(result);
        setFields(profileFields(result));
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your profile."); });
    return () => { active = false; };
  }, []);

  function updateField<K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) {
    setFields((current) => current ? { ...current, [key]: value } : current);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fields) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let updated = await agentRequest<AgentProfile>("profile", {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      if (photo) {
        const body = new FormData();
        body.append("profile_picture", photo);
        updated = await agentRequest<AgentProfile>("profile", { method: "PATCH", body });
        setPhoto(null);
      }
      setProfile(updated);
      setFields(profileFields(updated));
      setNotice("Your agent profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    setPhoto(event.target.files?.[0] ?? null);
  }

  if (error && !profile) return <div className="account-error" role="alert">{error}</div>;
  if (!profile || !fields) return <div className="account-skeleton" aria-label="Loading profile" />;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your agent profile";

  return (
    <>
      <div className="account-page-heading"><div><p className="account-eyebrow">YOUR PROFESSIONAL PRESENCE</p><h1>Agent profile</h1><p>Keep your contact details and professional information current.</p></div></div>
      <form className="agent-profile-form" onSubmit={save}>
        <section className="agent-detail-card agent-profile-card">
          <div className="agent-profile-photo">
            <span className="agent-profile-avatar">{profile.profile_picture ? <Image src={profile.profile_picture} alt="" width={64} height={64} unoptimized /> : displayName.slice(0, 1).toUpperCase()}</span>
            <div><strong>{displayName}</strong><span>{profile.email}</span><label className="agent-photo-button"><Camera size={15} />Change photo<input type="file" accept="image/*" onChange={choosePhoto} /></label>{photo && <small>{photo.name} selected</small>}</div>
          </div>
          <div className="account-form-grid agent-form-grid">
            <label>First name<input value={fields.first_name} onChange={(event) => updateField("first_name", event.target.value)} maxLength={150} /></label>
            <label>Last name<input value={fields.last_name} onChange={(event) => updateField("last_name", event.target.value)} maxLength={150} /></label>
            <label>Email address<input value={profile.email} disabled /></label>
            <label>Phone number<input type="tel" value={fields.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} maxLength={30} /></label>
            <label>Company<input value={fields.company} onChange={(event) => updateField("company", event.target.value)} maxLength={255} /></label>
            <label>License number<input value={fields.license_number} onChange={(event) => updateField("license_number", event.target.value)} maxLength={100} /></label>
            <label className="full-width">Professional biography<textarea value={fields.biography} onChange={(event) => updateField("biography", event.target.value)} rows={6} /></label>
          </div>
          <label className="agent-notifications-toggle"><input type="checkbox" checked={fields.email_notifications} onChange={(event) => updateField("email_notifications", event.target.checked)} /><span><strong>Email notifications</strong><small>Receive updates about enquiries and listing activity.</small></span></label>
          {error && <div className="account-error" role="alert">{error}</div>}
          {notice && <p className="agent-notice" role="status">{notice}</p>}
          <div className="agent-profile-actions"><button type="submit" className="account-primary-button" disabled={saving}>{saving ? "Saving…" : <><Save size={16} /> Save profile</>}</button></div>
        </section>
      </form>
    </>
  );
}
