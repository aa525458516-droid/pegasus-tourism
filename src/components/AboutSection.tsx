import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Award, Clock, Users, Plane, CheckCircle2, HeartHandshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t, direction } = useLanguage();

  const steps = [
    {
      num: '01',
      title: 'Easy Online Booking',
      desc: 'Submit your flight details and destination. Receive a unique booking reference immediately with zero prepayment required.'
    },
    {
      num: '02',
      title: 'Real-Time Flight Radar Tracking',
      desc: 'Our 24/7 Hurghada dispatch office tracks your aircraft live. We adjust pickup timing automatically for delays or early landings.'
    },
    {
      num: '03',
      title: 'VIP Arrival Hall Welcome',
      desc: 'Your private chauffeur greets you inside the terminal with a discrete personalized PEGASUS name board and assists with baggage.'
    },
    {
      num: '04',
      title: 'Chilled Refreshments & Smooth Ride',
      desc: 'Relax in a sanitized, climate-controlled luxury vehicle with free Wi-Fi and cold mineral water directly to your resort doorstep.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Red Sea Tourism Excellence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] leading-tight">
              {t('about.storyTitle')}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {t('about.storyP1')}
            </p>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {t('about.storyP2')}
            </p>

            {/* Standards & Operations row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EAE4D9]">
              <div className="p-3 bg-white rounded-xl border border-[#EAE4D9] text-center">
                <span className="block text-sm sm:text-base font-bold font-heading text-[#0D1B2A]">Punctual</span>
                <span className="text-[11px] text-slate-500 font-medium">[Dispatch Policy]</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE4D9] text-center">
                <span className="block text-sm sm:text-base font-bold font-heading text-[#D4AF37]">Inspected</span>
                <span className="text-[11px] text-slate-500 font-medium">[Fleet Standard]</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE4D9] text-center">
                <span className="block text-sm sm:text-base font-bold font-heading text-[#0D1B2A]">Permitted</span>
                <span className="text-[11px] text-slate-500 font-medium">[Tourism License]</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EAE4D9] text-center">
                <span className="block text-sm sm:text-base font-bold font-heading text-[#0D1B2A]">24/7</span>
                <span className="text-[11px] text-slate-500 font-medium">[Local Dispatch]</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
                alt="PEGASUS Chauffeur Service Hurghada"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-bold text-sm">[Egyptian Tourism License - Editable Placeholder]</span>
                </div>
                <p className="text-xs text-slate-300">
                  [Private transportation and regional excursion permits across Red Sea, Luxor, and Cairo governorates - Subject to official registration].
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Airport Arrival Protocol */}
        <div className="bg-white rounded-2xl border border-[#EAE4D9] p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold font-heading text-[#0D1B2A] mb-2">
              The PEGASUS VIP Airport Arrival Protocol
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              How our seamless private arrival service at Hurghada International Airport (HRG) works:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9]">
                <div className="text-2xl font-extrabold font-heading text-[#D4AF37] mb-2">
                  {st.num}
                </div>
                <h4 className="font-bold text-sm text-[#0D1B2A] mb-1.5">
                  {st.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
