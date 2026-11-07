import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tour } from '../types';
import { subscribeToTours } from '../services/tourService';
import { 
  MapPin, 
  Clock, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Calendar,
  CheckCircle,
  Eye
} from 'lucide-react';

interface ToursSectionProps {
  onSelectTour: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
  showOnlyFeatured?: boolean;
}

export const ToursSection: React.FC<ToursSectionProps> = ({
  onSelectTour,
  onBookTour,
  showOnlyFeatured = false,
}) => {
  const { t, language, direction } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToTours((data) => {
      setTours(data.filter((x) => x.active !== false));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: t('tours.all') },
    { id: 'historical', label: t('tours.historical') },
    { id: 'marine', label: t('tours.marine') },
    { id: 'safari', label: t('tours.safari') },
    { id: 'daytrip', label: t('tours.daytrip') },
  ];

  const filteredTours = tours
    .filter((tr) => (showOnlyFeatured ? tr.featured : true))
    .filter((tr) => (selectedCategory === 'all' ? true : tr.category === selectedCategory));

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9]/40 border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Organized Egyptian Expeditions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-2">
              {t('tours.title')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              {t('tours.subtitle')}
            </p>
          </div>

          {/* Filter Pills */}
          {!showOnlyFeatured && (
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

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => {
            const title = language === 'de' ? tour.titleDe : language === 'ar' ? tour.titleAr : tour.title;
            const desc = language === 'de' ? tour.descriptionDe : language === 'ar' ? tour.descriptionAr : tour.description;

            return (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    <img
                      src={tour.imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                      <span className="bg-[#0D1B2A]/90 backdrop-blur-xs text-[#D4AF37] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#D4AF37]/40 uppercase tracking-wider">
                        {tour.category}
                      </span>
                    </div>

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

                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {tour.highlights.slice(0, 3).map((hl, i) => (
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
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                      {t('tours.pricePerPerson')}
                    </span>
                    <div className="text-sm sm:text-base font-bold font-heading text-[#0D1B2A]">
                      {tour.pricePerPerson ? (
                        <>
                          €{tour.pricePerPerson}{' '}
                          <span className="text-xs font-normal text-slate-500 font-sans">
                            / {t('tours.perPerson')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-amber-800 font-sans font-medium">
                          {tour.priceNotice || '[Quote upon Request - Editable]'}
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

                    <button
                      onClick={() => onBookTour(tour)}
                      className="px-4 py-2.5 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t('tours.bookTour')}</span>
                    </button>
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
