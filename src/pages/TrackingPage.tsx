import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBookingStatusByReference } from '../services/bookingService';
import { getCustomTripByReference, approveCustomTripPrice } from '../services/customTripService';
import { getCompanySettings, getWhatsAppLink, getVehicleOptions, resolveVehicleDisplayName } from '../services/settingsService';
import { BookingPublicStatus, CustomTripPublicStatus } from '../types';
import { verifyTrackingContact } from '../utils/trackingVerification';
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
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';

interface TrackingPageProps {
  initialReference?: string;
  initialContact?: string;
  onOpenBooking?: () => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ 
  initialReference = '',
  initialContact = '',
  onOpenBooking 
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
    if (initialReference && initialContact) {
      performLookup(initialReference.toUpperCase(), initialContact);
    }
  }, [initialReference, initialContact]);

  const performLookup = async (refCode: string, contactValue: string) => {
    const cleanRef = refCode.trim().toUpperCase();
    const cleanContact = contactValue.trim();
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
      console.error('Tracking lookup error:', err);
      setErrorType('networkError');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(reference, contactInput);
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

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return t('track.statusConfirmed', 'Confirmed');
      case 'Completed':
        return t('track.statusCompleted', 'Completed');
      case 'Cancelled':
        return t('track.statusCancelled', 'Cancelled');
      case 'Price Sent':
        return t('track.statusPriceSent', 'Price Sent');
      case 'Price Approved':
      case 'Customer Approved':
        return t('track.statusPriceApproved', 'Price Approved');
      default:
        return t('track.statusPending', 'Pending Confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-10 px-4 sm:px-6 lg:px-8" dir={direction}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-xs font-semibold mb-4 border border-[#D4AF37]/30 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>{language === 'ru' ? 'Клиентский портал PEGASUS' : language === 'ar' ? 'بوابة عملاء بيجاسوس' : language === 'de' ? 'PEGASUS Kundenportal' : 'PEGASUS Customer Portal'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight mb-3">
            {t('track.title')}
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t('track.subtitle')}
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-xl p-6 sm:p-8 mb-8">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {language === 'ru' ? 'Номер бронирования или индивидуального тура *' : language === 'ar' ? 'الرقم المرجعي للحجز أو الرحلة المخصصة *' : language === 'de' ? 'Buchungs- oder Ausflugsreferenz *' : 'Booking or Custom Trip Reference *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder={t('track.inputPlaceholder')}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#D5CDBD] text-slate-900 font-mono font-bold tracking-wider text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 uppercase"
                    dir="ltr"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 rtl:right-auto rtl:left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('track.contactLabel', 'Booking Email or Phone Number *')}
                </label>
                <input
                  type="text"
                  required
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder={t('track.contactPlaceholder', 'Enter email or phone used when booking')}
                  className="w-full px-4 py-3 rounded-xl border border-[#D5CDBD] text-slate-900 text-sm focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] hover:brightness-110 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? (
                  <span>{language === 'ru' ? 'Проверка...' : language === 'ar' ? 'جاري الفحص...' : language === 'de' ? 'Wird geprüft...' : 'Checking...'}</span>
                ) : (
                  <>
                    <span>{t('track.btn')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>

            {errorType && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  {errorType === 'empty' && (
                    <p className="font-semibold">
                      {language === 'ru' ? 'Пожалуйста, введите код бронирования.' : language === 'ar' ? 'يرجى إدخال الرقم المرجعي.' : language === 'de' ? 'Bitte geben Sie Ihren Referenzcode ein.' : 'Please enter your reference code.'}
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
                      {language === 'ru' ? 'Ошибка соединения. Проверьте подключение и попробуйте снова.' : language === 'ar' ? 'خطأ في الاتصال. يرجى المحاولة مرة أخرى.' : language === 'de' ? 'Verbindungsfehler. Bitte erneut versuchen.' : 'Connection error. Please check your network and try again.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Result 1: Standard Transfer / Tour Booking */}
        {bookingStatus && (
          <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  {t('success.ref')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0D1B2A] tracking-wider" dir="ltr">
                    {bookingStatus.bookingReference}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRef(bookingStatus.bookingReference)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
                  </button>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  bookingStatus.status === 'Confirmed'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : bookingStatus.status === 'Completed'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : bookingStatus.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span>{getStatusLabel(bookingStatus.status)}</span>
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-[#FBF9F5] rounded-xl border border-[#EAE4D9] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.name')}</span>
                  <span className="font-semibold text-slate-900 text-sm">{bookingStatus.maskedCustomerName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.date')} & {t('booking.time')}</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {bookingStatus.pickupDate} {bookingStatus.pickupTime ? `(${bookingStatus.pickupTime})` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.serviceType')}</span>
                  <span className="font-semibold text-slate-900 text-sm capitalize">
                    {bookingStatus.tourTitle ? `${bookingStatus.tourTitle}` : (bookingStatus.serviceType || 'Airport Transfer').replace('_', ' ')}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">{t('booking.origin')} ➔ {t('booking.destination')}</span>
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{bookingStatus.origin} ➔ {bookingStatus.destination}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.vehicleChoice')}</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {bookingStatus.vehicleName || resolveVehicleDisplayName(bookingStatus.vehicleType, getVehicleOptions(), language)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {bookingStatus.passengerCount} {t('fleet.passengers')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.priceLabel')}</span>
                  <span className="font-semibold text-[#0D1B2A] text-sm">
                    {typeof bookingStatus.quotedPrice === 'number' && bookingStatus.quotedPrice > 0
                      ? `${bookingStatus.quotedPrice} ${bookingStatus.priceCurrency || 'EUR'}`
                      : t('booking.priceOnRequest')}
                  </span>
                </div>
              </div>

              {/* Customer message if coordinator provided one */}
              {bookingStatus.customerMessage && (
                <div className="mt-4 pt-3 border-t border-[#EAE4D9] text-xs">
                  <span className="font-bold text-[#0D1B2A] block mb-1">
                    {t('track.customerMessage')}:
                  </span>
                  <p className="text-slate-800 bg-white p-3 rounded-lg border border-[#D5CDBD]">
                    {bookingStatus.customerMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                {t('success.cashNotice')}
              </span>

              <a
                href={getWhatsAppLink(companySettings.whatsapp, `Hello PEGASUS Hurghada, inquiry regarding booking ref ${bookingStatus.bookingReference}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('tours.whatsappBtn')}</span>
              </a>
            </div>
          </div>
        )}

        {/* Result 2: Custom Trip Request */}
        {customTrip && (
          <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  {language === 'ru' ? 'Код индивидуального тура' : language === 'ar' ? 'مرجع الرحلة المخصصة' : language === 'de' ? 'Referenz (Individuelle Reise)' : 'Custom Trip Reference'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0D1B2A] tracking-wider" dir="ltr">
                    {customTrip.referenceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyRef(customTrip.referenceNumber)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
                  </button>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  customTrip.status === 'Confirmed' || customTrip.status === 'Price Approved' || customTrip.status === 'Customer Approved'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : customTrip.status === 'Price Sent'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span>{getStatusLabel(customTrip.status)}</span>
                </span>
              </div>
            </div>

            {/* Price Quote Banner */}
            {customTrip.status === 'Price Sent' && Boolean(customTrip.pricing?.finalPrice) && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-[#FDFBF7] border-2 border-[#D4AF37] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-[#0D1B2A] block">
                      {t('track.priceQuote', 'Quoted Price for Itinerary')}
                    </span>
                    <span className="text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                      {customTrip.pricing?.finalPrice} {customTrip.pricing?.currency || 'EUR'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={approvingPrice}
                    onClick={handleApprovePrice}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37] font-bold text-xs sm:text-sm hover:brightness-110 transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4 text-[#D4AF37]" />
                    <span>{approvingPrice ? (language === 'ru' ? 'Подтверждение...' : language === 'ar' ? 'جاري التأكيد...' : 'Approving...') : t('track.approvePriceBtn', 'Approve This Quoted Price')}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  {language === 'ru'
                    ? 'Оплата производится наличными по прибытии. Нажмите кнопку подтверждения, чтобы согласовать стоимость с диспетчерской.'
                    : language === 'ar'
                    ? 'يتم الدفع نقداً عند الوصول. اضغط للموافقة وتأكيد هذا السعر مع فريق التنسيق.'
                    : language === 'de'
                    ? 'Die Zahlung erfolgt bar bei Ankunft. Klicken Sie auf Bestätigen, um das Angebot anzunehmen.'
                    : 'Payment is made in cash directly upon arrival. Click approve to confirm this price with our dispatch team.'}
                </p>
              </div>
            )}

            {priceApprovedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('track.priceApprovedSuccess', 'You have approved this quote. Our team will finalize your itinerary.')}</span>
              </div>
            )}

            {/* Details */}
            <div className="bg-[#FBF9F5] rounded-xl border border-[#EAE4D9] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.name')}</span>
                  <span className="font-semibold text-slate-900 text-sm">{customTrip.maskedCustomerName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('booking.date')}</span>
                  <span className="font-semibold text-slate-900 text-sm">{customTrip.startDate} — {customTrip.endDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('fleet.passengers')}</span>
                  <span className="font-semibold text-slate-900 text-sm">{customTrip.passengerCount} {t('fleet.passengers')}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">{t('booking.pickupLocation')}</span>
                  <span className="font-semibold text-slate-900 text-sm">{customTrip.pickup} • {customTrip.accommodation}</span>
                </div>
              </div>

              {/* Experiences list */}
              {customTrip.experiences && customTrip.experiences.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#EAE4D9]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    {language === 'ru' ? `Выбранные активности (${customTrip.experiences.length})` : language === 'ar' ? `الأنشطة المختارة (${customTrip.experiences.length})` : language === 'de' ? `Ausgewählte Aktivitäten (${customTrip.experiences.length})` : `Selected Experiences (${customTrip.experiences.length})`}
                  </span>
                  <div className="space-y-1.5">
                    {customTrip.experiences.map((exp, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-[#EAE4D9] flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{exp.title}</span>
                        <span className="text-[#D4AF37] font-semibold">{exp.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customTrip.customerMessage && (
                <div className="mt-4 pt-3 border-t border-[#EAE4D9] text-xs">
                  <span className="font-bold text-[#0D1B2A] block mb-1">
                    {t('track.customerMessage')}:
                  </span>
                  <p className="text-slate-800 bg-white p-3 rounded-lg border border-[#D5CDBD]">
                    {customTrip.customerMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                {t('success.cashNotice')}
              </span>

              <a
                href={getWhatsAppLink(companySettings.whatsapp, `Hello PEGASUS! Inquiry regarding custom trip ref ${customTrip.referenceNumber}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('tours.whatsappBtn')}</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
