import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CustomTripRequest,
  CustomTripPublicStatus,
  CustomTripStatus,
  CustomTripAdminPricing,
} from '../types';
import { maskName } from './bookingService';
import { computeVerifyEmailHash, computeVerifyPhoneHash } from '../utils/trackingVerification';

const COLLECTION_NAME = 'customTripRequests';
const PUBLIC_STATUS_COLLECTION = 'customTripStatus';
const ADMIN_PRICING_COLLECTION = 'customTripAdminPricing';

/**
 * Generates an unguessable cryptographically secure custom trip reference.
 * 8 alphanumeric chars from safe base32 alphabet (no 0, O, 1, I, L).
 */
export function generateTripReference(): string {
  const year = new Date().getFullYear();
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let randomPart = '';
  for (let i = 0; i < array.length; i++) {
    randomPart += alphabet[array[i] % alphabet.length];
  }
  return `PEG-TRIP-${year}-${randomPart}`;
}

export async function createCustomTripRequest(
  tripData: Omit<CustomTripRequest, 'id' | 'status' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'pricing'>
): Promise<CustomTripRequest> {
  const referenceNumber = generateTripReference();
  const docRef = doc(db, COLLECTION_NAME, referenceNumber);
  const statusDocRef = doc(db, PUBLIC_STATUS_COLLECTION, referenceNumber);
  const now = new Date().toISOString();

  // Enforce max 4 passengers
  const passengerCountInt = Math.min(4, Math.max(1, Math.round(Number(tripData.passengerCount) || 1)));

  const newRequest: CustomTripRequest = {
    id: referenceNumber,
    referenceNumber,
    customerName: tripData.customerName.trim(),
    email: tripData.email.trim(),
    phone: tripData.phone.trim(),
    country: tripData.country?.trim() || 'International',
    startDate: tripData.startDate,
    endDate: tripData.endDate || tripData.startDate,
    passengerCount: passengerCountInt,
    pickup: tripData.pickup.trim(),
    accommodation: tripData.accommodation.trim(),
    destination: tripData.destination?.trim() || '',
    experiences: tripData.experiences || [],
    specialRequests: tripData.specialRequests?.trim() || '',
    pricing: {
      currency: 'EUR',
    },
    status: 'Pending Review',
    createdAt: now,
    updatedAt: now,
  };

  const [verifyEmailHash, verifyPhoneHash] = await Promise.all([
    computeVerifyEmailHash(referenceNumber, tripData.email),
    computeVerifyPhoneHash(referenceNumber, tripData.phone),
  ]);

  // Sanitized public tracking card (Zero PII)
  const publicStatusDoc: CustomTripPublicStatus = {
    referenceNumber,
    maskedCustomerName: maskName(tripData.customerName),
    startDate: tripData.startDate,
    endDate: tripData.endDate || tripData.startDate,
    passengerCount: passengerCountInt,
    pickup: tripData.pickup.trim(),
    accommodation: tripData.accommodation.trim(),
    destination: tripData.destination?.trim() || '',
    experiences: tripData.experiences || [],
    pricing: {
      currency: 'EUR',
    },
    status: 'Pending Review',
    verifyEmailHash,
    verifyPhoneHash,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, newRequest);
    await setDoc(statusDocRef, publicStatusDoc);
    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

export async function getCustomTripByReference(referenceNumber: string): Promise<CustomTripPublicStatus | null> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  if (!cleanRef) return null;

  try {
    const snap = await getDoc(doc(db, PUBLIC_STATUS_COLLECTION, cleanRef));
    if (snap.exists()) {
      return { ...(snap.data() as CustomTripPublicStatus), id: snap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${PUBLIC_STATUS_COLLECTION}/${cleanRef}`);
    return null;
  }
}

export async function getAllCustomTripRequests(): Promise<CustomTripRequest[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as CustomTripRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

/**
 * Updates custom trip pricing.
 * Internal cost and margin are stored STRICTLY in admin-only collection /customTripAdminPricing.
 * Only finalPrice and currency are written to the master request and sanitized public status card.
 */
export async function updateCustomTripPricing(
  referenceNumber: string,
  internalCost: number,
  margin: number,
  finalPrice: number,
  currency: string = 'EUR'
): Promise<void> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  const now = new Date().toISOString();

  try {
    // 1. Save confidential admin pricing in admin-only collection
    const adminPricingRef = doc(db, ADMIN_PRICING_COLLECTION, cleanRef);
    const adminPricingData: CustomTripAdminPricing = {
      referenceNumber: cleanRef,
      internalCost: Number(internalCost) || 0,
      margin: Number(margin) || 0,
      finalPrice: Number(finalPrice) || 0,
      currency: currency || 'EUR',
      updatedAt: now,
    };
    await setDoc(adminPricingRef, adminPricingData);

    // 2. Update master document
    const docRef = doc(db, COLLECTION_NAME, cleanRef);
    await updateDoc(docRef, {
      'pricing.finalPrice': Number(finalPrice) || 0,
      'pricing.currency': currency || 'EUR',
      status: 'Price Sent',
      updatedAt: now,
    });

    // 3. Synchronize sanitized public tracking card
    const statusDocRef = doc(db, PUBLIC_STATUS_COLLECTION, cleanRef);
    await setDoc(
      statusDocRef,
      {
        pricing: {
          finalPrice: Number(finalPrice) || 0,
          currency: currency || 'EUR',
        },
        status: 'Price Sent',
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${cleanRef}`);
    throw error;
  }
}

export const saveCustomTripAdminPricing = updateCustomTripPricing;

export async function getCustomTripAdminPricing(referenceNumber: string): Promise<CustomTripAdminPricing | null> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  try {
    const snap = await getDoc(doc(db, ADMIN_PRICING_COLLECTION, cleanRef));
    if (snap.exists()) {
      return snap.data() as CustomTripAdminPricing;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ADMIN_PRICING_COLLECTION}/${cleanRef}`);
    return null;
  }
}

/**
 * Customer action to approve the quoted price on the tracking page.
 */
export async function approveCustomTripPrice(referenceNumber: string): Promise<void> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, PUBLIC_STATUS_COLLECTION, cleanRef), {
      status: 'Customer Approved',
      updatedAt: now,
    });
    await updateDoc(doc(db, COLLECTION_NAME, cleanRef), {
      status: 'Customer Approved',
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PUBLIC_STATUS_COLLECTION}/${cleanRef}`);
    throw error;
  }
}

export async function updateCustomTripStatus(
  referenceNumber: string,
  status: CustomTripStatus,
  customerMessage?: string
): Promise<void> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  const now = new Date().toISOString();
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: now,
    };
    if (customerMessage !== undefined) {
      updatePayload.customerMessage = customerMessage;
    }
    await updateDoc(doc(db, COLLECTION_NAME, cleanRef), updatePayload);
    await setDoc(doc(db, PUBLIC_STATUS_COLLECTION, cleanRef), updatePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${cleanRef}`);
    throw error;
  }
}

export async function deleteCustomTripRequest(referenceNumber: string): Promise<void> {
  const cleanRef = referenceNumber.trim().toUpperCase();
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, cleanRef));
    await deleteDoc(doc(db, PUBLIC_STATUS_COLLECTION, cleanRef));
    await deleteDoc(doc(db, ADMIN_PRICING_COLLECTION, cleanRef));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${cleanRef}`);
    throw error;
  }
}
