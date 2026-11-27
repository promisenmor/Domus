# Domus Frontend Specification

**Document:** `frontend.md`  
**Project:** Domus — Real Estate Platform  
**Status:** Proposed Specification  
**Architecture:** Frontend application consuming the Django REST Framework API

---

# 1. Introduction

## 1.1 Purpose

Domus is a real estate platform designed to connect property buyers, renters, clients, and real estate agents through a central property discovery and management system.

The frontend is the user-facing layer of Domus. It provides the interface through which visitors discover properties, clients manage their interests, agents manage listings, and authorised staff administer the platform.

The frontend must prioritise:

- An intuitive property discovery experience.
- A professional and trustworthy visual identity.
- Responsive layouts across desktop, tablet, and mobile.
- Clear separation between public pages and authenticated dashboards.
- Reliable integration with the Django REST Framework backend.
- Accessibility, performance, SEO, and maintainability.

## 1.2 Frontend Objectives

The frontend should:

1. Present property listings in an attractive and searchable format.
2. Allow visitors to explore detailed property information.
3. Allow clients to register, save properties, and submit enquiries.
4. Allow agents to create, update, and manage property listings.
5. Provide dashboards based on authenticated user roles.
6. Display CMS-managed content and blog articles.
7. Communicate with the backend through documented API endpoints.
8. Provide a consistent experience across all supported devices.

---

# 2. Technology Stack

The proposed frontend stack is:

| Technology | Responsibility |
|---|---|
| Next.js | React framework and application routing |
| React | Component-based UI |
| TypeScript | Static typing and maintainability |
| Tailwind CSS | Styling and responsive layouts |
| React Hook Form | Form state and submission |
| Zod | Client-side validation |
| Fetch API | Backend communication |
| Lucide React | Icons |
| Playwright | End-to-end testing |
| Vitest / React Testing Library | Unit and component testing |

### 2.1 Why Next.js?

Next.js provides:

- Server-side rendering.
- Static generation where appropriate.
- File-based routing.
- Metadata and SEO support.
- Image optimisation.
- Server and client component separation.
- A structured foundation for a growing frontend.

Property pages and public content are particularly suitable for server rendering because search engines should be able to discover and index them.

### 2.2 Why TypeScript?

TypeScript will help us maintain predictable data structures when communicating with the backend.

For example, a property returned by the API should follow a defined structure rather than relying on loosely typed JavaScript objects.

---

# 3. Frontend Architecture

## 3.1 Architectural Approach

Domus will use a separate frontend application and backend API.

- **Frontend:** Next.js, React, TypeScript.
- **Backend:** Django and Django REST Framework.
- **Database:** PostgreSQL.
- **Media storage:** Cloudinary or another compatible object-storage provider.
- **Background processing:** Celery and Redis where required.

The frontend must not communicate directly with the database.

All business logic, permissions, validation rules, and data ownership decisions remain on the backend.

## 3.2 Request Flow

The expected request flow is:

Browser → Next.js frontend → Django REST API → PostgreSQL

The backend processes the request and returns the appropriate response.

The frontend is responsible for displaying the response and handling the user's interaction with it.

## 3.3 Separation of Responsibilities

| Frontend responsibilities | Backend responsibilities |
|---|---|
| Display properties | Store property records |
| Search interface | Execute property searches |
| Form validation for usability | Authoritative data validation |
| Dashboard presentation | Calculate dashboard metrics |
| Display user permissions | Enforce permissions |
| Display enquiry status | Manage enquiry lifecycle |
| Image upload interface | Validate and store media |
| Authentication interface | Authenticate and authorise users |

The frontend must never be treated as a security boundary.

## 3.4 Proposed Project Structure

```text
domus-frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── properties/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── blog/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── account/
│   │   ├── agent/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── properties/
│   │   ├── forms/
│   │   └── dashboard/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── properties/
│   │   ├── saved-properties/
│   │   ├── enquiries/
│   │   └── agents/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── validation/
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── types/
│   └── config/
│
├── tests/
├── package.json
└── README.md
```

This is a proposed structure. We should adapt it to the actual repository if an existing frontend is already established.

---

# 4. User Roles and Frontend Access

Domus has four main roles:

- ADMIN
- STAFF
- AGENT
- CLIENT

The frontend should present interfaces according to the authenticated user's role.

| Role | Frontend access |
|---|---|
| ADMIN | Full administrative access |
| STAFF | Authorised operational management |
| AGENT | Property and enquiry management |
| CLIENT | Saved properties, enquiries, and profile |
| Guest | Public property discovery and guest enquiry where supported |

Important: hiding a navigation link does not secure a page. The backend must enforce all permissions.

Public registration should only offer CLIENT and AGENT account types. ADMIN and STAFF accounts must be provisioned through authorised administrative processes.

---

# 5. Public Website

The public website is the main property discovery experience.

It should be visually engaging, easy to navigate, and optimised for search engines.

## 5.1 Homepage

Route: `/`

The homepage should contain:

### Header and Navigation
- Domus logo.
- Home.
- Properties.
- About.
- Services.
- Blog.
- Contact.
- Login/Register.
- User account menu when authenticated.

### Hero Section
- Strong headline.
- Supporting description.
- Property search component.
- Sale/rent selection.
- Location search.
- Search button.
- High-quality property imagery.

### Featured Properties
Display selected property listings.

Each property card should include:
- Primary image.
- Property title.
- Price.
- Location.
- Bedrooms.
- Bathrooms.
- Property type.
- Save property action.

### Additional Homepage Sections
- Recently added properties.
- Property categories.
- Areas or locations.
- About Domus.
- Services.
- Latest blog posts.
- Contact call-to-action.
- Footer.

Homepage content should be configurable where appropriate rather than permanently hardcoded.

## 5.2 Property Search Page

Route: `/properties`

This page is responsible for displaying property search results.

### Search Features

Users should be able to filter properties by:

- Location.
- Sale or rent.
- Property type.
- Minimum price.
- Maximum price.
- Bedrooms.
- Bathrooms.
- Additional property features.

### Sorting

Users should be able to sort by:

- Most recent.
- Lowest price.
- Highest price.
- Other supported backend sorting options.

### Search Experience

The page should support:

- Search results count.
- Active filters.
- Clear filters.
- Pagination.
- Loading states.
- Empty states.
- Error states.
- Responsive property grid.

Search filters should be represented in URL query parameters so that users can share or revisit searches.

Example:

```text
/properties?listing_type=rent&min_price=500&bedrooms=2
```

The frontend should not download every listing and filter everything locally. The backend should perform the actual search and pagination.

## 5.3 Property Cards

A reusable property card component should be created.

Expected information:

- Property image.
- Property title.
- Location.
- Price.
- Listing status.
- Bedrooms.
- Bathrooms.
- Property type.
- Save/favourite button.
- Link to property details.

Cards must handle missing optional information gracefully.

## 5.4 Property Details Page

Route: `/properties/[slug]`

This is one of the most important pages in Domus.

It should provide all relevant information about an individual property.

### Page Sections

1. Breadcrumb navigation.
2. Property title.
3. Property location.
4. Price and listing status.
5. Property image gallery.
6. Key property information.
7. Property description.
8. Property features and amenities.
9. Floorplans or supporting documents, where available.
10. Location information or map, if supported.
11. Agent information.
12. Enquiry form.
13. Similar properties.
14. Save property action.

The page must display the appropriate state for properties that are sold, let, withdrawn, or otherwise unavailable.

Unpublished listings must never be exposed through public pages.

## 5.5 About Page

Route: `/about`

This page should communicate:

- What Domus is.
- Its mission.
- Its approach to real estate.
- Its services.
- Reasons users should trust the platform.

Content should eventually be managed through the CMS.

## 5.6 Contact Page

Route: `/contact`

Features:

- Contact information.
- Contact form.
- Enquiry category.
- Message field.
- Submission feedback.

Form submissions should be sent to the backend.

## 5.7 Services Page

Route: `/services`

Display services offered through Domus, such as:

- Property sales.
- Property rentals.
- Property management.
- Agent services.
- Other supported real estate services.

The final content depends on the actual business model.

## 5.8 Blog

Routes:

```text
/blog
/blog/[slug]
```

The blog should display CMS-managed articles.

Blog listing page:
- Article image.
- Title.
- Excerpt.
- Publication date.
- Author.
- Category.

Article page:
- Title.
- Cover image.
- Author.
- Publication date.
- Article content.
- Related articles.
- SEO metadata.

---

# 6. Authentication and Account Management

## 6.1 Authentication Pages

Routes:

```text
/login
/register
/forgot-password
/reset-password
```

The frontend should support:

- User registration.
- Login.
- Email verification.
- Forgot password.
- Password reset.
- Logout.
- Session handling.

## 6.2 Registration

The registration form should collect the information required by the backend.

Depending on the role:

**Client**
- Full name.
- Email.
- Password.
- Password confirmation.

**Agent**
- Full name.
- Email.
- Password.
- Password confirmation.
- Additional agent information if required.

The user must explicitly select an allowed registration role.

The backend remains responsible for validating and enforcing that role.

## 6.3 Authentication Strategy

The authentication implementation must be agreed with the backend.

Preferred approach:

- Secure HttpOnly cookies where the architecture supports them.
- Appropriate Secure and SameSite settings.
- CSRF protection for cookie-authenticated requests.
- Short-lived access tokens where applicable.
- Refresh-token rotation and revocation where supported.

Avoid storing long-lived authentication credentials in localStorage.

The frontend and backend must agree on cookie domains, CORS, CSRF, and refresh behaviour before implementation.

## 6.4 Protected Routes

Protected routes include:

```text
/account/*
/agent/*
```

The frontend should redirect unauthenticated users appropriately.

Authenticated users should only access pages permitted for their role.

However, the backend must independently enforce all access restrictions.

---

# 7. Client Dashboard

Route: `/account`

The client dashboard provides a central place for managing property interests.

## 7.1 Dashboard Overview

Display:

- Welcome message.
- Profile summary.
- Number of saved properties.
- Number of enquiries.
- Recent activity.

Metrics should come from backend endpoints.

## 7.2 Saved Properties

Route: `/account/saved-properties`

Features:

- View saved properties.
- Open property details.
- Remove saved properties.
- Handle unavailable properties.
- Empty state when no properties have been saved.

## 7.3 My Enquiries

Route: `/account/enquiries`

Features:

- View submitted enquiries.
- Property associated with each enquiry.
- Submission date.
- Enquiry status.
- Relevant responses or updates, where supported.

## 7.4 Profile

Route: `/account/profile`

Features:

- View profile.
- Update personal information.
- Update contact details.
- Upload profile image if supported.

## 7.5 Settings

Route: `/account/settings`

Features:

- Change password.
- Manage account preferences.
- Manage notification preferences.
- Account-related actions supported by the backend.

---

# 8. Agent Dashboard

Route: `/agent`

The agent dashboard is a central workspace for managing properties and prospective clients.

## 8.1 Dashboard Overview

Display:

- Total listings.
- Published listings.
- Draft listings.
- Pending listings.
- Sold or let listings.
- Recent enquiries.
- Recent listing activity.

All metrics should be supplied by the backend.

## 8.2 Property Management

Route: `/agent/listings`

Features:

- View assigned or owned listings.
- Search listings.
- Filter by listing status.
- Sort listings.
- Open listing details.
- Edit listings.
- Create new listings.

Agents must only see and manage listings permitted by backend ownership and assignment rules.

## 8.3 Create Property

Route: `/agent/listings/new`

The listing form should be divided into logical sections.

### Basic Information
- Property title.
- Property description.
- Property type.
- Sale or rental.
- Price.
- Currency and price frequency where applicable.

### Location
- Address fields.
- City or area.
- Postcode.
- Country.
- Location coordinates if supported.

### Property Details
- Bedrooms.
- Bathrooms.
- Receptions.
- Floor area.
- Additional features.

### Media
- Upload images.
- Preview images.
- Set primary image.
- Reorder images.
- Remove images.
- Upload floorplans or documents where supported.

### Submission

Agents should be able to:

- Save as draft.
- Submit for review.
- Update an existing listing.

The backend determines whether a listing is valid and whether it can be published.

## 8.4 Edit Property

Route: `/agent/listings/[id]/edit`

The edit form should:

- Load existing property data.
- Allow permitted changes.
- Preserve unchanged information.
- Support media updates.
- Display validation errors.
- Warn about unsaved changes where appropriate.

## 8.5 Listing Status

The interface should clearly communicate listing status.

Possible statuses:

- Draft.
- Pending review.
- Published.
- Sold.
- Let.
- Archived.
- Withdrawn.

Only actions permitted by the backend should be available.

## 8.6 Enquiry Management

Routes:

```text
/agent/enquiries
/agent/enquiries/[id]
```

Features:

- View enquiries.
- Filter by status.
- View enquiry details.
- View associated property.
- Update enquiry status where permitted.
- Add internal notes.
- Record follow-up information.

---

# 9. Staff and Admin Interface

For the initial release, Django Admin should remain the primary administrative interface.

This avoids building a second administration system before the core platform is stable.

The frontend may later introduce custom staff interfaces for:

- Listing moderation.
- User management.
- Enquiry management.
- CMS management.
- CRM integration monitoring.
- Operational analytics.

Any custom interface must use the same backend permission system.

---

# 10. Reusable Component System

Domus should use reusable components rather than duplicating UI across pages.

## 10.1 Layout Components

```text
SiteHeader
SiteFooter
MainNavigation
MobileNavigation
Breadcrumbs
PageContainer
DashboardLayout
DashboardSidebar
```

## 10.2 Property Components

```text
PropertySearch
PropertyFilters
PropertyCard
PropertyGrid
PropertyGallery
PropertyFeatures
PropertyPrice
PropertyStatus
PropertyMap
SimilarProperties
SavePropertyButton
```

## 10.3 Form Components

```text
FormInput
FormSelect
FormTextarea
FormCheckbox
FormError
FormSubmitButton
ImageUploader
MultiImageUploader
```

## 10.4 Dashboard Components

```text
DashboardHeader
StatCard
DataTable
StatusBadge
ActivityList
EmptyState
Pagination
```

## 10.5 Feedback Components

```text
LoadingSkeleton
ErrorMessage
SuccessMessage
Toast
ConfirmationDialog
EmptyState
NotFound
```

Components should be accessible, reusable, and independent of specific page implementations where practical.

---

# 11. Design System

The frontend should follow a consistent design system.

The final visual direction must be documented in `DESIGN.md`.

## 11.1 Design Principles

Domus should communicate:

- Trust.
- Professionalism.
- Clarity.
- Quality.
- Simplicity.
- Confidence.

The interface should feel like a professional real estate platform rather than a generic dashboard template.

## 11.2 Visual Hierarchy

Property photography should be prominent.

The interface should use:

- Clear typography.
- Strong page hierarchy.
- Consistent spacing.
- Readable property information.
- Clear calls to action.
- Restrained use of colour.
- Consistent buttons and form controls.

## 11.3 Design Tokens

The design system should define:

- Primary and secondary colours.
- Background colours.
- Text colours.
- Typography.
- Font sizes.
- Spacing scale.
- Border radii.
- Shadows.
- Breakpoints.
- Component states.

These values should be centralised rather than scattered across components.

---

# 12. Responsive Design

Domus must support:

- Mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.

The implementation should follow a mobile-first approach.

### Mobile
- Collapsible navigation.
- Single-column property cards.
- Search filters in a drawer or expandable panel.
- Touch-friendly controls.
- Responsive property galleries.

### Tablet
- Two-column property layouts where appropriate.
- Adaptable dashboard navigation.
- Responsive forms and tables.

### Desktop
- Multi-column property grids.
- Full navigation.
- Sidebar dashboard layouts.
- Larger image galleries.

Responsive design must be tested rather than assumed from the use of Tailwind breakpoints.

---

# 13. Accessibility

Domus should target WCAG 2.2 AA where practical.

Requirements:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Appropriate colour contrast.
- Accessible form labels.
- Clear validation messages.
- Descriptive image alt text.
- Accessible dialogs and menus.
- Proper heading hierarchy.
- Reduced-motion support where appropriate.
- Sufficient touch-target sizes.

Accessibility should be considered during component development, not added as a final step.

---

# 14. API Integration

## 14.1 Central API Client

All backend communication should pass through a central API layer.

Avoid scattering raw fetch calls throughout page components.

The API client should handle:

- Base URL configuration.
- Authentication.
- Request headers.
- JSON requests.
- Multipart file uploads.
- Response parsing.
- Error handling.
- Request cancellation where appropriate.

## 14.2 Environment Configuration

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Only public configuration should use the `NEXT_PUBLIC_` prefix.

Secrets must never be exposed to the browser.

## 14.3 Frontend Data Types

The frontend should define types corresponding to backend API responses.

Expected entities include:

```text
User
AgentProfile
Listing
ListingImage
SavedProperty
Enquiry
PropertyFeature
BlogPost
CMSPage
PaginatedResponse
APIError
```

Where possible, these types should be generated from the backend OpenAPI schema to reduce inconsistencies.

## 14.4 API Error Handling

The frontend should handle:

- 400 — Validation errors.
- 401 — Unauthenticated requests.
- 403 — Permission denied.
- 404 — Resource not found.
- 409 — Conflict, where used by the API.
- 429 — Rate limiting.
- 500 — Server errors.
- Network failures.

Users should receive clear messages rather than raw server responses.

---

# 15. SEO and Performance

Public pages must be optimised for search engines.

## 15.1 SEO

Requirements:

- Unique page titles.
- Meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Property-specific metadata.
- Sitemap generation.
- Robots configuration.
- Structured data where appropriate.
- Clean and descriptive URLs.

Private account and dashboard pages must not be indexed.

## 15.2 Performance

Requirements:

- Server-render public property pages where appropriate.
- Optimised property images.
- Lazy loading for below-the-fold content.
- Avoid unnecessary client-side JavaScript.
- Avoid duplicate API requests.
- Paginate large result sets.
- Avoid caching private user data across accounts.
- Monitor Core Web Vitals.

Performance should be tested using realistic listing data, not only a handful of development records.

---

# 16. Forms and User Experience

All forms should provide a consistent experience.

Requirements:

- Clear labels.
- Required-field indicators.
- Client-side validation.
- Backend validation.
- Field-level error messages.
- Loading indicators.
- Prevention of accidental duplicate submissions.
- Success feedback.
- Preservation of form values after validation failures where appropriate.
- Confirmation before destructive actions.

Client-side validation improves usability but never replaces backend validation.

---

# 17. Security Considerations

The frontend must follow these principles:

1. Never expose API secrets.
2. Never trust client-side role information as proof of permission.
3. Never assume hidden navigation protects a route.
4. Avoid unsafe rendering of user-generated HTML.
5. Use secure authentication and session handling.
6. Handle CSRF correctly when using cookie-based authentication.
7. Do not cache private responses in shared public caches.
8. Validate uploaded files on the backend.
9. Avoid exposing unpublished listings.
10. Handle authentication expiry and logout correctly.

---

# 18. Testing Strategy

## 18.1 Unit Tests

Test:

- Utility functions.
- Form validation.
- Data formatting.
- Reusable components.
- UI state transitions.

## 18.2 Integration Tests

Test:

- API client behaviour.
- Authentication flows.
- Property search.
- Saved property operations.
- Enquiry submissions.
- Listing creation and updates.

## 18.3 End-to-End Tests

Use Playwright to test complete user journeys.

Important scenarios:

**Visitor**
- Visit homepage.
- Search properties.
- Apply filters.
- Open property details.
- Submit an enquiry.

**Client**
- Register.
- Verify account.
- Log in.
- Save a property.
- View saved properties.
- Submit an enquiry.
- View enquiry history.

**Agent**
- Log in.
- Create a listing.
- Upload images.
- Save a draft.
- Submit for review.
- Edit an existing listing.
- Manage enquiries.

**Access control**
- Unauthenticated user cannot access protected dashboards.
- Client cannot access agent-only pages.
- Agent cannot access another agent's restricted listing.
- Unpublished properties cannot be viewed publicly.

---

# 19. Implementation Roadmap

Implementation should be incremental.

## Phase 1 — Public Website

Deliverables:

- Next.js project setup.
- TypeScript and Tailwind configuration.
- Design tokens.
- Shared layout components.
- Header and footer.
- Homepage.
- Property search page.
- Property cards.
- Property details page.
- Image gallery.
- Enquiry form.
- API integration.
- Loading, error, and empty states.
- Responsive layouts.
- Basic SEO.

**Outcome:** Visitors can discover properties and submit enquiries.

## Phase 2 — Authentication and Client Dashboard

Deliverables:

- Registration.
- Login.
- Email verification.
- Password recovery.
- Session management.
- Protected routes.
- Client dashboard.
- Saved properties.
- Enquiry history.
- Profile management.

**Outcome:** Clients can manage their accounts and property interests.

## Phase 3 — Agent Dashboard

Deliverables:

- Agent dashboard.
- Listing overview.
- Listing creation.
- Listing editing.
- Image uploads.
- Listing status management.
- Submission for moderation.
- Enquiry management.
- Agent profile.

**Outcome:** Agents can manage their properties and prospective clients.

The Phase 3 frontend includes role-aware agent sign-in, a protected agent workspace,
dashboard metrics and recent activity, searchable/filterable/sortable listing management,
listing create/edit forms with separately uploaded and ordered property images, review
submission, enquiry status/internal-note/follow-up management, and editable agent profiles.
Agent requests use the same-origin Next.js API proxy and HttpOnly auth cookies used by the
client portal. Agents can save drafts and submit them for moderation; publishing and other
moderation decisions remain backend-controlled.

## Phase 4 — CMS and Administrative Enhancements

Deliverables:

- CMS page integration.
- Blog integration.
- Advanced content pages.
- Multilingual frontend support if required.
- Custom staff interfaces if Django Admin proves insufficient.
- Advanced search experience.

**Outcome:** Domus supports its broader content and operational requirements.

## Phase 5 — Production Readiness

Deliverables:

- Accessibility review.
- Responsive testing.
- Browser compatibility.
- End-to-end testing.
- Performance optimisation.
- SEO verification.
- Error monitoring.
- Production deployment.
- Frontend documentation.

**Outcome:** A stable, production-ready frontend.

---

# 20. Definition of Done

The frontend should be considered ready for its initial production release when:

- Visitors can search and view published properties.
- Visitors can submit enquiries.
- Clients can register and manage their accounts.
- Clients can save properties.
- Agents can create and manage listings.
- Agents can upload property images.
- Listing moderation is respected.
- Role-based access is enforced by the backend.
- The application works on mobile, tablet, and desktop.
- Public pages have appropriate SEO metadata.
- Important user journeys have automated tests.
- Loading, empty, validation, and error states are implemented.
- The application is deployed and connected to the production API.

---

# 21. Development Workflow

Every feature should follow this workflow:

1. Review the relevant product requirement.
2. Confirm the backend API contract.
3. Review the design specification.
4. Identify reusable components.
5. Implement the interface.
6. Integrate the API.
7. Handle loading, success, empty, and error states.
8. Test responsiveness and accessibility.
9. Write or update automated tests.
10. Verify the complete user journey.
11. Update documentation.

Frontend development should not proceed on assumptions about backend endpoints or response structures.

---

# 22. Outstanding Decisions

The following decisions must be confirmed before implementation:

| Decision | Current position |
|---|---|
| Frontend framework | Next.js proposed |
| UI framework | React + TypeScript |
| Styling | Tailwind CSS |
| Backend integration | Django REST API |
| Authentication | Secure cookie strategy preferred, subject to backend compatibility |
| Image storage | Cloudinary or compatible storage |
| Admin interface | Django Admin initially |
| Design direction | To be finalised in DESIGN.md |
| Deployment platform | To be decided |
| Multilingual support | To be confirmed |
| Map integration | To be confirmed |

---

# 23. Immediate Next Step

Before writing frontend code, we should audit the existing Domus repository.

We need to establish:

- Whether a frontend already exists.
- Which framework it uses.
- Which pages have already been implemented.
- Whether reusable components exist.
- How styling is currently handled.
- Whether the frontend already communicates with Django.
- Whether authentication is implemented.
- Which features are complete, partial, or missing.

We should retain working code and improve the existing architecture where possible rather than rewriting the frontend unnecessarily.

**The next implementation milestone is the public property discovery experience: homepage, property search, property cards, and property details.**