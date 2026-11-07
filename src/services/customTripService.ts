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
import { CustomTripRequest, CustomTripStatus } from '../types';
import { hashIdentifier, hashPhone } from './bookingService';

const COLLECTION_NAME = 'customTripRequests';

export function generateTripReference(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PEG-TRIP-${year}-${randomChars}`;
}

export async function createCustomTripRequest(
  tripData: Omit<CustomTripRequest, 'id' | 'status' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'pricing'>
): Promise<CustomTripRequest> {
  const referenceNumber = generateTripReference();
  const docRef = doc(collection(db, COLLECTION_NAME));
  const now = new Date().toISOString();

  // Enforce max 2 passengers as per business model
  const passengerCountInt = Math.min(2, Math.max(1, Math.round(Number(tripData.passengerCount) || 1)));

  const emailHash = await hashIdentifier(tripData.email);
  const phoneHash = await hashPhone(tripData.phone);

  const newRequest: CustomTripRequest = {
    id: docRef.id,
    referenceNumber,
    customerName: tripData.customerName.trim(),
    email: tripData.email.trim(),
    phone: tripData.phone.trim(),
    country: tripData.country.trim() || 'International',
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
    emailHash,
    phoneHash,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, newRequest);
    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

export async function getCustomTripByReference(referenceNumber: string): Promise<CustomTripRequest | null> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      const data = d.data() as CustomTripRequest;
      if (data.referenceNumber?.toLowerCase() === referenceNumber.trim().toLowerCase()) {
        return { ...data, id: d.id };
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
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

export async function updateCustomTripPricing(
  tripId: string,
  internalCost: number,
  margin: number,
  finalPrice: number
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, tripId);
    await updateDoc(docRef, {
      'pricing.internalCost': Number(internalCost) || 0,
      'pricing.margin': Number(margin) || 0,
      'pricing.finalPrice': Number(finalPrice) || 0,
      status: 'Price Sent',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${tripId}`);
    throw error;
  }
}

export async function updateCustomTripStatus(
  tripId: string,
  status: CustomTripStatus
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, tripId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${tripId}`);
    throw error;
  }
}
