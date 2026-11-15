import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tour } from '../types';
import { subscribeToTours } from '../services/tourService';
import { getCompanySettings, getWhatsAppLink } from '../services/settingsService';
import { getSiteImage } from '../config/images';
import { 
  MapPin, 
  Clock, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  CheckCircle,
  Eye,
  MessageCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ToursSectionProps {
  onSelectTour: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
  onBuildCustomTrip?: () => void;
  showOnlyFeatured?: boolean;
}

export const ToursSection: React.FC<ToursSectionProps> = ({
  onSelectTour,
  onBookTour,
  onBuildCustomTrip,
  showOnlyFeatured = false,
}) => {
  const { t, language, direction } = useLanguage();
  const companySettings = getCompanySettings();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToTours((data) => {
      // Show tours from Firestore
      setTours(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: t('tours.all') },
    { id: 'safari', label: t('tours.safari', 'Safari & Desert') },
    { id: 'marine', label: t('tours.marine', 'Boat & Sea') },
    { id: 'kite', label: t('tours.kite', 'Kite & Water') },
    { id: 'historical', label: t('tours.historical', 'Cultural / Day Trips') },
  ];

  const filteredTours = tours
    .filter((tr) => (showOnlyFeatured ? tr.featured : true))
    .filter((tr) => (selectedCategory === 'all' ? true : tr.category === selectedCategory));

  const whatsappInquiryUrl = getWhatsAppLink(
    companySettings.whatsapp,
    'Hello PEGASUS! I am inquiring about custom tours and excursions in Hurghada.'
  );

  return (
    <section id="tours" className="py-16 md:py-24 bg-[#F5F1E9]/40 border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Готовые туры и впечатления'
                  : language === 'ar'
                  ? 'تجارب ورحلات جاهزة'
                  : language === 'de'
                  ? 'Fertige Ausflüge & Erlebnisse'
                  : 'Ready-Made Experiences'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-2">
              {t('tours.title')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              {t('tours.subtitle')}
            </p>
          </div>

          {/* Filter Pills */}
          {!showOnlyFeatured && tours.length > 0 && (
            <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-[#EAE4D9] self-start md:self-auto">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#F8F5EE]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#D4AF37]/60 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center mx-auto border border-amber-200">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-heading text-[#0D1B2A]">
                {t('tours.emptyTitle', 'No Scheduled Group Tours Currently Listed')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {t('tours.emptyDesc', 'You can build your customized day trip or contact our concierge directly on WhatsApp for custom arrangements.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onBuildCustomTrip && (
                <button
                  type="button"
                  onClick={onBuildCustomTrip}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] border border-[#D4AF37] font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('tours.buildCustomBtn', 'Build Your Perfect Trip')}</span>
                </button>
              )}

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:brightness-105 transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{t('tours.whatsappBtn', 'Inquire on WhatsApp')}</span>
              </a>
            </div>
          </div>
        )}

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => {
            const title = language === 'de' ? tour.titleDe : language === 'ar' ? tour.titleAr : language === 'ru' ? (tour.titleRu || tour.title) : tour.title;
            const desc = language === 'de' ? tour.descriptionDe : language === 'ar' ? tour.descriptionAr : language === 'ru' ? (tour.descriptionRu || tour.description) : tour.description;
            const highlights =
              language === 'de' && tour.highlightsDe?.length
                ? tour.highlightsDe
                : language === 'ar' && tour.highlightsAr?.length
                ? tour.highlightsAr
                : language === 'ru' && tour.highlightsRu?.length
                ? tour.highlightsRu
                : tour.highlights;
            const isAvailable = tour.available !== false;

            return (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs luxury-hover-card flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    {tour.imageUrl ? (
                      <img
                        src={tour.imageUrl}
                        alt={title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (tour.category === 'safari') target.src = '/images/tour_quad.jpg';
                          else if (tour.category === 'historical') target.src = '/images/tour_pyramids.jpg';
                          else if (tour.destination?.toLowerCase().includes('gouna')) target.src = '/images/tour_el_gouna.jpg';
                          else target.src = '/images/tour_orange_bay.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] flex items-center justify-center">
                        <Compass className="w-12 h-12 text-[#D4AF37]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-2">
                      <span className="bg-[#0D1B2A]/90 backdrop-blur-xs text-[#D4AF37] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#D4AF37]/40 uppercase tracking-wider">
                        {tour.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-600/90 text-slate-200'
                      }`}>
                        {isAvailable ? t('tours.statusAvailable', 'Available') : t('tours.statusUnavailable', 'Unavailable')}
                      </span>
                    </div>

                    {tour.pricePerPerson && (
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md border border-white/60 flex items-center gap-1">
                        <span className="text-sm font-black">{tour.pricePerPerson}</span>
                        <span className="text-[10px] font-bold">EUR</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{tour.destination}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{tour.duration}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-[#0D1B2A] font-heading mb-2 leading-snug group-hover:text-[#99781B] transition">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {desc}
                    </p>

                    {highlights && highlights.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {highlights.slice(0, 3).map((hl, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{hl}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <div className="bg-[#FAF7EE] px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 shadow-xs">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
                      {t('tours.pricePerPerson')}
                    </span>
                    <div className="text-base sm:text-lg font-black text-[#0D1B2A] flex items-baseline gap-1">
                      {tour.pricePerPerson ? (
                        <>
                          <span className="text-[#0D1B2A] font-black">{tour.pricePerPerson}</span>
                          <span className="text-xs font-bold text-[#99781B]">EUR</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            / {t('tours.perPerson')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-amber-800 font-medium">
                          {tour.priceNotice || t('booking.priceOnRequest')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTour(tour)}
                      className="p-2.5 rounded-xl border border-[#EAE4D9] hover:bg-[#F8F5EE] text-slate-700 text-xs font-medium transition cursor-pointer"
                      title={t('tours.viewDetails')}
                    >
                      <Eye className="w-4 h-4 text-[#D4AF37]" />
                    </button>

                    {isAvailable ? (
                      <button
                        onClick={() => onBookTour(tour)}
                        className="px-4 py-2.5 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t('tours.bookTour')}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                      >
                        {t('tours.statusUnavailable')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
