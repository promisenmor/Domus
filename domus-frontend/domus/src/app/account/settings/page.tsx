"use client";

import { Bell, Check, KeyRound, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { accountRequest } from "@/lib/api/client";
import type { ClientProfile } from "@/types/account";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    accountRequest<ClientProfile>("profile")
      .then((profile) => { if (active) setNotifications(profile.email_notifications); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load your settings."); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  async function saveNotifications(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await accountRequest<ClientProfile>("profile", {
        method: "PATCH",
        body: JSON.stringify({ email_notifications: notifications }),
      });
      setNotice("Notification preferences saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your settings.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await accountRequest("password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Your password has been changed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to change your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="account-page-heading">
        <div><p className="account-eyebrow">ACCOUNT PREFERENCES</p><h1>Settings</h1><p>Manage your security and updates from Domus.</p></div>
      </div>
      {error && <div className="account-error" role="alert">{error}</div>}
      {notice && <p className="account-notice" role="status"><Check size={16} /> {notice}</p>}
      {!loaded && !error ? <div className="account-skeleton" aria-label="Loading settings" /> : (
        <div className="settings-stack">
          <form className="settings-card" onSubmit={saveNotifications}>
            <div className="settings-card-heading">
              <span className="settings-icon"><Bell size={19} /></span>
              <div><h2>Email notifications</h2><p>Choose whether to receive updates about your enquiries and account.</p></div>
            </div>
            <label className="notification-toggle">
              <span><strong>Account updates</strong><small>Receive important updates about your property enquiries.</small></span>
              <input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} />
            </label>
            <div className="account-form-actions"><button className="account-primary-button" type="submit" disabled={busy}><Save size={16} /> Save preferences</button></div>
          </form>

          <form className="settings-card" onSubmit={changePassword}>
            <div className="settings-card-heading">
              <span className="settings-icon"><KeyRound size={19} /></span>
              <div><h2>Change password</h2><p>Use a unique password you don&apos;t use for other accounts.</p></div>
            </div>
            <div className="account-form-grid">
              <label className="full-width">Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
              <label>New password<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
              <label>Confirm new password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
            </div>
            <div className="password-safety-note"><ShieldCheck size={16} /> Your current password is required to make this change.</div>
            <div className="account-form-actions"><button className="account-primary-button" type="submit" disabled={busy}><KeyRound size={16} /> Update password</button></div>
          </form>
        </div>
      )}
    </>
  );
}
