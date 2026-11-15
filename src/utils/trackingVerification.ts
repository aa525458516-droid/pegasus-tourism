/**
 * Salted SHA-256 verification helpers for customer booking / custom trip lookups.
 * Uses the unguessable reference code as a per-booking salt so hashes cannot be
 * correlated across bookings or cracked with generic rainbow tables.
 */

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeVerificationPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length >= 8 ? digits.slice(-8) : digits;
}

export async function computeVerifyEmailHash(reference: string, email: string): Promise<string> {
  const cleanRef = (reference || '').trim().toUpperCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanRef || !cleanEmail) return '';
  return sha256Hex(`PEGASUS-VERIFY:${cleanRef}:EMAIL:${cleanEmail}`);
}

export async function computeVerifyPhoneHash(reference: string, phone: string): Promise<string> {
  const cleanRef = (reference || '').trim().toUpperCase();
  const normalizedDigits = normalizeVerificationPhone(phone);
  if (!cleanRef || !normalizedDigits) return '';
  return sha256Hex(`PEGASUS-VERIFY:${cleanRef}:PHONE:${normalizedDigits}`);
}

export async function verifyTrackingContact(
  reference: string,
  contactInput: string,
  storedEmailHash?: string,
  storedPhoneHash?: string
): Promise<boolean> {
  const trimmed = (contactInput || '').trim();
  if (!trimmed) return false;
  if (!storedEmailHash && !storedPhoneHash) return false;

  if (storedEmailHash) {
    const candidateEmailHash = await computeVerifyEmailHash(reference, trimmed);
    if (candidateEmailHash && candidateEmailHash === storedEmailHash) {
      return true;
    }
  }

  if (storedPhoneHash && trimmed.replace(/\D/g, '').length >= 5) {
    const candidatePhoneHash = await computeVerifyPhoneHash(reference, trimmed);
    if (candidatePhoneHash && candidatePhoneHash === storedPhoneHash) {
      return true;
    }
  }

  return false;
}
