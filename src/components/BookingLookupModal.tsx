import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBookingStatusByReference } from '../services/bookingService';
import { getCustomTripByReference, approveCustomTripPrice } from '../services/customTripService';
import { getCompanySettings, getWhatsAppLink, getVehicleOptions, resolveVehicleDisplayName } from '../services/settingsService';
import { BookingPublicStatus, CustomTripPublicStatus } from '../types';
import { verifyTrackingContact } from '../utils/trackingVerification';
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
  Check,
  Sparkles,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
  initialContact?: string;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({ 
  isOpen, 
  onClose,
  initialReference = '',
  initialContact = '',
}) => {
  const { t, language, direction } = useLanguage();
  const companySettings = getCompanySettings();

  const [reference, setReference] = useState(initialReference);
  const [contactInput, setContactInput] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingPublicStatus | null>(null);
  const [customTrip, setCustomTrip] = useState<CustomTripPublicStatus | null>(null);
  const [approvingPrice, setApprovingPrice] = useState(false);
  const [priceApprovedSuccess, setPriceApprovedSuccess] = useState(false);
  const [errorType, setErrorType] = useState<'empty' | 'missingContact' | 'verificationFailed' | 'notFound' | 'networkError' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialReference) {
      setReference(initialReference.toUpperCase());
    }
    if (initialContact) {
      setContactInput(initialContact);
    }
  }, [initialReference, initialContact, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRef = reference.trim().toUpperCase();
    const cleanContact = contactInput.trim();
    if (!cleanRef) {
      setErrorType('empty');
      return;
    }
    if (!cleanContact) {
      setBookingStatus(null);
      setCustomTrip(null);
      setErrorType('missingContact');
      return;
    }

    setLoading(true);
    setErrorType(null);
    setBookingStatus(null);
    setCustomTrip(null);
    setPriceApprovedSuccess(false);

    try {
      if (cleanRef.startsWith('PEG-TRIP-')) {
        const trip = await getCustomTripByReference(cleanRef);
        if (!trip) {
          setErrorType('notFound');
        } else {
          const isVerified = await verifyTrackingContact(
            cleanRef,
            cleanContact,
            trip.verifyEmailHash,
            trip.verifyPhoneHash
          );
          if (!isVerified) {
            setErrorType('verificationFailed');
          } else {
            setCustomTrip(trip);
          }
        }
      } else {
        const status = await getBookingStatusByReference(cleanRef);
        if (!status) {
          setErrorType('notFound');
        } else {
          const isVerified = await verifyTrackingContact(
            cleanRef,
            cleanContact,
            status.verifyEmailHash,
            status.verifyPhoneHash
          );
          if (!isVerified) {
            setErrorType('verificationFailed');
          } else {
            setBookingStatus(status);
          }
        }
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setErrorType('networkError');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrice = async () => {
    if (!customTrip) return;
    setApprovingPrice(true);
    try {
      await approveCustomTripPrice(customTrip.referenceNumber);
      setCustomTrip({
        ...customTrip,
        status: 'Customer Approved',
      });
      setPriceApprovedSuccess(true);
    } catch (err) {
      console.error('Failed to approve price:', err);
    } finally {
      setApprovingPrice(false);
    }
  };

  const copyRef = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Price Approved':
      case 'Customer Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'Confirmed' ? t('track.statusConfirmed', 'CONFIRMED') : t('track.statusPriceApproved', 'PRICE APPROVED')}</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('track.statusCompleted', 'COMPLETED')}</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t('track.statusCancelled', 'CANCELLED')}</span>
          </span>
        );
      case 'Price Sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('track.statusPriceSent', 'PRICE QUOTED')}</span>
          </span>
        );
      case 'Pending':
      case 'Pending Review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('track.statusPending', 'PENDING REVIEW')}</span>
          </span>
        );
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
                {t('track.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSearch} className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ru' ? 'Код бронирования (PEG-...) *' : language === 'ar' ? 'الرقم المرجعي (PEG-...) *' : language === 'de' ? 'Referenzcode (PEG-...) *' : 'Reference Code (PEG-...) *'}
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder={t('track.inputPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDBD] bg-white text-slate-800 focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 font-mono text-sm tracking-wider uppercase"
                dir="ltr"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('track.contactLabel', 'Booking Email or Phone Number *')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder={t('track.contactPlaceholder', 'Enter email or phone used when booking')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CDBD] bg-white text-slate-800 focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm"
                  dir="ltr"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-semibold text-xs sm:text-sm hover:brightness-110 transition shadow-md disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {loading ? (language === 'ru' ? 'Проверка...' : language === 'ar' ? 'جاري الفحص...' : language === 'de' ? 'Wird geprüft...' : 'Checking...') : t('track.btn')}
                </button>
              </div>
            </div>
          </form>

          {errorType && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                {errorType === 'empty' && (
                  <p className="font-semibold">
                    {language === 'ru' ? 'Пожалуйста, введите код бронирования.' : language === 'ar' ? 'يرجى إدخال الرقم المرجعي.' : language === 'de' ? 'Bitte Referenzcode eingeben.' : 'Please enter your reference code.'}
                  </p>
                )}
                {errorType === 'missingContact' && (
                  <p className="font-semibold">{t('track.missingContact')}</p>
                )}
                {errorType === 'verificationFailed' && (
                  <p className="font-semibold">{t('track.verificationFailed')}</p>
                )}
                {errorType === 'notFound' && (
                  <p className="font-semibold">{t('track.notFound')}</p>
                )}
                {errorType === 'networkError' && (
                  <p className="font-semibold">
                    {language === 'ru' ? 'Ошибка соединения. Попробуйте позже.' : language === 'ar' ? 'خطأ في الاتصال. يرجى المحاولة لاحقاً.' : language === 'de' ? 'Verbindungsfehler. Bitte erneut versuchen.' : 'Connection error. Please check your network and try again.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Standard Transfer / Tour Booking Status Card */}
          {bookingStatus && (
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    {t('success.ref')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-mono font-bold text-[#0D1B2A] tracking-wider" dir="ltr">
                      {bookingStatus.bookingReference}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRef(bookingStatus.bookingReference)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>{getStatusBadge(bookingStatus.status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.name')}</span>
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
                    <span className="font-medium text-slate-900">
                      {bookingStatus.vehicleName || resolveVehicleDisplayName(bookingStatus.vehicleType, getVehicleOptions(), language)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.serviceType')} & {t('booking.priceLabel')}</span>
                    <span className="font-medium text-slate-900 capitalize block">
                      {bookingStatus.tourTitle || (bookingStatus.serviceType || 'Airport Transfer').replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-[#0D1B2A] block mt-0.5">
                      {typeof bookingStatus.quotedPrice === 'number' && bookingStatus.quotedPrice > 0
                        ? `${bookingStatus.quotedPrice} ${bookingStatus.priceCurrency || 'EUR'}`
                        : t('booking.priceOnRequest')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">{t('booking.origin')} ➔ {t('booking.destination')}</span>
                    <span className="font-medium text-slate-900">{bookingStatus.origin} ➔ {bookingStatus.destination}</span>
                    {(bookingStatus.pickupLocation?.latitude || bookingStatus.destinationLocation?.latitude) && (
                      <div className="mt-1 flex items-center gap-3">
                        {bookingStatus.pickupLocation?.latitude && bookingStatus.pickupLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.pickupLocation.latitude},${bookingStatus.pickupLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{language === 'ru' ? 'Точка подачи на карте' : language === 'ar' ? 'خريطة الانطلاق' : language === 'de' ? 'Abholort Karte' : 'Pickup Location Map'}</span>
                          </a>
                        )}
                        {bookingStatus.destinationLocation?.latitude && bookingStatus.destinationLocation?.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${bookingStatus.destinationLocation.latitude},${bookingStatus.destinationLocation.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{language === 'ru' ? 'Пункт назначения на карте' : language === 'ar' ? 'خريطة الوجهة' : language === 'de' ? 'Zielort Karte' : 'Destination Map'}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer message if coordinator provided one */}
              {bookingStatus.customerMessage && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">{t('track.customerMessage')}:</span>
                  <p>{bookingStatus.customerMessage}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {t('success.cashNotice')}
                </span>

                <a
                  href={getWhatsAppLink(companySettings.whatsapp, `Hello PEGASUS! Inquiry regarding booking ref ${bookingStatus.bookingReference}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>{t('tours.whatsappBtn')}</span>
                </a>
              </div>
            </div>
          )}

          {/* Custom Trip Request Status Card */}
          {customTrip && (
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    {language === 'ru' ? 'Код индивидуального тура' : language === 'ar' ? 'مرجع الرحلة المخصصة' : language === 'de' ? 'Referenz (Individuelle Reise)' : 'Custom Trip Reference'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-mono font-bold text-[#0D1B2A] tracking-wider" dir="ltr">
                      {customTrip.referenceNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRef(customTrip.referenceNumber)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>{getStatusBadge(customTrip.status)}</div>
              </div>

              {/* Price Quote Banner if Price Sent */}
              {customTrip.status === 'Price Sent' && Boolean(customTrip.pricing?.finalPrice) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-[#FDFBF7] border-2 border-[#D4AF37] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-[#0D1B2A] block">
                        {t('track.priceQuote', 'Quoted Price for Itinerary')}
                      </span>
                      <span className="text-2xl font-extrabold text-[#0D1B2A] tracking-tight">
                        {customTrip.pricing?.finalPrice} {customTrip.pricing?.currency || 'EUR'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={approvingPrice}
                      onClick={handleApprovePrice}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37] font-bold text-xs sm:text-sm hover:brightness-110 transition shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4 text-[#D4AF37]" />
                      <span>{approvingPrice ? (language === 'ru' ? 'Подтверждение...' : language === 'ar' ? 'جاري التأكيد...' : 'Approving...') : t('track.approvePriceBtn', 'Approve This Quoted Price')}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {language === 'ru'
                      ? 'Оплата производится наличными по прибытии. Нажмите кнопку подтверждения, чтобы согласовать стоимость.'
                      : language === 'ar'
                      ? 'الدفع نقداً عند الوصول. اضغط للموافقة على السعر مع فريق التنسيق.'
                      : language === 'de'
                      ? 'Barzahlung bei Ankunft. Klicken Sie zur Freigabe dieses Angebots.'
                      : 'Payment is made in cash directly upon arrival. Click approve to confirm this price with our dispatch team.'}
                  </p>
                </div>
              )}

              {priceApprovedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('track.priceApprovedSuccess', 'You have approved this quote. Our team will finalize your itinerary.')}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block">{t('booking.name')}</span>
                  <span className="font-medium text-slate-900">{customTrip.maskedCustomerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('booking.date')}</span>
                  <span className="font-medium text-slate-900">{customTrip.startDate} — {customTrip.endDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('fleet.passengers')}</span>
                  <span className="font-medium text-slate-900">{customTrip.passengerCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('booking.pickupLocation')}</span>
                  <span className="font-medium text-slate-900">{customTrip.pickup} • {customTrip.accommodation}</span>
                </div>
              </div>

              {/* Experiences list */}
              {customTrip.experiences && customTrip.experiences.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    {language === 'ru' ? `Выбранные активности (${customTrip.experiences.length})` : language === 'ar' ? `الأنشطة المختارة (${customTrip.experiences.length})` : `Itinerary Activities (${customTrip.experiences.length})`}
                  </span>
                  <div className="space-y-1">
                    {customTrip.experiences.map((exp, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                        <span className="font-medium text-slate-800">{exp.title}</span>
                        <span className="text-[11px] text-[#D4AF37] font-semibold">{exp.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customTrip.customerMessage && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block mb-0.5">{t('track.customerMessage')}:</span>
                  <p>{customTrip.customerMessage}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {t('success.cashNotice')}
                </span>

                <a
                  href={getWhatsAppLink(companySettings.whatsapp, `Hello PEGASUS! Inquiry regarding custom trip ref ${customTrip.referenceNumber}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>{t('tours.whatsappBtn')}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
