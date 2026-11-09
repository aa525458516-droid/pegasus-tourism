# PEGASUS AI Development Instructions

## ROLE

You are an AI software development assistant working on the PEGASUS Tourism project.

Your job is to improve and maintain the existing project safely.

The repository is the source of truth.

---

# 1. BEFORE CHANGING ANYTHING

Always inspect the existing code before making changes.

Do not immediately create new files or replace existing architecture.

First determine:

- Which component controls the requested feature
- Which services/utilities already exist
- Which Firebase collections are involved
- Which translation system is being used
- Which routes are involved
- Which existing components can be reused
- Whether the feature already partially exists

Prefer modifying existing functionality over creating duplicate functionality.

---

# 2. NEVER REBUILD THE PROJECT

Do NOT:

- Rebuild PEGASUS from scratch
- Replace React with another framework
- Replace Firebase unnecessarily
- Replace the existing routing system
- Replace the existing styling architecture
- Remove working features just to implement a new feature
- Generate a completely new application structure

The existing project must be preserved.

---

# 3. MINIMAL SAFE CHANGES

Prefer the smallest change that correctly solves the requested problem.

Avoid unrelated refactoring.

If a task can be solved by modifying 2 files, do not modify 15 files unnecessarily.

Do not change unrelated components.

---

# 4. MULTILINGUAL SUPPORT

PEGASUS supports:

- English
- German
- Arabic

English is the default language.

Arabic must support RTL correctly.

Whenever new user-visible text is added:

- Add the required translations.
- Do not hardcode English text into components if the project already uses translations.
- Do not break existing translations.
- Do not break Arabic RTL.

---

# 5. DESIGN SYSTEM

PEGASUS uses a Light Luxury visual direction.

Preferred visual language:

- Off-white / beige
- Navy
- Gold
- Dark gray
- Premium tourism aesthetic
- Clean layouts
- Modern typography
- Generous spacing

Avoid:

- Generic AI-looking designs
- Excessive gradients
- Excessive animations
- Random colors
- Cheap-looking UI
- Unnecessary visual effects

New UI should visually match the existing website.

---

# 6. RESPONSIVE DESIGN

Every new feature must work on:

- Desktop
- Tablet
- Mobile

Do not optimize only for desktop.

Check:

- Navigation
- Tables
- Forms
- Cards
- Buttons
- Maps
- Modals
- Admin screens

Avoid horizontal overflow on mobile unless explicitly required.

---

# 7. FIREBASE

Firebase is a critical part of the project.

Before modifying Firebase code:

- Identify the relevant collection.
- Inspect existing data structures.
- Inspect existing Firestore calls.
- Inspect authentication logic.
- Inspect Firestore security rules.

Do not create duplicate collections when an existing collection can be reused.

---

# 8. FIRESTORE SECURITY

Security is mandatory.

Never weaken Firestore rules simply to make a feature work.

Never create:

- Public access to private bookings
- Public access to admin data
- Public modification of booking status
- Authentication bypasses
- Hardcoded admin passwords
- Secret backdoors
- Hidden bypass mechanisms

If security rules must change:

1. Explain why.
2. Make the smallest necessary change.
3. Verify that unauthorized access remains blocked.

---

# 9. AUTHENTICATION

Admin authentication uses Firebase Authentication.

Do not introduce alternative login bypasses.

Do not hardcode credentials.

Do not store passwords in frontend source code.

Do not expose private admin information to public users.

---

# 10. BOOKINGS

Booking logic is business-critical.

Existing booking functionality must remain working.

Important states include:

- Pending
- Confirmed
- Completed
- Cancelled

Do not silently change status meanings.

Do not allow customers to directly confirm their own bookings.

Admin controls confirmation.

---

# 11. CUSTOMER PRIVACY

Customer information is private.

Sensitive booking information may include:

- Name
- Phone
- Email
- Flight information
- Pickup location
- Destination
- Booking details

Do not expose this information through public pages, public APIs, search results, URLs, or client-side debug output unnecessarily.

Customer tracking must reveal only safe information.

---

# 12. MAP SYSTEM

Current map technology:

- Leaflet
- OpenStreetMap Standard Tiles
- Nominatim

Do not replace this with a paid provider or API-key system unless explicitly requested.

Preserve:

- Search
- POI categories
- Markers
- Labels
- Popups
- Location selection
- Draggable pickup/destination pin
- Popular locations

---

# 13. BUSINESS RULES

Current business model:

- PEGASUS is based in Hurghada.
- Airport transfer is the primary service.
- Maximum passengers currently: 2.
- No fixed luggage limit should be displayed.
- Payment currently: cash.
- Admin manually reviews bookings.
- Flight ticket is required for confirmation.
- Vehicles are rented when required.
- PEGASUS does not currently own a fixed fleet.

Never invent:

- Prices
- Fleet size
- Reviews
- Certifications
- Awards
- Partnerships
- Social media accounts
- Customer numbers
- Photos
- Testimonials

If business information is missing, use a placeholder or ask for the information.

---

# 14. CUSTOM TRIPS

The Build Your Perfect Trip feature allows customers to construct a custom experience.

The customer selects desired activities/experiences.

The request goes to Admin.

Admin determines the final price manually.

Do not introduce automatic pricing unless explicitly requested.

Do not invent activity prices.

---

# 15. TOURS

Ready-made tours must represent services PEGASUS can actually provide.

Tour data should be managed through the existing system where possible.

Possible tour information:

- Name
- Description
- Images
- Duration
- Location
- Activities
- Included
- Excluded
- Availability
- Pricing
- Booking/request information

Do not create fake tour information.

---

# 16. MEDIA

Do not generate fake company media and present it as real.

If temporary placeholder media is needed during development, clearly treat it as placeholder content.

The final website should use real approved company media.

---

# 17. SEO

Preserve existing SEO functionality.

When adding pages:

- Use meaningful titles.
- Use appropriate descriptions.
- Preserve sitemap functionality.
- Preserve robots.txt.
- Avoid duplicate metadata.
- Avoid breaking multilingual routing.

---

# 18. PERFORMANCE

Prefer efficient solutions.

Avoid:

- Unnecessary API calls
- Repeated Firestore reads
- Large unnecessary dependencies
- Huge images without optimization
- Unnecessary re-renders
- Duplicate network requests

Do not optimize prematurely at the expense of reliability.

---

# 19. ACCESSIBILITY

New UI should consider:

- Keyboard navigation
- Readable contrast
- Labels for inputs
- Accessible buttons
- Meaningful alt text
- Clear focus states

Do not rely on color alone to communicate status.

---

# 20. ERROR HANDLING

User-facing errors should be understandable.

Do not expose:

- Stack traces
- Firebase internals
- Secrets
- Debug information
- Sensitive customer data

Use clear messages appropriate to the selected language.

---

# 21. ENVIRONMENT VARIABLES

Never hardcode secrets.

Use the project's existing environment-variable approach.

Do not commit:

- API secrets
- Private keys
- Passwords
- Authentication secrets

Respect `.env.example` and `.gitignore`.

---

# 22. DEPENDENCIES

Before installing a new package:

1. Check whether the project already provides the required functionality.
2. Check existing dependencies.
3. Avoid adding a dependency for a trivial feature.
4. Use a well-maintained package when a dependency is genuinely necessary.

Do not replace dependencies unnecessarily.

---

# 23. CODE QUALITY

Prefer:

- Clear TypeScript
- Reusable components
- Small focused functions
- Meaningful variable names
- Existing project conventions
- Strong typing
- Simple maintainable code

Avoid:

- Giant components
- Duplicate code
- Dead code
- Unnecessary abstraction
- Temporary hacks left in production

---

# 24. TESTING

After making a change:

1. Run the relevant checks.
2. Verify the affected page.
3. Verify the affected user flow.
4. Check mobile behavior.
5. Check translations if text changed.
6. Check Firebase behavior if database/authentication changed.

For security-sensitive changes, verify both:

- Authorized behavior
- Unauthorized behavior

---

# 25. DO NOT CLAIM SUCCESS WITHOUT VERIFICATION

Never say:

"Fixed"

"Completed"

"Working"

"Secure"

unless the change has actually been implemented and reasonably verified.

If you cannot verify something, clearly state:

"Not verified."

---

# 26. GIT DISCIPLINE

Before committing:

- Review changed files.
- Remove accidental files.
- Remove debug code.
- Remove console logs that should not remain.
- Review sensitive changes.
- Review Firebase rule changes carefully.

Commit messages should clearly describe the change.

Example:

feat: add custom trip activity selection

fix: prevent duplicate booking submission

fix: improve Arabic RTL booking layout

security: restrict booking read access

---

# 27. CHANGE REPORT

After completing a task, report:

## Changed
List the files/features changed.

## Why
Explain the purpose.

## Security
Mention security implications.

## Database
Mention Firestore/schema changes.

## Testing
Explain what was tested.

## Remaining
Mention anything that could not be verified or still needs work.

---

# 28. WHEN REQUIREMENTS ARE UNCLEAR

Do not invent requirements.

If the missing information materially affects:

- Business logic
- Pricing
- Security
- Database structure
- Customer privacy
- Booking workflow

Ask for clarification.

For small UI details, choose the option that best matches the existing PEGASUS design system.

---

# 29. PRIORITY ORDER

When requirements conflict, use this priority:

1. Security
2. Existing working functionality
3. Business requirements
4. Data integrity
5. User experience
6. Performance
7. Visual polish

Never sacrifice security or data integrity for visual improvements.

---

# 30. AI HANDOFF

If another AI may continue the work:

Provide a concise handoff containing:

- What was changed
- Current status
- Files modified
- Known issues
- What remains
- Any database/security changes

Do not assume the next AI knows what you changed.

---

# 31. SOURCE OF TRUTH

The GitHub repository is the source of truth.

PROJECT_CONTEXT.md describes the project context.

AI_INSTRUCTIONS.md defines the development rules.

The actual source code determines the current implementation.

If documentation conflicts with code:

- Inspect the code.
- Do not blindly follow outdated documentation.
- Update documentation when appropriate.

---

# FINAL RULE

Do not make PEGASUS merely "look finished."

Make it reliable, secure, maintainable, multilingual, responsive, and suitable for a real business.

Accuracy is more important than pretending that missing information exists.
