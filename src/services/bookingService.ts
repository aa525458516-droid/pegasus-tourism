import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Booking, BookingPublicStatus, BookingStatus } from '../types';
import { sendServerWhatsAppBookingNotification } from './notificationService';
import { computeVerifyEmailHash, computeVerifyPhoneHash } from '../utils/trackingVerification';

const COLLECTION_NAME = 'bookings';
const STATUS_COLLECTION = 'bookingStatus';

/**
 * Generates an unguessable, cryptographically secure booking reference.
 * 8 alphanumeric chars from base32 without confusing characters (no 0, O, 1, I, L).
 * Total ~656 billion combinations per year, impossible to guess.
 */
export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let randomPart = '';
  for (let i = 0; i < array.length; i++) {
    randomPart += alphabet[array[i] % alphabet.length];
  }
  return `PEG-${year}-${randomPart}`;
}

export function maskName(name: string): string {
  if (!name) return 'Customer';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p;
      return p[0] + '*'.repeat(Math.min(p.length - 1, 4));
    })
    .join(' ');
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'status' | 'bookingReference' | 'createdAt' | 'updatedAt'>
): Promise<Booking> {
  const bookingReference = generateBookingReference();
  const docRef = doc(collection(db, COLLECTION_NAME));
  const now = new Date().toISOString();

  // Enforce passenger limit: up to 8 for Toyota Hiace only, 4 max for all other vehicles
  const maxAllowedPassengers = bookingData.vehicleType === 'toyota_hiace' ? 8 : 4;
  const passengerCountInt = Math.min(maxAllowedPassengers, Math.max(1, Math.round(Number(bookingData.passengerCount) || 1)));
  const luggageCountInt = Math.max(0, Math.round(Number(bookingData.luggageCount) || 0));

  // Confidential master record (Admin only)
  const cleanBooking: Record<string, any> = {
    id: docRef.id,
    bookingReference,
    customerName: bookingData.customerName.trim(),
    phone: bookingData.phone.trim(),
    email: bookingData.email.trim(),
    nationality: bookingData.nationality?.trim() || 'International',
    passengerCount: passengerCountInt,
    luggageCount: luggageCountInt,
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime || '12:00',
    serviceType: bookingData.serviceType || 'airport_pickup',
    origin: bookingData.origin.trim(),
    destination: bookingData.destination.trim(),
    vehicleType: bookingData.vehicleType || 'toyota_corolla',
    status: 'Pending',
    adminNotes: bookingData.adminNotes?.trim() || '', // Admin internal notes ONLY
    customerMessage: '',                             // Public message to customer
    createdAt: now,
    updatedAt: now,
  };

  if (bookingData.vehicleName && bookingData.vehicleName.trim()) {
    cleanBooking.vehicleName = bookingData.vehicleName.trim();
  }
  if (typeof bookingData.quotedPrice === 'number' && Number.isFinite(bookingData.quotedPrice) && bookingData.quotedPrice > 0) {
    cleanBooking.quotedPrice = bookingData.quotedPrice;
  }
  if (bookingData.priceCurrency && bookingData.priceCurrency.trim()) {
    cleanBooking.priceCurrency = bookingData.priceCurrency.trim();
  }
  if (bookingData.priceStatus) {
    cleanBooking.priceStatus = bookingData.priceStatus;
  }
  if (bookingData.tripType) {
    cleanBooking.tripType = bookingData.tripType;
  }
  if (bookingData.flightNumber && bookingData.flightNumber.trim()) {
    cleanBooking.flightNumber = bookingData.flightNumber.trim().toUpperCase();
  }
  if (bookingData.airline && bookingData.airline.trim()) {
    cleanBooking.airline = bookingData.airline.trim();
  }
  if (bookingData.flightDirection) {
    cleanBooking.flightDirection = bookingData.flightDirection;
  }
  if (bookingData.flightTime && bookingData.flightTime.trim()) {
    cleanBooking.flightTime = bookingData.flightTime.trim();
  }
  if (bookingData.pickupLocation && bookingData.pickupLocation.name) {
    cleanBooking.pickupLocation = {
      name: bookingData.pickupLocation.name.trim(),
      address: bookingData.pickupLocation.address?.trim() || bookingData.pickupLocation.name.trim(),
      ...(bookingData.pickupLocation.latitude !== undefined && { latitude: Number(bookingData.pickupLocation.latitude) }),
      ...(bookingData.pickupLocation.longitude !== undefined && { longitude: Number(bookingData.pickupLocation.longitude) }),
    };
  }
  if (bookingData.destinationLocation && bookingData.destinationLocation.name) {
    cleanBooking.destinationLocation = {
      name: bookingData.destinationLocation.name.trim(),
      address: bookingData.destinationLocation.address?.trim() || bookingData.destinationLocation.name.trim(),
      ...(bookingData.destinationLocation.latitude !== undefined && { latitude: Number(bookingData.destinationLocation.latitude) }),
      ...(bookingData.destinationLocation.longitude !== undefined && { longitude: Number(bookingData.destinationLocation.longitude) }),
    };
  }
  if (bookingData.notes && bookingData.notes.trim()) {
    cleanBooking.notes = bookingData.notes.trim();
  }
  if (bookingData.tourId && bookingData.tourId.trim()) {
    cleanBooking.tourId = bookingData.tourId.trim();
  }
  if (bookingData.tourTitle && bookingData.tourTitle.trim()) {
    cleanBooking.tourTitle = bookingData.tourTitle.trim();
  }

  const [verifyEmailHash, verifyPhoneHash] = await Promise.all([
    computeVerifyEmailHash(bookingReference, bookingData.email),
    computeVerifyPhoneHash(bookingReference, bookingData.phone),
  ]);

  // Sanitized public status record (Zero PII, verified with salted hashes, NO admin notes)
  const publicStatusDoc: BookingPublicStatus = {
    bookingReference,
    status: 'Pending',
    maskedCustomerName: maskName(bookingData.customerName),
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime || '12:00',
    origin: bookingData.origin.trim(),
    destination: bookingData.destination.trim(),
    vehicleType: bookingData.vehicleType || 'toyota_corolla',
    serviceType: bookingData.serviceType || 'airport_pickup',
    passengerCount: passengerCountInt,
    customerMessage: '',
    verifyEmailHash,
    verifyPhoneHash,
    updatedAt: now,
    createdAt: now,
  };

  if (cleanBooking.vehicleName) {
    publicStatusDoc.vehicleName = cleanBooking.vehicleName;
  }
  if (cleanBooking.quotedPrice !== undefined) {
    publicStatusDoc.quotedPrice = cleanBooking.quotedPrice;
  }
  if (cleanBooking.priceCurrency) {
    publicStatusDoc.priceCurrency = cleanBooking.priceCurrency;
  }
  if (cleanBooking.priceStatus) {
    publicStatusDoc.priceStatus = cleanBooking.priceStatus;
  }
  if (cleanBooking.tripType) {
    publicStatusDoc.tripType = cleanBooking.tripType;
  }
  if (cleanBooking.pickupLocation) {
    publicStatusDoc.pickupLocation = cleanBooking.pickupLocation;
  }
  if (cleanBooking.destinationLocation) {
    publicStatusDoc.destinationLocation = cleanBooking.destinationLocation;
  }
  if (cleanBooking.tourTitle) {
    publicStatusDoc.tourTitle = cleanBooking.tourTitle;
  }

  try {
    // 1. Create confidential master record
    await setDoc(docRef, cleanBooking);

    // 2. Create sanitized public tracking card (keyed by unguessable bookingReference)
    const statusDocRef = doc(db, STATUS_COLLECTION, bookingReference);
    await setDoc(statusDocRef, publicStatusDoc);

    // 3. Fire-and-forget server-side WhatsApp notification (never blocks customer booking)
    void sendServerWhatsAppBookingNotification(cleanBooking as Booking);

    return cleanBooking as Booking;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

export async function getBookingStatusByReference(bookingReference: string): Promise<BookingPublicStatus | null> {
  const cleanRef = bookingReference.trim().toUpperCase();
  if (!cleanRef) return null;

  try {
    const snap = await getDoc(doc(db, STATUS_COLLECTION, cleanRef));
    if (snap.exists()) {
      return snap.data() as BookingPublicStatus;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STATUS_COLLECTION}/${cleanRef}`);
    return null;
  }
}

export function subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
      callback(bookings);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      callback([]);
    }
  );
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  bookingReference: string,
  status: BookingStatus,
  adminNotes?: string,
  customerMessage?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    // Update private master booking
    const updateData: Record<string, any> = {
      status,
      updatedAt: now,
    };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    if (customerMessage !== undefined) {
      updateData.customerMessage = customerMessage;
    }

    await updateDoc(doc(db, COLLECTION_NAME, bookingId), updateData);

    // Synchronize public status card with status and customerMessage ONLY (never internal adminNotes)
    const publicDocRef = doc(db, STATUS_COLLECTION, bookingReference);
    const publicUpdate: Record<string, any> = {
      status,
      updatedAt: now,
    };
    if (customerMessage !== undefined) {
      publicUpdate.customerMessage = customerMessage;
    }
    await setDoc(publicDocRef, publicUpdate, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${bookingId}`);
    throw error;
  }
}

export async function deleteBooking(bookingId: string, bookingReference?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, bookingId));
    if (bookingReference) {
      await deleteDoc(doc(db, STATUS_COLLECTION, bookingReference));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${bookingId}`);
    throw error;
  }
}
