import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdminEmailRecord } from '../types';

export const BOOTSTRAP_ADMIN_EMAIL = 'aa525458516@gmail.com';
const ADMIN_EMAILS_COLLECTION = 'adminEmails';
const ADMINS_UID_COLLECTION = 'admins';

export function isBootstrapAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
}

/**
 * Checks if a user is an authorized admin:
 * 1. Must have email_verified === true
 * 2. Must match the bootstrap owner email OR exist in /adminEmails/{email} OR exist in /admins/{uid}
 */
export async function verifyUserIsAdmin(email?: string | null, uid?: string | null, emailVerified?: boolean): Promise<boolean> {
  if (!email || !emailVerified) {
    return false;
  }
  const normalized = email.trim().toLowerCase();

  // Bootstrap owner is always admin if email is verified
  if (normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  try {
    // Check adminEmails collection
    const emailDoc = await getDoc(doc(db, ADMIN_EMAILS_COLLECTION, normalized));
    if (emailDoc.exists()) {
      return true;
    }

    // Check legacy admins UID collection
    if (uid) {
      const uidDoc = await getDoc(doc(db, ADMINS_UID_COLLECTION, uid));
      if (uidDoc.exists()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('Admin check error:', error);
    return false;
  }
}

export function subscribeToAdminEmails(callback: (emails: AdminEmailRecord[]) => void): () => void {
  return onSnapshot(
    collection(db, ADMIN_EMAILS_COLLECTION),
    (snap) => {
      const list: AdminEmailRecord[] = [];
      snap.forEach((d) => {
        const data = d.data() as Partial<AdminEmailRecord>;
        list.push({
          email: d.id,
          addedAt: data.addedAt || new Date().toISOString(),
          addedBy: data.addedBy,
        });
      });
      if (!list.some((item) => item.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase())) {
        list.unshift({
          email: BOOTSTRAP_ADMIN_EMAIL,
          addedAt: 'System Bootstrap',
          addedBy: 'Owner (Protected)',
        });
      }
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ADMIN_EMAILS_COLLECTION);
      callback([
        {
          email: BOOTSTRAP_ADMIN_EMAIL,
          addedAt: 'System Bootstrap',
          addedBy: 'Owner (Protected)',
        }
      ]);
    }
  );
}

export async function getAdminEmails(): Promise<AdminEmailRecord[]> {
  try {
    const snap = await getDocs(collection(db, ADMIN_EMAILS_COLLECTION));
    const list: AdminEmailRecord[] = [];
    snap.forEach((d) => {
      const data = d.data() as Partial<AdminEmailRecord>;
      list.push({
        email: d.id,
        addedAt: data.addedAt || new Date().toISOString(),
        addedBy: data.addedBy,
      });
    });

    // Ensure bootstrap email is visible in the list as owner
    if (!list.some((item) => item.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase())) {
      list.unshift({
        email: BOOTSTRAP_ADMIN_EMAIL,
        addedAt: 'System Bootstrap',
        addedBy: 'Owner (Protected)',
      });
    }

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ADMIN_EMAILS_COLLECTION);
    return [
      {
        email: BOOTSTRAP_ADMIN_EMAIL,
        addedAt: 'System Bootstrap',
        addedBy: 'Owner (Protected)',
      }
    ];
  }
}

export async function addAdminEmail(email: string, addedBy?: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    throw new Error('Invalid email address');
  }

  const docRef = doc(db, ADMIN_EMAILS_COLLECTION, normalized);
  try {
    await setDoc(docRef, {
      email: normalized,
      addedAt: new Date().toISOString(),
      addedBy: addedBy || 'Admin',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMIN_EMAILS_COLLECTION}/${normalized}`);
    throw error;
  }
}

export async function removeAdminEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('The primary bootstrap owner email cannot be removed.');
  }

  const docRef = doc(db, ADMIN_EMAILS_COLLECTION, normalized);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ADMIN_EMAILS_COLLECTION}/${normalized}`);
    throw error;
  }
}
