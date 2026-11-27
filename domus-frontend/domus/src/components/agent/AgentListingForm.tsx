"use client";

import { ArrowDown, ArrowUp, Check, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { agentRequest } from "@/lib/api/agent";
import type { AgentListing, ListingImage } from "@/types/agent";

type Props = { listingId?: string };
type ListingFields = Pick<
  AgentListing,
  | "title" | "description" | "short_description" | "price" | "location" | "address"
  | "city" | "region" | "postcode" | "property_type" | "listing_type" | "bedrooms"
  | "bathrooms" | "reception_rooms" | "parking" | "garden" | "balcony" | "furnished"
  | "currency" | "price_frequency" | "reference_number"
>;

const blankListing: ListingFields = {
  title: "",
  description: "",
  short_description: "",
  price: "",
  location: "",
  address: "",
  city: "",
  region: "",
  postcode: "",
  property_type: "HOUSE",
  listing_type: "FOR_SALE",
  bedrooms: 0,
  bathrooms: 0,
  reception_rooms: 0,
  parking: false,
  garden: false,
  balcony: false,
  furnished: false,
  currency: "NGN",
  price_frequency: "",
  reference_number: "",
};

function getListingFields(listing: AgentListing): ListingFields {
  return {
    title: listing.title,
    description: listing.description,
    short_description: listing.short_description,
    price: listing.price,
    location: listing.location,
    address: listing.address,
    city: listing.city,
    region: listing.region,
    postcode: listing.postcode,
    property_type: listing.property_type,
    listing_type: listing.listing_type,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    reception_rooms: listing.reception_rooms,
    parking: listing.parking,
    garden: listing.garden,
    balcony: listing.balcony,
    furnished: listing.furnished,
    currency: listing.currency,
    price_frequency: listing.price_frequency,
    reference_number: listing.reference_number,
  };
}

export function AgentListingForm({ listingId }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<ListingFields>(blankListing);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [uploads, setUploads] = useState<{ file: File; preview: string }[]>([]);
  const uploadsRef = useRef(uploads);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(Boolean(listingId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { uploadsRef.current = uploads; }, [uploads]);
  useEffect(() => () => uploadsRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview)), []);

  useEffect(() => {
    if (!listingId) return;
    let active = true;
    agentRequest<AgentListing>(`listings/${listingId}`)
      .then((listing) => {
        if (!active) return;
        setFields(getListingFields(listing));
        setExistingImages(listing.images);
        setStatus(listing.status);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load this listing.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listingId]);

  function updateField<K extends keyof ListingFields>(key: K, value: ListingFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setUploads((current) => [...current, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = "";
  }

  function removeSelectedFile(index: number) {
    const upload = uploads[index];
    if (upload) URL.revokeObjectURL(upload.preview);
    setUploads((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function uploadSelectedFiles(propertyId: number) {
    const uploaded: ListingImage[] = [];
    const failed: { file: File; error: string }[] = [];
    for (const [index, upload] of uploads.entries()) {
      const body = new FormData();
      body.append("property", String(propertyId));
      body.append("image", upload.file);
      body.append("order", String(existingImages.length + index));
      body.append("is_primary", String(existingImages.length === 0 && index === 0));
      try {
        uploaded.push(await agentRequest<ListingImage>("listing-images", { method: "POST", body }));
      } catch (cause) {
        failed.push({
          file: upload.file,
          error: cause instanceof Error ? cause.message : "Upload failed.",
        });
      }
    }
    return { uploaded, failed };
  }

  async function saveListing(form: HTMLFormElement, submitForReview: boolean) {
    if (!form.reportValidity()) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const listing = listingId
        ? await agentRequest<AgentListing>(`listings/${listingId}`, {
            method: "PATCH",
            body: JSON.stringify(fields),
          })
        : await agentRequest<AgentListing>("listings", {
            method: "POST",
            body: JSON.stringify(fields),
          });
      if (uploads.length) {
        const { uploaded, failed } = await uploadSelectedFiles(listing.id);
        const failedFiles = new Set(failed.map(({ file }) => file));
        uploads.filter(({ file }) => !failedFiles.has(file)).forEach(({ preview }) => URL.revokeObjectURL(preview));
        setUploads((current) => current.filter(({ file }) => failedFiles.has(file)));
        setExistingImages((current) => [...current, ...uploaded]);
        if (failed.length) {
          setError(failed.map(({ file, error: message }) => `${file.name}: ${message}`).join(" "));
          setNotice("The listing details and successfully uploaded photos have been saved. Retry any remaining photos.");
          if (!listingId) router.replace(`/agent/listings/${listing.id}/edit`);
          return;
        }
      }
      if (submitForReview) {
        await agentRequest<AgentListing>(`listings/${listing.id}/submit`, { method: "POST" });
      }
      router.push("/agent/listings");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save this listing.");
    } finally {
      setSaving(false);
    }
  }

  async function removeImage(image: ListingImage) {
    setError("");
    try {
      await agentRequest<void>(`listing-images/${image.id}`, { method: "DELETE" });
      setExistingImages((current) => current.filter((item) => item.id !== image.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove this image.");
    }
  }

  async function setPrimaryImage(image: ListingImage) {
    setError("");
    try {
      await Promise.all(existingImages.map((item) =>
        agentRequest<ListingImage>(`listing-images/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ is_primary: item.id === image.id }),
        }),
      ));
      setExistingImages((current) => current.map((item) => ({ ...item, is_primary: item.id === image.id })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update the primary image.");
    }
  }

  async function moveImage(image: ListingImage, direction: -1 | 1) {
    const currentIndex = existingImages.findIndex((item) => item.id === image.id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= existingImages.length) return;
    const reordered = [...existingImages];
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
    setError("");
    try {
      await Promise.all(reordered.map((item, index) =>
        agentRequest<ListingImage>(`listing-images/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: index }),
        }),
      ));
      setExistingImages(reordered.map((item, index) => ({ ...item, order: index })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reorder images.");
    }
  }

  if (loading) return <div className="account-skeleton" aria-label="Loading listing" />;
  const canSubmit = !["PENDING_REVIEW", "PUBLISHED", "SOLD", "LET", "ARCHIVED", "WITHDRAWN"].includes(status);

  return (
    <>
      <div className="account-page-heading">
        <div>
          <p className="account-eyebrow">{listingId ? "LISTING DETAILS" : "ADD TO YOUR PORTFOLIO"}</p>
          <h1>{listingId ? "Edit listing" : "Create a listing"}</h1>
          <p>{listingId ? "Keep your property information and photos up to date." : "Add the key details now. You can save a draft or send it to Domus for review."}</p>
        </div>
        {listingId && status && <span className={`enquiry-status status-${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span>}
      </div>
      {error && <div className="account-error" role="alert">{error}</div>}
      {notice && <p className="agent-notice" role="status">{notice}</p>}
      {listingId && !canSubmit && <p className="agent-notice">This listing is {status.toLowerCase().replaceAll("_", " ")}. Updates can be saved, but it cannot be submitted again from this state.</p>}

      <form className="agent-form" onSubmit={(event) => {
        event.preventDefault();
        void saveListing(event.currentTarget, false);
      }}>
        <section className="agent-form-section">
          <div className="agent-form-heading"><span>01</span><div><h2>Property details</h2><p>Tell buyers or tenants what makes this home right for them.</p></div></div>
          <div className="account-form-grid agent-form-grid">
            <label className="full-width">Listing title<input value={fields.title} onChange={(event) => updateField("title", event.target.value)} required maxLength={255} placeholder="e.g. Light-filled Victorian townhouse" /></label>
            <label className="full-width">Short description<textarea value={fields.short_description} onChange={(event) => updateField("short_description", event.target.value)} maxLength={500} rows={2} placeholder="A concise summary for listing previews" /></label>
            <label className="full-width">Full description<textarea value={fields.description} onChange={(event) => updateField("description", event.target.value)} required rows={7} placeholder="Describe the property, its features, and the surrounding area" /></label>
            <label>Property type<select value={fields.property_type} onChange={(event) => updateField("property_type", event.target.value)}><option value="HOUSE">House</option><option value="APARTMENT">Apartment</option><option value="BUNGALOW">Bungalow</option><option value="COMMERCIAL">Commercial property</option><option value="LAND">Land</option><option value="OTHER">Other</option></select></label>
            <label>Offering<select value={fields.listing_type} onChange={(event) => updateField("listing_type", event.target.value)}><option value="FOR_SALE">For sale</option><option value="TO_RENT">To rent</option></select></label>
          </div>
        </section>

        <section className="agent-form-section">
          <div className="agent-form-heading"><span>02</span><div><h2>Price & location</h2><p>Help people understand the value and where they&apos;ll find it.</p></div></div>
          <div className="account-form-grid agent-form-grid">
            <label>Price<input type="number" min="0" step="0.01" value={fields.price} onChange={(event) => updateField("price", event.target.value)} required /></label>
            <label>Currency<select value={fields.currency} onChange={(event) => updateField("currency", event.target.value)}><option value="NGN">NGN</option><option value="GBP">GBP</option><option value="USD">USD</option></select></label>
            {fields.listing_type === "TO_RENT" && <label>Price frequency<select value={fields.price_frequency} onChange={(event) => updateField("price_frequency", event.target.value)}><option value="">Select frequency</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select></label>}
            <label>Location<input value={fields.location} onChange={(event) => updateField("location", event.target.value)} required maxLength={255} placeholder="Neighbourhood or area" /></label>
            <label>Street address<input value={fields.address} onChange={(event) => updateField("address", event.target.value)} maxLength={255} /></label>
            <label>City<input value={fields.city} onChange={(event) => updateField("city", event.target.value)} maxLength={100} /></label>
            <label>Region / state<input value={fields.region} onChange={(event) => updateField("region", event.target.value)} maxLength={100} /></label>
            <label>Postcode<input value={fields.postcode} onChange={(event) => updateField("postcode", event.target.value)} maxLength={20} /></label>
          </div>
        </section>

        <section className="agent-form-section">
          <div className="agent-form-heading"><span>03</span><div><h2>Features</h2><p>Share the details that help people compare homes.</p></div></div>
          <div className="account-form-grid agent-form-grid">
            <label>Bedrooms<input type="number" min="0" step="1" value={fields.bedrooms} onChange={(event) => updateField("bedrooms", Number(event.target.value))} /></label>
            <label>Bathrooms<input type="number" min="0" step="1" value={fields.bathrooms} onChange={(event) => updateField("bathrooms", Number(event.target.value))} /></label>
            <label>Reception rooms<input type="number" min="0" step="1" value={fields.reception_rooms} onChange={(event) => updateField("reception_rooms", Number(event.target.value))} /></label>
            <label>Reference number<input value={fields.reference_number} onChange={(event) => updateField("reference_number", event.target.value)} maxLength={100} /></label>
          </div>
          <div className="agent-feature-checks">
            {(["parking", "garden", "balcony", "furnished"] as const).map((feature) => (
              <label key={feature}><input type="checkbox" checked={fields[feature]} onChange={(event) => updateField(feature, event.target.checked)} /><span>{feature[0].toUpperCase() + feature.slice(1)}</span></label>
            ))}
          </div>
        </section>

        <section className="agent-form-section">
          <div className="agent-form-heading"><span>04</span><div><h2>Property photos</h2><p>Upload clear images. Choose a primary image and set their order.</p></div></div>
          <label className="agent-upload-zone">
            <input type="file" accept="image/*" multiple onChange={chooseFiles} />
            <span className="agent-upload-icon"><ImagePlus size={22} /></span>
            <strong>Choose photos to upload</strong>
            <small>Images upload after saving the listing. JPG, PNG, or WebP recommended.</small>
            <span className="account-secondary-button"><Upload size={15} /> Browse files</span>
          </label>
          {(existingImages.length > 0 || uploads.length > 0) && (
            <div className="agent-image-grid">
              {existingImages.map((image, index) => (
                <article className="agent-image-card" key={image.id}>
                  <Image src={image.image} alt={image.alt_text || image.caption || "Listing photo"} width={400} height={300} unoptimized />
                  {image.is_primary && <span className="agent-image-primary"><Check size={13} /> Primary</span>}
                  <div className="agent-image-actions">
                    <button type="button" aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => void moveImage(image, -1)}><ArrowUp size={15} /></button>
                    <button type="button" aria-label={`Move image ${index + 1} later`} disabled={index === existingImages.length - 1} onClick={() => void moveImage(image, 1)}><ArrowDown size={15} /></button>
                    {!image.is_primary && <button type="button" onClick={() => void setPrimaryImage(image)}>Set primary</button>}
                    <button type="button" aria-label="Remove image" onClick={() => void removeImage(image)}><Trash2 size={15} /></button>
                  </div>
                </article>
              ))}
              {uploads.map(({ file, preview }, index) => (
                <article className="agent-image-card" key={`${file.name}-${index}`}>
                  <Image src={preview} alt={`New upload: ${file.name}`} width={400} height={300} unoptimized />
                  <div className="agent-image-actions"><span>Ready to upload</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeSelectedFile(index)}><Trash2 size={15} /></button></div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="agent-form-actions">
          <Link className="account-secondary-button" href="/agent/listings">Cancel</Link>
          <div>
            <button type="submit" className="agent-save-button" disabled={saving}>{saving ? <LoaderCircle size={16} className="agent-spinner" /> : null}Save {listingId ? "changes" : "draft"}</button>
            {canSubmit && <button type="button" className="account-primary-button" disabled={saving} onClick={(event) => {
              const form = event.currentTarget.form;
              if (form) void saveListing(form, true);
            }}>{saving ? "Saving…" : "Submit for review"}</button>}
          </div>
        </div>
      </form>
    </>
  );
}
