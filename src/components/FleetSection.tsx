import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getVehicleOptions, getVehicleOptionsAsync } from '../services/settingsService';
import { VehicleCategory } from '../types';
import { Users, Luggage, Car, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface FleetSectionProps {
  onSelectVehicle: (vehicleId: string) => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({ onSelectVehicle }) => {
  const { t, language, direction } = useLanguage();
  const [vehicles, setVehicles] = useState<VehicleCategory[]>([]);

  useEffect(() => {
    setVehicles(getVehicleOptions());
    getVehicleOptionsAsync()
      .then((opts) => {
        if (opts && opts.length > 0) {
          setVehicles(opts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="fleet" className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {language === 'ar' 
                ? 'معايير سعة الركاب والسلامة' 
                : language === 'de' 
                ? 'Fahrgast-Kapazitätsstandards' 
                : language === 'ru'
                ? 'Стандарты вместимости и комфорта'
                : 'Passenger Capacity Standards'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('fleet.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('fleet.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-7xl mx-auto">
          {vehicles.map((v) => {
            const name = language === 'de' ? v.nameDe : language === 'ar' ? v.nameAr : language === 'ru' ? (v.nameRu || v.name) : v.name;
            const desc = language === 'de' ? v.descriptionDe : language === 'ar' ? v.descriptionAr : language === 'ru' ? (v.descriptionRu || v.description) : v.description;

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs luxury-hover-card flex flex-col justify-between group"
              >
                <div>
                  {/* Vehicle Real Photo */}
                  {v.imageUrl ? (
                    <div className="relative h-52 bg-slate-900 overflow-hidden">
                      <img
                        src={v.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      
                      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                        <span className="text-[10px] bg-[#0D1B2A]/90 text-white font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-xs backdrop-blur-xs">
                          {v.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                        <span className="text-xs bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] font-black px-3 py-1 rounded-full shadow-md border border-white/50 backdrop-blur-xs">
                          {v.capacityPassengers != null
                            ? (language === 'ar' 
                              ? `حتى ${v.capacityPassengers} ركاب` 
                              : language === 'de' 
                              ? `Bis zu ${v.capacityPassengers} Personen` 
                              : language === 'ru'
                              ? `До ${v.capacityPassengers} чел.`
                              : `Up to ${v.capacityPassengers} Pax`)
                            : t('booking.specsEditable')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-6 pb-0 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0D1B2A] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/40 shadow-xs">
                        <Car className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-amber-50 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                        {v.capacityPassengers != null
                          ? (language === 'ar' 
                            ? `حتى ${v.capacityPassengers} ركاب` 
                            : language === 'de'
                            ? `Bis zu ${v.capacityPassengers} Personen`
                            : language === 'ru'
                            ? `До ${v.capacityPassengers} чел.`
                            : `Up to ${v.capacityPassengers} Passengers`)
                          : t('booking.specsEditable')}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#0D1B2A] font-heading mb-2">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                      {desc}
                    </p>

                    <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-[#F0ECE1] text-xs text-slate-800 mb-6 bg-[#FDFBF7] rounded-xl px-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-semibold">
                          {v.capacityPassengers != null
                            ? `${v.capacityPassengers} ${language === 'ar' ? 'ركاب كحد أقصى' : language === 'de' ? 'Passagiere max' : language === 'ru' ? 'макс. пасс.' : 'Passengers max'}`
                            : t('booking.specsEditable')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Luggage className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-semibold">
                          {v.capacityLuggage != null
                            ? `${v.capacityLuggage} ${language === 'ar' ? 'حقائب سفر' : language === 'de' ? 'Gepäckstücke' : language === 'ru' ? 'мест багажа' : 'Bags space'}`
                            : t('booking.specsEditable')}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 mb-6">
                      {v.features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectVehicle(v.id)}
                        className="w-full py-3 px-5 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-[#D4AF37]/60 cursor-pointer shadow-md"
                      >
                        <span>{t('fleet.selectVehicle')}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>{t('fleet.capacityNotice')}</p>
        </div>
      </div>
    </section>
  );
};
