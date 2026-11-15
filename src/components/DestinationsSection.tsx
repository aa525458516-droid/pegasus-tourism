import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToDestinations } from '../services/destinationService';
import { DestinationItem } from '../types';
import { 
  MapPin, 
  Compass, 
  ArrowRight, 
  Clock, 
  Navigation, 
  Sparkles,
  Waves,
  Car
} from 'lucide-react';

interface DestinationsSectionProps {
  onOpenBooking: (serviceType?: string, preselectedTourId?: string) => void;
  onOpenCustomTrip?: () => void;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  onOpenBooking,
  onOpenCustomTrip,
}) => {
  const { t, language, direction } = useLanguage();
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToDestinations((items) => {
      setDestinations(items.filter((item) => item.active !== false));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    { id: 'all', labelEn: 'All Landmarks', labelAr: 'جميع المعالم والوجهات', labelDe: 'Alle Reiseziele', labelRu: 'Все направления' },
    { id: 'red_sea', labelEn: 'Red Sea & Coast', labelAr: 'البحر الأحمر والغردقة', labelDe: 'Rotes Meer & Hurghada', labelRu: 'Красное море и курорты' },
    { id: 'heritage', labelEn: 'Pyramids & Luxor', labelAr: 'الأهرامات والأقصر والتاريخ', labelDe: 'Pyramiden & Luxor', labelRu: 'Пирамиды и Луксор' },
  ];

  const filteredDestinations = destinations.filter((dest) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'red_sea') return dest.category === 'red_sea';
    if (selectedCategory === 'heritage') return dest.category === 'cairo' || dest.category === 'luxor';
    return dest.category === selectedCategory;
  });

  const getCategoryLabel = (cat: string) => {
    if (cat === 'red_sea') {
      return language === 'ar' ? 'شاطئي وبحري' : language === 'de' ? 'Rotes Meer' : language === 'ru' ? 'Красное море' : 'Red Sea';
    }
    if (cat === 'cairo') {
      return language === 'ar' ? 'القاهرة والجيزة' : language === 'de' ? 'Kairo & Gizeh' : language === 'ru' ? 'Каир и Гиза' : 'Cairo & Giza';
    }
    if (cat === 'luxor') {
      return language === 'ar' ? 'الأقصر والآثار' : language === 'de' ? 'Luxor & Kultur' : language === 'ru' ? 'Луксор и история' : 'Luxor & Heritage';
    }
    return cat;
  };

  return (
    <section 
      id="destinations" 
      className="py-16 md:py-24 bg-gradient-to-b from-[#FBF9F5] via-[#F4EFE6] to-[#FBF9F5] border-b border-[#EAE4D9] relative overflow-hidden" 
      dir={direction}
    >
      {/* Decorative ambient coastal glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0077B6]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-xs font-semibold mb-3 border border-[#D4AF37]/30 shadow-xs">
            <Waves className="w-3.5 h-3.5 text-[#00A8E8]" />
            <span>
              {language === 'ar' ? 'أشهر المعالم والوجهات السياحية' : language === 'de' ? 'Berühmte Reiseziele & Sehenswürdigkeiten' : language === 'ru' ? 'Популярные направления и достопримечательности' : 'Top Destinations & Egyptian Landmarks'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#0D1B2A] mb-4">
            {language === 'ar' 
              ? 'وجهات لا تُفوّت من الغردقة وإلى جميع أنحاء مصر' 
              : language === 'de' 
              ? 'Unvergessliche Ziele von Hurghada bis ganz Ägypten' 
              : language === 'ru'
              ? 'Лучшие направления из Хургады по всему Египту'
              : 'Icons of Egypt & The Red Sea Riviera'}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'استكشف جزر البحر الأحمر والشواطئ الفيروزية، أو سافر بسيارة خاصة ومريحة إلى الأقصر والقاهرة مع سائق خاص محترف وحساب دقيق للمسافات.'
              : language === 'de'
              ? 'Entdecken Sie die Inseln des Roten Meeres und buchen Sie zuverlässige Privatfahrten nach Luxor, Kairo und zu allen Küstenresorts.'
              : language === 'ru'
              ? 'Откройте острова Красного моря и коралловые рифы или отправляйтесь с комфортом на частном авто в Луксор и к пирамидам Каира от двери до двери.'
              : 'From pristine island sands and coral reefs to the Pyramids and Valley of the Kings. Book private door-to-door transportation anywhere in Egypt.'}
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => {
              const label = language === 'ar' ? cat.labelAr : language === 'de' ? cat.labelDe : language === 'ru' ? cat.labelRu : cat.labelEn;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-md border border-[#D4AF37]'
                      : 'bg-white text-slate-700 hover:text-[#0D1B2A] hover:bg-[#F0ECE1] border border-[#EAE4D9]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-2" />
            <span>{language === 'ru' ? 'Загрузка направлений...' : language === 'ar' ? 'جاري تحميل الوجهات...' : language === 'de' ? 'Reiseziele werden geladen...' : 'Loading destinations...'}</span>
          </div>
        )}

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((dest) => {
            const name = language === 'ar' ? dest.nameAr : language === 'de' ? dest.nameDe : language === 'ru' ? (dest.nameRu || dest.name) : dest.name;
            const desc = language === 'ar' ? dest.descriptionAr : language === 'de' ? dest.descriptionDe : language === 'ru' ? (dest.descriptionRu || dest.description) : dest.description;

            return (
              <div
                key={dest.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#EAE4D9] shadow-xs luxury-hover-card flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Overlay */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                    {dest.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-[#D4AF37]/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/20 to-transparent" />
                    
                    {/* Price badge */}
                    {dest.pricePerPerson && (
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] shadow-md border border-white/60">
                          {dest.pricePerPerson} EUR
                        </span>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0D1B2A]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs">
                        {getCategoryLabel(dest.category)}
                      </span>
                    </div>

                    {/* Distance from Hurghada */}
                    <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 text-white text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#00A8E8]" />
                      <span className="drop-shadow-xs">{dest.distanceFromHurghada || 'Hurghada'}</span>
                    </div>

                    {/* Approx Duration / Note */}
                    {dest.suggestedTripDuration && (
                      <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 flex items-center gap-1 text-slate-200 text-[11px] font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                        <span>{dest.suggestedTripDuration}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-2 group-hover:text-[#9A7B38] transition">
                      {name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {desc}
                    </p>

                    {/* Prominent Price Pill */}
                    <div className="flex items-center justify-between py-2 px-3 bg-[#FAF7F0] rounded-xl border border-[#EAE4D9] mb-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        {language === 'ar' ? 'السعر للشخص:' : language === 'de' ? 'Preis pro Person:' : language === 'ru' ? 'Официальная цена:' : 'Official Rate:'}
                      </span>
                      <span className="text-sm font-black text-[#0D1B2A]">
                        {dest.pricePerPerson ? `${dest.pricePerPerson} EUR` : t('booking.priceOnRequest')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 border-t border-[#F8F5EE] mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => onOpenBooking('airport_pickup')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-bold text-xs transition flex items-center justify-center gap-1.5 border border-[#D4AF37]/50 shadow-xs cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'احجز توصيلة خاصة إلى هنا' : language === 'de' ? 'Privattransfer buchen' : language === 'ru' ? 'Заказать частный трансфер' : 'Book Private Transfer'}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>

                  {onOpenCustomTrip && (
                    <button
                      type="button"
                      onClick={onOpenCustomTrip}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F8F5EE] text-slate-700 text-xs font-semibold transition border border-[#D5CDBD] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>{language === 'ar' ? 'صمم رحلة مخصصة شاملة' : language === 'de' ? 'Als Tagestour planen' : language === 'ru' ? 'Собрать индивидуальный тур' : 'Customize as Day Trip'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner with Distance & Custom Calculation Notice */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold font-heading text-[#0D1B2A]">
                {language === 'ar' ? 'تريد زيارة وجهة أخرى أو برنامج مخصص؟' : language === 'de' ? 'Wünschen Sie ein anderes Ziel oder eine individuelle Tour?' : language === 'ru' ? 'Нужен трансфер в другой город или индивидуальный маршрут?' : 'Need a transfer to another city or bespoke tour?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {language === 'ar' 
                  ? 'أسعار واضحة ومعتمدة لجميع المحافظات والمعالم السياحية مع سيارة خاصة وسائق محترف.' 
                  : language === 'de'
                  ? 'Klare und verlässliche Preise in ganz Ägypten für private Transfers und Ausflüge.'
                  : language === 'ru'
                  ? 'Прозрачные и честные тарифы по всему Египту для частных трансферов и персональных экскурсий.'
                  : 'Clear and trusted rates across Egypt for all private transfers and bespoke excursions.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenCustomTrip && (
              <button
                type="button"
                onClick={onOpenCustomTrip}
                className="px-5 py-3 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37] shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'ar' ? 'تصميم رحلة مخصصة' : language === 'de' ? 'Individuelle Route planen' : language === 'ru' ? 'Собрать маршрут' : 'Build Custom Itinerary'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenBooking('airport_pickup')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#ECC974] hover:brightness-105 text-[#0D1B2A] font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>{t('nav.bookNow')}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
