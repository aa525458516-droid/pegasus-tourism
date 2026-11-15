import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createCustomTripRequest } from '../services/customTripService';
import { playBookingChime, getAdminCustomTripWhatsAppAlertUrl } from '../services/notificationService';
import { CustomTripRequest, SelectedExperience, ExperienceItem } from '../types';
import { INITIAL_EXPERIENCES } from '../data/experiencesData';
import { 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  Building, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Globe, 
  Plus, 
  Trash2, 
  ShieldCheck,
  Plane,
  Anchor,
  Car
} from 'lucide-react';

interface CustomTripBuilderPageProps {
  onTrackTrip?: (reference: string, contact?: string) => void;
  onExploreOther?: () => void;
}

export const CustomTripBuilderPage: React.FC<CustomTripBuilderPageProps> = ({
  onTrackTrip,
  onExploreOther,
}) => {
  const { t, language, direction } = useLanguage();
  const todayIso = new Date().toISOString().split('T')[0];

  // Wizard Step: 1 (Basics) | 2 (Experiences) | 3 (Customize) | 4 (Customer) | 5 (Review) | 6 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Trip Basics
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [passengerCount, setPassengerCount] = useState<number>(2); // 1 to 4 max
  const [pickup, setPickup] = useState('Hurghada International Airport (HRG)');
  const [accommodation, setAccommodation] = useState('Steigenberger ALDAU Beach Resort');
  const [destination, setDestination] = useState('El Gouna & Luxor');
  const [specialRequests, setSpecialRequests] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // STEP 2: Selected Experiences
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(['exp-airport-transfer', 'exp-quad-safari']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // STEP 3: Experience Customization (Date/Notes per selected experience)
  const [experienceDetails, setExperienceDetails] = useState<Record<string, { date: string; notes: string }>>({});

  // STEP 4: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Germany');

  // Submission & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedTrip, setSubmittedTrip] = useState<CustomTripRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: language === 'ru' ? 'Все активности' : language === 'ar' ? 'جميع الأنشطة' : language === 'de' ? 'Alle Aktivitäten' : 'All Experiences' },
    { id: 'safari_desert', label: language === 'ru' ? 'Сафари и пустыня' : language === 'ar' ? 'السفاري والصحراء' : language === 'de' ? 'Safari & Wüste' : 'Safari & Desert' },
    { id: 'kite_water', label: language === 'ru' ? 'Кайт и водный спорт' : language === 'ar' ? 'الكايت والرياضات المائية' : language === 'de' ? 'Kite & Wassersport' : 'Kite & Water' },
    { id: 'boat_trips', label: language === 'ru' ? 'Морские прогулки' : language === 'ar' ? 'الرحلات البحرية' : language === 'de' ? 'Bootstouren' : 'Boat Trips' },
    { id: 'sea_snorkeling', label: language === 'ru' ? 'Море и снорклинг' : language === 'ar' ? 'الغوص والسنوركلنج' : language === 'de' ? 'Meer & Schnorcheln' : 'Sea & Snorkeling' },
    { id: 'cultural_trips', label: language === 'ru' ? 'Культура и однодневные туры' : language === 'ar' ? 'الرحلات الثقافية' : language === 'de' ? 'Kultur & Ausflüge' : 'Cultural & Day Trips' },
    { id: 'transportation', label: language === 'ru' ? 'Транспорт и трансферы' : language === 'ar' ? 'النقل والتحويلات' : language === 'de' ? 'Transport & Transfers' : 'Transportation' },
  ];

  const getLocalizedExpTitle = (exp: ExperienceItem) => {
    if (language === 'ru') return exp.titleRu || exp.title;
    if (language === 'de') return exp.titleDe || exp.title;
    if (language === 'ar') return exp.titleAr || exp.title;
    return exp.title;
  };

  const getLocalizedExpDesc = (exp: ExperienceItem) => {
    if (language === 'ru') return exp.descriptionRu || exp.description;
    if (language === 'de') return exp.descriptionDe || exp.description;
    if (language === 'ar') return exp.descriptionAr || exp.description;
    return exp.description;
  };

  const toggleExperience = (id: string) => {
    if (selectedExpIds.includes(id)) {
      setSelectedExpIds(selectedExpIds.filter((x) => x !== id));
    } else {
      setSelectedExpIds([...selectedExpIds, id]);
      if (!experienceDetails[id]) {
        setExperienceDetails((prev) => ({
          ...prev,
          [id]: { date: startDate, notes: '' },
        }));
      }
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!startDate) {
      newErrors.startDate =
        language === 'ru'
          ? 'Укажите дату начала'
          : language === 'ar'
          ? 'تاريخ البداية مطلوب'
          : language === 'de'
          ? 'Startdatum ist erforderlich'
          : 'Start date is required';
    }
    if (startDate < todayIso) {
      newErrors.startDate =
        language === 'ru'
          ? 'Дата начала не может быть в прошлом'
          : language === 'ar'
          ? 'لا يمكن أن يكون تاريخ البداية في الماضي'
          : language === 'de'
          ? 'Startdatum darf nicht in der Vergangenheit liegen'
          : 'Start date cannot be in the past';
    }
    if (!pickup.trim()) newErrors.pickup = t('booking.valPickup');
    if (!accommodation.trim()) {
      newErrors.accommodation =
        language === 'ru'
          ? 'Укажите отель или место проживания'
          : language === 'ar'
          ? 'يرجى إدخال اسم الفندق أو مكان الإقامة'
          : language === 'de'
          ? 'Hotel / Unterkunft ist erforderlich'
          : 'Hotel / accommodation is required';
    }
    if (passengerCount < 1 || passengerCount > 4) newErrors.passengerCount = t('booking.valPassengers');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    if (selectedExpIds.length === 0) {
      setGeneralError(
        language === 'ru'
          ? 'Выберите хотя бы одну активность или трансфер для индивидуального тура.'
          : language === 'ar'
          ? 'يرجى اختيار نشاط واحد أو خدمة نقل على الأقل لرحلتك المخصصة.'
          : language === 'de'
          ? 'Bitte wählen Sie mindestens eine Aktivität oder einen Transfer für Ihre Reise aus.'
          : 'Please select at least one experience or transfer for your custom trip.'
      );
      return;
    }
    setGeneralError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) newErrors.customerName = t('booking.valName');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) newErrors.email = t('booking.valEmail');
    if (!phone.trim() || phone.replace(/\D/g, '').length < 6) newErrors.phone = t('booking.valPhone');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    if (honeypot.trim()) {
      return;
    }
    setLoading(true);
    setGeneralError(null);

    try {
      const formattedExperiences: SelectedExperience[] = selectedExpIds.map((id) => {
        const item = INITIAL_EXPERIENCES.find((e) => e.id === id);
        const details = experienceDetails[id];
        return {
          experienceId: id,
          title: item ? getLocalizedExpTitle(item) : id,
          category: item ? item.categoryId : 'general',
          date: details?.date || startDate,
          notes: details?.notes || '',
        };
      });

      const result = await createCustomTripRequest({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim() || 'International',
        startDate,
        endDate,
        passengerCount: Math.min(4, Math.max(1, passengerCount)),
        pickup: pickup.trim(),
        accommodation: accommodation.trim(),
        destination: destination.trim(),
        experiences: formattedExperiences,
        specialRequests: specialRequests.trim(),
      });

      setSubmittedTrip(result);
      playBookingChime();
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Custom trip submission error:', err);
      setGeneralError(
        language === 'ru'
          ? 'Не удалось отправить заявку. Проверьте интернет-соединение или свяжитесь с диспетчером в WhatsApp.'
          : language === 'ar'
          ? 'تعذر إرسال طلب الرحلة المخصصة. يرجى التحقق من الإنترنت أو التواصل عبر واتساب.'
          : language === 'de'
          ? 'Anfrage konnte nicht gesendet werden. Bitte prüfen Sie Ihre Verbindung oder kontaktieren Sie uns per WhatsApp.'
          : 'Could not submit custom trip request. Please check your network or contact dispatch on WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (submittedTrip?.referenceNumber) {
      navigator.clipboard.writeText(submittedTrip.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8" dir={direction}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'ru'
                ? 'Индивидуальный сервис PEGASUS'
                : language === 'ar'
                ? 'تجربة PEGASUS المخصصة'
                : language === 'de'
                ? 'PEGASUS Maßgeschneidertes Erlebnis'
                : 'PEGASUS Bespoke Experience'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1B2A] font-heading">
            {t('nav.buildTrip', 'Build Your Perfect Trip')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Объедините трансферы из аэропорта, сафари в пустыне, кайтсёрфинг, морские круизы и культурные экскурсии в единый персональный маршрут. Наша команда рассмотрит заявку и рассчитает для вас лучшую цену.'
              : language === 'ar'
              ? 'اجمع بين انتقالات المطار وسفاري الصحراء والكايت والرحلات البحرية والجولات الثقافية في برنامج واحد مخصص. سيقوم فريقنا بمراجعته وحساب أفضل سعر لك.'
              : language === 'de'
              ? 'Kombinieren Sie Flughafentransfers, Wüstensafaris, Kitesurfen, Bootstouren und Kulturausflüge zu Ihrer Wunschroute. Unser Team prüft alles und erstellt Ihnen das beste Angebot.'
              : 'Combine airport transfers, desert safaris, kitesurfing, boat cruises, and cultural excursions into a single custom itinerary. Our team will review and calculate the best price for you.'}
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        {currentStep < 6 && (
          <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-2xl border border-[#EAE4D9] shadow-xs">
            {[
              { num: 1, label: language === 'ru' ? 'Основы' : language === 'ar' ? 'الأساسيات' : language === 'de' ? 'Basisdaten' : 'Basics' },
              { num: 2, label: language === 'ru' ? 'Активности' : language === 'ar' ? 'الأنشطة' : language === 'de' ? 'Aktivitäten' : 'Experiences' },
              { num: 3, label: language === 'ru' ? 'График' : language === 'ar' ? 'الجدول' : language === 'de' ? 'Zeitplan' : 'Schedule' },
              { num: 4, label: language === 'ru' ? 'Контакты' : language === 'ar' ? 'البيانات' : language === 'de' ? 'Kontakt' : 'Customer' },
              { num: 5, label: language === 'ru' ? 'Обзор' : language === 'ar' ? 'المراجعة' : language === 'de' ? 'Übersicht' : 'Review' },
            ].map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0D1B2A] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${isCurrent ? 'text-[#0D1B2A]' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {generalError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ========================================================
            STEP 1: TRIP BASICS
        ======================================================== */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Шаг 1 — Основы поездки и даты'
                  : language === 'ar'
                  ? 'الخطوة 1 — أساسيات الرحلة والمواعيد'
                  : language === 'de'
                  ? 'Schritt 1 — Reisedaten & Basisinfos'
                  : 'Step 1 — Trip Basics & Schedule'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'ru' ? 'Дата начала *' : language === 'ar' ? 'تاريخ البداية *' : language === 'de' ? 'Startdatum *' : 'Start Date *'}
                </label>
                <input
                  type="date"
                  min={todayIso}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.startDate && <p className="text-[11px] text-rose-600 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'ru' ? 'Дата окончания (прим.)' : language === 'ar' ? 'تاريخ الانتهاء (تقريبي)' : language === 'de' ? 'Enddatum (ca.)' : 'End Date (Approx.)'}
                </label>
                <input
                  type="date"
                  min={startDate || todayIso}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t('booking.passengersCount')}{' '}
                  <span className="text-[#D4AF37] font-semibold">
                    ({language === 'ru' ? 'Макс. 4 пассажира' : language === 'ar' ? 'حد أقصى 4 أفراد' : language === 'de' ? 'Max. 4 Passagiere' : 'Max 4 Passengers'})
                  </span>{' '}
                  *
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-bold text-[#0D1B2A] bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value={1}>
                    {language === 'ru' ? '1 пассажир (индивидуальный VIP)' : language === 'ar' ? '1 فرد (VIP خاص)' : language === 'de' ? '1 Person (Privat-VIP)' : '1 Passenger (Private VIP)'}
                  </option>
                  <option value={2}>
                    {language === 'ru' ? '2 пассажира (пара / дуэт)' : language === 'ar' ? '2 أفراد (ثنائي خاص)' : language === 'de' ? '2 Personen (Paar / Duo)' : '2 Passengers (Private Couple / Duo)'}
                  </option>
                  <option value={3}>
                    {language === 'ru' ? '3 пассажира (небольшая семья)' : language === 'ar' ? '3 أفراد (عائلة صغيرة)' : language === 'de' ? '3 Personen (Kleine Familie)' : '3 Passengers (Small Family)'}
                  </option>
                  <option value={4}>
                    {language === 'ru' ? '4 пассажира (макс. стандарт)' : language === 'ar' ? '4 أفراد (الحد الأقصى القياسي)' : language === 'de' ? '4 Personen (Standard-Maximum)' : '4 Passengers (Standard Family / Group Max)'}
                  </option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'ru'
                    ? 'Стандартные автомобили вмещают до 4 пассажиров с комфортным местом для багажа.'
                    : language === 'ar'
                    ? 'تتسع السيارات القياسية لما يصل إلى 4 ركاب مع مساحة مريحة للأمتعة.'
                    : language === 'de'
                    ? 'Standardfahrzeuge bieten Platz für bis zu 4 Passagiere und Gepäck.'
                    : 'Vehicle categories accommodate up to 4 passengers with comfortable luggage space.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('booking.pickupLocation')} *</label>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder={language === 'ru' ? 'Напр., Аэропорт Хургады (HRG) или отель' : 'e.g. Hurghada Airport (HRG) or Hotel'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.pickup && <p className="text-[11px] text-rose-600 mt-1">{errors.pickup}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'ru' ? 'Отель / место проживания *' : language === 'ar' ? 'الفندق / مكان الإقامة *' : language === 'de' ? 'Hotel / Unterkunft *' : 'Hotel / Accommodation *'}
                </label>
                <input
                  type="text"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                  placeholder={language === 'ru' ? 'Напр., Steigenberger ALDAU / курорт в Эль-Гуне' : 'e.g. Steigenberger ALDAU / El Gouna Resort'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.accommodation && <p className="text-[11px] text-rose-600 mt-1">{errors.accommodation}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'ru' ? 'Дополнительное направление' : language === 'ar' ? 'وجهة إضافية اختيارية' : language === 'de' ? 'Optionales Reiseziel' : 'Optional Target Destination'}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={language === 'ru' ? 'Напр., Луксор, Каир, Сахл-Хашиш' : 'e.g. Luxor, Cairo, Sahl Hasheesh'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {language === 'ru' ? 'Особые пожелания и примечания' : language === 'ar' ? 'متطلبات وملاحظات خاصة' : language === 'de' ? 'Besondere Wünsche & Hinweise' : 'Special Requirements & Notes'}
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder={
                  language === 'ru'
                    ? 'Детские кресла, пожелания по питанию или удобное время...'
                    : language === 'ar'
                    ? 'مقاعد أطفال، تفضيلات خاصة أو مواعيد محددة...'
                    : language === 'de'
                    ? 'Kindersitze, Verpflegungswünsche oder bevorzugte Zeiten...'
                    : 'Child safety seats, dietary preferences, or specific timing requirements...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#F0ECE1]">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>
                  {language === 'ru'
                    ? 'Выбрать активности'
                    : language === 'ar'
                    ? 'اختيار الأنشطة'
                    : language === 'de'
                    ? 'Aktivitäten auswählen'
                    : 'Select Experiences'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 2: SELECT EXPERIENCES
        ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
              <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D4AF37]" />
                <span>
                  {language === 'ru'
                    ? `Шаг 2 — Выберите активности (выбрано: ${selectedExpIds.length})`
                    : language === 'ar'
                    ? `الخطوة 2 — اختر الأنشطة (${selectedExpIds.length} مختارة)`
                    : language === 'de'
                    ? `Schritt 2 — Aktivitäten wählen (${selectedExpIds.length} gewählt)`
                    : `Step 2 — Choose Your Experiences (${selectedExpIds.length} Selected)`}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeCategoryFilter === cat.id
                        ? 'bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37]'
                        : 'bg-[#FBF9F5] text-slate-700 border border-[#EAE4D9] hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {INITIAL_EXPERIENCES.filter((exp) => exp.active && (activeCategoryFilter === 'all' || exp.categoryId === activeCategoryFilter)).map((exp) => {
                const isSelected = selectedExpIds.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => toggleExperience(exp.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#FDFBF7] shadow-sm ring-1 ring-[#D4AF37]'
                        : 'border-[#EAE4D9] bg-[#FBF9F5] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-2 py-0.5 rounded">
                          {exp.badge}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-[#0D1B2A] border-[#D4AF37] text-[#D4AF37]' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <h4 className="font-bold text-[#0D1B2A] text-sm mb-1">{getLocalizedExpTitle(exp)}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{getLocalizedExpDesc(exp)}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#EAE4D9] flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>
                        {isSelected
                          ? language === 'ru'
                            ? '✓ Добавлено в тур'
                            : language === 'ar'
                            ? '✓ تمت الإضافة للرحلة'
                            : language === 'de'
                            ? '✓ Zur Reise hinzugefügt'
                            : '✓ Added to Trip'
                          : language === 'ru'
                          ? '+ Нажмите, чтобы добавить'
                          : language === 'ar'
                          ? '+ اضغط للإضافة'
                          : language === 'de'
                          ? '+ Klicken zum Hinzufügen'
                          : '+ Click to Add'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ru' ? 'Назад' : language === 'ar' ? 'رجوع' : language === 'de' ? 'Zurück' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>
                  {language === 'ru'
                    ? `Настроить расписание (${selectedExpIds.length})`
                    : language === 'ar'
                    ? `تخصيص الجدول (${selectedExpIds.length})`
                    : language === 'de'
                    ? `Zeitplan festlegen (${selectedExpIds.length})`
                    : `Customize Schedule (${selectedExpIds.length})`}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: SCHEDULE & CUSTOMIZE SELECTED EXPERIENCES
        ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Шаг 3 — Расписание выбранных активностей'
                  : language === 'ar'
                  ? 'الخطوة 3 — جدولة وتخصيص الأنشطة المختارة'
                  : language === 'de'
                  ? 'Schritt 3 — Zeitplan für Ihre Aktivitäten'
                  : 'Step 3 — Schedule & Customize Your Selected Experiences'}
              </span>
            </h3>

            <p className="text-xs text-slate-600">
              {language === 'ru'
                ? 'Укажите желаемую дату или примечания для каждой выбранной активности вашего маршрута.'
                : language === 'ar'
                ? 'حدد التاريخ المفضل أو الملاحظات الخاصة لكل نشاط في برنامج رحلتك المخصصة.'
                : language === 'de'
                ? 'Legen Sie ein Wunschdatum oder Hinweise für jede ausgewählte Aktivität fest.'
                : 'Assign a preferred date or specific notes for each selected activity in your custom itinerary.'}
            </p>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {selectedExpIds.map((id, index) => {
                const exp = INITIAL_EXPERIENCES.find((e) => e.id === id);
                if (!exp) return null;
                const details = experienceDetails[id] || { date: startDate, notes: '' };

                return (
                  <div key={id} className="p-4 rounded-xl border border-[#EAE4D9] bg-[#FBF9F5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{getLocalizedExpTitle(exp)}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExperience(id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'ru' ? 'Удалить' : language === 'ar' ? 'إزالة' : language === 'de' ? 'Entfernen' : 'Remove'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ru' ? 'Дата активности' : language === 'ar' ? 'تاريخ النشاط' : language === 'de' ? 'Datum der Aktivität' : 'Activity Date'}
                        </label>
                        <input
                          type="date"
                          value={details.date}
                          onChange={(e) => setExperienceDetails({
                            ...experienceDetails,
                            [id]: { ...details, date: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'ru' ? 'Пожелания / время' : language === 'ar' ? 'ملاحظات / الوقت المفضل' : language === 'de' ? 'Hinweise / Uhrzeit' : 'Specific Notes / Time'}
                        </label>
                        <input
                          type="text"
                          value={details.notes}
                          onChange={(e) => setExperienceDetails({
                            ...experienceDetails,
                            [id]: { ...details, notes: e.target.value }
                          })}
                          placeholder={
                            language === 'ru'
                              ? 'Напр., Утренний выезд около 09:00'
                              : language === 'ar'
                              ? 'مثال: فترة صباحية حوالي 09:00 صباحاً'
                              : language === 'de'
                              ? 'z. B. Morgens gegen 09:00 Uhr'
                              : 'e.g. Morning session around 09:00 AM'
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ru' ? 'Назад' : language === 'ar' ? 'رجوع' : language === 'de' ? 'Zurück' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep3}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>{t('booking.nextToCustomer', 'Continue to Customer Details')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: CUSTOMER DETAILS
        ======================================================== */}
        {currentStep === 4 && (
          <form onSubmit={handleNextFromStep4} className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Honeypot anti-spam */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <label htmlFor="trip_company_website_url">Do not fill this</label>
              <input
                type="text"
                id="trip_company_website_url"
                name="trip_company_website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <User className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Шаг 4 — Контактные данные'
                  : language === 'ar'
                  ? 'الخطوة 4 — بيانات العميل'
                  : language === 'de'
                  ? 'Schritt 4 — Kundendaten'
                  : 'Step 4 — Customer Information'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('booking.name')} *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('booking.namePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.customerName && <p className="text-[11px] text-rose-600 mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('booking.email')} *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('booking.emailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                  dir="ltr"
                />
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('booking.phone')} *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('booking.phonePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                  dir="ltr"
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'ru' ? 'Страна / гражданство' : language === 'ar' ? 'الدولة / الجنسية' : language === 'de' ? 'Land / Nationalität' : 'Country / Nationality'}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('booking.nationalityPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ru' ? 'Назад' : language === 'ar' ? 'رجوع' : language === 'de' ? 'Zurück' : 'Back'}</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>
                  {language === 'ru'
                    ? 'Проверить заявку'
                    : language === 'ar'
                    ? 'مراجعة الرحلة المخصصة'
                    : language === 'de'
                    ? 'Wunschreise prüfen'
                    : 'Review Custom Trip'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 5: REVIEW & SUBMIT
        ======================================================== */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Шаг 5 — Проверьте ваш индивидуальный тур'
                  : language === 'ar'
                  ? 'الخطوة 5 — مراجعة طلب الرحلة المخصصة'
                  : language === 'de'
                  ? 'Schritt 5 — Anfrage überprüfen'
                  : 'Step 5 — Review Your Custom Trip Request'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FBF9F5] p-5 rounded-xl border border-[#EAE4D9] text-xs">
              <div className="space-y-2">
                <div><span className="font-semibold text-slate-500">{t('booking.name')}:</span> <strong className="text-slate-900">{customerName}</strong></div>
                <div><span className="font-semibold text-slate-500">{t('booking.email')}:</span> <strong className="text-slate-900">{email}</strong></div>
                <div><span className="font-semibold text-slate-500">{t('booking.phone')}:</span> <strong className="text-slate-900">{phone}</strong></div>
                <div><span className="font-semibold text-slate-500">{t('booking.nationality')}:</span> <strong className="text-slate-900">{country}</strong></div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-slate-500">
                    {language === 'ru' ? 'Даты поездки:' : language === 'ar' ? 'تواريخ الرحلة:' : language === 'de' ? 'Reisedaten:' : 'Trip Dates:'}
                  </span>{' '}
                  <strong className="text-slate-900">{startDate} — {endDate}</strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">{t('booking.passengersCount')}:</span>{' '}
                  <strong className="text-slate-900">{passengerCount}</strong>
                </div>
                <div><span className="font-semibold text-slate-500">{t('booking.pickupLocation')}:</span> <strong className="text-slate-900">{pickup}</strong></div>
                <div>
                  <span className="font-semibold text-slate-500">
                    {language === 'ru' ? 'Отель / проживание:' : language === 'ar' ? 'الإقامة:' : language === 'de' ? 'Unterkunft:' : 'Accommodation:'}
                  </span>{' '}
                  <strong className="text-slate-900">{accommodation}</strong>
                </div>
              </div>
            </div>

            {/* Selected Experiences List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-3">
                {language === 'ru'
                  ? `Выбранные активности (${selectedExpIds.length}):`
                  : language === 'ar'
                  ? `الأنشطة المختارة (${selectedExpIds.length}):`
                  : language === 'de'
                  ? `Ausgewählte Aktivitäten (${selectedExpIds.length}):`
                  : `Selected Experiences (${selectedExpIds.length}):`}
              </h4>
              <div className="space-y-2">
                {selectedExpIds.map((id) => {
                  const exp = INITIAL_EXPERIENCES.find((e) => e.id === id);
                  const details = experienceDetails[id];
                  return (
                    <div key={id} className="p-3 rounded-lg bg-white border border-[#EAE4D9] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#0D1B2A]">{exp ? getLocalizedExpTitle(exp) : id}</strong>
                        {details?.notes && (
                          <span className="block text-[11px] text-slate-500">
                            {language === 'ru' ? 'Примечание:' : language === 'ar' ? 'ملاحظة:' : 'Note:'} {details.notes}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[#D4AF37] bg-[#0D1B2A] px-2 py-0.5 rounded">
                        {details?.date || startDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {specialRequests && (
              <div className="p-3 rounded-lg bg-[#FBF9F5] border border-[#EAE4D9] text-xs">
                <span className="font-bold text-slate-700 block mb-1">{t('booking.notes')}:</span>
                <p className="text-slate-600">{specialRequests}</p>
              </div>
            )}

            {/* Pricing Notice & Official Benchmarks */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2">
              <div className="font-bold text-sm flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[#0D1B2A]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {language === 'ru'
                      ? 'Расчёт индивидуального тура'
                      : language === 'ar'
                      ? 'تسعير الرحلة المخصصة'
                      : language === 'de'
                      ? 'Angebot für Ihre Wunschreise'
                      : 'Custom Trip Quote'}
                  </span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-[11px] font-bold">
                  {language === 'ru'
                    ? 'Проверяется консьержем'
                    : language === 'ar'
                    ? 'قيد المراجعة من الإدارة'
                    : language === 'de'
                    ? 'Wird vom Concierge geprüft'
                    : 'Reviewed by Concierge'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {language === 'ru'
                  ? 'Наш консьерж рассчитает персональную стоимость на основе вашего маршрута и выбранных активностей.'
                  : language === 'ar'
                  ? 'يقوم فريق الإدارة بدراسة خط سيرك المخصص وتحديد السعر النهائي بناءً على الأنشطة المختارة والمسافات.'
                  : language === 'de'
                  ? 'Unser Concierge berechnet Ihren individuellen Gesamtpreis basierend auf Ihrer Wunschroute und Ihren ausgewählten Aktivitäten.'
                  : 'Our concierge calculates your personalized quote based on your custom destinations and selected experiences.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ru' ? 'Назад' : language === 'ar' ? 'رجوع' : language === 'de' ? 'Zurück' : 'Back'}</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] font-bold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 transition cursor-pointer disabled:opacity-50"
              >
                <span>
                  {loading
                    ? language === 'ru'
                      ? 'Отправка...'
                      : language === 'ar'
                      ? 'جاري الإرسال...'
                      : language === 'de'
                      ? 'Wird gesendet...'
                      : 'Submitting Request...'
                    : language === 'ru'
                    ? 'Отправить заявку'
                    : language === 'ar'
                    ? 'إرسال الطلب'
                    : language === 'de'
                    ? 'Anfrage absenden'
                    : 'Send Trip Request'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: SUCCESS CONFIRMATION SCREEN
        ======================================================== */}
        {currentStep === 6 && submittedTrip && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-10 text-center space-y-6 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-3 py-1 rounded-full">
                {language === 'ru'
                  ? 'Статус: Ожидает проверки'
                  : language === 'ar'
                  ? 'الحالة: قيد المراجعة'
                  : language === 'de'
                  ? 'Status: Prüfung ausstehend'
                  : 'Status: Pending Review'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] font-heading">
                {language === 'ru'
                  ? 'Заявка на индивидуальный тур получена!'
                  : language === 'ar'
                  ? 'تم استلام طلب رحلتك المخصصة!'
                  : language === 'de'
                  ? 'Anfrage für Wunschreise erhalten!'
                  : 'Custom Trip Request Received!'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
                {language === 'ru'
                  ? `Спасибо, ${submittedTrip.customerName}. Ваш индивидуальный маршрут отправлен диспетчеру PEGASUS. Мы проверим выбранные активности и вскоре свяжемся с вами с итоговой ценой.`
                  : language === 'ar'
                  ? `شكراً لك ${submittedTrip.customerName}. تم إرسال برنامج رحلتك المخصص إلى فريق بيجاسوس. سنقوم بدراسة الأنشطة المختارة والتواصل معك قريباً بالسعر النهائي.`
                  : language === 'de'
                  ? `Vielen Dank, ${submittedTrip.customerName}. Ihre individuelle Reiseroute wurde an PEGASUS übermittelt. Wir prüfen die Auswahl und melden uns zeitnah mit dem Gesamtpreis.`
                  : `Thank you, ${submittedTrip.customerName}. Your tailored trip itinerary has been submitted to PEGASUS dispatch. We will evaluate your selected experiences and contact you shortly with the final price.`}
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] max-w-md mx-auto flex items-center justify-between gap-3">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {language === 'ru'
                    ? 'Номер заявки на тур'
                    : language === 'ar'
                    ? 'الرقم المرجعي للرحلة'
                    : language === 'de'
                    ? 'Reise-Referenznummer'
                    : 'Trip Reference Number'}
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#0D1B2A]" dir="ltr">{submittedTrip.referenceNumber}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold hover:bg-[#1B263B] transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>
                  {copied
                    ? t('booking.copied')
                    : t('booking.copyRef')}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {onTrackTrip && (
                <button
                  type="button"
                  onClick={() => onTrackTrip(submittedTrip.referenceNumber, submittedTrip.email)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 hover:bg-[#1B263B] transition cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>
                    {language === 'ru'
                      ? 'Отследить заявку'
                      : language === 'ar'
                      ? 'تتبع طلب الرحلة'
                      : language === 'de'
                      ? 'Anfrage verfolgen'
                      : 'Track Trip Request'}
                  </span>
                </button>
              )}

              <a
                href={getAdminCustomTripWhatsAppAlertUrl(submittedTrip)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer-wrap inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm shadow-md transition"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>
                  {language === 'ru'
                    ? 'Отправить детали тура консьержу в WhatsApp'
                    : language === 'ar'
                    ? 'إرسال تفاصيل الرحلة للمشرف على واتساب للتسعير والتأكيد'
                    : language === 'de'
                    ? 'Reisedetails per WhatsApp an Concierge senden'
                    : 'Send Trip Details to Concierge on WhatsApp'}
                </span>
              </a>

              {onExploreOther && (
                <button
                  type="button"
                  onClick={onExploreOther}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#EAE4D9] text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>
                    {language === 'ru'
                      ? 'Вернуться на главную'
                      : language === 'ar'
                      ? 'العودة للرئيسية'
                      : language === 'de'
                      ? 'Zurück zur Startseite'
                      : 'Return to Home'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
