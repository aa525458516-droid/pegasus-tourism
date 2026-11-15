import { Booking, CustomTripRequest } from '../types';
import { getCompanySettings, getWhatsAppLink } from './settingsService';

/**
 * Play a synthesized luxury two-tone chime via Web Audio API.
 * Guaranteed to work without external audio files or network assets.
 */
export function playBookingChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // First bell tone (D5 ~ 587 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Second bell tone (A5 ~ 880 Hz) - higher harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.18);
    gain2.gain.setValueAtTime(0.4, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

/**
 * Request desktop browser notification permissions.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check if desktop notifications are permitted.
 */
export function isNotificationPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Send a desktop notification to the owner.
 */
export function sendDesktopNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    const notif = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('Desktop notification error:', e);
  }
}

export interface ServerWhatsAppResponse {
  sent: boolean;
  status: 'SENT' | 'NEEDS_CREDENTIALS' | 'DELIVERY_FAILED' | 'INVALID_PAYLOAD' | 'NETWORK_ERROR';
  missing?: string[];
  recipient?: string;
  messageId?: string | null;
  error?: string;
}

/**
 * Triggers the secure server-side endpoint (/api/notifications/whatsapp-booking)
 * so WhatsApp Business API credentials never live in React frontend code.
 * Non-blocking: booking creation still succeeds even if WhatsApp API credentials
 * have not yet been configured on the server.
 */
export async function sendServerWhatsAppBookingNotification(
  booking: Partial<Booking>
): Promise<ServerWhatsAppResponse> {
  try {
    const priceDisplay =
      typeof booking.quotedPrice === 'number' && booking.quotedPrice > 0
        ? `${booking.quotedPrice} ${booking.priceCurrency || 'EUR'}`
        : booking.priceStatus === 'price_on_request'
        ? 'Price on Request'
        : '';

    const response = await fetch('/api/notifications/whatsapp-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        phone: booking.phone,
        email: booking.email,
        serviceType: booking.tourTitle
          ? `${booking.serviceType || 'tour'} (${booking.tourTitle})`
          : booking.serviceType || 'private_transfer',
        origin: booking.origin,
        destination: booking.destination,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        tripType: booking.tripType || 'one_way',
        passengerCount: booking.passengerCount,
        vehicleName: booking.vehicleName || booking.vehicleType,
        notes: booking.notes || '',
        priceDisplay,
      }),
    });

    const data = (await response.json().catch(() => null)) as ServerWhatsAppResponse | null;
    if (data) return data;
    return { sent: false, status: 'NETWORK_ERROR' };
  } catch {
    return { sent: false, status: 'NETWORK_ERROR' };
  }
}

/**
 * Generate a pre-filled direct WhatsApp link for notifying the admin with full booking details.
 */
export function getAdminWhatsAppAlertUrl(booking: Partial<Booking>): string {
  const settings = getCompanySettings();
  const priceLine =
    typeof booking.quotedPrice === 'number' && booking.quotedPrice > 0
      ? `- Price: ${booking.quotedPrice} ${booking.priceCurrency || 'EUR'}\n`
      : booking.priceStatus === 'price_on_request'
      ? `- Price: Price on Request\n`
      : '';
  const flightLine = booking.flightNumber
    ? `- Flight: ${booking.flightNumber}${booking.airline ? ` (${booking.airline})` : ''}${booking.flightTime ? ` • ${booking.flightTime}` : ''}\n`
    : '';

  const text =
    `New Booking Received\n\n` +
    `- Booking Reference: ${booking.bookingReference || 'N/A'}\n` +
    `- Customer Name: ${booking.customerName || 'N/A'}\n` +
    `- Phone: ${booking.phone || 'N/A'}\n` +
    `- Email: ${booking.email || 'N/A'}\n` +
    `- Service Type: ${booking.tourTitle ? `${booking.serviceType || 'tour'} (${booking.tourTitle})` : booking.serviceType || 'N/A'}\n` +
    `- Pickup: ${booking.origin || 'N/A'}\n` +
    `- Destination: ${booking.destination || 'N/A'}\n` +
    `- Date: ${booking.pickupDate || 'N/A'}\n` +
    `- Time: ${booking.pickupTime || 'N/A'}\n` +
    `- Trip Type: ${booking.tripType || 'one_way'}\n` +
    `- Passengers: ${booking.passengerCount || 1}\n` +
    `- Vehicle: ${booking.vehicleName || booking.vehicleType || 'N/A'}\n` +
    flightLine +
    priceLine +
    `- Notes: ${booking.notes || 'None'}`;

  return getWhatsAppLink(settings.whatsapp, text);
}

/**
 * Generate an admin WhatsApp alert link for a custom trip request.
 */
export function getAdminCustomTripWhatsAppAlertUrl(trip: Partial<CustomTripRequest>): string {
  const settings = getCompanySettings();
  const text = 
    `🌟 طلب تنظيم رحلة مخصصة جديد في بيجاسوس!\n\n` +
    `• كود الطلب: ${trip.referenceNumber || 'غير محدد'}\n` +
    `• العميل: ${trip.customerName || 'غير محدد'}\n` +
    `• رقم الهاتف: ${trip.phone || 'غير محدد'}\n` +
    `• البلد: ${trip.country || ''}\n` +
    `• التواريخ: من ${trip.startDate || ''} إلى ${trip.endDate || ''}\n` +
    `• الانطلاق: ${trip.pickup || ''}\n` +
    `• مكان الإقامة: ${trip.accommodation || ''}\n` +
    `• عدد الركاب: ${trip.passengerCount || 1} (الحد الأقصى 4)\n` +
    `• عدد التجارب المختارة: ${trip.experiences?.length || 0}\n` +
    (trip.specialRequests ? `• طلبات خاصة: ${trip.specialRequests}\n` : '') +
    `\nيرجى مراجعة الطلب وتحديد السعر للعميل في لوحة الإدارة.`;

  return getWhatsAppLink(settings.whatsapp, text);
}
