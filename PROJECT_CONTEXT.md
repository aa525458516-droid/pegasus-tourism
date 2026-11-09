# PEGASUS Tourism — Project Context

## 1. Project Overview

PEGASUS is a professional multilingual private tourism and transportation website based in Hurghada, Egypt.

The website is designed for:
- Airport transfers
- Private transportation
- Ready-made tours and excursions
- Custom/private trips
- Build Your Perfect Trip requests
- Customer booking and tracking
- Admin management

The project is intended to be production-ready, professional, secure, multilingual, mobile-friendly, and easy to maintain.

---

## 2. Technology Stack

Frontend:
- React
- TypeScript
- Vite

Backend / Database:
- Firebase
- Firestore
- Firebase Authentication

Maps:
- Leaflet
- OpenStreetMap Standard Tiles
- Nominatim for location search

Styling:
- Existing project styling system must be preserved unless a task specifically requires a change.

---

## 3. Languages

The website supports:

1. English — default language
2. German
3. Arabic — RTL

Arabic pages and components must correctly support RTL layout.

Do not remove or break existing translations.

---

## 4. Main Website Areas

Current major areas include:

- Homepage
- Airport Transfers
- Tours & Excursions
- Tour Details
- About
- Gallery
- Contact
- Booking
- Track Booking
- Admin Dashboard

---

## 5. Booking System

The booking system supports:

- Service selection
- Ready-made Tour
- Custom Trip
- One Way
- Round Trip
- Pickup location
- Destination location
- Map selection
- Flight details when required
- Passenger information
- Customer contact information
- Review before submission
- Firestore booking creation
- Unique booking reference
- Pending status
- Booking success screen
- Customer booking tracking

Booking references follow a format similar to:

PEG-2026-XXXXXX

The initial booking status is:

Pending

The Admin can later change the status.

Possible booking statuses include:

- Pending
- Confirmed
- Completed
- Cancelled

---

## 6. Airport Transfer Workflow

Airport transfer is currently the primary business service.

Supported directions:

- Airport → Destination
- Destination → Airport

The customer can select a tourist destination.

Important business rules:

- Maximum passengers currently supported: 2
- Do NOT impose a fixed luggage-count limit unless the business requirements change.
- Payment is currently cash.
- Admin reviews and confirms bookings.
- Flight ticket is required for confirmation.
- Customer phone/WhatsApp information is available to Admin for contacting the customer.
- Driver should meet the customer holding a sign containing the customer's name and PEGASUS branding/logo.
- Flight delay handling/tracking should be supported where applicable.

Do not invent pricing.

Prices are currently determined manually by the business/Admin.

---

## 7. Custom Trip — Build Your Perfect Trip

The website includes a flexible custom-trip concept.

Customers can select the experiences/activities they want and build a complete trip.

The customer submits the request.

Admin then reviews the request and determines the final price manually.

The system should support:

- Activity/experience selection
- Trip customization
- Customer information
- Date/time information
- Pickup/location information
- Admin review
- Manual pricing
- Customer communication
- Booking/request status tracking

Do not create fake fixed prices.

---

## 8. Tours & Excursions

The project supports ready-made tours that PEGASUS can actually provide.

Tours should be manageable through the Admin Dashboard.

A tour may contain:

- Title
- Description
- Images/media
- Duration
- Location
- Activities
- Included items
- Excluded items
- Availability
- Pricing model
- Booking/request information

Only use real business information supplied by the owner/admin.

Do not invent reviews, certifications, partnerships, prices, photos, or claims.

---

## 9. Map System

The website uses:

- Leaflet
- OpenStreetMap Standard Tiles
- Nominatim search

The map currently supports curated locations/POIs.

Categories include:

- Hotels & Resorts
- Destinations
- Attractions
- Airports
- Marinas

Map functionality includes:

- Search
- Category filtering
- POI markers
- Permanent labels
- Popup information
- Select This Location
- Draggable golden pickup/destination pin
- Popular locations outside the map

Do not replace OpenStreetMap with a paid API unless explicitly requested.

Do not introduce API-key requirements unnecessarily.

---

## 10. Customer Tracking

Customers can track a booking using:

- Booking reference
- Email or phone verification

Tracking must not expose private customer information.

Public tracking should return only safe booking information.

Private booking data must remain protected.

---

## 11. Admin Dashboard

The Admin Dashboard is protected.

Admin functionality includes management of:

- Bookings
- Tours
- Messages
- Company information
- Settings

Admin authentication uses Firebase Authentication.

Admin authorization must be enforced using Firebase security rules and authenticated admin checks.

Do not add password/passcode backdoors.

Do not hardcode secret credentials.

---

## 12. Firestore Security

Firestore security is critical.

Public users may be allowed to create booking requests according to the current application design.

Public users must NOT be able to:

- List private bookings
- Read arbitrary bookings
- Modify bookings
- Modify booking status
- Access admin data
- Bypass authentication
- Access private customer information

Admin users may access and manage authorized data.

Any security rule change must be reviewed carefully before implementation.

---

## 13. Company Information

Current known business information:

Company:
PEGASUS

Location:
Hurghada, Egypt

Phone:
01109790984

WhatsApp:
01109790984

Email:
aa525458516@gmail.com

Support:
24/7

Business model:
Online private tourism and transportation service.

Important:
The email is temporary and may be changed later.

Do not invent:
- Social media accounts
- Reviews
- Certifications
- Fleet ownership
- Partnerships
- Customer statistics
- Awards
- Prices

---

## 14. Fleet / Vehicles

PEGASUS currently does not own a fixed fleet.

When a customer books, the business can rent an appropriate vehicle.

Therefore:

Do not claim that PEGASUS owns a fleet unless the owner explicitly updates this information.

---

## 15. Brand / Design Direction

Brand direction:

Light Luxury

Preferred visual direction:

- Off-white / beige
- Navy
- Gold
- Dark gray
- Clean premium layouts
- Professional tourism aesthetic
- Modern typography
- Spacious UI

Avoid cheap-looking templates, excessive gradients, excessive animations, and generic AI-generated visual clutter.

---

## 16. SEO

The project includes SEO-related files and configuration such as:

- robots.txt
- sitemap.xml
- favicon.svg
- HTML metadata

SEO improvements should preserve multilingual support and avoid breaking routing.

---

## 17. Media

The company currently does not have a finalized media library.

Do not invent company photos, videos, customer photos, reviews, or trust badges.

When media is added, it should be structured so it can later be managed easily.

---

## 18. Development Rules

Before modifying the project:

1. Understand the existing architecture.
2. Search the repository before creating new systems.
3. Reuse existing components and utilities.
4. Do not duplicate functionality.
5. Do not remove working features without explicit reason.
6. Preserve multilingual support.
7. Preserve Arabic RTL support.
8. Preserve Firebase security.
9. Preserve booking functionality.
10. Test affected flows after changes.

---

## 19. AI Development Rule

Any AI working on this project must treat the existing repository as the source of truth.

Do not assume the project is empty.

Do not rebuild the application from scratch.

Do not replace working architecture simply because another framework or library is preferred.

Before coding:

- Inspect the relevant files.
- Understand dependencies.
- Understand existing components.
- Understand current data structures.
- Identify related features.
- Make the smallest safe change necessary.

---

## 20. Change Management

Every significant change should include:

- What was changed
- Why it was changed
- Which files were modified
- Any database/security implications
- Any environment-variable requirements
- How the change was tested

If a change can affect Firebase rules, authentication, bookings, tracking, or customer privacy, treat it as a high-risk change and verify it carefully.

---

## 21. Important Principle

PEGASUS is a real business project.

Accuracy is more important than filling empty sections.

Never fabricate business information.

If required information is missing, use a clear placeholder or ask for the required business data instead of inventing it.
