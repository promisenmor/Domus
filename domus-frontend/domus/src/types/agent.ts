import type { Paginated } from "@/types/account";

export type AgentProfile = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  company: string;
  license_number: string;
  biography: string;
  profile_picture: string | null;
  email_notifications: boolean;
  role: "AGENT";
  is_verified: boolean;
};

export type ListingImage = {
  id: number;
  image: string;
  caption: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
};

export type AgentListing = {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  location: string;
  address: string;
  city: string;
  region: string;
  postcode: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  reception_rooms: number;
  parking: boolean;
  garden: boolean;
  balcony: boolean;
  furnished: boolean;
  currency: string;
  price_frequency: string;
  reference_number: string;
  status: string;
  image: string | null;
  images: ListingImage[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentDashboardData = {
  profile: AgentProfile;
  overview: {
    total_listings: number;
    published_listings: number;
    draft_listings: number;
    pending_listings: number;
    sold_listings: number;
    let_listings: number;
    total_enquiries: number;
    new_enquiries: number;
  };
  properties: AgentListing[];
};

export type AgentEnquiry = {
  id: number;
  property: number;
  property_title: string;
  client: number | null;
  assigned_agent: number;
  name: string;
  email: string;
  phone_number: string;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED" | "SPAM";
  internal_notes: string;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentListingPage = Paginated<AgentListing>;
export type AgentEnquiryPage = Paginated<AgentEnquiry>;
