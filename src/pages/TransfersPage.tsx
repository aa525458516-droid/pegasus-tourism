import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookingForm } from '../components/BookingForm';
import { 
  Plane, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Car, 
  CheckCircle, 
  Users, 
  Luggage,
  Sparkles,
  Award
} from 'lucide-react';
import { INITIAL_VEHICLES } from '../data/initialData';

interface TransfersPageProps {
  onTrackBooking?: (ref: string) => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ onTrackBooking }) => {
  const { t, language, direction } = useLanguage();

  const transferRoutes = [
    { from: "Hurghada Airport (HRG)", to: "El Gouna Hotels & Villas", distance: "Approx. 38 km [Route Dependent]", time: "Est. 30-35 mins [Subject to Traffic]" },
    { from: "Hurghada Airport (HRG)", to: "Makadi Bay Resorts", distance: "Approx. 32 km [Route Dependent]", time: "Est. 25-30 mins [Subject to Traffic]" },
    { from: "Hurghada Airport (HRG)", to: "Sahl Hasheesh Bay", distance: "Approx. 24 km [Route Dependent]", time: "Est. 20-25 mins [Subject to Traffic]" },
    { from: "Hurghada Airport (HRG)", to: "Soma Bay / Safaga Port", distance: "Approx. 52 km [Route Dependent]", time: "Est. 40-45 mins [Subject to Traffic]" },
    { from: "Hurghada Airport (HRG)", to: "Hurghada City Promenade (Mamsha)", distance: "Approx. 10 km [Route Dependent]", time: "Est. 10-15 mins [Subject to Traffic]" },
    { from: "Hurghada Airport (HRG)", to: "Port Ghalib / Marsa Alam", distance: "Approx. 215 km [Intercity]", time: "Est. 2h 30 mins [Subject to Checkpoints]" },
    { from: "Hurghada Airport (HRG)", to: "Luxor Nile City (Intercity)", distance: "Approx. 290 km [Intercity]", time: "Est. 3h 45 mins [Subject to Checkpoints]" },
    { from: "Hurghada Airport (HRG)", to: "Cairo / Giza (Intercity VIP)", distance: "Approx. 470 km [Intercity]", time: "Est. 4h 45 mins [Subject to Highway Conditions]" },
  ];

  return (
    <div className="py-12 bg-[#FBF9F5]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <Plane className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hurghada International Airport (HRG) Private Chauffeur</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('nav.transfers')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Reserve your private door-to-door transfer from Hurghada Airport directly to any resort, private villa or intercity destination in Egypt. Transparent fixed pricing, flight tracking, and zero advance payment required.
          </p>
        </div>

        {/* Main Grid: Form on Left/Top, Value & Routes on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Booking Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0ECE1]">
              <div>
                <h2 className="text-xl font-bold font-heading text-[#0D1B2A]">
                  Reserve Transfer
                </h2>
                <p className="text-xs text-slate-500">
                  Instant reference code • Status set to Pending • Free cancellation
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#0D1B2A] border border-[#D4AF37]/40">
                Guaranteed Fixed Rate
              </span>
            </div>

            <BookingForm initialServiceType="airport_pickup" onTrackBooking={onTrackBooking} />
          </div>

          {/* Side Info: Route Times & VIP Service Benefits */}
          <div className="lg:col-span-5 space-y-6">
            {/* VIP Perks */}
            <div className="bg-[#0D1B2A] text-white rounded-2xl p-6 sm:p-7 border border-[#D4AF37]/40 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-white">
                  Included in Every Private Transfer
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Flight Monitoring:</strong>
                    We track your flight number in real time. If delayed, your driver automatically waits without extra fees.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">VIP Arrival Hall Welcome:</strong>
                    Chauffeur stands at terminal exit with your custom name sign and assists with luggage.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Climate & Amenities:</strong>
                    Full air-conditioning, chilled bottled water, high-speed Wi-Fi, and spotless leather seating.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Transparent Fixed Price:</strong>
                    No cash surprises, tolls, or parking fees. Pay upon arrival.
                  </div>
                </div>
              </div>
            </div>

            {/* Approximate Travel Times Table */}
            <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 shadow-xs">
              <h3 className="text-sm font-bold font-heading text-[#0D1B2A] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Estimated Transfer Durations</span>
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {transferRoutes.map((r, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block">{r.to}</span>
                      <span className="text-[11px] text-slate-400">{r.distance} from HRG</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#F8F5EE] text-[#0D1B2A] font-medium font-mono text-[11px] whitespace-nowrap">
                      ~ {r.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
