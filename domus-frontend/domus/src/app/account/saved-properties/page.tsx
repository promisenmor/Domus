"use client";

import { ArrowRight, Bookmark, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SavedPropertyCard } from "@/components/account/SavedPropertyCard";
import { accountRequest } from "@/lib/api/client";
import type { Paginated, SavedListing } from "@/types/account";

export default function SavedPropertiesPage() {
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSavedListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await accountRequest<Paginated<SavedListing> | SavedListing[]>("saved-properties");
      setListings(Array.isArray(response) ? response : response.results);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load your saved properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    accountRequest<Paginated<SavedListing> | SavedListing[]>("saved-properties")
      .then((response) => {
        if (active) setListings(Array.isArray(response) ? response : response.results);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load your saved properties.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function removeListing(id: number) {
    if (!window.confirm("Remove this property from your saved list?")) return;
    setNotice("");
    try {
      await accountRequest("saved-properties", {
        method: "DELETE",
        body: JSON.stringify({ listing_id: id }),
      });
      setListings((saved) => saved.filter((listing) => listing.id !== id));
      setNotice("Property removed from your saved list.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove the property.");
    }
  }

  return (
    <>
      <div className="account-page-heading">
        <div><p className="account-eyebrow">YOUR SHORTLIST</p><h1>Saved properties</h1><p>Properties you&apos;ve saved for later.</p></div>
        <Link className="account-primary-button" href="/properties"><Search size={17} /> Find a property</Link>
      </div>
      {notice && <p className="account-notice" role="status">{notice}</p>}
      {error && <div className="account-error" role="alert">{error}<button type="button" onClick={() => void loadSavedListings()}>Try again</button></div>}
      {loading ? <div className="account-skeleton" aria-label="Loading saved properties" /> : listings.length ? (
        <div className="account-saved-grid saved-properties-grid">
          {listings.map((listing) => <SavedPropertyCard key={listing.id} listing={listing} onRemove={removeListing} />)}
        </div>
      ) : !error && (
        <div className="account-empty-state saved-empty-state">
          <span className="empty-state-icon"><Bookmark size={22} /></span>
          <h2>You haven&apos;t saved any properties yet.</h2>
          <p>Keep the homes you love close by and compare them whenever you like.</p>
          <Link href="/properties" className="account-secondary-button">Explore properties <ArrowRight size={16} /></Link>
        </div>
      )}
    </>
  );
}
