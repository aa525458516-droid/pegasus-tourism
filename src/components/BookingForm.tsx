import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createBooking } from '../services/bookingService';
import { subscribeToTours } from '../services/tourService';
import {
  getVehicleOptions,
  getCompanySettings,
  subscribeToVehicleOptions,
  subscribeToCompanySettings,
  subscribeToTransferPricingRules,
  resolveTransferPrice,
  resolveVehicleDisplayName,
} from '../services/settingsService';
import { playBookingChime, getAdminWhatsAppAlertUrl } from '../services/notificationService';
import {
  Booking,
  ServiceType,
  TripType,
  FlightDirection,
  LocationDetails,
  Tour,
  VehicleCategory,
  CompanySettings,
  TransferPriceRule,
} from '../types';
import { POPULAR_LOCATIONS } from '../data/initialData';
const MapLocationPicker = lazy(() => import('./MapLocationPicker').then(m => ({ default: m.MapLocationPicker })));
import { PopularLocationsSection } from './PopularLocationsSection';
import { 
  Car, 
  Calendar, 
  Clock, 
  Users, 
  Luggage, 
  Plane, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Compass,
  Edit,
  Copy,
  Check,
  User,
  RotateCcw,
  Info,
  Sparkles
} from 'lucide-react';

interface BookingFormProps {
  initialServiceType?: ServiceType;
  initialTourId?: string;
  initialTourTitle?: string;
  initialPassengers?: number;
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
  onTrackBooking?: (reference: string, contact?: string) => void;
  isModal?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialServiceType = 'airport_pickup',
  initialTourId,
  initialTourTitle,
  initialPassengers,
  onSuccess,
  onCancel,
  onTrackBooking,
}) => {
  const { t, language, direction } = useLanguage();

  const todayIso = new Date().toISOString().split('T')[0];

  // Dynamic tours, vehicles, pricing rules & settings from services
  const [tours, setTours] = useState<Tour[]>([]);
  const [vehicles, setVehicles] = useState<VehicleCategory[]>(() =>
    getVehicleOptions().filter((v) => v.active !== false)
  );
  const [pricingRules, setPricingRules] = useState<TransferPriceRule[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());

  useEffect(() => {
    const unsubTours = subscribeToTours((allTours) => {
      const active = allTours.filter((tr) => tr.available !== false);
      setTours(active);
    });
    const unsubVehicles = subscribeToVehicleOptions((allVehicles) => {
      setVehicles(allVehicles.filter((v) => v.active !== false));
    });
    const unsubPricing = subscribeToTransferPricingRules(setPricingRules);
    const unsubSettings = subscribeToCompanySettings(setCompanySettings);

    return () => {
      unsubTours();
      unsubVehicles();
      unsubPricing();
      unsubSettings();
    };
  }, []);

  // Wizard Step: 1 (Trip) | 2 (Customer) | 3 (Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Mode: Ready-Made Tour vs Custom / Airport / Transfer
  const [bookingMode, setBookingMode] = useState<'ready_tour' | 'custom_route'>(
    initialTourId || initialTourTitle ? 'ready_tour' : 'custom_route'
  );

  // STEP 1 STATE: Trip Details
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [selectedTourId, setSelectedTourId] = useState<string>(initialTourId || '');

  const [origin, setOrigin] = useState<string>(
    initialServiceType === 'airport_pickup' ? 'Hurghada International Airport (HRG)' : 'Hurghada Hotel / Resort'
  );
  const [destination, setDestination] = useState<string>(
    initialTourTitle ? initialTourTitle : 'El Gouna / Hurghada Hotel'
  );

  const [pickupLocation, setPickupLocation] = useState<LocationDetails | undefined>(() => {
    if (initialServiceType === 'airport_pickup') {
      return {
        name: 'Hurghada International Airport (HRG)',
        address: 'Hurghada Airport, Red Sea Governorate, Egypt',
        latitude: 27.1783,
        longitude: 33.7994,
      };
    }
    return undefined;
  });

  const [destinationLocation, setDestinationLocation] = useState<LocationDetails | undefined>(() => {
    if (initialTourTitle) {
      return {
        name: initialTourTitle,
        address: `${initialTourTitle}, Egypt`,
      };
    }
    return undefined;
  });

  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('12:00');

  // Round trip return details
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [returnTime, setReturnTime] = useState('14:00');

  // Flight Information
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDirection, setFlightDirection] = useState<FlightDirection>(
    initialServiceType === 'airport_dropoff' ? 'departure' : 'arrival'
  );
  const [flightTime, setFlightTime] = useState('');

  // Passengers (Max 4 standard / up to 8 strictly for Toyota Hiace)
  const initialSafePax = typeof initialPassengers === 'number' ? Math.min(8, Math.max(1, initialPassengers)) : 2;
  const [passengerCount, setPassengerCount] = useState<number>(initialSafePax);
  const [luggageCount, setLuggageCount] = useState<number>(2);
  const [vehicleType, setVehicleType] = useState<string>(() => {
    const activeVehicles = getVehicleOptions().filter((v) => v.active !== false);
    if (initialSafePax > 4 && activeVehicles.some((v) => v.id === 'toyota_hiace')) {
      return 'toyota_hiace';
    }
    return activeVehicles[0]?.id || 'toyota_corolla';
  });

  useEffect(() => {
    if (passengerCount > 4 && vehicleType !== 'toyota_hiace' && vehicles.some((v) => v.id === 'toyota_hiace')) {
      setVehicleType('toyota_hiace');
    }
  }, [passengerCount, vehicleType, vehicles]);

  // STEP 2 STATE: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [notes, setNotes] = useState('');

  // Anti-Spam Honeypot field (hidden from real users)
  const [honeypot, setHoneypot] = useState('');

  // Map Picker Modal state
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'pickup' | 'destination'>('pickup');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Submission Status
  const [loading, setLoading] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTourSelection = (tourId: string) => {
    setSelectedTourId(tourId);
    const tourObj = tours.find((tr) => tr.id === tourId);
    if (tourObj) {
      setDestination(tourObj.title);
      setDestinationLocation({
        name: tourObj.title,
        address: `${tourObj.destination}, Egypt`,
      });
    }
  };

  const handleOpenMapPicker = (target: 'pickup' | 'destination') => {
    setMapPickerTarget(target);
    setMapPickerOpen(true);
  };

  const handleLocationPicked = (loc: LocationDetails) => {
    if (mapPickerTarget === 'pickup') {
      setPickupLocation(loc);
      setOrigin(loc.name);
      clearError('origin');
    } else {
      setDestinationLocation(loc);
      setDestination(loc.name);
      clearError('destination');
    }
  };

  // STEP 1 VALIDATION
  const handleNextToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const newErrors: Record<string, string> = {};

    if (!origin.trim()) {
      newErrors.origin = t('booking.valPickup');
    }
    if (!destination.trim()) {
      newErrors.destination = t('booking.valDestination');
    }
    if (!pickupDate) {
      newErrors.pickupDate = t('booking.valDate');
    } else if (pickupDate < todayIso) {
      newErrors.pickupDate = t('booking.valDatePast', 'Pickup date cannot be in the past');
    }
    if (!pickupTime) {
      newErrors.pickupTime = t('booking.valTime');
    }
    const maxAllowedPassengers = vehicleType === 'toyota_hiace' ? 8 : 4;
    if (passengerCount < 1 || passengerCount > maxAllowedPassengers) {
      newErrors.passengerCount =
        vehicleType === 'toyota_hiace'
          ? language === 'ru'
            ? 'Количество пассажиров для Toyota Hiace — от 1 до 8'
            : language === 'ar'
            ? 'يجب أن يكون عدد الركاب بين 1 و 8 لسيارة Toyota Hiace'
            : language === 'de'
            ? 'Passagieranzahl für Toyota Hiace muss zwischen 1 und 8 liegen'
            : 'Passenger count must be between 1 and 8 for Toyota Hiace'
          : t('booking.valPassengers', 'Passenger count must be between 1 and 4 (5–8 requires Toyota Hiace)');
    }
    if (tripType === 'round_trip') {
      if (!returnDate) {
        newErrors.returnDate = t('booking.valReturnDate');
      } else if (returnDate < pickupDate) {
        newErrors.returnDate =
          language === 'ru'
            ? 'Дата возвращения должна быть не раньше даты подачи'
            : language === 'ar'
            ? 'يجب أن يكون تاريخ العودة في نفس يوم الذهاب أو بعده'
            : language === 'de'
            ? 'Das Rückfahrtdatum darf nicht vor dem Abholdatum liegen'
            : 'Return date must be on or after pickup date';
      }
      if (!returnTime) {
        newErrors.returnTime = t('booking.valReturnTime');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 2 VALIDATION
  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.customerName = t('booking.valName');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = t('booking.valEmail');
    }
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhoneDigits.length < 6) {
      newErrors.phone = t('booking.valPhone');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 3 FINAL SUBMIT
  const handleConfirmBooking = async () => {
    // Honeypot check: If bot filled hidden field, abort silently
    if (honeypot.trim()) {
      return;
    }

    setGeneralError(null);
    setLoading(true);

    try {
      const selectedTourObj = bookingMode === 'ready_tour' ? tours.find((t) => t.id === selectedTourId) : undefined;
      const resolvedTourTitle = selectedTourObj ? selectedTourObj.title : (initialTourTitle || undefined);

      const notesCombined = [
        notes.trim(),
        tripType === 'round_trip' ? `[Round Trip Return: ${returnDate} at ${returnTime}]` : '',
      ].filter(Boolean).join('\n');

      const maxAllowedPassengers = vehicleType === 'toyota_hiace' ? 8 : 4;
      const safePassengers = Math.min(maxAllowedPassengers, Math.max(1, Math.round(Number(passengerCount) || 1)));
      const resolvedVehicleName = resolveVehicleDisplayName(vehicleType, vehicles, 'en');
      const transferQuote =
        bookingMode === 'custom_route'
          ? resolveTransferPrice(origin.trim(), destination.trim(), vehicleType, tripType, pricingRules)
          : null;

      const tourPrice =
        bookingMode === 'ready_tour' && selectedTourObj && typeof selectedTourObj.pricePerPerson === 'number' && selectedTourObj.pricePerPerson > 0
          ? selectedTourObj.pricePerPerson
          : null;

      const quotedPrice = bookingMode === 'ready_tour' ? tourPrice : transferQuote?.amount ?? null;
      const priceCurrency = bookingMode === 'ready_tour' ? (tourPrice ? 'EUR' : undefined) : (transferQuote?.currency || undefined);
      const priceStatus: 'fixed' | 'price_on_request' =
        typeof quotedPrice === 'number' && quotedPrice > 0 ? 'fixed' : 'price_on_request';

      const created = await createBooking({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        nationality: nationality.trim() || 'International',
        passengerCount: safePassengers,
        luggageCount: Math.max(0, Math.round(Number(luggageCount) || 0)),
        pickupDate,
        pickupTime,
        serviceType,
        tripType,
        origin: origin.trim(),
        destination: destination.trim(),
        pickupLocation: pickupLocation || {
          name: origin.trim(),
          address: origin.trim(),
        },
        destinationLocation: destinationLocation || {
          name: destination.trim(),
          address: destination.trim(),
        },
        flightNumber: flightNumber.trim() ? flightNumber.trim().toUpperCase() : undefined,
        airline: airline.trim() || undefined,
        flightDirection: serviceType === 'airport_pickup' || serviceType === 'airport_dropoff' ? flightDirection : undefined,
        flightTime: flightTime.trim() || undefined,
        vehicleType,
        vehicleName: resolvedVehicleName,
        quotedPrice,
        priceCurrency,
        priceStatus,
        tourId: bookingMode === 'ready_tour' ? selectedTourId : undefined,
        tourTitle: resolvedTourTitle,
        notes: notesCombined || undefined,
        adminNotes: '',
      });

      setSubmittedBooking(created);
      playBookingChime();
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: unknown) {
      console.error('Booking submission error details:', err);
      setGeneralError(
        language === 'ru'
          ? 'Не удалось сохранить заявку на бронирование. Проверьте подключение или свяжитесь с нами в WhatsApp.'
          : language === 'ar'
          ? 'تعذر حفظ طلب الحجز. يرجى التحقق من الاتصال أو التواصل معنا مباشرة عبر واتساب.'
          : language === 'de'
          ? 'Buchungsanfrage konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Verbindung oder kontaktieren Sie uns über WhatsApp.'
          : 'Could not save booking request. Please check your connection or contact our team directly on WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReference = () => {
    if (submittedBooking?.bookingReference) {
      navigator.clipboard.writeText(submittedBooking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBookAnother = () => {
    setSubmittedBooking(null);
    setCurrentStep(1);
    setOrigin(initialServiceType === 'airport_pickup' ? 'Hurghada International Airport (HRG)' : 'Hurghada Hotel / Resort');
    setDestination('El Gouna / Hurghada Hotel');
    setCustomerName('');
    setEmail('');
    setPhone('');
    setNationality('');
    setNotes('');
    setFlightNumber('');
    setAirline('');
    setFlightTime('');
    setErrors({});
    setGeneralError(null);
  };

  // SUCCESS SCREEN
  if (submittedBooking) {
    const whatsappUrl = getAdminWhatsAppAlertUrl(submittedBooking);
    const submittedVehicleLabel =
      submittedBooking.vehicleName || resolveVehicleDisplayName(submittedBooking.vehicleType, vehicles, language);
    const submittedPriceLabel =
      typeof submittedBooking.quotedPrice === 'number' && submittedBooking.quotedPrice > 0
        ? `${submittedBooking.quotedPrice} ${submittedBooking.priceCurrency || 'EUR'}`
        : t('booking.priceOnRequest');

    return (
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/60 p-6 md:p-8 shadow-2xl text-center max-w-2xl mx-auto" dir={direction}>
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
          {t('success.status')}
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0D1B2A] mb-2">
          {t('success.title')}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
          {t('success.msg')}
        </p>

        {/* Reference & Copy Card */}
        <div className="bg-[#FBF9F5] rounded-xl border-2 border-dashed border-[#D4AF37] p-5 mb-6 text-start">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9] pb-3 mb-3">
            <div>
              <span className="text-[11px] uppercase text-slate-400 font-bold block">{t('success.ref')}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0D1B2A] tracking-wider" dir="ltr">
                  {submittedBooking.bookingReference}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D4AF37] bg-white hover:bg-[#F8F5EE] text-[#0D1B2A] text-xs font-semibold shadow-2xs transition cursor-pointer"
                  title="Copy Reference"
                  aria-label="Copy booking reference"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">{t('booking.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('booking.copyRef')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <span className="text-xs bg-[#0D1B2A] text-[#D4AF37] font-semibold px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs">
              PEGASUS Hurghada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
            <div>
              <span className="text-slate-400">{t('booking.name')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedBooking.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.date')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedBooking.pickupDate} ({submittedBooking.pickupTime})</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.origin')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedBooking.origin}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.destination')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedBooking.destination}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.passengersCount')}:</span>{' '}
              <span className="font-semibold text-slate-900">
                {submittedBooking.passengerCount}{' '}
                {language === 'ru'
                  ? `чел. (макс. ${submittedBooking.vehicleType === 'toyota_hiace' ? 8 : 4})`
                  : language === 'ar'
                  ? `أفراد (حد أقصى ${submittedBooking.vehicleType === 'toyota_hiace' ? 8 : 4})`
                  : `Pers. (Max ${submittedBooking.vehicleType === 'toyota_hiace' ? 8 : 4})`}
              </span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.luggageCount')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedBooking.luggageCount}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.vehicleChoice')}:</span>{' '}
              <span className="font-semibold text-slate-900">{submittedVehicleLabel}</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.priceLabel')}:</span>{' '}
              <span className="font-bold text-[#0D1B2A]">{submittedPriceLabel}</span>
            </div>
          </div>
        </div>

        {/* Flight Ticket Requirement Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 mb-5 text-xs text-amber-900 flex items-start gap-2.5 text-start">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{t('success.flightNotice')}</p>
            <p className="text-[11px] text-amber-800 mt-0.5">{t('success.cashNotice')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onTrackBooking && (
            <button
              type="button"
              onClick={() => onTrackBooking(submittedBooking.bookingReference, submittedBooking.email)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] border border-[#D4AF37] font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('success.trackBtn')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleBookAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#D5CDBD] font-semibold text-sm shadow-xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('booking.bookAnother')}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{t('success.whatsappBtn')}</span>
          </a>
        </div>
      </div>
    );
  }

  // WIZARD STEP INDICATOR HEADER
  return (
    <div className="space-y-6" dir={direction}>
      {/* 3 Steps Wizard Header */}
      <div className="bg-white rounded-xl border border-[#EAE4D9] p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition ${
              currentStep === 1
                ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 1 ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </span>
            <span className="truncate">{t('booking.step1')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (origin.trim() && destination.trim()) {
                setCurrentStep(2);
              }
            }}
            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition ${
              currentStep === 2
                ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 2 ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span className="truncate">{t('booking.step2')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (origin.trim() && destination.trim() && customerName.trim() && email.trim() && phone.trim()) {
                setCurrentStep(3);
              }
            }}
            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition ${
              currentStep === 3
                ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 3 ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </span>
            <span className="truncate">{t('booking.step3')}</span>
          </button>
        </div>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP 1: TRIP DETAILS */}
      {currentStep === 1 && (
        <form onSubmit={handleNextToCustomer} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">
              {t('booking.tripCategory')}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setBookingMode('custom_route');
                  if (serviceType === 'tour') setServiceType('airport_pickup');
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  bookingMode === 'custom_route'
                    ? 'bg-[#0D1B2A] text-[#D4AF37] border-[#D4AF37] shadow-xs'
                    : 'bg-white border-[#EAE4D9] text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>{t('booking.customTrip')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingMode('ready_tour');
                  setServiceType('tour');
                  if (tours.length > 0) {
                    setSelectedTourId(tours[0].id);
                    setDestination(tours[0].title);
                  }
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  bookingMode === 'ready_tour'
                    ? 'bg-[#0D1B2A] text-[#D4AF37] border-[#D4AF37] shadow-xs'
                    : 'bg-white border-[#EAE4D9] text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-5 h-5" />
                <span>{t('booking.readyMadeTour')}</span>
              </button>
            </div>

            {/* If ready_tour mode */}
            {bookingMode === 'ready_tour' && (
              <div className="pt-2">
                {tours.length > 0 ? (
                  <>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('quick.tourSelection')}:
                    </label>
                    <select
                      value={selectedTourId}
                      onChange={(e) => handleTourSelection(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-bold text-[#0D1B2A] bg-white focus:outline-hidden focus:border-[#D4AF37]"
                    >
                      {tours.map((tour) => {
                        const localizedTourTitle =
                          language === 'ru'
                            ? tour.titleRu || tour.title
                            : language === 'de'
                            ? tour.titleDe || tour.title
                            : language === 'ar'
                            ? tour.titleAr || tour.title
                            : tour.title;
                        return (
                          <option key={tour.id} value={tour.id}>
                            {localizedTourTitle} • {tour.pricePerPerson ? `${tour.pricePerPerson} EUR / ${t('tours.perPerson')}` : ''} • {tour.destination}
                          </option>
                        );
                      })}
                    </select>

                    {(() => {
                      const chosenTour = tours.find((tr) => tr.id === selectedTourId);
                      if (!chosenTour || !chosenTour.pricePerPerson) return null;
                      return (
                        <div className="mt-2 p-2.5 rounded-lg bg-[#FAF7EE] border border-[#D4AF37]/50 flex items-center justify-between text-xs shadow-2xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>
                              {language === 'ru'
                                ? 'Официальная цена экскурсии:'
                                : language === 'ar'
                                ? 'السعر الرسمي للرحلة:'
                                : language === 'de'
                                ? 'Offizieller Ausflugspreis:'
                                : 'Official Excursion Rate:'}
                            </span>
                          </span>
                          <span className="font-black text-sm text-[#0D1B2A] bg-white px-2.5 py-0.5 rounded-md border border-[#D4AF37]/40">
                            {chosenTour.pricePerPerson} EUR <span className="text-[10px] font-normal text-slate-500">/ {t('tours.perPerson')}</span>
                          </span>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <p className="font-semibold">{t('tours.emptyTitle')}</p>
                    <p className="text-[11px] mt-0.5 text-amber-800">
                      {language === 'ru'
                        ? 'Пожалуйста, выберите режим трансфера или конструктор индивидуального тура для расчёта цены.'
                        : language === 'ar'
                        ? 'يرجى استخدام وضع المسار المخصص أو تصميم رحلتك الخاصة للحصول على عرض سعر.'
                        : language === 'de'
                        ? 'Bitte nutzen Sie den individuellen Routenmodus oder den Reiseplaner für ein Angebot.'
                        : 'Please use the custom route mode or build your trip to receive a quote.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Service Type Pills */}
            {bookingMode === 'custom_route' && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  {t('booking.serviceType')}:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'airport_pickup', label: t('booking.serviceTypePickup'), icon: Plane },
                    { id: 'airport_dropoff', label: t('booking.serviceTypeDropoff'), icon: Plane },
                    { id: 'private_transfer', label: t('booking.serviceTypePrivate'), icon: Car },
                    { id: 'intercity', label: t('booking.serviceTypeIntercity'), icon: MapPin },
                  ].map((st) => {
                    const IconComp = st.icon;
                    const isSel = serviceType === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setServiceType(st.id as ServiceType);
                          if (st.id === 'airport_pickup') {
                            setOrigin('Hurghada International Airport (HRG)');
                            setFlightDirection('arrival');
                          } else if (st.id === 'airport_dropoff') {
                            setDestination('Hurghada International Airport (HRG)');
                            setFlightDirection('departure');
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-[11px] font-semibold text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSel
                            ? 'bg-[#0D1B2A] text-[#D4AF37] border-[#D4AF37] font-bold'
                            : 'bg-white border-[#EAE4D9] text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span className="line-clamp-2">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trip Type: One Way vs Round Trip */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                {t('booking.tripType')}:
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="one_way"
                    checked={tripType === 'one_way'}
                    onChange={() => setTripType('one_way')}
                    className="accent-[#D4AF37]"
                  />
                  <span>{t('booking.oneWay')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="round_trip"
                    checked={tripType === 'round_trip'}
                    onChange={() => setTripType('round_trip')}
                    className="accent-[#D4AF37]"
                  />
                  <span>{t('booking.roundTrip')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Locations: Pickup & Destination with Map Location Picker */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Маршрут и адреса'
                  : language === 'ar'
                  ? 'المسار والمواقع'
                  : language === 'de'
                  ? 'Route & Orte'
                  : 'Route & Locations'}
              </span>
            </h4>

            {/* Origin */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('booking.pickupLocation')} *
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenMapPicker('pickup')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{t('booking.chooseOnMap')}</span>
                </button>
              </div>

              <input
                type="text"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  clearError('origin');
                }}
                placeholder={
                  language === 'ru'
                    ? 'Напр., Аэропорт Хургады (HRG) или название отеля'
                    : language === 'ar'
                    ? 'مثال: مطار الغردقة الدولي (HRG) أو اسم الفندق'
                    : language === 'de'
                    ? 'z. B. Flughafen Hurghada (HRG) oder Hotelname'
                    : 'e.g. Hurghada Airport (HRG) or Hotel Name'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                  errors.origin
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                }`}
              />
              {errors.origin && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {errors.origin}
                </p>
              )}
            </div>

            {/* Destination */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('booking.destinationLocation')} *
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenMapPicker('destination')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{t('booking.chooseOnMap')}</span>
                </button>
              </div>

              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  clearError('destination');
                }}
                placeholder={
                  language === 'ru'
                    ? 'Напр., Steigenberger ALDAU / Эль-Гуна / Луксор'
                    : language === 'ar'
                    ? 'مثال: شتيجنبرجر الداو / الجونة / الأقصر'
                    : language === 'de'
                    ? 'z. B. Steigenberger ALDAU / El Gouna / Luxor'
                    : 'e.g. Steigenberger ALDAU / El Gouna / Luxor'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                  errors.destination
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                }`}
              />
              {errors.destination && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {errors.destination}
                </p>
              )}
            </div>

            {/* Quick Popular Locations Pill Shortcuts */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                {language === 'ru'
                  ? 'Популярные курорты Красного моря:'
                  : language === 'ar'
                  ? 'وجهات البحر الأحمر الشائعة:'
                  : language === 'de'
                  ? 'Beliebte Ziele am Roten Meer:'
                  : 'Popular Red Sea Destinations:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.slice(0, 6).map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDestination(loc);
                      clearError('destination');
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#FBF9F5] hover:bg-[#F3EFEA] border border-[#EAE4D9] text-[11px] text-slate-700 font-medium transition cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Places Section */}
          <PopularLocationsSection
            onSelectAsPickup={(loc) => {
              setPickupLocation(loc);
              setOrigin(loc.name);
              clearError('origin');
            }}
            onSelectAsDestination={(loc) => {
              setDestinationLocation(loc);
              setDestination(loc.name);
              clearError('destination');
            }}
            currentPickupName={origin}
            currentDestinationName={destination}
          />

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Дата и время поездки'
                  : language === 'ar'
                  ? 'الموعد والتاريخ'
                  : language === 'de'
                  ? 'Datum & Uhrzeit'
                  : 'Schedule & Date'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('booking.date')} *
                </label>
                <input
                  type="date"
                  min={todayIso}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    clearError('pickupDate');
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.pickupDate ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                />
                {errors.pickupDate && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.pickupDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('booking.time')} *
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => {
                    setPickupTime(e.target.value);
                    clearError('pickupTime');
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.pickupTime ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                />
                {errors.pickupTime && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.pickupTime}</p>
                )}
              </div>
            </div>

            {/* Return Journey for Round Trips */}
            {tripType === 'round_trip' && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {language === 'ru'
                      ? 'Детали обратного трансфера (Туда и обратно)'
                      : language === 'ar'
                      ? 'تفاصيل رحلة العودة (ذهاب وعودة)'
                      : language === 'de'
                      ? 'Details der Rückfahrt (Hin & Zurück)'
                      : 'Return Journey Details (Round Trip)'}
                  </span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('booking.returnDate')} *
                    </label>
                    <input
                      type="date"
                      min={pickupDate || todayIso}
                      value={returnDate}
                      onChange={(e) => {
                        setReturnDate(e.target.value);
                        clearError('returnDate');
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                        errors.returnDate ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.returnDate && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.returnDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('booking.returnTime')} *
                    </label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => {
                        setReturnTime(e.target.value);
                        clearError('returnTime');
                      }}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                        errors.returnTime ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.returnTime && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.returnTime}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flight Details (For Airport Transfers) */}
          {(serviceType === 'airport_pickup' || serviceType === 'airport_dropoff') && (
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('booking.flightDetails')}</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {language === 'ru'
                    ? 'Используется водителем для координации встречи'
                    : language === 'ar'
                    ? 'يستخدمه السائق لتنسيق الاستقبال عند الوصول'
                    : language === 'de'
                    ? 'Zur Flugkoordination durch den Fahrer'
                    : 'Used by driver to coordinate arrival'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('booking.flightNumber')}
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MS 042 / DE 1420"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-[#D4AF37]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('booking.airline')}
                  </label>
                  <input
                    type="text"
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder={language === 'ru' ? 'Напр., Aeroflot, EgyptAir, Condor' : 'e.g. Condor, EgyptAir, Edelweiss'}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('booking.flightTime')}
                  </label>
                  <input
                    type="text"
                    value={flightTime}
                    onChange={(e) => setFlightTime(e.target.value)}
                    placeholder={
                      language === 'ru'
                        ? 'Напр., 14:35 прилёт'
                        : language === 'ar'
                        ? 'مثال: 14:35 الوصول'
                        : language === 'de'
                        ? 'z. B. 14:35 Landung'
                        : 'e.g. 14:35 Landing'
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passengers (MAX 4 STRICTLY ENFORCED), Luggage, and Vehicle Category */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Пассажиры и автомобиль'
                  : language === 'ar'
                  ? 'الركاب والسيارة'
                  : language === 'de'
                  ? 'Passagiere & Fahrzeug'
                  : 'Passengers & Vehicle'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('booking.passengersCount')} *</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {vehicleType === 'toyota_hiace'
                      ? (language === 'ru' ? 'Макс. 8 (Hiace)' : language === 'ar' ? 'الحد الأقصى 8 (هايس)' : language === 'de' ? 'Max 8 (Hiace)' : 'Max 8 (Hiace)')
                      : (language === 'ru' ? 'Макс. 4 (8 для Hiace)' : language === 'ar' ? 'الحد الأقصى 4 (8 لـ Hiace)' : language === 'de' ? 'Max 4 (8 bei Hiace)' : 'Max 4 (8 for Hiace)')}
                  </span>
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => {
                    const val = Math.min(8, Math.max(1, Number(e.target.value)));
                    setPassengerCount(val);
                    if (val > 4 && vehicleType !== 'toyota_hiace') {
                      const hiaceAvailable = vehicles.some((v) => v.id === 'toyota_hiace');
                      if (hiaceAvailable) {
                        setVehicleType('toyota_hiace');
                      }
                    }
                    clearError('passengerCount');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBD] text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value={1}>1 {language === 'ru' ? 'пассажир' : language === 'ar' ? 'فرد' : language === 'de' ? 'Person' : 'Person'}</option>
                  <option value={2}>2 {language === 'ru' ? 'пассажира' : language === 'ar' ? 'أفراد' : language === 'de' ? 'Personen' : 'Passengers'}</option>
                  <option value={3}>3 {language === 'ru' ? 'пассажира' : language === 'ar' ? 'أفراد' : language === 'de' ? 'Personen' : 'Passengers'}</option>
                  <option value={4}>4 {language === 'ru' ? 'пассажира' : language === 'ar' ? 'أفراد' : language === 'de' ? 'Personen' : 'Passengers'}</option>
                  <option value={5}>
                    5 {language === 'ru' ? 'пассажиров (только Toyota Hiace)' : language === 'ar' ? 'أفراد (Toyota Hiace فقط)' : language === 'de' ? 'Personen (Nur Toyota Hiace)' : 'Passengers (Toyota Hiace only)'}
                  </option>
                  <option value={6}>
                    6 {language === 'ru' ? 'пассажиров (только Toyota Hiace)' : language === 'ar' ? 'أفراد (Toyota Hiace فقط)' : language === 'de' ? 'Personen (Nur Toyota Hiace)' : 'Passengers (Toyota Hiace only)'}
                  </option>
                  <option value={7}>
                    7 {language === 'ru' ? 'пассажиров (только Toyota Hiace)' : language === 'ar' ? 'أفراد (Toyota Hiace فقط)' : language === 'de' ? 'Personen (Nur Toyota Hiace)' : 'Passengers (Toyota Hiace only)'}
                  </option>
                  <option value={8}>
                    8 {language === 'ru' ? 'пассажиров (макс. — только Toyota Hiace)' : language === 'ar' ? 'أفراد (الحد الأقصى - Toyota Hiace فقط)' : language === 'de' ? 'Personen (Max - Nur Toyota Hiace)' : 'Passengers (Max - Toyota Hiace only)'}
                  </option>
                </select>
                {errors.passengerCount && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.passengerCount}</p>
                )}
                <span className="text-[10px] text-slate-400 block mt-1">
                  {language === 'ru'
                    ? 'Макс. 4 пассажира в стандартных авто; 5–8 пассажиров только в Toyota Hiace.'
                    : language === 'ar'
                    ? 'الحد الأقصى 4 أفراد للسيارات العادية، وحتى 8 أفراد لسيارة Toyota Hiace فقط.'
                    : language === 'de'
                    ? 'Maximal 4 Passagiere in PKWs; bis zu 8 Passagiere nur mit Toyota Hiace.'
                    : 'Max 4 passengers in standard vehicles; 5–8 passengers exclusively with Toyota Hiace.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('booking.luggageCount')}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={luggageCount}
                  onChange={(e) => setLuggageCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder={language === 'ru' ? 'Количество мест багажа' : language === 'ar' ? 'عدد الحقائب' : language === 'de' ? 'Anzahl Gepäckstücke' : 'Number of bags'}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBD] text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  {language === 'ru'
                    ? 'Стандартные чемоданы, сумки или снаряжение для дайвинга.'
                    : language === 'ar'
                    ? 'حقائب السفر العادية أو حقائب الغوص.'
                    : language === 'de'
                    ? 'Normale Koffer, Reisetaschen oder Tauchgepäck.'
                    : 'Standard travel bags, suitcases, or dive luggage.'}
                </span>
              </div>
            </div>

            {/* Vehicle Category Selector */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                {t('booking.vehicleChoice')}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {vehicles.map((v) => {
                  const isHiace = v.id === 'toyota_hiace';
                  const isDisabledForPassengers = passengerCount > 4 && !isHiace;
                  const isSel = vehicleType === v.id;
                  const displayName =
                    language === 'ru'
                      ? (v.nameRu || v.name)
                      : language === 'ar'
                      ? (v.nameAr || v.name)
                      : language === 'de'
                      ? (v.nameDe || v.name)
                      : v.name;
                  const displayDesc =
                    language === 'ru'
                      ? (v.descriptionRu || v.description)
                      : language === 'ar'
                      ? (v.descriptionAr || v.description)
                      : language === 'de'
                      ? (v.descriptionDe || v.description)
                      : v.description;
                  const vehPrice =
                    bookingMode === 'custom_route'
                      ? resolveTransferPrice(origin, destination, v.id, tripType, pricingRules)
                      : null;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isDisabledForPassengers}
                      onClick={() => {
                        if (isDisabledForPassengers) return;
                        setVehicleType(v.id);
                        clearError('passengerCount');
                      }}
                      className={`group rounded-xl border text-start transition flex flex-col justify-between overflow-hidden ${
                        isDisabledForPassengers
                          ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-55 cursor-not-allowed'
                          : isSel
                          ? 'bg-[#0D1B2A] text-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37] cursor-pointer'
                          : 'bg-white border-[#EAE4D9] text-slate-800 hover:bg-slate-50 hover:border-[#D4AF37]/60 cursor-pointer'
                      }`}
                    >
                      <div className="w-full">
                        {/* Vehicle Photo */}
                        <div className="relative h-32 sm:h-36 w-full bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] overflow-hidden">
                          {v.imageUrl ? (
                            <img
                              src={v.imageUrl}
                              alt={displayName}
                              loading="lazy"
                              className={`w-full h-full object-cover transition duration-500 ${
                                isDisabledForPassengers ? 'grayscale' : 'group-hover:scale-105'
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-3 text-center">
                              <Car className="w-9 h-9 text-[#D4AF37]" />
                              <span className="text-xs font-bold text-white">{displayName}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                          {isSel && !isDisabledForPassengers && (
                            <span className="absolute top-2 end-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black shadow-xs">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                          {isDisabledForPassengers && (
                            <span className="absolute top-2 end-2 px-2 py-0.5 rounded bg-rose-700/90 text-white text-[10px] font-bold">
                              {language === 'ru' ? 'До 4 пасс.' : language === 'ar' ? 'حتى 4 أفراد فقط' : language === 'de' ? 'Max 4 Pers.' : 'Max 4 pax only'}
                            </span>
                          )}
                          {v.category && (
                            <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                              {v.category}
                            </span>
                          )}
                        </div>

                        {/* Vehicle Info */}
                        <div className="p-3.5 pb-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-xs font-bold ${isSel && !isDisabledForPassengers ? 'text-[#D4AF37]' : 'text-[#0D1B2A]'}`}>
                              {displayName}{v.modelYear ? ` (${v.modelYear})` : ''}
                            </span>
                            <Car className={`w-4 h-4 shrink-0 ${isSel && !isDisabledForPassengers ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                          </div>
                          {isDisabledForPassengers ? (
                            <p className="text-[11px] leading-snug text-rose-600 font-medium">
                              {language === 'ru'
                                ? 'Только для 1–4 пасс. — для 5–8 нужен Toyota Hiace'
                                : language === 'ar'
                                ? 'متاحة لـ 1–4 أفراد فقط — من 5 إلى 8 أفراد متاح مع Toyota Hiace فقط'
                                : language === 'de'
                                ? 'Nur für 1–4 Personen — 5–8 Personen nur mit Toyota Hiace'
                                : '1–4 pax only — 5–8 passengers require Toyota Hiace'}
                            </p>
                          ) : displayDesc ? (
                            <p className={`text-[11px] leading-snug line-clamp-2 ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                              {displayDesc}
                            </p>
                          ) : (
                            <p className={`text-[11px] leading-snug ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                              {isHiace
                                ? (language === 'ru' ? 'Вместимость до 8 пассажиров' : language === 'ar' ? 'متاحة حتى 8 أفراد (حد أقصى 8)' : language === 'de' ? 'Bis zu 8 Personen möglich' : 'Supports up to 8 passengers')
                                : t('booking.specsEditable')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`mx-3.5 mb-3.5 mt-1 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                        isSel && !isDisabledForPassengers ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isHiace ? (
                            <span>{language === 'ru' ? 'Макс. 8 пасс.' : language === 'ar' ? 'حد أقصى 8 أفراد' : language === 'de' ? 'Max 8 Pers.' : 'Max 8 pax'}</span>
                          ) : (
                            v.capacityPassengers != null && (
                              <span>
                                {language === 'ru' ? `До ${v.capacityPassengers} пасс.` : language === 'ar' ? `حتى ${v.capacityPassengers} أفراد` : language === 'de' ? `Bis ${v.capacityPassengers} Pers.` : `Up to ${v.capacityPassengers} pax`}
                              </span>
                            )
                          )}
                          {v.capacityLuggage != null && (
                            <span>• {v.capacityLuggage} {language === 'ru' ? 'багаж' : language === 'ar' ? 'حقائب' : language === 'de' ? 'Gepäck' : 'bags'}</span>
                          )}
                        </div>
                        {bookingMode === 'custom_route' && vehPrice && (
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            isSel && !isDisabledForPassengers
                              ? 'bg-[#D4AF37] text-[#0D1B2A]'
                              : vehPrice.isPriceOnRequest
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-50 text-[#0D1B2A] border border-amber-200'
                          }`}>
                            {!vehPrice.isPriceOnRequest && vehPrice.amount
                              ? `${vehPrice.amount} ${vehPrice.currency}`
                              : t('booking.priceOnRequest')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Route + Vehicle Live Quote Bar */}
              {bookingMode === 'custom_route' && (() => {
                const quote = resolveTransferPrice(origin, destination, vehicleType, tripType, pricingRules);
                const selectedVehName = resolveVehicleDisplayName(vehicleType, vehicles, language);
                return (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#FAF7EE] border border-[#D4AF37]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        {t('booking.estimatedPrice')} ({selectedVehName})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {tripType === 'round_trip' ? t('booking.roundTrip') : t('booking.oneWay')}
                      </span>
                    </div>
                    <span className="font-black text-sm text-[#0D1B2A] bg-white px-3 py-1 rounded-lg border border-[#D4AF37]/40">
                      {!quote.isPriceOnRequest && quote.amount
                        ? `${quote.amount} ${quote.currency}`
                        : t('booking.priceOnRequest')}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] hover:brightness-110 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>{t('booking.nextToCustomer')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: CUSTOMER DETAILS */}
      {currentStep === 2 && (
        <form onSubmit={handleNextToReview} className="space-y-6">
          {/* Honeypot field - invisible to human users */}
          <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <label htmlFor="company_website_url">Do not fill this</label>
            <input
              type="text"
              id="company_website_url"
              name="company_website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('booking.personalInfo')}</span>
            </h4>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t('booking.name')} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  clearError('customerName');
                }}
                placeholder={t('booking.namePlaceholder')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                  errors.customerName ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                }`}
              />
              {errors.customerName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('booking.email')} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  placeholder={t('booking.emailPlaceholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.email ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('booking.phone')} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError('phone');
                  }}
                  placeholder={t('booking.phonePlaceholder')}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.phone}
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {language === 'ru'
                    ? 'Желательно с WhatsApp для быстрой координации.'
                    : language === 'ar'
                    ? 'يفضل رقم عليه واتساب لتسهيل التنسيق.'
                    : language === 'de'
                    ? 'Bevorzugt für WhatsApp-Koordination.'
                    : 'Preferred for WhatsApp coordination.'}
                </span>
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('booking.nationality')}
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder={t('booking.nationalityPlaceholder')}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('booking.notes')}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('booking.notesPlaceholder')}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setCurrentStep(1);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t('booking.backToTrip')}</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] hover:brightness-110 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>{t('booking.nextToReview')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: REVIEW & CONFIRM */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-lg p-6 space-y-6">
            <div className="border-b border-[#EAE4D9] pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold font-heading text-[#0D1B2A]">
                  {t('booking.reviewTitle')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('booking.reviewSubtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37] text-xs font-bold text-[#0D1B2A] hover:bg-[#F8F5EE] transition cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('booking.editDetails')}</span>
              </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FBF9F5] p-5 rounded-xl border border-[#EAE4D9] text-xs">
              {/* Route */}
              <div className="md:col-span-2 pb-3 border-b border-[#EAE4D9]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {language === 'ru' ? 'Маршрут и услуга' : language === 'ar' ? 'المسار والخدمة' : language === 'de' ? 'Route & Service' : 'Route & Service'}
                </span>
                <div className="text-base font-bold text-[#0D1B2A] flex items-center gap-2 flex-wrap">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{origin}</span>
                  <span className="text-[#D4AF37]">➔</span>
                  <span>{destination}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('booking.serviceType')}:{' '}
                  <span className="font-semibold text-slate-800">
                    {serviceType === 'airport_pickup'
                      ? t('booking.serviceTypePickup')
                      : serviceType === 'airport_dropoff'
                      ? t('booking.serviceTypeDropoff')
                      : serviceType === 'private_transfer'
                      ? t('booking.serviceTypePrivate')
                      : serviceType === 'intercity'
                      ? t('booking.serviceTypeIntercity')
                      : t('booking.readyMadeTour')}
                  </span>{' '}
                  • {t('booking.tripType')}:{' '}
                  <span className="font-semibold text-slate-800">
                    {tripType === 'round_trip' ? t('booking.roundTrip') : t('booking.oneWay')}
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {language === 'ru' ? 'Дата и время подачи' : language === 'ar' ? 'موعد التحرك' : language === 'de' ? 'Abholzeitpunkt' : 'Pickup Schedule'}
                </span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {pickupDate} {language === 'ru' ? 'в' : language === 'ar' ? 'الساعة' : language === 'de' ? 'um' : 'at'} {pickupTime}
                  </span>
                </div>
              </div>

              {/* Round Trip Return if applicable */}
              {tripType === 'round_trip' && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
                    {language === 'ru' ? 'Расписание возвращения' : language === 'ar' ? 'موعد العودة' : language === 'de' ? 'Rückfahrt' : 'Return Schedule'}
                  </span>
                  <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>
                      {returnDate} {language === 'ru' ? 'в' : language === 'ar' ? 'الساعة' : language === 'de' ? 'um' : 'at'} {returnTime}
                    </span>
                  </div>
                </div>
              )}

              {/* Passengers, Vehicle & Quoted Price */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {language === 'ru' ? 'Пассажиры и автомобиль' : language === 'ar' ? 'الركاب والسيارة' : language === 'de' ? 'Passagiere & Fahrzeug' : 'Passengers & Vehicle'}
                </span>
                <div className="flex items-start gap-3">
                  {(() => {
                    const selectedVehObj = vehicles.find((v) => v.id === vehicleType);
                    if (!selectedVehObj?.imageUrl) return null;
                    return (
                      <img
                        src={selectedVehObj.imageUrl}
                        alt={resolveVehicleDisplayName(vehicleType, vehicles, language)}
                        className="w-16 h-12 rounded-lg object-cover border border-[#EAE4D9] shrink-0"
                      />
                    );
                  })()}
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {passengerCount}{' '}
                      {language === 'ru'
                        ? `пасс. (макс. ${vehicleType === 'toyota_hiace' ? 8 : 4}) • ${luggageCount} багаж`
                        : language === 'ar'
                        ? `أفراد (حد أقصى ${vehicleType === 'toyota_hiace' ? 8 : 4}) • ${luggageCount} حقائب`
                        : language === 'de'
                        ? `Pers. (Max ${vehicleType === 'toyota_hiace' ? 8 : 4}) • ${luggageCount} Gepäck`
                        : `Passengers (Max ${vehicleType === 'toyota_hiace' ? 8 : 4}) • ${luggageCount} Luggage`}
                    </div>
                    <div className="text-xs text-[#0D1B2A] font-semibold mt-0.5">
                      {t('booking.vehicleChoice')}: {resolveVehicleDisplayName(vehicleType, vehicles, language)}
                    </div>
                    <div className="text-xs text-[#D4AF37] font-bold mt-1">
                      {t('booking.priceLabel')}:{' '}
                      {(() => {
                        if (bookingMode === 'ready_tour') {
                          const chosenTour = tours.find((tr) => tr.id === selectedTourId);
                          return chosenTour && typeof chosenTour.pricePerPerson === 'number' && chosenTour.pricePerPerson > 0
                            ? `${chosenTour.pricePerPerson} EUR / ${t('tours.perPerson')}`
                            : t('booking.priceOnRequest');
                        }
                        const quote = resolveTransferPrice(origin, destination, vehicleType, tripType, pricingRules);
                        return !quote.isPriceOnRequest && quote.amount
                          ? `${quote.amount} ${quote.currency}`
                          : t('booking.priceOnRequest');
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Contact */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {t('booking.personalInfo')}
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {customerName}
                </div>
                <div className="text-xs text-slate-600 mt-0.5" dir="ltr">
                  {phone} • {email}
                </div>
                {nationality && (
                  <div className="text-[11px] text-slate-500">
                    {t('booking.nationality')}: {nationality}
                  </div>
                )}
              </div>

              {/* Flight details */}
              {flightNumber && (
                <div className="md:col-span-2 pt-2 border-t border-[#EAE4D9]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {t('booking.flightDetails')}
                  </span>
                  <div className="font-semibold text-slate-800" dir="ltr">
                    {language === 'ru' ? 'Рейс' : 'Flight'} {flightNumber} {airline ? `(${airline})` : ''} {flightTime ? `• ${flightTime}` : ''}
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div className="md:col-span-2 pt-2 border-t border-[#EAE4D9]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {t('booking.notes')}
                  </span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-[#EAE4D9]">
                    {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Policy & Payment Notice */}
            <div className="bg-[#0D1B2A]/5 border border-[#D4AF37]/50 rounded-xl p-3.5 text-xs text-[#0D1B2A] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>{t('booking.notice')}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t('booking.editDetails')}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBooking}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] hover:brightness-110 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>{t('booking.submitting')}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('booking.confirmBooking')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Location Picker Modal (Lazy Loaded) */}
      {mapPickerOpen && (
        <Suspense fallback={null}>
          <MapLocationPicker
            isOpen={mapPickerOpen}
            onClose={() => setMapPickerOpen(false)}
            initialLocation={mapPickerTarget === 'pickup' ? pickupLocation : destinationLocation}
            defaultType={mapPickerTarget}
            onSelectLocation={handleLocationPicked}
          />
        </Suspense>
      )}
    </div>
  );
};
