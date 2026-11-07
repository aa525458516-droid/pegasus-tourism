# PEGASUS — Luxury Private Tourism & Transportation Hurghada

**PEGASUS** is a production-grade, multilingual web application built for a premier private tourism and VIP transportation company based in Hurghada, Egypt. The platform provides private airport pickups from Hurghada International Airport (HRG), intercity resort transfers, and curated excursions to Luxor, Cairo, and Marsa Alam.

---

## Key Features

1. **Light Luxury Design System**:
   - Palette: warm off-white and sand backgrounds (`#FBF9F5`, `#F5F1E9`), regal dark navy (`#0D1B2A`), and refined gold accents (`#D4AF37`, `#ECC974`).
   - Elegant typography with serif headings (*Cinzel* & *Playfair Display*) and modern body sans-serif (*Plus Jakarta Sans* & *Alexandria*).
   - Fully responsive across mobile smartphones, tablets, and desktop displays.

2. **Multilingual & RTL Support**:
   - Three fully localized languages: **English** (default), **German (Deutsch)**, and **Arabic (العربية)**.
   - Comprehensive translation dictionaries covering all forms, buttons, validation messages, tour itineraries, and administrative controls.
   - Automatic HTML `dir="rtl"` and `dir="ltr"` layout adaptation with Arabic typography adjustments.

3. **Booking Engine & Status Lifecycle**:
   - Unique generated reference per booking (e.g., `PEG-2025-XXXXX`).
   - Every newly created booking is strictly assigned **Pending** status.
   - Customers cannot confirm bookings themselves; confirmation is reserved for authorized dispatch managers.
   - Zero upfront online credit card payment required — travelers can pay upon arrival.
   - Instant 1-click **WhatsApp** message prefill with all booking details.
   - **Track Booking** lookup modal enabling customers to verify live status and driver notes anytime using their booking reference.

4. **Complete Public Tourism Pages**:
   - **Home**: VIP Hero banner, direct booking widget, fleet highlights, featured excursions, and arrival guide.
   - **Airport Transfers**: Dedicated transfer booking calculator, route duration estimations (El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Marsa Alam, Luxor, Cairo), and VIP airport welcome benefits.
   - **Tours & Excursions**: Filterable catalog (Historical, Marine & Snorkeling, Desert Safari, Day Trips) with pricing, duration, highlights, and full itinerary modals.
   - **Tour Details**: Rich itinerary breakdown, inclusions (private A/C vehicle, Egyptologist, tickets, lunch), exclusions, and immediate booking.
   - **About Us**: Egypt Ministry of Tourism credentials, 24/7 Hurghada dispatch operations, and step-by-step Hurghada airport arrival protocol.
   - **Gallery**: Curated photography of vehicles, Red Sea marine reserves, and ancient Egyptian monuments with a lightbox viewer.
   - **Contact Us**: Working inquiry form saved to database, Google map service area overview, and 24/7 hotline numbers.

5. **Protected Admin Management Portal**:
   - Separate access via the Admin lock icon or `/admin` view.
   - Secure authentication supporting **Google Sign-In** for authorized admin emails and instant access via dispatcher passcode (`pegasus2025` or `admin`).
   - **Bookings Management**: Filter by status (*Pending*, *Confirmed*, *Completed*, *Cancelled*), full text search, live status update, driver assignment notes, customer WhatsApp direct chat, and printable voucher generator.
   - **Tours Catalog Manager**: Create, edit, toggle active status, and delete tours. Includes a "Seed Initial Data" button.
   - **Customer Inquiries**: View messages submitted via contact form, filter unread/read/replied, and reply via WhatsApp or email.
   - **Company Information**: Edit official phone, WhatsApp number, email, address, and dispatch hours.

---

## Database Architecture & Firestore Rules

The database uses Google Cloud Firestore:

- `/bookings/{bookingId}`:
  - `create`: Publicly writeable with strict field validations. Ensures status is always initialized to `'Pending'`.
  - `get`: Readable by admin or customers querying a specific document ID.
  - `list`: Restricted strictly to authorized administrators to protect customer PII (phone, email, flight numbers).
  - `update`, `delete`: Admin only.
- `/tours/{tourId}`: Publicly readable; create/update/delete restricted to administrators.
- `/contactMessages/{messageId}`: Publicly writeable for new inquiries; read/update restricted to admin.
- `/settings/company`: Publicly readable; writeable only by administrators.
- `/admins/{adminUid}`: Authorized administrator registry.

---

## Admin Account Creation & Setup

### 1. Authorized Administrator Authentication
The application supports secure Firebase Authentication:
- **Google Sign-In**: Pre-configured for the primary administrator account: `aa525458516@gmail.com`.
- **Firebase Auth Email/Password**: Secure login for authorized operational staff accounts.
- Hardcoded default passcodes (such as `pegasus2025` or `admin`) have been audited and removed to ensure zero-trust security.

### 2. Adding New Administrators in Firestore
To add additional admin users:
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Navigate to **Firestore Database** > `admins` collection.
3. Create a document where the Document ID is the target user's Firebase Auth `UID`.
4. Add `{ "role": "admin", "email": "user@example.com", "createdAt": "..." }`.

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
Licensed under Apache-2.0. Built for PEGASUS Hurghada Luxury Tourism & Transfers.
