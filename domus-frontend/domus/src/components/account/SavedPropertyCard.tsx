"use client";

import { BookmarkX, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { SavedListing } from "@/types/account";
import { imageUrl } from "@/lib/api/client";

type SavedPropertyCardProps = {
  listing: SavedListing;
  onRemove?: (id: number) => void;
};

export function SavedPropertyCard({ listing, onRemove }: SavedPropertyCardProps) {
  return (
    <article className="saved-property-card">
      <Link href={`/properties/${listing.slug}`} className="saved-property-image">
        <Image
          src={imageUrl(listing.image)}
          alt={listing.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </Link>
      <div className="saved-property-info">
        <p><MapPin size={14} /> {listing.location || listing.city || "Location not provided"}</p>
        <Link href={`/properties/${listing.slug}`}><h3>{listing.title}</h3></Link>
        <strong>{listing.price}</strong>
        {onRemove && (
          <button type="button" className="remove-saved-button" onClick={() => onRemove(listing.id)}>
            <BookmarkX size={15} /> Remove saved property
          </button>
        )}
      </div>
    </article>
  );
}
