# PEGASUS — Private Tourism & Passenger Transfers Hurghada

**PEGASUS** is a production-grade, multilingual web application for private passenger transportation and custom tour bookings in Hurghada, Egypt. The platform provides private airport transfers to and from Hurghada International Airport (HRG), intercity resort transfers (El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Marsa Alam), custom trip planning ("Build Your Perfect Trip"), and direct customer booking tracking.

---

## Business Operating Model

- **Location**: Hurghada, Red Sea, Egypt.
- **Service Nature**: Online private tourism and passenger transportation booking service.
- **Vehicle Fleet**: Passenger vehicles (accommodating 1 to 4 passengers) arranged on demand per booking. No owned fleet or vehicle brand claims.
- **Capacity**: Maximum **4 passengers** per vehicle (Sedan: 1–2 passengers; Comfort: up to 4 passengers). Luggage is a flexible customer input without arbitrary limits.
- **Pricing**: Manual quote model. No fake automated rates, guaranteed fixed pricing, or invented fees.
- **Payment**: Cash payment upon arrival directly with the driver.
- **Confirmation Requirement**: A copy of the customer's flight ticket is required for airport transfer confirmation.
- **Driver Meet & Greet**: Driver meets passengers outside the terminal holding a personalized sign with the customer's name and PEGASUS branding.
- **Direct Contact**: Phone & WhatsApp: `01109790984` (International: `+20 110 979 0984`).
- **Official Email**: Configurable via Admin Dashboard Settings (default bootstrap: `aa525458516@gmail.com`).

---

## Key Features

1. **Light Luxury Design System**:
   - Palette: Warm sand and off-white backgrounds (`#FBF9F5`, `#F5F1E9`), refined navy (`#0D1B2A`, `#1A2332`), and subtle warm gold accents (`#C5A880`, `#D4AF37`).
   - Clean, modern typography with *Plus Jakarta Sans* and *Alexandria* (Arabic).
   - Fully responsive across mobile smartphones, tablets, and desktop viewports.

2. **Multilingual & RTL Architecture**:
   - Three fully localized languages: **English** (`en`), **German** (`de`), and **Arabic** (`ar`).
   - Native RTL support for Arabic with proper typography and directional mirroring.
   - Client-side URL routing supporting `/:lang`, `/:lang/transfers`, `/:lang/tours`, `/:lang/custom-trip`, `/:lang/track`, `/:lang/about`, `/:lang/contact`, and `/:lang/admin`.
   - Full browser Back/Forward navigation history support (`popstate`).

3. **Booking Engine & Status Lifecycle**:
   - Unique unguessable cryptographic references (e.g., `PEG-2026-A1B2C3` for transfers, `PEG-TRIP-2026-D4E5F6` for custom trips).
   - All newly submitted bookings and trips start strictly in **Pending** status.
   - Customers cannot confirm bookings themselves; confirmation is performed by authorized administrators.
   - Direct WhatsApp integration with prefilled booking reference and trip details.
   - Public customer tracking via reference code, returning safe status data without exposing PII (phone, email, flight numbers, or admin internal notes).

4. **Public Sections & Pages**:
   - **Home**: Hero banner, quick transfer booking widget, service highlights, featured tours, reference tracker, and custom trip builder CTA.
   - **Airport & Private Transfers**: Clear route options, transparent guidelines (flight ticket required, cash payment, up to 4 passengers), and direct booking form.
   - **Tours & Excursions**: Admin-managed catalog with real availability toggles (*Available* / *Currently Unavailable*), rich details modal, and "Request This Tour" flow. Displays an elegant custom inquiry prompt when catalog is empty.
   - **Build Your Perfect Trip**: Interactive trip builder allowing customers to select multiple destinations/activities, schedule dates, and request personalized quotes.
   - **Track Booking**: Direct reference lookup for both standard transfers and custom trips with quote approval action.
   - **About Us & Vehicle Categories**: Honest presentation of passenger vehicle categories (1–2 and up to 4 passengers) and direct Hurghada arrival protocols.
   - **Contact Us**: Working inquiry form, direct WhatsApp button, dynamic email/phone, and honeypot spam protection.

5. **Protected Admin Management Portal**:
   - Lazy-loaded to eliminate bundle overhead for regular visitors.
   - Secure authentication via Firebase Authentication (Google Sign-In or verified Email/Password).
   - Requires verified email (`emailVerified === true`) and inclusion in authorized `/adminEmails` or `/admins`.
   - **Bookings Management**: Filter by status (*Pending*, *Confirmed*, *Completed*, *Cancelled*), search, status updates, driver assignment, driver name/notes, customer WhatsApp direct chat, and printable voucher generator.
   - **Custom Trip Quotes**: Review custom itineraries, set customer quote price, approve requests, and maintain confidential internal cost/margin data in private `/customTripAdminPricing`.
   - **Tours Catalog Manager**: Create, edit, toggle availability (*Available* / *Currently Unavailable*), and delete tours.
   - **Inquiries**: Review contact form messages.
   - **Administrator Access**: Manage authorized admin emails directly from the dashboard.
   - **Company Settings**: Update phone, WhatsApp, email, address, and company policies dynamically.

---

## Domain Configuration

The canonical domain is configured in `src/config/siteConfig.ts`:
```ts
export const SITE_URL = ''; // Set to production domain once purchased (e.g. 'https://example.com')
```
When `SITE_URL` is empty, canonical URLs and `og:url` tags are cleanly omitted.

---

## Development & Deployment

### Run Locally
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## License
Licensed under Apache-2.0. Built for PEGASUS Hurghada.
