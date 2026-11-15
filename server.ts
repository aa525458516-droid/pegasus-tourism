import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

interface FirebasePublicConfig {
  projectId?: string;
  firestoreDatabaseId?: string;
}

function loadFirebasePublicConfig(): FirebasePublicConfig {
  try {
    const configPath = path.resolve(currentDir, 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw) as FirebasePublicConfig;
  } catch {
    return {};
  }
}

const firebasePublicConfig = loadFirebasePublicConfig();

interface WhatsAppBookingPayload {
  bookingReference?: unknown;
  customerName?: unknown;
  phone?: unknown;
  email?: unknown;
  serviceType?: unknown;
  origin?: unknown;
  destination?: unknown;
  pickupDate?: unknown;
  pickupTime?: unknown;
  tripType?: unknown;
  passengerCount?: unknown;
  vehicleName?: unknown;
  notes?: unknown;
  priceDisplay?: unknown;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  maxBuckets?: number;
  errorBody: Record<string, unknown>;
}) {
  const buckets = new Map<string, RateLimitBucket>();
  const maxBuckets = options.maxBuckets ?? 5000;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (buckets.size > maxBuckets) {
      for (const [key, entry] of buckets.entries()) {
        if (entry.resetAt <= now) {
          buckets.delete(key);
        }
      }
      if (buckets.size > maxBuckets) {
        buckets.clear();
      }
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const current = buckets.get(clientIp);
    if (!current || current.resetAt <= now) {
      buckets.set(clientIp, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (current.count >= options.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json(options.errorBody);
      return;
    }

    current.count += 1;
    next();
  };
}

// Replay prevention cache so a single bookingReference can trigger at most one WhatsApp alert per window
const dispatchedReferences = new Map<string, number>();
const REFERENCE_DEDUP_WINDOW_MS = 15 * 60 * 1000;

function isRecentlyDispatched(ref: string): boolean {
  const now = Date.now();
  if (dispatchedReferences.size > 2000) {
    for (const [key, expiresAt] of dispatchedReferences.entries()) {
      if (expiresAt <= now) dispatchedReferences.delete(key);
    }
  }
  const existing = dispatchedReferences.get(ref);
  return typeof existing === 'number' && existing > now;
}

function markReferenceDispatched(ref: string): void {
  dispatchedReferences.set(ref, Date.now() + REFERENCE_DEDUP_WINDOW_MS);
}

function stripControlChars(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function sanitizeField(val: unknown, fallback = 'N/A', maxLength = 200): string {
  if (typeof val !== 'string') {
    if (typeof val === 'number' && Number.isFinite(val)) return String(val);
    return fallback;
  }
  const cleaned = stripControlChars(val).replace(/\s+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

function cleanRecipientDigits(input?: string): string {
  const digits = (input || '').replace(/\D/g, '');
  if (!digits) return '201109790984';
  if (digits.startsWith('01') && digits.length === 11) {
    return '2' + digits;
  }
  return digits;
}

const BOOKING_REF_REGEX = /^PEG-(?:TRIP-)?\d{4}-[A-Z0-9]{4,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidatedBookingNotification {
  bookingReference: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  origin: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  tripType: string;
  passengerCount: number;
  vehicleName: string;
  notes: string;
  priceDisplay: string;
}

function validateWhatsAppPayload(raw: unknown): { ok: true; data: ValidatedBookingNotification } | { ok: false; message: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Invalid JSON object payload.' };
  }

  const payload = raw as WhatsAppBookingPayload;
  const bookingReference = sanitizeField(payload.bookingReference, '', 40).toUpperCase();
  const customerName = sanitizeField(payload.customerName, '', 100);
  const phone = sanitizeField(payload.phone, '', 50);
  const email = sanitizeField(payload.email, '', 100).toLowerCase();

  if (!bookingReference || !customerName) {
    return { ok: false, message: 'bookingReference and customerName are required.' };
  }
  if (!BOOKING_REF_REGEX.test(bookingReference)) {
    return { ok: false, message: 'Invalid bookingReference format.' };
  }
  if (customerName.length < 2) {
    return { ok: false, message: 'customerName must be at least 2 characters.' };
  }
  if (!phone || phone.replace(/\D/g, '').length < 5) {
    return { ok: false, message: 'Valid phone number is required.' };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { ok: false, message: 'Valid email address is required.' };
  }

  const rawPassengers = Number(payload.passengerCount);
  const passengerCount = Number.isFinite(rawPassengers) && rawPassengers >= 1 && rawPassengers <= 12
    ? Math.round(rawPassengers)
    : 1;

  return {
    ok: true,
    data: {
      bookingReference,
      customerName,
      phone,
      email,
      serviceType: sanitizeField(payload.serviceType, 'private_transfer', 120),
      origin: sanitizeField(payload.origin, 'N/A', 200),
      destination: sanitizeField(payload.destination, 'N/A', 200),
      pickupDate: sanitizeField(payload.pickupDate, 'N/A', 30),
      pickupTime: sanitizeField(payload.pickupTime, 'N/A', 20),
      tripType: sanitizeField(payload.tripType, 'one_way', 30),
      passengerCount,
      vehicleName: sanitizeField(payload.vehicleName, 'N/A', 80),
      notes: sanitizeField(payload.notes, 'None', 1000),
      priceDisplay: sanitizeField(payload.priceDisplay, '', 60),
    },
  };
}

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function timingSafeHexEquals(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) {
    return false;
  }
  const bufA = Buffer.from(a.toLowerCase(), 'hex');
  const bufB = Buffer.from(b.toLowerCase(), 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function normalizeVerificationPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length >= 8 ? digits.slice(-8) : digits;
}

/**
 * Verifies against Firestore's public /bookingStatus/{bookingReference} record (using only
 * public project config, zero Admin SDK secrets) that the booking genuinely exists, was
 * recently created, is in Pending status, and matches both the salted email and phone hashes.
 */
async function verifyBookingWithFirestore(
  data: ValidatedBookingNotification
): Promise<{ verified: true } | { verified: false; reason: string; unavailable?: boolean }> {
  const projectId = firebasePublicConfig.projectId;
  const databaseId = firebasePublicConfig.firestoreDatabaseId || '(default)';
  if (!projectId) {
    return { verified: false, reason: 'Firebase project configuration not found.', unavailable: true };
  }

  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}/documents/bookingStatus/${encodeURIComponent(data.bookingReference)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 404) {
      return { verified: false, reason: 'Booking reference not found.' };
    }
    if (!res.ok) {
      return { verified: false, reason: `Verification lookup failed (HTTP ${res.status}).`, unavailable: true };
    }

    const doc = (await res.json()) as {
      fields?: Record<string, { stringValue?: string }>;
    };
    const fields = doc?.fields;
    if (!fields) {
      return { verified: false, reason: 'Invalid booking status document.' };
    }

    const storedStatus = fields.status?.stringValue || '';
    const storedEmailHash = fields.verifyEmailHash?.stringValue || '';
    const storedPhoneHash = fields.verifyPhoneHash?.stringValue || '';
    const createdAtIso = fields.createdAt?.stringValue || '';

    if (storedStatus !== 'Pending') {
      return { verified: false, reason: 'Notifications are only sent for newly created Pending bookings.' };
    }

    if (createdAtIso) {
      const createdMs = Date.parse(createdAtIso);
      if (Number.isFinite(createdMs) && Date.now() - createdMs > REFERENCE_DEDUP_WINDOW_MS) {
        return { verified: false, reason: 'Booking notification window has expired.' };
      }
    }

    const expectedEmailHash = sha256Hex(`PEGASUS-VERIFY:${data.bookingReference}:EMAIL:${data.email}`);
    const normalizedPhone = normalizeVerificationPhone(data.phone);
    const expectedPhoneHash = normalizedPhone
      ? sha256Hex(`PEGASUS-VERIFY:${data.bookingReference}:PHONE:${normalizedPhone}`)
      : '';

    if (!timingSafeHexEquals(expectedEmailHash, storedEmailHash) || !timingSafeHexEquals(expectedPhoneHash, storedPhoneHash)) {
      return { verified: false, reason: 'Contact verification mismatch.' };
    }

    return { verified: true };
  } catch {
    return { verified: false, reason: 'Firestore verification temporarily unavailable.', unavailable: true };
  }
}

function formatNewBookingWhatsAppMessage(payload: ValidatedBookingNotification): string {
  const lines = [
    'New Booking Received',
    '',
    `- Booking Reference: ${payload.bookingReference}`,
    `- Customer Name: ${payload.customerName}`,
    `- Phone: ${payload.phone}`,
    `- Email: ${payload.email}`,
    `- Service Type: ${payload.serviceType}`,
    `- Pickup: ${payload.origin}`,
    `- Destination: ${payload.destination}`,
    `- Date: ${payload.pickupDate}`,
    `- Time: ${payload.pickupTime}`,
    `- Trip Type: ${payload.tripType}`,
    `- Passengers: ${payload.passengerCount}`,
    `- Vehicle: ${payload.vehicleName}`,
    `- Notes: ${payload.notes}`,
  ];

  if (payload.priceDisplay) {
    lines.push(`- Price: ${payload.priceDisplay}`);
  }

  return lines.join('\n');
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Baseline security headers compatible with Firebase Auth popups, Leaflet tiles, and Cloud Run SPA
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Content-Security-Policy', "object-src 'none'; base-uri 'self'; form-action 'self';");
    }
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  });

  // Scope tight JSON body limit to API routes
  app.use('/api', express.json({ limit: '32kb' }));
  app.use('/api', (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
      res.status(400).json({
        sent: false,
        status: 'INVALID_PAYLOAD',
        message: 'Malformed JSON body.',
      });
      return;
    }
    next(err);
  });

  const apiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    errorBody: { ok: false, error: 'Too many requests. Please try again shortly.' },
  });

  const whatsappRateLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    errorBody: {
      sent: false,
      status: 'RATE_LIMITED',
      message: 'Too many notification requests. Please try again later.',
    },
  });

  app.use('/api', apiRateLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/notifications/whatsapp-booking', whatsappRateLimiter, async (req, res) => {
    const validation = validateWhatsAppPayload(req.body);
    if (!validation.ok) {
      res.status(400).json({
        sent: false,
        status: 'INVALID_PAYLOAD',
        message: validation.message,
      });
      return;
    }

    const payload = validation.data;

    if (isRecentlyDispatched(payload.bookingReference)) {
      res.status(200).json({
        sent: false,
        status: 'ALREADY_PROCESSED',
        message: 'Notification for this booking reference was already processed.',
      });
      return;
    }

    const verification = await verifyBookingWithFirestore(payload);
    if (!verification.verified) {
      res.status(verification.unavailable ? 503 : 403).json({
        sent: false,
        status: 'BOOKING_NOT_VERIFIED',
        message: verification.reason,
      });
      return;
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
    const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
    const recipient = cleanRecipientDigits(process.env.WHATSAPP_RECIPIENT_NUMBER || '201109790984');
    const messageBody = formatNewBookingWhatsAppMessage(payload);

    const missing: string[] = [];
    if (!accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
    if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');

    if (missing.length > 0) {
      console.info(
        `[WhatsApp Server Hook] Verified Booking ${payload.bookingReference} logged for ${recipient}. Missing env vars for automated Cloud API delivery: ${missing.join(', ')}`
      );
      res.status(200).json({
        sent: false,
        status: 'NEEDS_CREDENTIALS',
        missing,
        recipient,
      });
      return;
    }

    try {
      const endpoint = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: {
            preview_url: false,
            body: messageBody,
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        messages?: Array<{ id?: string }>;
        error?: { message?: string; code?: number };
      };

      if (!response.ok) {
        console.error('[WhatsApp Cloud API Error]', response.status, data?.error?.message || 'Unknown error');
        res.status(200).json({
          sent: false,
          status: 'DELIVERY_FAILED',
          error: data?.error?.message || `HTTP ${response.status}`,
          recipient,
        });
        return;
      }

      markReferenceDispatched(payload.bookingReference);

      res.status(200).json({
        sent: true,
        status: 'SENT',
        messageId: data?.messages?.[0]?.id || null,
        recipient,
      });
    } catch (error) {
      console.error('[WhatsApp Cloud API Network Error]', error);
      res.status(200).json({
        sent: false,
        status: 'DELIVERY_FAILED',
        error: 'Network error communicating with WhatsApp Cloud API',
        recipient,
      });
    }
  });

  app.all('/api/*', (_req, res) => {
    res.status(404).json({ ok: false, error: 'API endpoint not found.' });
  });

  if (isProduction) {
    const distDir = path.resolve(currentDir, 'dist');
    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      app.use('/assets', express.static(assetsDir, { maxAge: '365d', immutable: true }));
    }
    app.use(express.static(distDir, { maxAge: '1h', index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(indexFile);
      } else {
        res.status(503).send('Build output not found. Run npm run build.');
      }
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PEGASUS Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down PEGASUS Server gracefully...`);
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
