import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { DestinationItem } from '../types';
import { INITIAL_DESTINATIONS } from '../data/initialData';

const COLLECTION_NAME = 'destinations';

function cleanLegacyDestinationText(text?: string): string | undefined {
  if (!text) return text;
  if (!/carolin/i.test(text)) return text;
  return text
    .replace(/Orange Bay\s*\(\s*Carolin(?:\s+Island)?\s*\)/gi, 'Orange Bay & Giftun-Insel')
    .replace(/\s*\(?\s*Carolin(?:\s+Island)?\s*\)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function enrichDestinationLocalization(dest: DestinationItem): DestinationItem {
  const base = INITIAL_DESTINATIONS.find((d) => d.id === dest.id);
  return {
    ...dest,
    name: cleanLegacyDestinationText(dest.name) ?? dest.name,
    nameDe: /carolin/i.test(dest.nameDe || '')
      ? (base?.nameDe || cleanLegacyDestinationText(dest.nameDe) || dest.nameDe)
      : dest.nameDe,
    descriptionDe: cleanLegacyDestinationText(dest.descriptionDe) ?? dest.descriptionDe,
    nameRu: dest.nameRu ?? base?.nameRu,
    descriptionRu: dest.descriptionRu ?? base?.descriptionRu,
  };
}

let cachedDestinations: DestinationItem[] = [...INITIAL_DESTINATIONS];

// Auto-sync memory cache
try {
  const q = query(collection(db, COLLECTION_NAME));
  onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const list: DestinationItem[] = [];
      snap.forEach((d) => {
        list.push(enrichDestinationLocalization({ ...d.data(), id: d.id } as DestinationItem));
      });
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      cachedDestinations = list;
    }
  });
} catch (e) {
  // safe fallback
}

export function getCachedDestinations(): DestinationItem[] {
  return cachedDestinations;
}

export function subscribeToDestinations(callback: (destinations: DestinationItem[]) => void): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const list: DestinationItem[] = [];
          snap.forEach((d) => {
            list.push(enrichDestinationLocalization({ ...d.data(), id: d.id } as DestinationItem));
          });
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          cachedDestinations = list;
          callback(list);
        } else {
          callback(INITIAL_DESTINATIONS);
        }
      },
      (error) => {
        console.warn('Destinations subscription fallback:', error);
        callback(INITIAL_DESTINATIONS);
      }
    );
  } catch (err) {
    callback(INITIAL_DESTINATIONS);
    return () => {};
  }
}

export async function saveDestination(destination: DestinationItem): Promise<void> {
  const id = destination.id || `dest_${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const payload = { ...destination, id };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

export async function deleteDestination(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}
