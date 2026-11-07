import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_VEHICLES } from '../data/initialData';
import { Users, Luggage, Shield, Check, ArrowRight, Wifi, Sparkles } from 'lucide-react';

interface FleetSectionProps {
  onSelectVehicle: (vehicleId: string) => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({ onSelectVehicle }) => {
  const { t, language, direction } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>VIP Transportation Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('fleet.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('fleet.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_VEHICLES.map((v) => {
            const name = language === 'de' ? v.nameDe : language === 'ar' ? v.nameAr : v.name;
            const desc = language === 'de' ? v.descriptionDe : language === 'ar' ? v.descriptionAr : v.description;

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#D4AF37]/70 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={v.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-[#0D1B2A]/90 backdrop-blur-xs text-[#D4AF37] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#D4AF37]/40">
                      {v.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-base text-[#0D1B2A] font-heading mb-1.5 line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-[#F0ECE1] text-xs text-slate-700 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>max {v.capacityPassengers} {t('fleet.passengers')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Luggage className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{v.capacityLuggage} {t('fleet.luggage')}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-600 mb-2">
                      {v.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectVehicle(v.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F8F5EE] group-hover:bg-[#0D1B2A] text-[#0D1B2A] group-hover:text-[#D4AF37] font-semibold text-xs transition flex items-center justify-center gap-2 border border-[#EAE4D9] group-hover:border-[#0D1B2A] cursor-pointer"
                  >
                    <span>{t('fleet.selectVehicle')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
