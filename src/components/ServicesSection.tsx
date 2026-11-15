import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Plane, 
  Car, 
  Compass, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Search, 
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ServicesSectionProps {
  onOpenBooking: (serviceType?: string, preselectedTourId?: string) => void;
  onExploreTours: () => void;
  onOpenCustomTrip?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenBooking,
  onExploreTours,
  onOpenCustomTrip,
}) => {
  const { t, direction, language } = useLanguage();

  const services = [
    {
      id: 'airport_transfers',
      title: t('services.airportTransfers.title'),
      desc: t('services.airportTransfers.desc'),
      icon: Plane,
      action: () => onOpenBooking('airport_pickup'),
      btnLabel: t('services.airportTransfers.btn'),
    },
    {
      id: 'private_transfers',
      title: t('services.privateTransport.title'),
      desc: t('services.privateTransport.desc'),
      icon: Car,
      action: () => onOpenBooking('private_transfer'),
      btnLabel: t('services.privateTransport.btn'),
    },
    {
      id: 'tours_excursions',
      title: t('services.toursExcursions.title'),
      desc: t('services.toursExcursions.desc'),
      icon: Compass,
      action: onExploreTours,
      btnLabel: t('services.toursExcursions.btn'),
    },
    {
      id: 'custom_trips',
      title: t('services.customTrip.title'),
      desc: t('services.customTrip.desc'),
      icon: Sliders,
      action: () => {
        if (onOpenCustomTrip) {
          onOpenCustomTrip();
        } else {
          onOpenBooking('custom_trip');
        }
      },
      btnLabel: t('services.customTrip.btn'),
    },
  ];

  const whyChoosePillars = [
    {
      title: t('why.privateFlexible.title'),
      desc: t('why.privateFlexible.desc'),
      icon: ShieldCheck,
    },
    {
      title: t('why.easyTracking.title'),
      desc: t('why.easyTracking.desc'),
      icon: Search,
    },
    {
      title: t('why.support247.title'),
      desc: t('why.support247.desc'),
      icon: Clock,
    },
    {
      title: t('why.doorToDoor.title'),
      desc: t('why.doorToDoor.desc'),
      icon: MapPin,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Services Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>
              {language === 'ru'
                ? 'PEGASUS Трансферы и Экскурсии'
                : language === 'ar'
                ? 'بيجاسوس للنقل والرحلات'
                : language === 'de'
                ? 'PEGASUS Chauffeur & Ausflüge'
                : 'PEGASUS Chauffeur & Excursions'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight mb-3">
            {t('services.sectionTitle')}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
            {t('services.sectionSubtitle')}
          </p>
        </div>

        {/* 4 Core Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service) => {
            const IconComp = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-7 luxury-hover-card flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0D1B2A] text-[#D4AF37] flex items-center justify-center shadow-xs mb-5 group-hover:scale-105 transition">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-2.5">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-light">
                    {service.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={service.action}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FBF9F5] hover:bg-[#0D1B2A] text-[#0D1B2A] hover:text-[#D4AF37] border border-[#D5CDBD] hover:border-[#0D1B2A] font-bold text-xs transition cursor-pointer"
                >
                  <span>{service.btnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Why PEGASUS Section (Strictly compliant with business data - Zero fake claims/stats) */}
        <div className="bg-[#0D1B2A] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#D4AF37]/30 relative overflow-hidden">
          <div className="relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] block mb-2">
                {t('why.sectionBadge')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#FBF9F5]">
                {t('why.sectionTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light">
                {t('why.sectionSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChoosePillars.map((item, index) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={index}
                    className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 backdrop-blur-xs transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mb-3.5">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
