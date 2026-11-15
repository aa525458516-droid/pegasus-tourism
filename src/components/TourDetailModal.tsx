import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tour } from '../types';
import { getSiteImage } from '../config/images';
import { 
  X, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface TourDetailModalProps {
  tour: Tour | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTour: (tour: Tour) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  isOpen,
  onClose,
  onBookTour,
}) => {
  const { t, language, direction } = useLanguage();

  if (!isOpen || !tour) return null;

  const title = language === 'de' ? tour.titleDe : language === 'ar' ? tour.titleAr : language === 'ru' ? (tour.titleRu || tour.title) : tour.title;
  const description = language === 'de' ? tour.descriptionDe : language === 'ar' ? tour.descriptionAr : language === 'ru' ? (tour.descriptionRu || tour.description) : tour.description;
  const highlights =
    language === 'de' && tour.highlightsDe?.length
      ? tour.highlightsDe
      : language === 'ar' && tour.highlightsAr?.length
      ? tour.highlightsAr
      : language === 'ru' && tour.highlightsRu?.length
      ? tour.highlightsRu
      : tour.highlights;
  const included =
    language === 'de' && tour.includedDe?.length
      ? tour.includedDe
      : language === 'ar' && tour.includedAr?.length
      ? tour.includedAr
      : language === 'ru' && tour.includedRu?.length
      ? tour.includedRu
      : tour.included;
  const excluded =
    language === 'de' && tour.excludedDe?.length
      ? tour.excludedDe
      : language === 'ar' && tour.excludedAr?.length
      ? tour.excludedAr
      : language === 'ru' && tour.excludedRu?.length
      ? tour.excludedRu
      : tour.excluded;
  const isAvailable = tour.available !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-[#FBF9F5] rounded-2xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden my-auto"
        dir={direction}
      >
        {/* Hero image Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
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
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] flex items-center justify-center">
              <Compass className="w-16 h-16 text-[#D4AF37]/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and metadata on hero */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37] text-[#0D1B2A] uppercase tracking-wider">
                {tour.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAvailable ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-200'
              }`}>
                {isAvailable ? t('tours.statusAvailable', 'Available') : t('tours.statusUnavailable', 'Currently Unavailable')}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                {tour.destination}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                {tour.duration}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold font-heading text-white">
              {title}
            </h2>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Price Bar & Booking trigger */}
          <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                {language === 'ru' ? 'Стоимость тура' : language === 'ar' ? 'تسعير الرحلة' : language === 'de' ? 'Tourpreis' : 'Tour Pricing'}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-heading text-[#0D1B2A] flex items-baseline gap-1">
                {tour.pricePerPerson ? (
                  <>
                    <span className="text-[#D4AF37] text-base">{language === 'ru' ? 'От' : language === 'ar' ? 'ابتداءً من' : language === 'de' ? 'Ab' : 'From'}</span> {tour.pricePerPerson} EUR
                    <span className="text-xs font-normal text-slate-500 font-sans">/ {t('tours.perPerson')}</span>
                  </>
                ) : (
                  <span className="text-sm font-sans font-semibold text-amber-800">
                    {tour.priceNotice || t('booking.priceOnRequest')}
                  </span>
                )}
              </div>
            </div>

            {isAvailable ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookTour(tour);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-sm shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('tours.bookTour', 'Request This Tour')}</span>
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                {t('tours.statusUnavailable', 'Currently Unavailable')}
              </span>
            )}
          </div>

          {/* Short Description & Full Overview */}
          <div>
            <h3 className="text-base font-bold font-heading text-[#0D1B2A] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'ru' ? 'Обзор программы' : language === 'ar' ? 'نظرة عامة على البرنامج' : language === 'de' ? 'Programmübersicht' : 'Itinerary Overview'}</span>
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-[#EAE4D9] space-y-2">
              <p>{description}</p>
              {tour.fullDescription && tour.fullDescription !== description && (
                <p className="text-slate-600 pt-2 border-t border-slate-100">{tour.fullDescription}</p>
              )}
            </div>
          </div>

          {/* Meeting & Pickup Info */}
          {tour.meetingPickupInfo && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-4 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ru' ? 'Информация о месте встречи:' : language === 'ar' ? 'معلومات التجمع والاستلام:' : language === 'de' ? 'Treffpunkt & Abholhinweise:' : 'Meeting & Pickup Information:'}</span>
              </span>
              <p>{tour.meetingPickupInfo}</p>
            </div>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0D1B2A] mb-3">
                {t('tours.itinerary')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-[#EAE4D9]">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#0D1B2A] font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What is Included / Excluded */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {included && included.length > 0 && (
              <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('tours.whatsIncluded')}</span>
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950">
                  {included.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {excluded && excluded.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>{t('tours.whatsExcluded')}</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {excluded.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Important Information if present */}
          {tour.importantInfo && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-700">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-slate-900">
                <Info className="w-4 h-4 text-slate-500" />
                <span>{t('tours.importantInfo', 'Important Information')}</span>
              </span>
              <p>{tour.importantInfo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
