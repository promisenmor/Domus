import { ArrowRight, Building2, House, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PropertyCard } from "@/components/properties/PropertyCard";

const featuredProperties = [
  {
    title: "Villa Amore",
    location: "Sandbanks, Dorset",
    price: "£2,450,000",
    listingType: "For sale" as const,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    bedrooms: 5,
    bathrooms: 4,
    area: "4,280 sq ft",
    slug: "villa-amore",
  },
  {
    title: "The Glasshouse",
    location: "Richmond, London",
    price: "£5,200 pcm",
    listingType: "For rent" as const,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,940 sq ft",
    slug: "the-glasshouse",
  },
  {
    title: "Hampstead Residence",
    location: "Hampstead, London",
    price: "£1,875,000",
    listingType: "For sale" as const,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    bedrooms: 4,
    bathrooms: 3,
    area: "3,160 sq ft",
    slug: "hampstead-residence",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Exceptional homes, thoughtfully found</p>
            <h1>Find a place<br />you&apos;ll call <em>home.</em></h1>
            <p className="hero-description">
              Explore distinctive homes and expert-led opportunities across the most sought-after locations.
            </p>
          </div>

          <div className="hero-media">
            <Image
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=90"
              alt="Contemporary luxury home surrounded by mature trees"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
            <div className="hero-location">
              <MapPin size={16} />
              <span><b>Featured property</b> Surrey, England</span>
            </div>
          </div>

          <form className="search-panel" action="/properties" method="get">
            <div className="search-tabs" aria-label="Listing type">
              <label><input type="radio" name="listing_type" value="buy" defaultChecked /><span>Buy</span></label>
              <label><input type="radio" name="listing_type" value="rent" /><span>Rent</span></label>
            </div>
            <div className="search-fields">
              <label className="search-field">
                <span>Location</span>
                <div><MapPin size={18} /><input name="location" placeholder="City or postcode" /></div>
              </label>
              <label className="search-field">
                <span>Property type</span>
                <select name="property_type" defaultValue="">
                  <option value="">Any property</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="commercial">Commercial</option>
                </select>
              </label>
              <label className="search-field">
                <span>Price range</span>
                <select name="max_price" defaultValue="">
                  <option value="">No maximum</option>
                  <option value="500000">Up to £500k</option>
                  <option value="1000000">Up to £1m</option>
                  <option value="2500000">Up to £2.5m</option>
                  <option value="5000000">Up to £5m</option>
                </select>
              </label>
              <button className="search-button" type="submit" aria-label="Search properties">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </section>

        <section className="section featured-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Curated collection</p>
              <h2>Featured properties</h2>
            </div>
            <Link href="/properties" className="text-link">View all properties <ArrowRight size={17} /></Link>
          </div>
          <div className="property-grid">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} {...property} />
            ))}
          </div>
        </section>

        <section className="category-section">
          <div className="category-copy">
            <p className="eyebrow">Find your fit</p>
            <h2>Explore by property type</h2>
            <p>Whether you seek the energy of the city or the calm of the countryside, your next chapter begins here.</p>
          </div>
          <div className="category-grid">
            <Link href="/properties?property_type=house" className="category-card category-large">
              <Image src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85" alt="Modern country house" fill sizes="(max-width: 720px) 100vw, 50vw" />
              <span><House size={22} /><b>Houses</b><small>124 properties</small></span>
            </Link>
            <Link href="/properties?property_type=apartment" className="category-card">
              <Image src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85" alt="Bright city apartment" fill sizes="(max-width: 720px) 100vw, 25vw" />
              <span><Building2 size={22} /><b>Apartments</b><small>89 properties</small></span>
            </Link>
            <Link href="/properties?property_type=bungalow" className="category-card">
              <Image src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=85" alt="Contemporary bungalow" fill sizes="(max-width: 720px) 100vw, 25vw" />
              <span><House size={22} /><b>Bungalows</b><small>36 properties</small></span>
            </Link>
          </div>
        </section>

        <section className="about-section">
          <div className="about-image">
            <Image src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85" alt="Domus property adviser with a client" fill sizes="(max-width: 900px) 100vw, 48vw" />
          </div>
          <div className="about-copy">
            <p className="eyebrow">The Domus approach</p>
            <h2>Real estate,<br />made personal.</h2>
            <p>We combine local knowledge, considered advice and genuine care to make every move feel straightforward.</p>
            <Link href="/about" className="primary-link">About Domus <ArrowRight size={17} /></Link>
          </div>
        </section>

        <section className="cta-section">
          <div>
            <p className="eyebrow">Thinking of selling or letting?</p>
            <h2>Let&apos;s find your property&apos;s next chapter.</h2>
          </div>
          <Link href="/contact" className="cta-button">Speak to an adviser <ArrowRight size={18} /></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
