import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HAS_REAL_IMAGES } from '../config/images';
import { GALLERY_ITEMS } from '../data/initialData';
import { Camera, X, Maximize2 } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { t, direction, language } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // If no authentic photos are configured, hide the gallery cleanly
  if (!HAS_REAL_IMAGES.gallery) {
    return null;
  }

  const categories = [
    { id: 'all', label: language === 'ru' ? 'Все фото' : language === 'ar' ? 'جميع الصور' : language === 'de' ? 'Alle Fotos' : 'All Photos' },
    { id: 'fleet', label: language === 'ru' ? 'Автомобили' : language === 'ar' ? 'السيارات' : language === 'de' ? 'Fahrzeuge' : 'Cars' },
    { id: 'luxor', label: language === 'ru' ? 'Луксор' : language === 'ar' ? 'الأقصر' : language === 'de' ? 'Luxor' : 'Luxor' },
    { id: 'cairo', label: language === 'ru' ? 'Каир' : language === 'ar' ? 'القاهرة' : language === 'de' ? 'Kairo' : 'Cairo' },
    { id: 'marine', label: language === 'ru' ? 'Море и острова' : language === 'ar' ? 'البحر والجزر' : language === 'de' ? 'Meer & Inseln' : 'Sea & Islands' },
    { id: 'safari', label: language === 'ru' ? 'Сафари в пустыне' : language === 'ar' ? 'سفاري الصحراء' : language === 'de' ? 'Wüstensafari' : 'Desert Safari' },
  ];

  const filtered = (GALLERY_ITEMS as any[]).filter((item: any) => (filter === 'all' ? true : item.category === filter));

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{language === 'ru' ? 'Фотогалерея' : language === 'ar' ? 'معرض الصور' : language === 'de' ? 'Bildergalerie' : 'Visual Showcase'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('gallery.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('gallery.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === c.id
                  ? 'bg-[#0D1B2A] text-[#D4AF37] shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-[#F3EFEA] border border-[#EAE4D9]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item.imageUrl)}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-xs border border-[#EAE4D9] bg-slate-900 cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition" />

              <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block mb-0.5">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold font-heading text-white">
                    {item.title}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImage}
              alt="Enlarged view"
              className="max-w-5xl max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </section>
  );
};
