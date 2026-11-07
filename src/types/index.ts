export type Language = 'en' | 'de' | 'ar';
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
  passengerCount: number;
  luggageCount: number;
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
  tourId?: string;
  tourTitle?: string;
  notes?: string;
  status: BookingStatus;
  adminNotes?: string;
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
  vehicleType: string;
  serviceType?: ServiceType;
  tripType?: TripType;
  passengerCount?: number;
  tourTitle?: string;
  emailHash?: string;
  phoneHash?: string;
  adminNotes?: string;
  updatedAt: string;
}

export interface Tour {
  id: string;
  title: string;
  titleDe: string;
  titleAr: string;
  category: 'historical' | 'marine' | 'safari' | 'daytrip' | 'kite_water' | 'boat_trips' | 'transportation';
  destination: string;
  duration: string;
  pricePerPerson?: number | null;
  priceMode: 'fixed' | 'request';
  priceNotice?: string;
  description: string;
  descriptionDe: string;
  descriptionAr: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  imageUrl: string;
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

export interface CompanySettings {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  emergencyPhone: string;
  officeHours: string;
  licenseNumber: string;
  updatedAt?: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  nameDe: string;
  nameAr: string;
  category: string;
  capacityPassengers: number;
  capacityLuggage: number;
  description: string;
  descriptionDe: string;
  descriptionAr: string;
  imageUrl: string;
  features: string[];
}

export type CustomTripStatus =
  | 'Pending Review'
  | 'Price Sent'
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
  description: string;
  descriptionDe: string;
  descriptionAr: string;
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

export interface CustomTripRequest {
  id?: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone: string;
  country: string;
  startDate: string;
  endDate?: string;
  passengerCount: number; // max 2
  pickup: string;
  accommodation: string;
  destination?: string;
  experiences: SelectedExperience[];
  specialRequests?: string;
  pricing: {
    internalCost?: number;
    margin?: number;
    finalPrice?: number;
    currency: string;
  };
  status: CustomTripStatus;
  emailHash?: string;
  phoneHash?: string;
  createdAt: string;
  updatedAt: string;
}

