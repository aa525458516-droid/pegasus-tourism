import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tour } from '../types';
import { INITIAL_TOURS } from '../data/initialData';

const COLLECTION_NAME = 'tours';

function cleanLegacyCompetitorText(text?: string): string | undefined {
  if (!text) return text;
  if (!/carolin/i.test(text)) return text;
  return text
    .replace(/Orange Bay\s*\(\s*Carolin(?:\s+Island)?\s*\)/gi, 'Orange Bay & Giftun-Insel')
    .replace(/\s*\(?\s*Carolin(?:\s+Island)?\s*\)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function enrichTourLocalization(tour: Tour): Tour {
  const base = INITIAL_TOURS.find((t) => t.id === tour.id);
  const title = cleanLegacyCompetitorText(tour.title) ?? tour.title;
  const titleDe = /carolin/i.test(tour.titleDe || '')
    ? (base?.titleDe || cleanLegacyCompetitorText(tour.titleDe) || tour.titleDe)
    : tour.titleDe;
  const titleAr = cleanLegacyCompetitorText(tour.titleAr) ?? tour.titleAr;
  const description = cleanLegacyCompetitorText(tour.description) ?? tour.description;
  const descriptionDe = cleanLegacyCompetitorText(tour.descriptionDe) ?? tour.descriptionDe;

  return {
    ...tour,
    title,
    titleDe,
    titleAr,
    description,
    descriptionDe,
    titleRu: tour.titleRu ?? base?.titleRu,
    descriptionRu: tour.descriptionRu ?? base?.descriptionRu,
    highlightsDe: tour.highlightsDe?.length ? tour.highlightsDe : base?.highlightsDe,
    includedDe: tour.includedDe?.length ? tour.includedDe : base?.includedDe,
    excludedDe: tour.excludedDe?.length ? tour.excludedDe : base?.excludedDe,
    highlightsAr: tour.highlightsAr?.length ? tour.highlightsAr : base?.highlightsAr,
    includedAr: tour.includedAr?.length ? tour.includedAr : base?.includedAr,
    excludedAr: tour.excludedAr?.length ? tour.excludedAr : base?.excludedAr,
    highlightsRu: tour.highlightsRu?.length ? tour.highlightsRu : base?.highlightsRu,
    includedRu: tour.includedRu?.length ? tour.includedRu : base?.includedRu,
    excludedRu: tour.excludedRu?.length ? tour.excludedRu : base?.excludedRu,
  };
}

export async function getTours(): Promise<Tour[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      return INITIAL_TOURS;
    }
    const list: Tour[] = [];
    snap.forEach((d) => {
      list.push(enrichTourLocalization({ ...(d.data() as Tour), id: d.id }));
    });
    return list.length > 0 ? list : INITIAL_TOURS;
  } catch (error) {
    console.warn('Failed to load tours from Firestore, returning initial tours:', error);
    return INITIAL_TOURS;
  }
}

export async function getTourById(tourId: string): Promise<Tour | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, tourId));
    if (!snap.exists()) return null;
    return enrichTourLocalization({ ...(snap.data() as Tour), id: snap.id });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${tourId}`);
    return null;
  }
}

export async function saveTour(tour: Tour): Promise<void> {
  const id = tour.id?.trim() || `tour-${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, id);
  const now = new Date().toISOString();
  const data = {
    ...tour,
    id,
    updatedAt: now,
    createdAt: tour.createdAt || now,
  };
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

export async function deleteTour(tourId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tourId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${tourId}`);
    throw error;
  }
}

export function subscribeToTours(callback: (tours: Tour[]) => void): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snap) => {
        if (snap.empty) {
          callback(INITIAL_TOURS);
          return;
        }
        const list: Tour[] = [];
        snap.forEach((d) => {
          list.push(enrichTourLocalization({ ...(d.data() as Tour), id: d.id }));
        });
        callback(list.length > 0 ? list : INITIAL_TOURS);
      },
      (error) => {
        console.warn('Tours subscription fallback error, using initial tours:', error);
        callback(INITIAL_TOURS);
      }
    );
  } catch (err) {
    callback(INITIAL_TOURS);
    return () => {};
  }
}
