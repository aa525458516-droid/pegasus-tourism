# CHANGELOG — PEGASUS Tourism Refactoring & Hardening

All changes made during the system audit, security hardening, bug fixing, and business reality alignment.

## Phase 1: Security & Domain Auditing
- **Domain Elimination**: Removed all occurrences of `pegasus-hurghada.com` across source files, `index.html`, `public/robots.txt`, and `public/sitemap.xml`.
- **Configurable Site URL**: Created `src/config/siteConfig.ts` with `SITE_URL = ""` until an official domain is acquired. All canonical and `og:url` tags are cleanly omitted when empty.
- **Crypto-Grade Reference Numbers**: Replaced predictable date-counter booking IDs with cryptographically secure unguessable tokens using `crypto.getRandomValues` (e.g. `PEG-2026-X8K2M1` and `PEG-TRIP-2026-N7P4Q9`).
- **Protected Firestore Rules**:
  - Enforced `request.auth.token.email_verified == true` for admin operations.
  - Locked down `/admins`, `/adminEmails`, and confidential `/customTripAdminPricing`.
  - Added passenger validation rule enforcing $1 \le \text{passengerCount} \le 4$.
  - Protected public tracking docs from containing phone numbers, emails, flight details, or admin internal notes.
- **Rules Deployed**: Deployed updated `firestore.rules` directly to Firebase using `deploy_firebase`.

## Phase 2: Authentic Content & Zero False Claims
- **Vehicle Fleet Alignment**:
  - Removed all mentions of owned fleets, luxury brand claims (Mercedes, Land Cruiser, HiAce), and fabricated amenities (Wi-Fi, leather seating, bottled water, snacks).
  - Replaced vehicle list with passenger capacity categories: Sedan (1–2 passengers) and Comfort (up to 4 passengers).
  - Maximum passengers capped at 4 across all types, validation rules, forms, and database schemas.
- **Official Credentials & Licenses**:
  - Removed all claims of Egyptian Ministry of Tourism licensing and PADI certifications.
  - Stated truthful business model: Online private passenger transport and excursion booking company in Hurghada.
- **Honest Pricing & Payment Model**:
  - Removed fake automatic pricing calculations and "guaranteed fixed rate" claims.
  - Implemented manual quote workflow by Admin.
  - Payment: Cash on arrival directly with the driver.
  - Requirement: Copy of flight ticket required for confirmation of airport transfers.
- **Real Contact Information**:
  - WhatsApp & Phone set to `01109790984` (international link: `201109790984`).
  - Removed default test number `201000000000`.
  - Dynamic email set to `aa525458516@gmail.com`, editable by Admin in Settings.

## Phase 3: Media & Stock Photo Sanitization
- **Unsplash Removal**: Completely removed all external Unsplash URLs.
- **Local Media Architecture**: Created `src/config/images.ts` and `public/images/README.txt` with `HAS_REAL_IMAGES` toggle (`gallery: false`).
- **Conditional Gallery**: Hidden the gallery section and navigation links until authentic company photography is uploaded.

## Phase 4: Customer Tracking & Privacy
- **Direct Reference Lookup**: Enabled tracking via booking or custom trip reference code alone, eliminating the need to hash or expose customer phone numbers/emails.
- **Public vs. Confidential Split**:
  - Customer messages (`customerMessage`) are visible to the customer.
  - Operational dispatch notes (`adminNotes`) remain strictly restricted to authenticated administrators.
  - Internal custom trip costs and profit margins stored in protected `/customTripAdminPricing/{ref}`.
- **Quote Approval Action**: Added a 1-click "Approve Quoted Price" button on the customer tracking page.

## Phase 5: Anti-Spam & Form Validation
- **Honeypot Fields**: Added hidden honeypot fields (`company_website_url`) to booking forms and contact inquiry forms to silently discard automated bot spam.
- **Date Validation**: Blocked past dates on all datepickers using dynamic `min={todayIso}` constraints.

## Phase 6: URL Routing & Performance
- **HTML5 History Routing**: Implemented clean client-side URL routing (`/:lang`, `/:lang/transfers`, `/:lang/tours`, `/:lang/custom-trip`, `/:lang/track`, `/:lang/about`, `/:lang/contact`, `/:lang/admin`).
- **Browser History Support**: Full support for Back and Forward navigation via `popstate` listeners.
- **Dynamic SEO & Metadata**: Dynamically updates `document.title` and `<meta name="description">` on route and language changes.
- **Code Splitting / Lazy Loading**: Lazy-loaded `AdminDashboard` and `MapLocationPicker` with `React.lazy` and `Suspense` to optimize initial load times.

## Phase 7: Documentation & Verification
- Updated `README.md`, `PROJECT_CONTEXT.md`, and `AI_INSTRUCTIONS.md`.
- Full compilation and lint checks passed with zero errors.
