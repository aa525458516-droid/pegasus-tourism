import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CompanySettings } from '../types';
import { INITIAL_COMPANY_SETTINGS } from '../data/initialData';

const SETTINGS_DOC = 'settings/company';

export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'company'));
    if (snap.exists()) {
      return snap.data() as CompanySettings;
    }
    return INITIAL_COMPANY_SETTINGS;
  } catch (error) {
    console.warn('Using initial company settings:', error);
    return INITIAL_COMPANY_SETTINGS;
  }
}

export async function saveCompanySettings(settings: CompanySettings): Promise<void> {
  const docRef = doc(db, 'settings', 'company');
  try {
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_DOC);
  }
}
