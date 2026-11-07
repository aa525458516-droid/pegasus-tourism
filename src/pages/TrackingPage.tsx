import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { verifyAndGetBooking } from '../services/bookingService';
import { BookingPublicStatus } from '../types';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Car, 
  Users, 
  Luggage,
  MessageCircle,
  Copy,
  Check,
  Plane,
  Compass,
  ArrowRight
} from 'lucide-react';

interface TrackingPageProps {
  initialReference?: string;
  onOpenBooking?: () => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ 
  initialReference = '',
  onOpenBooking 
}) => {
  const { t, language, direction } = useLanguage();

  const [reference, setReference] = useState(initialReference);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingPublicStatus | null>(null);
  const [errorType, setErrorType] = useState<'empty' | 'notFound' | 'verificationFailed' | 'networkError' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialReference) {
      setReference(initialReference.toUpperCase());
    }
  }, [initialReference]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !emailOrPhone.trim()) {
      setErrorType('empty');
      return;
    }

    setLoading(true);
    setErrorType(null);
    setBookingStatus(null);

    try {
      const result = await verifyAndGetBooking(reference.trim(), emailOrPhone.trim());
      if (result.success && result.booking) {
        setBookingStatus(result.booking);
      } else {
        setErrorType(result.error || 'notFound');
      }
    } catch (err) {
      console.error('Tracking verification error:', err);
      setErrorType('networkError');
    } finally {
      setLoading(false);
    }
  };

  const copyReference = () => {
    if (bookingStatus?.bookingReference) {
      navigator.clipboard.writeText(bookingStatus.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return {
          title: language === 'de' ? 'Ihre Buchung wurde bestätigt.' : language === 'ar' ? 'تم تأكيد حجزك بنجاح.' : 'Your booking has been confirmed.',
          description: language === 'de' ? 'Ihr privater Chauffeur ist zugeteilt und wartet am vereinbarten Abholort.' : language === 'ar' ? 'تم تخصيص السائق الخاص بك وسيكون بانتظارك في الوقت المحدد.' : 'Your private chauffeur and luxury vehicle are scheduled and will be awaiting you on time.',
          color: 'emerald',
          badge: 'Confirmed',
          icon: CheckCircle2,
          step: 2,
        };
      case 'Completed':
        return {
          title: language === 'de' ? 'Ihre Buchung wurde abgeschlossen.' : language === 'ar' ? 'تم إكمال حجزك بنجاح.' : 'Your booking has been completed.',
          description: language === 'de' ? 'Diese Fahrt wurde erfolgreich durchgeführt. Wir hoffen, Sie hatten eine angenehme Reise!' : language === 'ar' ? 'تم الانتهاء من هذه الرحلة بنجاح. نتمنى أن تكون قد استمتعت بخدمات بيجاسوس!' : 'This transfer or tour has been completed. Thank you for traveling with PEGASUS Hurghada.',
          color: 'blue',
          badge: 'Completed',
          icon: CheckCircle2,
          step: 3,
        };
      case 'Cancelled':
        return {
          title: language === 'de' ? 'Ihre Buchung wurde storniert.' : language === 'ar' ? 'تم إلغاء حجزك.' : 'Your booking has been cancelled.',
          description: language === 'de' ? 'Diese Buchungsanfrage wurde storniert. Bei Fragen kontaktieren Sie bitte unseren Support.' : language === 'ar' ? 'تم إلغاء طلب الحجز هذا. إذا كان لديك أي استفسار يرجى التواصل مع فريق العمل.' : 'This booking request was cancelled. If you need assistance, please contact our 24/7 dispatch.',
          color: 'rose',
          badge: 'Cancelled',
          icon: XCircle,
          step: 0,
        };
      case 'Pending':
      default:
        return {
          title: language === 'de' ? 'Ihre Buchungsanfrage ist eingegangen und wartet auf Bestätigung.' : language === 'ar' ? 'تم استلام طلب الحجز الخاص بك وهو بانتظار التأكيد.' : 'Your booking request has been received and is awaiting confirmation.',
          description: language === 'de' ? 'Unser Dispatch-Team prüft die Details und wird Ihre Reservierung in Kürze final bestätigen.' : language === 'ar' ? 'يقوم فريق العمل بمراجعة تفاصيل حجزك وسيتم التأكيد النهائي في أقرب وقت.' : 'Our dispatch team in Hurghada is reviewing your details and will assign your private vehicle shortly.',
          color: 'amber',
          badge: 'Pending Confirmation',
          icon: Clock,
          step: 1,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-10 px-4 sm:px-6 lg:px-8" dir={direction}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header Title Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-xs font-semibold mb-4 border border-[#D4AF37]/30 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>PEGASUS Customer Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight mb-3">
            {t('nav.trackBooking')}
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Verify your reservation status, vehicle allocation, and driver notes by entering your booking reference code and associated contact information.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-xl p-6 sm:p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Field 1: Booking Reference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Booking Reference *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder="e.g. PEG-2026-XXXXX"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#D5CDBD] text-slate-900 font-mono font-bold tracking-wider text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 uppercase"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found on your reservation confirmation card or email.
                </p>
              </div>

              {/* Field 2: Email or Phone for Security Verification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Email OR Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. name@example.com or +49 170 1234567"
                    className="w-full px-4 py-3 rounded-xl border border-[#D5CDBD] text-slate-900 text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Must match the contact information used during booking.
                </p>
              </div>
            </div>

            {/* Error Feedback */}
            {errorType && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  {errorType === 'empty' && (
                    <p className="font-semibold">
                      Please enter both your Booking Reference and the Email or Phone used when booking.
                    </p>
                  )}
                  {errorType === 'notFound' && (
                    <>
                      <p className="font-semibold">
                        No reservation was found matching reference <span className="font-mono underline">{reference}</span>.
                      </p>
                      <p className="text-xs text-rose-700 mt-0.5">
                        Please verify your code format (e.g. PEG-2026-XXXXX) or contact PEGASUS dispatch for live assistance.
                      </p>
                    </>
                  )}
                  {errorType === 'verificationFailed' && (
                    <>
                      <p className="font-semibold">
                        Verification failed: The email or phone number entered does not match this booking reference.
                      </p>
                      <p className="text-xs text-rose-700 mt-0.5">
                        For customer privacy protection, reservation details can only be revealed when matching credentials are provided.
                      </p>
                    </>
                  )}
                  {errorType === 'networkError' && (
                    <p className="font-semibold">
                      Network or connection error. Please check your internet connection and try again.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Trust Privacy Protocol: Customer contact details are never exposed to unauthenticated queries.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] hover:brightness-110 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Track Booking</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Skeleton during verification */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-xl p-6 sm:p-8 animate-pulse space-y-6">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                <div className="h-8 w-48 bg-slate-300 rounded"></div>
              </div>
              <div className="h-7 w-32 bg-amber-100 rounded-full"></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9]">
              <div className="space-y-2"><div className="h-2.5 w-16 bg-slate-200 rounded"></div><div className="h-4 w-28 bg-slate-300 rounded"></div></div>
              <div className="space-y-2"><div className="h-2.5 w-20 bg-slate-200 rounded"></div><div className="h-4 w-32 bg-slate-300 rounded"></div></div>
              <div className="space-y-2"><div className="h-2.5 w-16 bg-slate-200 rounded"></div><div className="h-4 w-28 bg-slate-300 rounded"></div></div>
              <div className="sm:col-span-2 space-y-2"><div className="h-2.5 w-24 bg-slate-200 rounded"></div><div className="h-4 w-52 bg-slate-300 rounded"></div></div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#0D1B2A] font-semibold">
              <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying booking credentials with secure zero-knowledge matching...</span>
            </div>
          </div>
        )}

        {/* Verified Result Card */}
        {bookingStatus && (() => {
          const statusInfo = getStatusDisplay(bookingStatus.status);
          const StatusIcon = statusInfo.icon;
          const waText = encodeURIComponent(
            `Hello PEGASUS Hurghada Dispatch, I am following up on booking reference ${bookingStatus.bookingReference}. Status: ${bookingStatus.status}.`
          );

          return (
            <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
              
              {/* Reference & Badge Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Booking Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0D1B2A] tracking-wider">
                      {bookingStatus.bookingReference}
                    </span>
                    <button
                      type="button"
                      onClick={copyReference}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      title="Copy Reference"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                    bookingStatus.status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : bookingStatus.status === 'Completed'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : bookingStatus.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusInfo.badge}</span>
                  </span>
                </div>
              </div>

              {/* Status Message Highlight Box */}
              <div className={`my-6 p-4 rounded-xl border flex items-start gap-3.5 ${
                bookingStatus.status === 'Confirmed'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : bookingStatus.status === 'Completed'
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : bookingStatus.status === 'Cancelled'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <StatusIcon className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base mb-1">
                    {statusInfo.title}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {statusInfo.description}
                  </p>
                </div>
              </div>

              {/* Progress Flow Steps */}
              {bookingStatus.status !== 'Cancelled' && (
                <div className="mb-8 px-2">
                  <div className="grid grid-cols-3 gap-2 relative">
                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        statusInfo.step >= 1 ? 'bg-[#0D1B2A] text-[#D4AF37]' : 'bg-slate-100 text-slate-400'
                      }`}>
                        1
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block">Received</span>
                      <span className="text-[9px] text-slate-400">Request pending</span>
                    </div>

                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        statusInfo.step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        2
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block">Confirmed</span>
                      <span className="text-[9px] text-slate-400">Chauffeur assigned</span>
                    </div>

                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        statusInfo.step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        3
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block">Completed</span>
                      <span className="text-[9px] text-slate-400">Trip finalized</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reservation Details Grid */}
              <div className="bg-[#FBF9F5] rounded-xl border border-[#EAE4D9] p-5 mb-6">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-3 pb-2 border-b border-[#EAE4D9] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#D4AF37]" />
                  <span>Verified Reservation Details</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Customer</span>
                    <span className="font-semibold text-slate-900 text-sm">{bookingStatus.maskedCustomerName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Pickup Date & Time</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {bookingStatus.pickupDate} {bookingStatus.pickupTime ? `at ${bookingStatus.pickupTime}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Service Type</span>
                    <span className="font-semibold text-slate-900 text-sm capitalize">
                      {bookingStatus.tourTitle ? `Tour: ${bookingStatus.tourTitle}` : (bookingStatus.serviceType || 'Airport Transfer').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Route & Locations</span>
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{bookingStatus.origin} ➔ {bookingStatus.destination}</span>
                    </div>

                    {/* Coordinates & Google Maps links if structured locations present */}
                    {(bookingStatus.pickupLocation?.latitude || bookingStatus.destinationLocation?.latitude) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        {bookingStatus.pickupLocation?.latitude && bookingStatus.pickupLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.pickupLocation.latitude},${bookingStatus.pickupLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#D4AF37] text-[#0D1B2A] hover:bg-[#F8F5EE] transition font-medium"
                          >
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span>Pickup on Map</span>
                          </a>
                        )}

                        {bookingStatus.destinationLocation?.latitude && bookingStatus.destinationLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.destinationLocation.latitude},${bookingStatus.destinationLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#D4AF37] text-[#0D1B2A] hover:bg-[#F8F5EE] transition font-medium"
                          >
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span>Destination on Map</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Vehicle Choice</span>
                    <span className="font-semibold text-slate-900 text-sm capitalize">
                      {bookingStatus.vehicleType.replace('_', ' ')}
                    </span>
                    {bookingStatus.tripType && (
                      <span className="text-[11px] text-[#D4AF37] block capitalize font-medium mt-0.5">
                        {bookingStatus.tripType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {bookingStatus.passengerCount !== undefined && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Passengers</span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {bookingStatus.passengerCount} Persons
                      </span>
                    </div>
                  )}

                  {bookingStatus.updatedAt && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Last Status Update</span>
                      <span className="font-mono text-slate-600">
                        {new Date(bookingStatus.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dispatch / Driver Note */}
                {bookingStatus.adminNotes && (
                  <div className="mt-4 pt-3 border-t border-[#EAE4D9] text-xs">
                    <span className="font-bold text-[#0D1B2A] block mb-1">
                      Dispatch & Chauffeur Notice:
                    </span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-[#D5CDBD]">
                      {bookingStatus.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingStatus(null);
                    setReference('');
                    setEmailOrPhone('');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Track Another Booking
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/201000000000?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp Dispatch</span>
                  </a>

                  {onOpenBooking && (
                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-semibold text-xs hover:brightness-110 transition cursor-pointer"
                    >
                      <span>New Booking</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
};
