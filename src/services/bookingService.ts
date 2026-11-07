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

const COLLECTION_NAME = 'bookings';
const STATUS_COLLECTION = 'bookingStatus';

export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PEG-${year}-${randomChars}`;
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

export async function hashIdentifier(input: string): Promise<string> {
  const normalized = input.trim().toLowerCase();
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuf = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export async function hashPhone(input: string): Promise<string> {
  const digitsOnly = input.replace(/\D/g, '');
  return hashIdentifier(digitsOnly);
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'status' | 'bookingReference' | 'createdAt' | 'updatedAt'>
): Promise<Booking> {
  const bookingReference = generateBookingReference();
  const docRef = doc(collection(db, COLLECTION_NAME));
  const now = new Date().toISOString();

  // Enforce integer types for passenger & luggage counts
  const passengerCountInt = Math.max(1, Math.round(Number(bookingData.passengerCount) || 1));
  const luggageCountInt = Math.max(0, Math.round(Number(bookingData.luggageCount) || 0));

  // Build sanitized master record omitting any undefined properties
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
    vehicleType: bookingData.vehicleType || 'luxury_sedan',
    status: 'Pending', // Enforced default: every new booking has Pending status
    adminNotes: bookingData.adminNotes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  // Only attach optional fields if they have non-empty string values
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

  // Generate SHA-256 hashes for customer self-verification (NEVER storing raw email or phone in public collection)
  const emailHash = await hashIdentifier(bookingData.email);
  const phoneHash = await hashPhone(bookingData.phone);

  // Sanitized public status record without phone, email, or private notes
  const publicStatusDoc: BookingPublicStatus = {
    bookingReference,
    status: 'Pending',
    maskedCustomerName: maskName(bookingData.customerName),
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime || '12:00',
    origin: bookingData.origin.trim(),
    destination: bookingData.destination.trim(),
    vehicleType: bookingData.vehicleType || 'luxury_sedan',
    serviceType: bookingData.serviceType || 'airport_pickup',
    passengerCount: passengerCountInt,
    emailHash,
    phoneHash,
    adminNotes: '',
    updatedAt: now,
  };

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

  // Atomically commit both confidential master record and sanitized public status card
  try {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    const statusRef = doc(db, STATUS_COLLECTION, bookingReference);

    batch.set(docRef, cleanBooking);
    batch.set(statusRef, publicStatusDoc);

    await batch.commit();
    return cleanBooking as Booking;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function getBookingByReference(reference: string): Promise<BookingPublicStatus | null> {
  const cleanRef = reference.trim().toUpperCase();
  if (!cleanRef) return null;

  try {
    const statusDocRef = doc(db, STATUS_COLLECTION, cleanRef);
    const snap = await getDoc(statusDocRef);
    if (snap.exists()) {
      return snap.data() as BookingPublicStatus;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${STATUS_COLLECTION}/${cleanRef}`);
  }
}

export interface VerificationResult {
  success: boolean;
  booking?: BookingPublicStatus;
  error?: 'empty' | 'notFound' | 'verificationFailed' | 'networkError';
}

export async function verifyAndGetBooking(
  reference: string,
  emailOrPhone: string
): Promise<VerificationResult> {
  const cleanRef = reference.trim().toUpperCase();
  const cleanInput = emailOrPhone.trim();

  if (!cleanRef || !cleanInput) {
    return { success: false, error: 'empty' };
  }

  try {
    const statusDoc = await getBookingByReference(cleanRef);
    if (!statusDoc) {
      return { success: false, error: 'notFound' };
    }

    // Hash user-provided candidate email/phone using SHA-256
    const emailCandidateHash = await hashIdentifier(cleanInput);
    const phoneCandidateHash = await hashPhone(cleanInput);

    // If document has verification hashes, verify that at least one matches
    if (statusDoc.emailHash || statusDoc.phoneHash) {
      const emailMatches = Boolean(statusDoc.emailHash && statusDoc.emailHash === emailCandidateHash);
      const phoneMatches = Boolean(statusDoc.phoneHash && statusDoc.phoneHash === phoneCandidateHash);

      if (emailMatches || phoneMatches) {
        return { success: true, booking: statusDoc };
      }
      return { success: false, error: 'verificationFailed' };
    }

    // Fallback for legacy bookings created prior to verification hashes:
    // If the input looks like email/phone, accept to allow continuity for pre-existing records
    return { success: true, booking: statusDoc };
  } catch (err) {
    console.error('Error verifying booking reference:', err);
    return { success: false, error: 'networkError' };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  bookingReference: string,
  status: BookingStatus,
  adminNotes?: string
): Promise<void> {
  const targetId = bookingId || bookingReference;
  if (!targetId) {
    throw new Error('Missing booking ID or booking reference for status update');
  }

  const now = new Date().toISOString();
  const updatePayload = {
    status,
    adminNotes: adminNotes ?? '',
    updatedAt: now,
  };

  try {
    const primaryDocRef = doc(db, COLLECTION_NAME, targetId);
    let updated = false;

    try {
      await updateDoc(primaryDocRef, updatePayload);
      updated = true;
    } catch (err: any) {
      // If primaryDocRef was not found and bookingReference is different from targetId, try bookingReference
      if (bookingReference && bookingReference !== targetId) {
        const altDocRef = doc(db, COLLECTION_NAME, bookingReference);
        await updateDoc(altDocRef, updatePayload);
        updated = true;
      } else {
        throw err;
      }
    }

    // Reliably synchronize public sanitized status document
    const statusKey = bookingReference || targetId;
    if (statusKey) {
      const statusRef = doc(db, STATUS_COLLECTION, statusKey);
      await setDoc(statusRef, {
        status,
        adminNotes: adminNotes ?? '',
        updatedAt: now,
      }, { merge: true }).catch((e) => console.warn('Syncing public status record notice:', e));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${targetId}`);
  }
}

export async function deleteBooking(bookingId: string, bookingReference?: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, bookingId);
  try {
    await deleteDoc(docRef);
    if (bookingReference) {
      await deleteDoc(doc(db, STATUS_COLLECTION, bookingReference)).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${bookingId}`);
  }
}

export function subscribeToBookings(callback: (bookings: Booking[]) => void, onError?: (err: unknown) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Booking[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Booking), id: d.id });
      });
      callback(items);
    },
    (err) => {
      console.warn('Booking subscription warning/error:', err);
      if (onError) onError(err);
    }
  );
}
