# PEGASUS Tourism — Project Context

## 1. Project Overview

PEGASUS is a professional multilingual private tourism and passenger transportation booking platform based in Hurghada, Egypt.

The website provides:
- Airport transfers to/from Hurghada International Airport (HRG)
- Private resort and intercity transfers
- Ready-made tours and excursions
- Custom/private trips ("Build Your Perfect Trip")
- Direct customer booking and trip tracking
- Administrative management portal

The project is production-ready, secure, multilingual, mobile-responsive, and maintained with zero false marketing claims.

---

## 2. Technology Stack

Frontend:
- React 19
- TypeScript
- Vite
- Tailwind CSS

Backend / Database:
- Google Cloud Firestore
- Firebase Authentication

Maps:
- Leaflet
- OpenStreetMap Standard Tiles
- Nominatim for location search

---

## 3. Languages

The website supports:
1. English (`en`) — default
2. German (`de`)
3. Arabic (`ar`) — full RTL layout

All components and pages support RTL layout when Arabic is selected.

---

## 4. Main Website Areas & Routes

Current routes (with URL history support):
- `/:lang` — Homepage
- `/:lang/transfers` — Airport & Private Transfers
- `/:lang/tours` — Ready-made Tours & Excursions
- `/:lang/custom-trip` — Build Your Perfect Trip
- `/:lang/track` — Booking & Trip Tracking
- `/:lang/about` — About Us & Vehicle Categories
- `/:lang/contact` — Contact Information & Inquiry Form
- `/:lang/admin` — Admin Management Portal (Lazy-loaded)

---

## 5. Booking System

The booking system supports:
- Service selection: Airport Pickup, Airport Dropoff, Intercity Transfer, Ready-made Tour
- Trip direction (Airport → Destination, Destination → Airport)
- Pickup & Destination locations (with interactive Leaflet map picker)
- Flight details for airport transfers
- Passenger count: 1 to 4 passengers maximum
- Luggage count (free numeric input without arbitrary limit)
- Customer contact information (Name, WhatsApp/Phone, Email, Notes)
- Anti-spam honeypot protection
- Review before submission
- Direct Firestore creation in `/bookings`
- Cryptographically unguessable reference codes (e.g., `PEG-2026-XXXXXX`)
- Initial status: `Pending`
- Immediate customer confirmation with 1-click WhatsApp message

---

## 6. Airport Transfer Workflow

Airport transfer is the primary service.

Important business rules:
- Maximum passengers supported: 4 (Sedan: 1–2 passengers; Comfort: up to 4 passengers).
- Free luggage input (no arbitrary fixed limits).
- Payment method: Cash on arrival directly with the driver.
- Flight ticket copy is required for confirmation.
- Admin reviews and quotes/confirms all bookings manually.
- Driver meets customer outside the terminal with a personalized name sign.
- Direct contact via WhatsApp: `01109790984` (International: `+20 110 979 0984`).

---

## 7. Custom Trip — Build Your Perfect Trip

Customers can select desired destinations and activities to design a bespoke itinerary across Hurghada, Luxor, Cairo, and the Red Sea.

Workflow:
- Customer selects activities, enters date, passenger count (up to 4), and contact info.
- Submits request to `/customTripRequests` with a unique reference (e.g., `PEG-TRIP-2026-XXXXXX`).
- Admin reviews the request, calculates vehicle/operational costs, and enters a quoted price for the customer.
- Confidential internal costs and profit margins are stored in private `/customTripAdminPricing/{ref}` (accessible ONLY to authenticated admins).
- Customer checks the quote on the Tracking page and can approve the price with 1 click.

---

## 8. Tours & Excursions

- Admin-managed tour catalog via Firestore `/tours`.
- Each tour features an admin-controlled availability status: `Available` or `Currently Unavailable`.
- If the database catalog has no active tours, an elegant inquiry prompt is shown guiding the customer to request a custom trip or inquire directly on WhatsApp.
- No invented prices, reviews, or fake availability claims.

---

## 9. Customer Tracking

- Customers can track their booking or custom trip directly using their unique reference code.
- Public tracking reads from `/bookingPublicStatus/{ref}` and public trip projections.
- Sensitive customer PII (phone number, email, flight numbers, private internal admin notes) is strictly excluded from public tracking.

---

## 10. Admin Dashboard & Security

- Protected by Firebase Authentication.
- Requires verified email (`emailVerified === true`) and authorization in `/adminEmails` or `/admins`.
- Primary bootstrap administrator: `aa525458516@gmail.com`.
- No hardcoded passwords, backdoors, or unauthenticated passcodes.
- Admin manages bookings, custom trip quotes, tours catalog, contact messages, authorized admin emails, and company settings.

---

## 11. Company & Operating Information

- Company: PEGASUS
- Location: Hurghada, Egypt
- Nature: Online booking service for private passenger transportation and tours.
- Phone / WhatsApp: `01109790984`
- Email: `aa525458516@gmail.com` (dynamically editable in Settings)
- Vehicles: Passenger vehicles (1 to 4 passengers) rented on demand per booking. No owned fleet, no fake vehicle brands (e.g. Mercedes, Land Cruiser).
- Strictly no fabricated claims: No Ministry of Tourism license claims, no fleet ownership claims, no fake reviews/ratings, no fake certifications.
