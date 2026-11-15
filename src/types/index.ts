export type Language = 'en' | 'de' | 'ar' | 'ru';
export type Direction = 'ltr' | 'rtl';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type ServiceType = 
  | 'airport_pickup' 
  | 'airport_dropoff' 
  | 'tour' 
  | 'intercity' 
  | 'hourly' 
  | 'custom_trip' 
  | 'private_transfer';

export type TripType = 'one_way' | 'round_trip';

export type FlightDirection = 'arrival' | 'departure';

export interface LocationDetails {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id?: string;
  bookingReference: string;
  customerName: string;
  phone: string;
  email: string;
  nationality: string;
  passengerCount: number; // Max 4
  luggageCount: number;   // Free field, no fixed limit
  pickupDate: string;
  pickupTime: string;
  serviceType: ServiceType;
  tripType?: TripType;
  origin: string;
  destination: string;
  pickupLocation?: LocationDetails;
  destinationLocation?: LocationDetails;
  flightNumber?: string;
  airline?: string;
  flightDirection?: FlightDirection;
  flightTime?: string;
  vehicleType: string;
  vehicleName?: string;
  quotedPrice?: number | null;
  priceCurrency?: string;
  priceStatus?: 'fixed' | 'price_on_request';
  tourId?: string;
  tourTitle?: string;
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;       // Admin private internal notes
  customerMessage?: string;  // Public message shown to customer on tracking page
  createdAt: string;
  updatedAt: string;
}

export interface BookingPublicStatus {
  bookingReference: string;
  status: BookingStatus;
  maskedCustomerName: string;
  pickupDate: string;
  pickupTime: string;
  origin: string;
  destination: string;
  pickupLocation?: LocationDetails;
  destinationLocation?: LocationDetails;
  vehicleType?: string;
  vehicleName?: string;
  quotedPrice?: number | null;
  priceCurrency?: string;
  priceStatus?: 'fixed' | 'price_on_request';
  serviceType?: ServiceType;
  tripType?: TripType;
  passengerCount?: number;
  tourTitle?: string;
  customerMessage?: string;
  tripSummary?: string;
  verifyEmailHash?: string;
  verifyPhoneHash?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface Tour {
  id: string;
  title: string;
  titleDe: string;
  titleAr: string;
  titleRu?: string;
  category: 'historical' | 'marine' | 'safari' | 'daytrip' | 'kite_water' | 'boat_trips' | 'transportation';
  destination: string;
  duration: string;
  pricePerPerson?: number | null;
  priceMode: 'fixed' | 'request';
  priceNotice?: string;
  description: string;
  descriptionDe: string;
  descriptionAr: string;
  descriptionRu?: string;
  fullDescription?: string;
  meetingPickupInfo?: string;
  importantInfo?: string;
  available?: boolean;
  highlights: string[];
  highlightsDe?: string[];
  highlightsAr?: string[];
  highlightsRu?: string[];
  included: string[];
  includedDe?: string[];
  includedAr?: string[];
  includedRu?: string[];
  excluded: string[];
  excludedDe?: string[];
  excludedAr?: string[];
  excludedRu?: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  featured: boolean;
  active: boolean;
  displayOrder: number;
  supplierName?: string;
  supplierContact?: string;
  supplierCost?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface CompanyPolicies {
  cancellationEn?: string;
  cancellationPolicyEn?: string;
  cancellationDe?: string;
  cancellationAr?: string;
  cancellationRu?: string;
  waitingTimeEn?: string;
  waitingTimePolicyEn?: string;
  waitingTimeDe?: string;
  waitingTimeAr?: string;
  waitingTimeRu?: string;
  inclusionsEn?: string;
  inclusionsDe?: string;
  inclusionsAr?: string;
  inclusionsRu?: string;
  paymentNotesEn?: string;
  paymentTermsEn?: string;
  paymentNotesDe?: string;
  paymentNotesAr?: string;
  paymentNotesRu?: string;
}

export interface SocialMediaLinks {
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
}

export interface CompanySettings {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  emergencyPhone?: string;
  officeHours?: string;
  licenseNumber?: string;
  socialMedia?: SocialMediaLinks;
  policies?: CompanyPolicies;
  updatedAt?: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  nameDe: string;
  nameAr: string;
  nameRu?: string;
  category: string;
  capacityPassengers?: number | null;
  capacityLuggage?: number | null;
  modelYear?: string;
  description: string;
  descriptionDe: string;
  descriptionAr: string;
  descriptionRu?: string;
  imageUrl?: string;
  features: string[];
  active?: boolean;
}

export type VehicleCategory = VehicleOption;

export interface TransferPriceRule {
  id: string;
  origin: string;
  destination: string;
  vehicleId: string;
  oneWayPrice: number | null;
  roundTripPrice: number | null;
  currency: 'EUR' | 'USD' | 'EGP';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  nameAr: string;
  nameDe: string;
  nameRu?: string;
  category: 'red_sea' | 'cairo' | 'luxor' | 'sinai' | 'alexandria' | 'all';
  imageUrl: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  descriptionRu?: string;
  distanceFromHurghada?: string;
  suggestedTripDuration?: string;
  pricePerPerson?: number;
  active: boolean;
  featured: boolean;
  displayOrder: number;
}

export type CustomTripStatus =
  | 'Pending'
  | 'Pending Review'
  | 'Price Sent'
  | 'Price Approved'
  | 'Customer Approved'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface ExperienceItem {
  id: string;
  categoryId: 'safari_desert' | 'kite_water' | 'boat_trips' | 'sea_snorkeling' | 'cultural_trips' | 'transportation';
  title: string;
  titleDe: string;
  titleAr: string;
  titleRu?: string;
  description: string;
  descriptionDe: string;
  descriptionAr: string;
  descriptionRu?: string;
  badge: string;
  active: boolean;
}

export interface SelectedExperience {
  experienceId: string;
  title: string;
  category: string;
  date?: string;
  notes?: string;
}

// Confidential master custom trip request (Admin only, contains customer PII)
export interface CustomTripRequest {
  id?: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone: string;
  country: string;
  startDate: string;
  endDate?: string;
  passengerCount: number; // Max 4
  pickup: string;
  accommodation: string;
  destination?: string;
  experiences: SelectedExperience[];
  specialRequests?: string;
  price?: number;
  currency?: string;
  pricing: {
    finalPrice?: number;
    currency: string;
  };
  customerMessage?: string;
  status: CustomTripStatus;
  createdAt: string;
  updatedAt: string;
}

// Sanitized public custom trip tracking card (Zero PII, verified by salted email/phone hashes)
export interface CustomTripPublicStatus {
  id?: string;
  referenceNumber: string;
  maskedCustomerName: string;
  startDate: string;
  endDate?: string;
  passengerCount: number;
  pickup: string;
  accommodation: string;
  destination?: string;
  experiences: SelectedExperience[];
  pricing: {
    finalPrice?: number;
    currency: string;
  };
  customerMessage?: string;
  status: CustomTripStatus;
  verifyEmailHash?: string;
  verifyPhoneHash?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin-only pricing doc (stored in separate admin collection /customTripAdminPricing)
export interface CustomTripAdminPricing {
  referenceNumber: string;
  internalCost: number;
  margin: number;
  finalPrice: number;
  currency: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AdminEmailRecord {
  email: string;
  addedAt: string;
  createdAt?: string;
  addedBy?: string;
}
