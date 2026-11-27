export type ClientProfile = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email_notifications: boolean;
  role: "CLIENT" | "AGENT" | "STAFF" | "ADMIN";
  is_verified: boolean;
};

export type SavedListing = {
  id: number;
  title: string;
  slug: string;
  price: string;
  location: string;
  city: string;
  image: string | null;
};

export type ClientEnquiry = {
  id: number;
  property: number;
  property_title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClientDashboardData = {
  profile: ClientProfile;
  overview: {
    saved_properties: number;
    total_enquiries: number;
    active_enquiries: number;
  };
  saved_listings: SavedListing[];
  enquiries: ClientEnquiry[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
