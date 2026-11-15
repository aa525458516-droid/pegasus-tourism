import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CompanySettings,
  Language,
  SocialMediaLinks,
  TransferPriceRule,
  TripType,
  VehicleOption,
} from '../types';
import { INITIAL_COMPANY_SETTINGS, INITIAL_VEHICLES } from '../data/initialData';

const SETTINGS_DOC = 'settings/company';
const VEHICLES_DOC = 'settings/vehicles';
const TRANSFER_PRICING_DOC = 'settings/transferPricing';

export const DEFAULT_WHATSAPP_NUMBER = '201109790984';
export const DEFAULT_PHONE_NUMBER = '01109790984';
export const DEFAULT_EMAIL = 'pegasusx2207@gmail.com';
const LEGACY_HIDDEN_ADMIN_EMAIL = 'aa525458516@gmail.com';

export const COMPANY_SOCIAL_LINKS: SocialMediaLinks = {
  instagramHandle: 'pegasus_eg2',
  instagramUrl: 'https://www.instagram.com/pegasus_eg2/',
  tiktokHandle: 'pegasus_eg2',
  tiktokUrl: 'https://www.tiktok.com/@pegasus_eg2',
};

function sanitizePublicCompanyEmail(rawEmail?: string): string {
  const trimmed = (rawEmail || '').trim();
  if (!trimmed || trimmed.toLowerCase() === LEGACY_HIDDEN_ADMIN_EMAIL) {
    return DEFAULT_EMAIL;
  }
  return trimmed;
}

function mergeCompanySettings(data: Partial<CompanySettings>): CompanySettings {
  return {
    companyName: data.companyName || INITIAL_COMPANY_SETTINGS.companyName,
    phone: data.phone || INITIAL_COMPANY_SETTINGS.phone,
    whatsapp: data.whatsapp || INITIAL_COMPANY_SETTINGS.whatsapp,
    email: sanitizePublicCompanyEmail(data.email),
    address: data.address || '',
    emergencyPhone: data.emergencyPhone || '',
    officeHours: data.officeHours || '',
    licenseNumber: data.licenseNumber || '',
    socialMedia: {
      instagramHandle: data.socialMedia?.instagramHandle || COMPANY_SOCIAL_LINKS.instagramHandle,
      instagramUrl: data.socialMedia?.instagramUrl || COMPANY_SOCIAL_LINKS.instagramUrl,
      tiktokHandle: data.socialMedia?.tiktokHandle || COMPANY_SOCIAL_LINKS.tiktokHandle,
      tiktokUrl: data.socialMedia?.tiktokUrl || COMPANY_SOCIAL_LINKS.tiktokUrl,
    },
    policies: data.policies || {},
    updatedAt: data.updatedAt,
  };
}

function mergeRequiredVehicles(options: VehicleOption[]): VehicleOption[] {
  const rawList = Array.isArray(options) ? [...options] : [...INITIAL_VEHICLES];
  const list = rawList.map((veh) => {
    const baseMatch = INITIAL_VEHICLES.find((b) => b.id === veh.id);
    if (!baseMatch) return veh;
    return {
      ...veh,
      imageUrl: veh.imageUrl === undefined && baseMatch.imageUrl ? baseMatch.imageUrl : veh.imageUrl,
      nameDe: veh.nameDe || baseMatch.nameDe,
      nameAr: veh.nameAr || baseMatch.nameAr,
      nameRu: veh.nameRu ?? baseMatch.nameRu,
      description: veh.description || baseMatch.description,
      descriptionDe: veh.descriptionDe || baseMatch.descriptionDe,
      descriptionAr: veh.descriptionAr || baseMatch.descriptionAr,
      descriptionRu: veh.descriptionRu ?? baseMatch.descriptionRu,
      capacityPassengers: veh.capacityPassengers ?? baseMatch.capacityPassengers,
      capacityLuggage: veh.capacityLuggage ?? baseMatch.capacityLuggage,
      features: Array.isArray(veh.features) && veh.features.length > 0 ? veh.features : baseMatch.features,
    };
  });
  for (const baseVeh of INITIAL_VEHICLES) {
    if (!list.some((v) => v.id === baseVeh.id)) {
      list.push(baseVeh);
    }
  }
  return list;
}

// In-memory reactive cache
let cachedCompanySettings: CompanySettings = { ...INITIAL_COMPANY_SETTINGS };
let cachedVehicleOptions: VehicleOption[] = [...INITIAL_VEHICLES];
let cachedTransferPricingRules: TransferPriceRule[] = [];

// Automatically keep memory cache synced with Firestore
try {
  onSnapshot(doc(db, 'settings', 'company'), (snap) => {
    if (snap.exists()) {
      cachedCompanySettings = mergeCompanySettings(snap.data() as Partial<CompanySettings>);
    }
  });

  onSnapshot(doc(db, 'settings', 'vehicles'), (snap) => {
    if (snap.exists() && Array.isArray(snap.data()?.options)) {
      cachedVehicleOptions = mergeRequiredVehicles(snap.data().options as VehicleOption[]);
    }
  });

  onSnapshot(doc(db, 'settings', 'transferPricing'), (snap) => {
    if (snap.exists() && Array.isArray(snap.data()?.rules)) {
      cachedTransferPricingRules = snap.data().rules as TransferPriceRule[];
    }
  });
} catch {
  // Safe initialization fallback
}

/**
 * Normalizes phone/WhatsApp digits to international format without + or dashes.
 * Defaults to 201109790984.
 */
export function cleanWhatsAppNumber(input?: string): string {
  if (!input) return DEFAULT_WHATSAPP_NUMBER;
  const digits = input.replace(/\D/g, '');
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;
  if (digits.startsWith('01') && digits.length === 11) {
    return '2' + digits;
  }
  return digits;
}

/**
 * Shared single helper for all WhatsApp links across the entire app.
 */
export function getWhatsAppLink(customNumber?: string, message?: string): string {
  const number = cleanWhatsAppNumber(customNumber);
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${textParam}`;
}

export function getCompanySettings(): CompanySettings {
  return cachedCompanySettings;
}

export async function getCompanySettingsAsync(): Promise<CompanySettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'company'));
    if (snap.exists()) {
      cachedCompanySettings = mergeCompanySettings(snap.data() as Partial<CompanySettings>);
      return cachedCompanySettings;
    }
    return INITIAL_COMPANY_SETTINGS;
  } catch (error) {
    console.warn('Using fallback company settings:', error);
    return INITIAL_COMPANY_SETTINGS;
  }
}

export function subscribeToCompanySettings(callback: (settings: CompanySettings) => void): () => void {
  try {
    const docRef = doc(db, 'settings', 'company');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const updated = mergeCompanySettings(snap.data() as Partial<CompanySettings>);
          cachedCompanySettings = updated;
          callback(updated);
        } else {
          callback(INITIAL_COMPANY_SETTINGS);
        }
      },
      (error) => {
        console.warn('Settings subscription fallback:', error);
        callback(cachedCompanySettings);
      }
    );
  } catch {
    callback(cachedCompanySettings);
    return () => {};
  }
}

export async function saveCompanySettings(settings: CompanySettings): Promise<void> {
  const docRef = doc(db, 'settings', 'company');
  const sanitized = mergeCompanySettings(settings);
  try {
    await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    cachedCompanySettings = { ...sanitized };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_DOC);
    throw error;
  }
}

export function getVehicleOptions(): VehicleOption[] {
  return cachedVehicleOptions;
}

export async function getVehicleOptionsAsync(): Promise<VehicleOption[]> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'vehicles'));
    if (snap.exists() && Array.isArray(snap.data()?.options)) {
      cachedVehicleOptions = mergeRequiredVehicles(snap.data().options as VehicleOption[]);
      return cachedVehicleOptions;
    }
    return INITIAL_VEHICLES;
  } catch (error) {
    console.warn('Using initial vehicle options:', error);
    return INITIAL_VEHICLES;
  }
}

export function subscribeToVehicleOptions(callback: (vehicles: VehicleOption[]) => void): () => void {
  try {
    const docRef = doc(db, 'settings', 'vehicles');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.options)) {
          const merged = mergeRequiredVehicles(snap.data().options as VehicleOption[]);
          cachedVehicleOptions = merged;
          callback(merged);
        } else {
          callback(INITIAL_VEHICLES);
        }
      },
      () => {
        callback(cachedVehicleOptions);
      }
    );
  } catch {
    callback(cachedVehicleOptions);
    return () => {};
  }
}

export async function saveVehicleOptions(options: VehicleOption[]): Promise<void> {
  const docRef = doc(db, 'settings', 'vehicles');
  try {
    await setDoc(docRef, { options, updatedAt: new Date().toISOString() }, { merge: true });
    cachedVehicleOptions = [...options];
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VEHICLES_DOC);
    throw error;
  }
}

export function resolveVehicleDisplayName(
  vehicleIdOrName?: string,
  vehiclesList: VehicleOption[] = cachedVehicleOptions,
  language: Language = 'en'
): string {
  if (!vehicleIdOrName) return 'Standard Vehicle';
  const match = vehiclesList.find(
    (v) => v.id === vehicleIdOrName || v.name.toLowerCase() === vehicleIdOrName.toLowerCase()
  );
  if (match) {
    if (language === 'ar' && match.nameAr) return match.nameAr;
    if (language === 'de' && match.nameDe) return match.nameDe;
    if (language === 'ru' && match.nameRu) return match.nameRu;
    return match.name;
  }
  return vehicleIdOrName.replace(/_/g, ' ');
}

// ============================================================================
// Vehicle-Based Transfer Pricing (Route + Vehicle + Trip Type)
// ============================================================================

export function getTransferPricingRules(): TransferPriceRule[] {
  return cachedTransferPricingRules;
}

export async function getTransferPricingRulesAsync(): Promise<TransferPriceRule[]> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'transferPricing'));
    if (snap.exists() && Array.isArray(snap.data()?.rules)) {
      cachedTransferPricingRules = snap.data().rules as TransferPriceRule[];
      return cachedTransferPricingRules;
    }
    return [];
  } catch {
    return [];
  }
}

export function subscribeToTransferPricingRules(
  callback: (rules: TransferPriceRule[]) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'transferPricing');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.rules)) {
          const rules = snap.data().rules as TransferPriceRule[];
          cachedTransferPricingRules = rules;
          callback(rules);
        } else {
          callback([]);
        }
      },
      () => {
        callback(cachedTransferPricingRules);
      }
    );
  } catch {
    callback(cachedTransferPricingRules);
    return () => {};
  }
}

export async function saveTransferPricingRules(rules: TransferPriceRule[]): Promise<void> {
  const docRef = doc(db, 'settings', 'transferPricing');
  try {
    await setDoc(docRef, { rules, updatedAt: new Date().toISOString() }, { merge: true });
    cachedTransferPricingRules = [...rules];
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, TRANSFER_PRICING_DOC);
    throw error;
  }
}

function normalizePlaceName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[\/\-–—_,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function placesMatch(rulePlace: string, bookingPlace: string): boolean {
  const aRaw = rulePlace.trim().toLowerCase();
  const bRaw = bookingPlace.trim().toLowerCase();
  if (!aRaw || !bRaw) return false;
  if (aRaw === bRaw) return true;

  const a = normalizePlaceName(rulePlace);
  const b = normalizePlaceName(bookingPlace);
  if (!a || !b) return false;
  if (a === b) return true;

  // Airport alias normalization for Hurghada (HRG)
  const isAHrg = a.includes('hurghada') && a.includes('airport');
  const isBHrg = b.includes('hurghada') && b.includes('airport');
  if (isAHrg && isBHrg) return true;

  return false;
}

export interface ResolvedTransferPrice {
  matchedRule: TransferPriceRule | null;
  amount: number | null;
  currency: string | null;
  isPriceOnRequest: boolean;
}

export function resolveTransferPrice(
  origin: string,
  destination: string,
  vehicleId: string,
  tripType: TripType,
  rules: TransferPriceRule[] = cachedTransferPricingRules
): ResolvedTransferPrice {
  const activeRules = rules.filter((r) => r.active !== false && r.vehicleId === vehicleId);
  const matchedRule =
    activeRules.find(
      (r) => placesMatch(r.origin, origin) && placesMatch(r.destination, destination)
    ) || null;

  if (!matchedRule) {
    return {
      matchedRule: null,
      amount: null,
      currency: null,
      isPriceOnRequest: true,
    };
  }

  const rawPrice =
    tripType === 'round_trip' ? matchedRule.roundTripPrice : matchedRule.oneWayPrice;

  if (typeof rawPrice === 'number' && Number.isFinite(rawPrice) && rawPrice > 0) {
    return {
      matchedRule,
      amount: rawPrice,
      currency: matchedRule.currency || 'EUR',
      isPriceOnRequest: false,
    };
  }

  return {
    matchedRule,
    amount: null,
    currency: null,
    isPriceOnRequest: true,
  };
}
