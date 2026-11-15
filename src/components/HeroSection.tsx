import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Car, 
  Compass, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Plane,
  Sparkles,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/initialData';
import { getCompanySettings, subscribeToCompanySettings, getWhatsAppLink } from '../services/settingsService';

interface HeroSectionProps {
  onOpenBooking: (serviceType?: string, preselectedTourId?: string, preselectedTourTitle?: string, initialPassengers?: number) => void;
  onExploreTours: () => void;
  onTrackBooking?: () => void;
  onOpenCustomTrip?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onExploreTours,
  onTrackBooking,
  onOpenCustomTrip,
}) => {
  const { t, direction, language } = useLanguage();
  const [companySettings, setCompanySettings] = useState(getCompanySettings());

  useEffect(() => {
    const unsub = subscribeToCompanySettings(setCompanySettings);
    return () => unsub();
  }, []);

  // Quick booking state
  const [serviceCategory, setServiceCategory] = useState<'airport' | 'tour' | 'custom'>('airport');
  const [directionType, setDirectionType] = useState<'arrival' | 'departure'>('arrival');
  const [selectedDestination, setSelectedDestination] = useState('El Gouna (All Resorts & Villas)');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(2);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (serviceCategory === 'custom') {
      if (onOpenCustomTrip) {
        onOpenCustomTrip();
      } else {
        onOpenBooking('custom_trip');
      }
      return;
    }

    if (serviceCategory === 'tour') {
      onExploreTours();
      return;
    }

    // Airport transfer: route according to direction
    const bookingType = directionType === 'arrival' ? 'airport_pickup' : 'airport_dropoff';
    onOpenBooking(bookingType, undefined, undefined, passengers);
  };

  return (
    <section className="relative bg-[#0D1B2A] text-white overflow-hidden border-b border-[#D4AF37]/20" dir={direction}>
      {/* Luxury background with crystal-clear high-definition Red Sea scenery */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/hurghada.jpg"
          alt={language === 'ar' ? 'ساحل البحر الأحمر بالغردقة' : language === 'ru' ? 'Побережье Красного моря в Хургаде' : 'Hurghada Red Sea Crystal Clear Coast'}
          loading="eager"
          className="w-full h-full object-cover opacity-85 filter contrast-[1.08] saturate-[1.2] brightness-[1.05] animate-hero-pan"
        />
        {/* Directional gradient to maintain text legibility while keeping the sea scene crystal-clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071728]/95 via-[#071728]/65 to-transparent rtl:bg-gradient-to-l rtl:from-[#071728]/95 rtl:via-[#071728]/65 rtl:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-transparent to-black/20" />
        
        {/* Subtle coastal waterline glow */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#0D1B2A] to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Description & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Coastal luxury brand kicker with new emblem */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#D4AF37]/60 p-0.5 bg-[#0D1B2A] shadow-md animate-float-subtle">
                <img src="/logo.png" alt="PEGASUS" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00A8E8] animate-pulse" />
                <span>{language === 'ar' ? 'بيجاسوس توريزم • تجارب الغردقة والبحر الأحمر الفاخرة' : t('hero.badge')}</span>
              </div>
            </div>

            {/* Clear main title requested by user */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-[#FBF9F5] leading-[1.15]">
              {t('hero.title')}
            </h1>

            {/* Concise description */}
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Two primary action buttons requested by user */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking('airport_pickup')}
                className="btn-shimmer-wrap inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl gold-animated-gradient animate-soft-glow text-[#0D1B2A] font-black text-sm sm:text-base shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Car className="w-5 h-5 text-[#0D1B2A]" />
                <span>{t('hero.bookTransfer')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={onExploreTours}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FBF9F5] hover:text-[#D4AF37] border border-white/20 hover:border-[#D4AF37]/50 font-semibold text-sm sm:text-base backdrop-blur-xs transition cursor-pointer"
              >
                <Compass className="w-5 h-5 text-[#D4AF37]" />
                <span>{t('hero.exploreTours')}</span>
              </button>

              {/* Direct WhatsApp Concierge Button using dynamic company settings */}
              <a
                href={getWhatsAppLink(companySettings.whatsapp, 'Hello PEGASUS Hurghada, I would like to inquire about a private transfer')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs sm:text-sm font-semibold transition"
                title="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{t('hero.whatsappDirect')}</span>
              </a>
            </div>

            {/* Transparent Pricing Highlight Badge */}
            <div className="pt-1">
              <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D1B2A]/90 to-[#1B263B]/90 border border-[#D4AF37]/60 shadow-md backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'تسعير واضح وشفاف:' : language === 'de' ? 'Transparente Preise:' : language === 'ru' ? 'Прозрачные тарифы:' : 'Clear Transparent Pricing:'}</span>
                </span>
                <span className="text-xs text-white font-semibold">
                  {language === 'ar' 
                    ? 'تسعير التوصيل حسب المسار ونوع السيارة • عروض أسعار مخصصة للرحلات' 
                    : language === 'de'
                    ? 'Private Transfers nach Route & Fahrzeug • Individuelle Ausflugsanfragen'
                    : language === 'ru'
                    ? 'Трансферы по маршруту и классу авто • Персональный расчёт туров'
                    : 'Private transfers priced per Route & Vehicle • Bespoke tour quotes'}
                </span>
              </div>
            </div>

            {/* Authentic trust highlights (zero fake reviews or invented claims) */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Прямая координация на месте' : language === 'ar' ? 'تنسيق محلي مباشر في الغردقة' : language === 'de' ? 'Direkte Betreuung vor Ort' : 'Direct Local Coordination'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Встреча к плановому прилёту рейса' : language === 'ar' ? 'تنسيق الاستقبال حسب موعد الوصول' : language === 'de' ? 'Abholung nach Flugplan' : 'Scheduled Flight Arrival Coordination'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Оплата наличными при встрече' : language === 'ar' ? 'الدفع نقداً عند الوصول' : language === 'de' ? 'Barzahlung bei Ankunft' : 'Cash Payment Upon Arrival'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Booking Widget within the first fold */}
          <div className="lg:col-span-5">
            <div className="bg-[#FBF9F5] text-[#1A2332] rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/40 relative">
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold font-heading text-[#0D1B2A]">
                    {t('quick.title')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('quick.subtitle')}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#0D1B2A] text-[#D4AF37] flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
              </div>

              {/* Service Type Segmented Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('quick.serviceType')}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#EAE4D9]/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setServiceCategory('airport')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                      serviceCategory === 'airport'
                        ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                        : 'text-slate-700 hover:text-[#0D1B2A]'
                    }`}
                  >
                    {t('quick.airportTransfer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategory('tour')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                      serviceCategory === 'tour'
                        ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                        : 'text-slate-700 hover:text-[#0D1B2A]'
                    }`}
                  >
                    {t('quick.tour')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceCategory('custom')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                      serviceCategory === 'custom'
                        ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                        : 'text-slate-700 hover:text-[#0D1B2A]'
                    }`}
                  >
                    {t('quick.customTrip')}
                  </button>
                </div>
              </div>

              <form onSubmit={handleQuickSubmit} className="space-y-3.5 text-xs">
                
                {/* When Airport Transfer is selected: Direction selection */}
                {serviceCategory === 'airport' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('quick.direction')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDirectionType('arrival')}
                        className={`py-2 px-2.5 rounded-lg border text-[11px] font-medium text-center transition cursor-pointer ${
                          directionType === 'arrival'
                            ? 'border-[#0D1B2A] bg-[#0D1B2A] text-[#D4AF37]'
                            : 'border-[#D5CDBD] bg-white text-slate-700 hover:border-[#0D1B2A]'
                        }`}
                      >
                        {t('quick.airportToDestination')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectionType('departure')}
                        className={`py-2 px-2.5 rounded-lg border text-[11px] font-medium text-center transition cursor-pointer ${
                          directionType === 'departure'
                            ? 'border-[#0D1B2A] bg-[#0D1B2A] text-[#D4AF37]'
                            : 'border-[#D5CDBD] bg-white text-slate-700 hover:border-[#0D1B2A]'
                        }`}
                      >
                        {t('quick.destinationToAirport')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Location Picker */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {serviceCategory === 'tour' ? t('quick.tourSelection') : t('quick.location')}
                    </span>
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    {serviceCategory === 'tour' ? (
                      <>
                        <option value="Luxor Cultural Day Trip">
                          {language === 'ar' ? 'رحلة الأقصر الثقافية (وادي الملوك)' : language === 'de' ? 'Tagesausflug Luxor (Tal der Könige)' : language === 'ru' ? 'Луксор: культурный день (Долина Царей)' : 'Luxor Cultural Day Trip (Valley of the Kings)'}
                        </option>
                        <option value="Cairo & Giza Day Trip">
                          {language === 'ar' ? 'رحلة القاهرة وأهرامات الجيزة' : language === 'de' ? 'Tagesausflug Kairo & Pyramiden von Gizeh' : language === 'ru' ? 'Каир и пирамиды Гизы (однодневный тур)' : 'Cairo & Giza Pyramids Day Excursion'}
                        </option>
                        <option value="Marsa Alam Marine & Snorkeling">
                          {language === 'ar' ? 'رحلة مرسى علم البحرية والسنوركلنج' : language === 'de' ? 'Marsa Alam Boot & Schnorchelausflug' : language === 'ru' ? 'Марса-Алам: море и снорклинг' : 'Marsa Alam Marine & Snorkeling Excursion'}
                        </option>
                        <option value="Orange Bay & Giftun Island">
                          {language === 'ar' ? 'جزيرة الجفتون وخليج أورانج باي' : language === 'de' ? 'Orange Bay & Giftun-Insel Bootstour' : language === 'ru' ? 'Остров Гифтун и бухта Оранж-Бэй' : 'Orange Bay & Giftun Island Sea Trip'}
                        </option>
                        <option value="Desert Safari & Quad Adventure">
                          {language === 'ar' ? 'سفاري صحراء الغردقة والمغامرة بالبيتش باجي' : language === 'de' ? 'Hurghada Wüstensafari & Quad-Tour' : language === 'ru' ? 'Сафари в пустыне Хургады и квадроциклы' : 'Hurghada Desert Safari & Quad Adventure'}
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="El Gouna (All Resorts & Villas)">
                          {language === 'ar' ? 'الجونة (جميع المنتجعات والفيلات)' : language === 'de' ? 'El Gouna (Alle Resorts & Villen)' : language === 'ru' ? 'Эль-Гуна (все курорты и виллы)' : 'El Gouna (All Resorts & Villas)'}
                        </option>
                        <option value="Makadi Bay Resorts">
                          {language === 'ar' ? 'منتجعات مكادي باي' : language === 'de' ? 'Makadi Bay Resorts' : language === 'ru' ? 'Курорты Макади-Бэй' : 'Makadi Bay Resorts'}
                        </option>
                        <option value="Sahl Hasheesh Bay & Old Town">
                          {language === 'ar' ? 'خليج سهل حشيش والمدينة القديمة' : language === 'de' ? 'Sahl Hasheesh Bucht & Old Town' : language === 'ru' ? 'Сахль-Хашиш и Старый город' : 'Sahl Hasheesh Bay & Old Town'}
                        </option>
                        <option value="Soma Bay & Safaga Port">
                          {language === 'ar' ? 'سوما باي وميناء سفاجا' : language === 'de' ? 'Soma Bay & Hafen Safaga' : language === 'ru' ? 'Сома-Бэй и порт Сафага' : 'Soma Bay & Safaga Port'}
                        </option>
                        <option value="Hurghada City Hotels & Marina">
                          {language === 'ar' ? 'فنادق مدينة الغردقة والمارينا' : language === 'de' ? 'Hurghada Stadthotels & Marina' : language === 'ru' ? 'Отели Хургады и Марина' : 'Hurghada City Hotels & Marina'}
                        </option>
                        <option value="Port Ghalib & Marsa Alam">
                          {language === 'ar' ? 'بورت غالب ومرسى علم' : language === 'de' ? 'Port Ghalib & Marsa Alam' : language === 'ru' ? 'Порт-Галиб и Марса-Алам' : 'Port Ghalib & Marsa Alam'}
                        </option>
                        <option value="Luxor (Private Intercity)">
                          {language === 'ar' ? 'الأقصر (نقل خاص بين المدن)' : language === 'de' ? 'Luxor (Privater Überlandtransfer)' : language === 'ru' ? 'Луксор (частный междугородний)' : 'Luxor (Private Intercity)'}
                        </option>
                        <option value="Cairo / Giza (Private Intercity)">
                          {language === 'ar' ? 'القاهرة / الجيزة (نقل خاص بين المدن)' : language === 'de' ? 'Kairo / Gizeh (Privater Überlandtransfer)' : language === 'ru' ? 'Каир / Гиза (частный междугородний)' : 'Cairo / Giza (Private Intercity)'}
                        </option>
                        {POPULAR_LOCATIONS.map((loc, i) => (
                          <option key={i} value={loc}>{loc}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Date & Passenger row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('quick.date')}</span>
                    </label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('quick.passengers')}</span>
                    </label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                    >
                      <option value="1">{language === 'ar' ? '1 فرد' : language === 'de' ? '1 Person' : language === 'ru' ? '1 пассажир' : '1 Person'}</option>
                      <option value="2">{language === 'ar' ? '2 أفراد (خاص)' : language === 'de' ? '2 Personen (Privat)' : language === 'ru' ? '2 пассажира (Стандарт)' : '2 Persons (Standard Private)'}</option>
                      <option value="3">{language === 'ar' ? '3–4 أفراد (عائلي)' : language === 'de' ? '3–4 Personen (Familie)' : language === 'ru' ? '3–4 пассажира (Семейный)' : '3–4 Persons (Standard / Family)'}</option>
                      <option value="5">{language === 'ar' ? '5–8 أفراد (Toyota Hiace فقط)' : language === 'de' ? '5–8 Personen (Nur Toyota Hiace)' : language === 'ru' ? '5–8 пассажиров (Только Toyota Hiace)' : '5–8 Persons (Toyota Hiace Only)'}</option>
                    </select>
                  </div>
                </div>

                {/* Continue button linking directly to existing booking flow */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] hover:brightness-110 text-[#D4AF37] font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {serviceCategory === 'custom' ? (
                    <>
                      <Sliders className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('services.customTrip.btn')}</span>
                    </>
                  ) : serviceCategory === 'tour' ? (
                    <>
                      <Compass className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('services.toursExcursions.btn')}</span>
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('quick.continueBooking')}</span>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>

              {/* Informational reassurance */}
              <div className="mt-3.5 pt-3 border-t border-[#EAE4D9] flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{language === 'ru' ? 'Мгновенный код брони' : language === 'ar' ? 'رمز حجز فوري' : language === 'de' ? 'Sofortiger Referenzcode' : 'Instant reference code'}</span>
                </span>
                <span>{language === 'ru' ? 'Без предоплаты' : language === 'ar' ? 'بدون دفع مسبق' : language === 'de' ? 'Keine Vorauszahlung nötig' : 'No advance payment needed'}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
