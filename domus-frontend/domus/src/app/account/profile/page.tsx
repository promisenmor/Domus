"use client";

import { Check, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { accountRequest } from "@/lib/api/client";
import type { ClientProfile } from "@/types/account";

type EditableProfile = Pick<ClientProfile, "first_name" | "last_name" | "phone_number">;

export default function ProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>({ first_name: "", last_name: "", phone_number: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    accountRequest<ClientProfile>("profile")
      .then((result) => {
        if (!active) return;
        setProfile(result);
        setForm({ first_name: result.first_name, last_name: result.last_name, phone_number: result.phone_number });
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your profile."); });
    return () => { active = false; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await accountRequest<ClientProfile>("profile", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setProfile(updated);
      setForm({ first_name: updated.first_name, last_name: updated.last_name, phone_number: updated.phone_number });
      setNotice("Your profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="account-page-heading">
        <div><p className="account-eyebrow">YOUR DETAILS</p><h1>My profile</h1><p>Keep your contact details up to date.</p></div>
      </div>
      {error && <div className="account-error" role="alert">{error}</div>}
      {notice && <p className="account-notice" role="status"><Check size={16} /> {notice}</p>}
      {!profile && !error ? <div className="account-skeleton" aria-label="Loading profile" /> : profile && (
        <form className="account-form-card" onSubmit={saveProfile}>
          <div className="profile-form-heading">
            <span className="profile-large-avatar">{profile.first_name.slice(0, 1).toUpperCase() || "D"}</span>
            <div><h2>Personal information</h2><p>Your email address is used to sign in and cannot be changed here.</p></div>
          </div>
          <div className="account-form-grid">
            <label>First name<input value={form.first_name} maxLength={150} onChange={(event) => setForm({ ...form, first_name: event.target.value })} required /></label>
            <label>Last name<input value={form.last_name} maxLength={150} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></label>
            <label>Email address<input value={profile.email} type="email" disabled /></label>
            <label>Phone number<input value={form.phone_number} type="tel" maxLength={15} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} /></label>
          </div>
          <div className="account-form-actions"><button className="account-primary-button" type="submit" disabled={busy}><Save size={16} /> {busy ? "Saving…" : "Save changes"}</button></div>
        </form>
      )}
    </>
  );
}
