import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createBooking } from '../services/bookingService';
import { Booking, ServiceType, TripType, FlightDirection, LocationDetails } from '../types';
import { INITIAL_VEHICLES, INITIAL_TOURS, POPULAR_LOCATIONS } from '../data/initialData';
import { MapLocationPicker } from './MapLocationPicker';
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
  Mail, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Compass,
  Edit,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Phone,
  User,
  Globe,
  FileText,
  RotateCcw
} from 'lucide-react';

interface BookingFormProps {
  initialServiceType?: ServiceType;
  initialTourId?: string;
  initialTourTitle?: string;
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
  onTrackBooking?: (reference: string) => void;
  isModal?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialServiceType = 'airport_pickup',
  initialTourId,
  initialTourTitle,
  onSuccess,
  onCancel,
  onTrackBooking,
  isModal = false,
}) => {
  const { t, language, direction } = useLanguage();

  // Wizard Step: 1 (Trip) | 2 (Customer) | 3 (Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Mode: Ready-Made Tour vs Custom / Airport / Transfer
  const [bookingMode, setBookingMode] = useState<'ready_tour' | 'custom_route'>(
    initialTourId || initialTourTitle ? 'ready_tour' : 'custom_route'
  );

  // STEP 1 STATE: Trip Details
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [selectedTourId, setSelectedTourId] = useState<string>(initialTourId || (INITIAL_TOURS[0]?.id ?? ''));

  const [origin, setOrigin] = useState<string>(
    initialServiceType === 'airport_pickup' ? 'Hurghada International Airport (HRG)' : 'Hurghada Hotel / Resort'
  );
  const [destination, setDestination] = useState<string>(
    initialTourTitle ? initialTourTitle : 'El Gouna / Hurghada Hotel'
  );

  const [pickupLocation, setPickupLocation] = useState<LocationDetails | undefined>(() => {
    if (initialServiceType === 'airport_pickup') {
      return {
        name: 'Hurghada International Airport (HRG) Terminal 1',
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

  // Flight Information (For airport pickup/dropoff)
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDirection, setFlightDirection] = useState<FlightDirection>(
    initialServiceType === 'airport_dropoff' ? 'departure' : 'arrival'
  );
  const [flightTime, setFlightTime] = useState('');

  // Passengers & Vehicle
  const [passengerCount, setPassengerCount] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);
  const [vehicleType, setVehicleType] = useState('luxury_sedan');

  // STEP 2 STATE: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [notes, setNotes] = useState('');

  // Map Picker Modal state
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'pickup' | 'destination'>('pickup');

  // Validation Errors (Field-level inline errors)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Submission Status
  const [loading, setLoading] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // Clear single error when user modifies field
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // When tour changes in ready_tour mode
  const handleTourSelection = (tourId: string) => {
    setSelectedTourId(tourId);
    const tourObj = INITIAL_TOURS.find((tr) => tr.id === tourId);
    if (tourObj) {
      setDestination(tourObj.title);
      setDestinationLocation({
        name: tourObj.title,
        address: `${tourObj.destination}, Egypt`,
      });
    }
  };

  // Open map picker for pickup or destination
  const handleOpenMapPicker = (target: 'pickup' | 'destination') => {
    setMapPickerTarget(target);
    setMapPickerOpen(true);
  };

  // Callback when location selected from map
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

  // STEP 1 VALIDATION -> Advance to Step 2
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
    }
    if (!pickupTime) {
      newErrors.pickupTime = t('booking.valTime');
    }
    if (passengerCount < 1) {
      newErrors.passengerCount = t('booking.valPassengers');
    }
    if (tripType === 'round_trip') {
      if (!returnDate) {
        newErrors.returnDate = t('booking.valReturnDate');
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

  // STEP 2 VALIDATION -> Advance to Step 3 (Review)
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

  // STEP 3 FINAL SUBMIT -> Firestore
  const handleConfirmBooking = async () => {
    setGeneralError(null);
    setLoading(true);

    try {
      const selectedTourObj = bookingMode === 'ready_tour' ? INITIAL_TOURS.find((t) => t.id === selectedTourId) : undefined;
      const resolvedTourTitle = selectedTourObj ? selectedTourObj.title : (initialTourTitle || undefined);

      const notesCombined = [
        notes.trim(),
        tripType === 'round_trip' ? `[Round Trip Return: ${returnDate} at ${returnTime}]` : '',
      ].filter(Boolean).join('\n');

      const created = await createBooking({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        nationality: nationality.trim() || 'International',
        passengerCount: Math.max(1, Math.round(Number(passengerCount) || 1)),
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
        tourId: bookingMode === 'ready_tour' ? selectedTourId : undefined,
        tourTitle: resolvedTourTitle,
        notes: notesCombined || undefined,
        adminNotes: '',
      });

      setSubmittedBooking(created);
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: unknown) {
      console.error('Booking submission error details:', err);
      setGeneralError(
        'Could not save booking request. Please check your network or contact dispatch directly on WhatsApp for immediate confirmation.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy reference code with feedback
  const handleCopyReference = () => {
    if (submittedBooking?.bookingReference) {
      navigator.clipboard.writeText(submittedBooking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Reset form for a fresh booking
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
    const waText = encodeURIComponent(
      `Hello PEGASUS Hurghada! I have submitted a booking request with reference ${submittedBooking.bookingReference}.\n` +
      `Name: ${submittedBooking.customerName}\n` +
      `Date: ${submittedBooking.pickupDate} at ${submittedBooking.pickupTime}\n` +
      `Route: ${submittedBooking.origin} -> ${submittedBooking.destination}\n` +
      `Passengers: ${submittedBooking.passengerCount} | Vehicle: ${submittedBooking.vehicleType}\n` +
      `Please confirm my reservation.`
    );

    return (
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/60 p-6 md:p-8 shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200" dir={direction}>
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
        <div className="bg-[#FBF9F5] rounded-xl border-2 border-dashed border-[#D4AF37] p-5 mb-6 text-left rtl:text-right">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE4D9] pb-3 mb-3">
            <div>
              <span className="text-[11px] uppercase text-slate-400 font-bold block">{t('success.ref')}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0D1B2A] tracking-wider">
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
              PEGASUS VIP
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
              <span className="font-semibold text-slate-900">{submittedBooking.passengerCount} Pers.</span>
            </div>
            <div>
              <span className="text-slate-400">{t('booking.vehicleChoice')}:</span>{' '}
              <span className="font-semibold text-slate-900 capitalize">{submittedBooking.vehicleType.replace('_', ' ')}</span>
            </div>
            {submittedBooking.tripType && (
              <div>
                <span className="text-slate-400">{t('booking.tripType')}:</span>{' '}
                <span className="font-semibold text-slate-900 capitalize">{submittedBooking.tripType.replace('_', ' ')}</span>
              </div>
            )}
            {submittedBooking.flightNumber && (
              <div>
                <span className="text-slate-400">{t('booking.flightNumber')}:</span>{' '}
                <span className="font-semibold text-slate-900">{submittedBooking.flightNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notice to save reference */}
        <div className="bg-[#0D1B2A]/5 border border-[#D4AF37]/50 rounded-xl p-3.5 mb-6 text-xs text-[#0D1B2A] flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="font-bold">
            {t('booking.saveRefNotice')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onTrackBooking && (
            <button
              type="button"
              onClick={() => onTrackBooking(submittedBooking.bookingReference)}
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
            href={`https://wa.me/201000000000?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{t('booking.contactUs')}</span>
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
          {/* Step 1 */}
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

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              // Only allow clicking step 2 if step 1 has origin and destination
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

          {/* Step 3 */}
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

      {/* Global alert error if any */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* ========================================================
          STEP 1: TRIP DETAILS
      ======================================================== */}
      {currentStep === 1 && (
        <form onSubmit={handleNextToCustomer} className="space-y-6">
          {/* Service Category Selection */}
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
                  const firstTour = INITIAL_TOURS[0];
                  if (firstTour) {
                    setSelectedTourId(firstTour.id);
                    setDestination(firstTour.title);
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

            {/* If ready_tour mode: tour dropdown */}
            {bookingMode === 'ready_tour' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Tour / Excursion Package:
                </label>
                <select
                  value={selectedTourId}
                  onChange={(e) => handleTourSelection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-bold text-[#0D1B2A] bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  {INITIAL_TOURS.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.title} ({tour.duration}) • {tour.destination}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Type Pills (Airport Pickup / Dropoff / Private / Intercity) */}
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
              <div className="flex items-center gap-3">
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
              <span>Route & Locations</span>
            </h4>

            {/* Origin / Pickup Field */}
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

              <div className="relative">
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    clearError('origin');
                  }}
                  placeholder="e.g. Hurghada Airport (HRG) or Hotel Name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.origin
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                />
              </div>
              {errors.origin && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {errors.origin}
                </p>
              )}
            </div>

            {/* Destination Field */}
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

              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    clearError('destination');
                  }}
                  placeholder="e.g. Steigenberger ALDAU / El Gouna / Luxor"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-hidden ${
                    errors.destination
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : 'border-[#D5CDBD] focus:border-[#D4AF37]'
                  }`}
                />
              </div>
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
                Popular Red Sea Destinations (Click to auto-fill):
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

          {/* Popular Places Outside Map (Category Tabs & Cards) */}
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

          {/* Date, Time & Round Trip Timing */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Schedule & Date</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('booking.date')} *
                </label>
                <input
                  type="date"
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

            {/* Conditional Round Trip Fields */}
            {tripType === 'round_trip' && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Return Journey Details (Round Trip)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('booking.returnDate')} *
                    </label>
                    <input
                      type="date"
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

          {/* Conditional Flight Details (For Airport Transfers) */}
          {(serviceType === 'airport_pickup' || serviceType === 'airport_dropoff') && (
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('booking.flightDetails')}</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  Enables live radar delay adjustment
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
                    placeholder="e.g. Condor, EgyptAir, Edelweiss"
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
                    placeholder="e.g. 14:35 Landing"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passengers, Luggage & Vehicle Category */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>Passengers & Vehicle</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('booking.passengersCount')} *</span>
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => {
                    setPassengerCount(Number(e.target.value));
                    clearError('passengerCount');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBD] text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'Passengers'}
                    </option>
                  ))}
                </select>
                {errors.passengerCount && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.passengerCount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('booking.luggageCount')}</span>
                </label>
                <select
                  value={luggageCount}
                  onChange={(e) => setLuggageCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBD] text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 8, 10, 15].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Piece' : 'Bags / Suitcases'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Options Cards */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                {t('booking.vehicleChoice')}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INITIAL_VEHICLES.map((v) => {
                  const isSel = vehicleType === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id)}
                      className={`p-3 rounded-xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'bg-[#0D1B2A] text-white border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]'
                          : 'bg-white border-[#EAE4D9] text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSel ? 'text-[#D4AF37]' : 'text-[#0D1B2A]'}`}>
                            {language === 'ar' ? v.nameAr : language === 'de' ? v.nameDe : v.name}
                          </span>
                          <Car className={`w-4 h-4 ${isSel ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                        </div>
                        <p className={`text-[11px] leading-snug line-clamp-2 ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                          {v.description}
                        </p>
                      </div>
                      <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                        isSel ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-500'
                      }`}>
                        <span>Up to {v.capacityPassengers} pax</span>
                        <span>{v.capacityLuggage} bags</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}

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

      {/* ========================================================
          STEP 2: CUSTOMER DETAILS
      ======================================================== */}
      {currentStep === 2 && (
        <form onSubmit={handleNextToReview} className="space-y-6">
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
              <div className="relative">
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
              </div>
              {errors.customerName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('booking.email')} *
                </label>
                <div className="relative">
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
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Used for verification & instant tracking access.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('booking.phone')} *
                </label>
                <div className="relative">
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
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.phone}
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Preferred for WhatsApp driver coordination.
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

      {/* ========================================================
          STEP 3: REVIEW & CONFIRM
      ======================================================== */}
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
                  Route & Service
                </span>
                <div className="text-base font-bold text-[#0D1B2A] flex items-center gap-2 flex-wrap">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{origin}</span>
                  <span className="text-[#D4AF37]">➔</span>
                  <span>{destination}</span>
                </div>
                <div className="text-xs text-slate-500 capitalize mt-1">
                  Service: <span className="font-semibold text-slate-800">{serviceType.replace('_', ' ')}</span> • Trip: <span className="font-semibold text-slate-800">{tripType.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Pickup Schedule
                </span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{pickupDate} at {pickupTime}</span>
                </div>
              </div>

              {/* Round Trip Return if applicable */}
              {tripType === 'round_trip' && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
                    Return Schedule
                  </span>
                  <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>{returnDate} at {returnTime}</span>
                  </div>
                </div>
              )}

              {/* Passengers & Vehicle */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Passengers & Vehicle
                </span>
                <div className="font-bold text-slate-900 text-sm capitalize">
                  {passengerCount} Passengers • {luggageCount} Luggage
                </div>
                <div className="text-xs text-[#D4AF37] font-semibold mt-0.5 capitalize">
                  Vehicle: {vehicleType.replace('_', ' ')}
                </div>
              </div>

              {/* Customer Contact */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Customer & Contact
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {customerName}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {phone} • {email}
                </div>
                {nationality && (
                  <div className="text-[11px] text-slate-500">
                    Nationality: {nationality}
                  </div>
                )}
              </div>

              {/* Flight details if present */}
              {flightNumber && (
                <div className="md:col-span-2 pt-2 border-t border-[#EAE4D9]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Flight Information
                  </span>
                  <div className="font-semibold text-slate-800">
                    Flight {flightNumber} {airline ? `(${airline})` : ''} {flightTime ? `• ${flightTime}` : ''}
                  </div>
                </div>
              )}

              {/* Notes if present */}
              {notes && (
                <div className="md:col-span-2 pt-2 border-t border-[#EAE4D9]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Special Notes / Instructions
                  </span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-[#EAE4D9]">
                    {notes}
                  </p>
                </div>
              )}
            </div>

            {/* Price policy notice */}
            <div className="bg-[#0D1B2A]/5 border border-[#D4AF37]/50 rounded-xl p-3.5 text-xs text-[#0D1B2A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('booking.notice')}</span>
            </div>

            {/* Actions: Edit vs Confirm */}
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

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialLocation={mapPickerTarget === 'pickup' ? pickupLocation : destinationLocation}
        defaultType={mapPickerTarget}
        onSelectLocation={handleLocationPicked}
        title={mapPickerTarget === 'pickup' ? 'Select Pickup Location' : 'Select Destination'}
      />
    </div>
  );
};
