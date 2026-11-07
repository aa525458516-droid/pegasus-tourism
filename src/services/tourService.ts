import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tour } from '../types';
import { INITIAL_TOURS } from '../data/initialData';

const COLLECTION_NAME = 'tours';

export async function getTours(): Promise<Tour[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      return INITIAL_TOURS;
    }
    const list: Tour[] = [];
    snap.forEach((d) => {
      list.push({ ...(d.data() as Tour), id: d.id });
    });
    return list;
  } catch (error) {
    console.warn('Failed to load tours from Firestore, returning initial tours:', error);
    return INITIAL_TOURS;
  }
}

export async function saveTour(tour: Tour): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tour.id);
  const now = new Date().toISOString();
  const data = {
    ...tour,
    updatedAt: now,
    createdAt: tour.createdAt || now,
  };
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${tour.id}`);
  }
}

export async function deleteTour(tourId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tourId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${tourId}`);
  }
}

export async function seedInitialTours(): Promise<void> {
  for (const tour of INITIAL_TOURS) {
    await saveTour(tour);
  }
}

export function subscribeToTours(callback: (tours: Tour[]) => void) {
  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snap) => {
      if (snap.empty) {
        callback(INITIAL_TOURS);
      } else {
        const list: Tour[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as Tour), id: d.id });
        });
        callback(list);
      }
    },
    (err) => {
      console.warn('Tours subscription notice:', err);
      callback(INITIAL_TOURS);
    }
  );
}
