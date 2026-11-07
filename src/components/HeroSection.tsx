import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Car, 
  Compass, 
  MessageCircle, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  Plane,
  Sparkles,
  Users,
  Search
} from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/initialData';

interface HeroSectionProps {
  onOpenBooking: (serviceType?: string, preselectedTourId?: string) => void;
  onExploreTours: () => void;
  onTrackBooking?: () => void;
  onOpenCustomTrip?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onExploreTours,
  onTrackBooking,
  onOpenCustomTrip,
}) => {
  const { t, direction, language } = useLanguage();

  const [origin, setOrigin] = useState('Hurghada International Airport (HRG)');
  const [destination, setDestination] = useState('El Gouna / Hurghada Hotel');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(2);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking('airport_pickup');
  };

  return (
    <div className="relative bg-[#0D1B2A] text-white overflow-hidden" dir={direction}>
      {/* Background imagery with luxury gradient overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80"
          alt="Hurghada Red Sea Luxury Coastline"
          loading="eager"
          width="2000"
          height="1200"
          className="w-full h-full object-cover opacity-35 scale-105 transform motion-safe:animate-pulse duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/85 to-[#0D1B2A]/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0D1B2A]/40 to-[#0D1B2A]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'بيجاسوس • نقل سياحي خاص • الغردقة، مصر' : 'PEGASUS • Private Transfers & Tours • Hurghada, Egypt'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-[#FBF9F5] leading-tight">
              {language === 'ar' ? (
                <>
                  <span className="text-[#D4AF37]">PEGASUS</span>
                  <span className="block text-2xl sm:text-4xl lg:text-5xl font-semibold mt-1">نقل خاص وجولات سياحية • الغردقة، مصر</span>
                </>
              ) : (
                <>
                  <span className="text-[#D4AF37]">PEGASUS</span>
                  <span className="block text-2xl sm:text-4xl lg:text-5xl font-semibold mt-1">Private Transfers & Tours • Hurghada, Egypt</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking('airport_pickup')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] font-bold text-sm sm:text-base shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 transition cursor-pointer"
              >
                <Car className="w-5 h-5 text-[#0D1B2A]" />
                <span>Book Your Transfer</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              {onTrackBooking && (
                <button
                  type="button"
                  onClick={onTrackBooking}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FBF9F5] hover:text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-sm sm:text-base backdrop-blur-xs transition cursor-pointer"
                >
                  <Search className="w-5 h-5 text-[#D4AF37]" />
                  <span>{t('nav.trackBooking')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExploreTours}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/20 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('hero.exploreTours')}</span>
              </button>

              {onOpenCustomTrip && (
                <button
                  type="button"
                  onClick={onOpenCustomTrip}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0D1B2A]/90 hover:bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37] font-bold text-xs sm:text-sm shadow-lg backdrop-blur-xs transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('hero.buildTrip')}</span>
                </button>
              )}

              <a
                href="https://wa.me/201000000000?text=Hello%20PEGASUS%20Hurghada%2C%20I%20would%20like%20to%20inquire%20about%20a%20private%20transfer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs sm:text-sm font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">{t('hero.whatsappDirect')}</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>[Tourism License - Subject to Verification]</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#D4AF37]" />
                <span>[Flight Tracking - Live Radar]</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>[Airport Wait Policy - Confirm with Dispatch]</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Airport Transfer Reservation Box */}
          <div className="lg:col-span-5">
            <div className="bg-[#FBF9F5] text-[#1A2332] rounded-2xl p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/50 relative">
              <div className="absolute -top-3.5 left-6 rtl:left-auto rtl:right-6 bg-[#0D1B2A] text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#D4AF37]/60">
                Direct Booking Engine
              </div>

              <h3 className="text-xl font-bold font-heading text-[#0D1B2A] mb-1">
                {t('quick.title')}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Hurghada Airport (HRG) • Fixed transparent rate • No upfront payment
              </p>

              <form onSubmit={handleQuickBook} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('quick.pickup')}</span>
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="Hurghada International Airport (HRG) Terminal 1">
                      Hurghada Int'l Airport (HRG) Terminal 1
                    </option>
                    <option value="Hurghada International Airport (HRG) Terminal 2">
                      Hurghada Int'l Airport (HRG) Terminal 2
                    </option>
                    {POPULAR_LOCATIONS.map((loc, i) => (
                      <option key={i} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('quick.dropoff')}</span>
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="El Gouna (All Resorts & Villas)">El Gouna (All Resorts & Villas)</option>
                    <option value="Makadi Bay Resorts">Makadi Bay Resorts</option>
                    <option value="Sahl Hasheesh Bay & Old Town">Sahl Hasheesh Bay & Old Town</option>
                    <option value="Soma Bay & Safaga Port">Soma Bay & Safaga Port</option>
                    <option value="Hurghada City Hotels & Marina">Hurghada City Hotels & Marina</option>
                    <option value="Port Ghalib & Marsa Alam">Port Ghalib & Marsa Alam</option>
                    <option value="Luxor (Private Intercity)">Luxor (Private Intercity)</option>
                    <option value="Cairo / Giza (Private Intercity)">Cairo / Giza (Private Intercity)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('quick.date')}</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t('quick.passengers')}</span>
                    </label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-[#D4AF37]"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5-7 (VIP Minivan)</option>
                      <option value="8">8+ (Group Bus)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-sm shadow-md hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Car className="w-4 h-4" />
                  <span>{t('quick.findRide')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-[#EAE4D9] flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Instant Booking Reference
                </span>
                <span>Pay to driver upon arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Highlight strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-2.5 font-bold">
              1
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{t('feat.meetGreet')}</h4>
            <p className="text-slate-300 font-light">{t('feat.meetGreetDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-2.5 font-bold">
              2
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{t('feat.flightTracking')}</h4>
            <p className="text-slate-300 font-light">{t('feat.flightTrackingDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-2.5 font-bold">
              3
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{t('feat.fixedPrices')}</h4>
            <p className="text-slate-300 font-light">{t('feat.fixedPricesDesc')}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-2.5 font-bold">
              4
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{t('feat.licensedFleet')}</h4>
            <p className="text-slate-300 font-light">{t('feat.licensedFleetDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
