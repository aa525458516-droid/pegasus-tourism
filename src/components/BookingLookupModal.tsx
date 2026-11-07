import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { verifyAndGetBooking } from '../services/bookingService';
import { BookingPublicStatus } from '../types';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Car, 
  Users, 
  MessageCircle,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({ 
  isOpen, 
  onClose,
  initialReference = ''
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
  }, [initialReference, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
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
      console.error(err);
      setErrorType('networkError');
    } finally {
      setLoading(false);
    }
  };

  const copyRef = () => {
    if (bookingStatus?.bookingReference) {
      navigator.clipboard.writeText(bookingStatus.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED / BESTÄTIGT</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>COMPLETED / ABGESCHLOSSEN</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>CANCELLED / STORNIERT</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING / AUSSTEHEND</span>
          </span>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return language === 'de' ? 'Ihre Buchung wurde bestätigt.' : language === 'ar' ? 'تم تأكيد حجزك بنجاح.' : 'Your booking has been confirmed.';
      case 'Completed':
        return language === 'de' ? 'Ihre Buchung wurde abgeschlossen.' : language === 'ar' ? 'تم إكمال حجزك بنجاح.' : 'Your booking has been completed.';
      case 'Cancelled':
        return language === 'de' ? 'Ihre Buchung wurde storniert.' : language === 'ar' ? 'تم إلغاء حجزك.' : 'Your booking has been cancelled.';
      case 'Pending':
      default:
        return language === 'de' ? 'Ihre Buchungsanfrage ist eingegangen und wartet auf Bestätigung.' : language === 'ar' ? 'تم استلام طلب الحجز الخاص بك وهو بانتظار التأكيد.' : 'Your booking request has been received and is awaiting confirmation.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#FBF9F5] rounded-2xl shadow-2xl border border-[#EAE4D9] overflow-hidden max-h-[90vh] flex flex-col"
        dir={direction}
      >
        {/* Header */}
        <div className="bg-[#0D1B2A] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-[#FBF9F5]">
                {t('track.title')}
              </h3>
              <p className="text-xs text-slate-300">
                Enter your reference code and contact detail to verify status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSearch} className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Booking Reference *
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. PEG-2026-XXXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDBD] bg-white text-slate-800 focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 font-mono text-sm tracking-wider uppercase"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email OR Phone Number used during booking *
              </label>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. alex@example.com or +49 170 1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDBD] bg-white text-slate-800 focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-semibold text-sm hover:brightness-110 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Verify & Check Status'}
            </button>
          </form>

          {errorType && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                {errorType === 'empty' && (
                  <p className="font-semibold">Please enter both your Booking Reference and Email/Phone.</p>
                )}
                {errorType === 'notFound' && (
                  <p className="font-semibold">No booking found matching reference <span className="font-mono">{reference}</span>.</p>
                )}
                {errorType === 'verificationFailed' && (
                  <p className="font-semibold">Verification failed: The email or phone number entered does not match this booking reference.</p>
                )}
                {errorType === 'networkError' && (
                  <p className="font-semibold">Connection error. Please check your network and try again.</p>
                )}
              </div>
            </div>
          )}

          {bookingStatus && (
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 shadow-xs animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    {t('success.ref')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-mono font-bold text-[#0D1B2A] tracking-wider">
                      {bookingStatus.bookingReference}
                    </span>
                    <button
                      type="button"
                      onClick={copyRef}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>{getStatusBadge(bookingStatus.status)}</div>
              </div>

              {/* Status Notice */}
              <div className={`my-3 p-3 rounded-lg border text-xs font-semibold ${
                bookingStatus.status === 'Confirmed'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : bookingStatus.status === 'Completed'
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : bookingStatus.status === 'Cancelled'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {getStatusMessage(bookingStatus.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Passenger</span>
                    <span className="font-medium text-slate-900">{bookingStatus.maskedCustomerName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.date')}</span>
                    <span className="font-medium text-slate-900">{bookingStatus.pickupDate} {bookingStatus.pickupTime ? `(${bookingStatus.pickupTime})` : ''}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Car className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.vehicleChoice')}</span>
                    <span className="font-medium text-slate-900 capitalize">{bookingStatus.vehicleType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">Service</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {bookingStatus.tourTitle || (bookingStatus.serviceType || 'Airport Transfer').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.origin')} ➔ {t('booking.destination')}</span>
                    <span className="font-medium text-slate-900">{bookingStatus.origin} ➔ {bookingStatus.destination}</span>
                    {(bookingStatus.pickupLocation?.latitude || bookingStatus.destinationLocation?.latitude) && (
                      <div className="mt-1 flex items-center gap-2">
                        {bookingStatus.pickupLocation?.latitude && bookingStatus.pickupLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.pickupLocation.latitude},${bookingStatus.pickupLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#D4AF37] hover:underline"
                          >
                            [Pickup Map]
                          </a>
                        )}
                        {bookingStatus.destinationLocation?.latitude && bookingStatus.destinationLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.destinationLocation.latitude},${bookingStatus.destinationLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#D4AF37] hover:underline"
                          >
                            [Destination Map]
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Privacy Notice */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Verified customer inquiry. Private contact details are never exposed.</span>
              </div>

              {bookingStatus.adminNotes && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">Dispatcher Update:</span>
                  {bookingStatus.adminNotes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <a
                  href={`https://wa.me/201000000000?text=Hello%20PEGASUS%20Dispatch%2C%20inquiry%20regarding%20booking%20ref%20${bookingStatus.bookingReference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Dispatch</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
