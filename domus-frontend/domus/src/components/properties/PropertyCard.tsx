import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type PropertyCardProps = {
  title: string;
  location: string;
  price: string;
  listingType: "For sale" | "For rent";
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  slug: string;
};

export function PropertyCard({
  title,
  location,
  price,
  listingType,
  image,
  bedrooms,
  bathrooms,
  area,
  slug,
}: PropertyCardProps) {
  return (
    <article className="property-card">
      <Link href={`/properties/${slug}`} className="property-image-link">
        <Image src={image} alt={title} fill sizes="(max-width: 720px) 100vw, 33vw" />
        <span className="listing-badge">{listingType}</span>
      </Link>
      <button className="save-button" type="button" aria-label={`Save ${title}`}>
        <Heart size={18} strokeWidth={1.8} />
      </button>
      <div className="property-card-body">
        <p className="property-location"><MapPin size={14} /> {location}</p>
        <Link href={`/properties/${slug}`}><h3>{title}</h3></Link>
        <div className="property-card-footer">
          <strong>{price}</strong>
          <div className="property-facts" aria-label="Property details">
            <span><BedDouble size={15} /> {bedrooms}</span>
            <span><Bath size={15} /> {bathrooms}</span>
            <span><Ruler size={15} /> {area}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
