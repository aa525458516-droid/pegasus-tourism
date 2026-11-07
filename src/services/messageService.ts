import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ContactMessage } from '../types';

const COLLECTION_NAME = 'contactMessages';

export async function sendContactMessage(msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<ContactMessage> {
  const docRef = doc(collection(db, COLLECTION_NAME));
  const now = new Date().toISOString();
  const cleanMessage: Record<string, any> = {
    id: docRef.id,
    name: msg.name.trim(),
    email: msg.email.trim(),
    message: msg.message.trim(),
    status: 'unread',
    createdAt: now,
  };

  if (msg.phone && msg.phone.trim()) {
    cleanMessage.phone = msg.phone.trim();
  }
  if (msg.subject && msg.subject.trim()) {
    cleanMessage.subject = msg.subject.trim();
  }

  try {
    await setDoc(docRef, cleanMessage);
    return cleanMessage as ContactMessage;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export function subscribeToMessages(callback: (messages: ContactMessage[]) => void, onError?: (err: unknown) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: ContactMessage[] = [];
      snap.forEach((d) => {
        list.push({ ...(d.data() as ContactMessage), id: d.id });
      });
      callback(list);
    },
    (err) => {
      console.warn('Messages subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export async function updateMessageStatus(messageId: string, status: 'unread' | 'read' | 'replied'): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, messageId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${messageId}`);
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, messageId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${messageId}`);
  }
}
