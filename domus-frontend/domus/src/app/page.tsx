import { ArrowRight, ChevronDown, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PropertyCard } from "@/components/properties/PropertyCard";

const featuredProperties = [
  {
    title: "Oak House",
    location: "Richmond, London",
    price: "£2,850,000",
    listingType: "For sale" as const,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88",
    bedrooms: 5,
    bathrooms: 4,
    area: "3,640 sq ft",
    slug: "oak-house",
  },
  {
    title: "The Foundry",
    location: "Clifton, Bristol",
    price: "£1,650,000",
    listingType: "For sale" as const,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=88",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,810 sq ft",
    slug: "the-foundry",
  },
  {
    title: "Riverside Apartment",
    location: "Chelsea, London",
    price: "£5,750 pcm",
    listingType: "For rent" as const,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,480 sq ft",
    slug: "riverside-apartment",
  },
];

const locations = [
  {
    name: "London",
    count: "286 properties",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Surrey",
    count: "142 properties",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Cotswolds",
    count: "98 properties",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-image" aria-hidden="true">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90"
              alt=""
              fill
              priority
              sizes="100vw"
            />
            <div className="hero-overlay" />
          </div>

          <div className="hero-content">
            <p className="hero-kicker">Exceptional homes. Thoughtfully found.</p>
            <h1 id="hero-heading">Find a place<br />that feels like <em>home.</em></h1>
            <p className="hero-description">
              Explore thoughtfully presented properties and discover spaces that fit the way you want to live.
            </p>

            <form className="property-search" action="/properties" method="get">
              <div className="search-location">
                <MapPin size={19} aria-hidden="true" />
                <label>
                  <span>Location</span>
                  <input name="location" placeholder="City, area or postcode" />
                </label>
              </div>

              <label className="search-select">
                <span>Looking to</span>
                <span className="select-wrap">
                  <select name="listing_type" defaultValue="buy">
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>

              <label className="search-select">
                <span>Property type</span>
                <span className="select-wrap">
                  <select name="property_type" defaultValue="">
                    <option value="">Any type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="bungalow">Bungalow</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>

              <label className="search-select">
                <span>Price range</span>
                <span className="select-wrap">
                  <select name="max_price" defaultValue="">
                    <option value="">Any price</option>
                    <option value="500000">Up to £500k</option>
                    <option value="1000000">Up to £1m</option>
                    <option value="2500000">Up to £2.5m</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>

              <button type="submit" className="search-submit" aria-label="Find properties">
                <Search size={19} aria-hidden="true" />
                <span>Find Properties</span>
              </button>
            </form>
          </div>
        </section>

        <section className="trust-strip" aria-label="Domus highlights">
          <div><strong>1,200+</strong><span>Curated properties</span></div>
          <div><strong>36</strong><span>Local markets</span></div>
          <div><strong>98%</strong><span>Client satisfaction</span></div>
          <div><strong>12 yrs</strong><span>Property expertise</span></div>
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Curated for you</p>
              <h2>Featured properties</h2>
            </div>
            <Link href="/properties" className="section-link">
              View all properties <ArrowRight size={17} />
            </Link>
          </div>
          <div className="property-grid">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} {...property} />
            ))}
          </div>
        </section>

        <section className="locations-section">
          <div className="locations-heading">
            <p className="section-kicker">Explore neighbourhoods</p>
            <h2>Places with a sense of belonging</h2>
          </div>
          <div className="location-grid">
            {locations.map((location) => (
              <Link
                href={`/properties?location=${encodeURIComponent(location.name)}`}
                className="location-card"
                key={location.name}
              >
                <Image src={location.image} alt={`${location.name} neighbourhood`} fill sizes="(max-width: 640px) 100vw, 33vw" />
                <span className="location-shade" />
                <span className="location-copy">
                  <strong>{location.name}</strong>
                  <small>{location.count}</small>
                </span>
                <span className="location-arrow" aria-hidden="true"><ArrowRight size={18} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="editorial-section">
          <div className="editorial-image">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=88"
              alt="Property adviser welcoming a client"
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </div>
          <div className="editorial-copy">
            <p className="section-kicker">A more personal approach</p>
            <h2>Property expertise,<br />without the pressure.</h2>
            <p>
              From the first viewing to the final detail, our advisers combine local knowledge with attentive,
              straightforward guidance.
            </p>
            <Link href="/about" className="editorial-link">
              Discover Domus <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <p className="section-kicker">Ready for your next move?</p>
            <h2>Let&apos;s find the right place.</h2>
          </div>
          <Link href="/contact" className="cta-button">
            Speak to an adviser <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
