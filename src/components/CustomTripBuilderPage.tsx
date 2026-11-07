import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createCustomTripRequest } from '../services/customTripService';
import { CustomTripRequest, SelectedExperience, ExperienceItem } from '../types';
import { INITIAL_EXPERIENCES } from '../data/experiencesData';
import { 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  Building, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Globe, 
  Plus, 
  Trash2, 
  ShieldCheck,
  Plane,
  Anchor,
  Car
} from 'lucide-react';

interface CustomTripBuilderPageProps {
  onTrackTrip?: (reference: string) => void;
  onExploreOther?: () => void;
}

export const CustomTripBuilderPage: React.FC<CustomTripBuilderPageProps> = ({
  onTrackTrip,
  onExploreOther,
}) => {
  const { t, language, direction } = useLanguage();

  // Wizard Step: 1 (Basics) | 2 (Experiences) | 3 (Customize) | 4 (Customer) | 5 (Review) | 6 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Trip Basics
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [passengerCount, setPassengerCount] = useState<number>(2); // Max 2 per business model
  const [pickup, setPickup] = useState('Hurghada International Airport (HRG)');
  const [accommodation, setAccommodation] = useState('Steigenberger ALDAU Beach Resort');
  const [destination, setDestination] = useState('El Gouna & Luxor');
  const [specialRequests, setSpecialRequests] = useState('');

  // STEP 2: Selected Experiences
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(['exp-airport-transfer', 'exp-quad-safari']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // STEP 3: Experience Customization (Date/Notes per selected experience)
  const [experienceDetails, setExperienceDetails] = useState<Record<string, { date: string; notes: string }>>({});

  // STEP 4: Customer Details
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Germany');

  // Submission & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittedTrip, setSubmittedTrip] = useState<CustomTripRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { id: 'all', label: language === 'ar' ? 'جميع الأنشطة' : language === 'de' ? 'Alle Aktivitäten' : 'All Experiences' },
    { id: 'safari_desert', label: language === 'ar' ? 'السفاري والصحراء' : language === 'de' ? 'Safari & Wüste' : 'Safari & Desert' },
    { id: 'kite_water', label: language === 'ar' ? 'الكايت والرياضات المائية' : language === 'de' ? 'Kite & Wassersport' : 'Kite & Water' },
    { id: 'boat_trips', label: language === 'ar' ? 'الرحلات البحرية' : language === 'de' ? 'Bootstouren' : 'Boat Trips' },
    { id: 'sea_snorkeling', label: language === 'ar' ? 'الغوص والسنوركلنج' : language === 'de' ? 'Meer & Schnorcheln' : 'Sea & Snorkeling' },
    { id: 'cultural_trips', label: language === 'ar' ? 'الرحلات الثقافية' : language === 'de' ? 'Kultur & Ausflüge' : 'Cultural & Day Trips' },
    { id: 'transportation', label: language === 'ar' ? 'النقل والتحويلات' : language === 'de' ? 'Transport & Transfers' : 'Transportation' },
  ];

  const getLocalizedExpTitle = (exp: ExperienceItem) => {
    if (language === 'de') return exp.titleDe;
    if (language === 'ar') return exp.titleAr;
    return exp.title;
  };

  const getLocalizedExpDesc = (exp: ExperienceItem) => {
    if (language === 'de') return exp.descriptionDe;
    if (language === 'ar') return exp.descriptionAr;
    return exp.description;
  };

  const toggleExperience = (id: string) => {
    if (selectedExpIds.includes(id)) {
      setSelectedExpIds(selectedExpIds.filter((x) => x !== id));
    } else {
      setSelectedExpIds([...selectedExpIds, id]);
      if (!experienceDetails[id]) {
        setExperienceDetails((prev) => ({
          ...prev,
          [id]: { date: startDate, notes: '' },
        }));
      }
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!pickup.trim()) newErrors.pickup = 'Pickup location is required';
    if (!accommodation.trim()) newErrors.accommodation = 'Hotel / accommodation is required';
    if (passengerCount < 1 || passengerCount > 2) newErrors.passengerCount = 'Maximum 2 passengers allowed per private trip model';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    if (selectedExpIds.length === 0) {
      setGeneralError('Please select at least one experience or transfer for your custom trip.');
      return;
    }
    setGeneralError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) newErrors.customerName = 'Full name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) newErrors.email = 'Valid email is required';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 6) newErrors.phone = 'Valid phone or WhatsApp number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setGeneralError(null);

    try {
      const formattedExperiences: SelectedExperience[] = selectedExpIds.map((id) => {
        const item = INITIAL_EXPERIENCES.find((e) => e.id === id);
        const details = experienceDetails[id];
        return {
          experienceId: id,
          title: item ? getLocalizedExpTitle(item) : id,
          category: item ? item.categoryId : 'general',
          date: details?.date || startDate,
          notes: details?.notes || '',
        };
      });

      const result = await createCustomTripRequest({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim() || 'International',
        startDate,
        endDate,
        passengerCount: Math.min(2, Math.max(1, passengerCount)),
        pickup: pickup.trim(),
        accommodation: accommodation.trim(),
        destination: destination.trim(),
        experiences: formattedExperiences,
        specialRequests: specialRequests.trim(),
      });

      setSubmittedTrip(result);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Custom trip submission error:', err);
      setGeneralError('Could not submit custom trip request. Please check your network or contact dispatch on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (submittedTrip?.referenceNumber) {
      navigator.clipboard.writeText(submittedTrip.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8" dir={direction}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PEGASUS Bespoke Experience</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1B2A] font-heading">
            Build Your Perfect Trip
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Combine airport transfers, desert safaris, kitesurfing, boat cruises, and cultural excursions into a single custom itinerary. Our team will review and calculate the best price for you.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        {currentStep < 6 && (
          <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded-2xl border border-[#EAE4D9] shadow-xs">
            {[
              { num: 1, label: 'Basics' },
              { num: 2, label: 'Experiences' },
              { num: 3, label: 'Schedule' },
              { num: 4, label: 'Customer' },
              { num: 5, label: 'Review' },
            ].map((s) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0D1B2A] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${isCurrent ? 'text-[#0D1B2A]' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {generalError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ========================================================
            STEP 1: TRIP BASICS
        ======================================================== */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              <span>Step 1 — Trip Basics & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.startDate && <p className="text-[11px] text-rose-600 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">End Date (Approx.)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Passengers <span className="text-[#D4AF37] font-semibold">(Max 2 Passengers)</span> *
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-bold text-[#0D1B2A] bg-white focus:outline-hidden focus:border-[#D4AF37]"
                >
                  <option value={1}>1 Passenger (Private VIP)</option>
                  <option value={2}>2 Passengers (Private Couple / Duo)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">PEGASUS model strictly specializes in private 1-2 passenger luxury transfers & excursions.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Pickup Location *</label>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Hurghada Airport (HRG) or Hotel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.pickup && <p className="text-[11px] text-rose-600 mt-1">{errors.pickup}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Hotel / Accommodation *</label>
                <input
                  type="text"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                  placeholder="e.g. Steigenberger ALDAU / El Gouna Resort"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.accommodation && <p className="text-[11px] text-rose-600 mt-1">{errors.accommodation}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Optional Target Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Luxor, Cairo, Sahl Hasheesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Special Requirements & Notes</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Child safety seats, dietary preferences, or specific timing requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#F0ECE1]">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>Select Experiences</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 2: SELECT EXPERIENCES
        ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
              <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D4AF37]" />
                <span>Step 2 — Choose Your Experiences ({selectedExpIds.length} Selected)</span>
              </h3>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeCategoryFilter === cat.id
                        ? 'bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37]'
                        : 'bg-[#FBF9F5] text-slate-700 border border-[#EAE4D9] hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {INITIAL_EXPERIENCES.filter((exp) => exp.active && (activeCategoryFilter === 'all' || exp.categoryId === activeCategoryFilter)).map((exp) => {
                const isSelected = selectedExpIds.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => toggleExperience(exp.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#FDFBF7] shadow-sm ring-1 ring-[#D4AF37]'
                        : 'border-[#EAE4D9] bg-[#FBF9F5] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-2 py-0.5 rounded">
                          {exp.badge}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-[#0D1B2A] border-[#D4AF37] text-[#D4AF37]' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <h4 className="font-bold text-[#0D1B2A] text-sm mb-1">{getLocalizedExpTitle(exp)}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{getLocalizedExpDesc(exp)}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#EAE4D9] flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>{isSelected ? '✓ Added to Trip' : '+ Click to Add'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>Customize Schedule ({selectedExpIds.length})</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: SCHEDULE & CUSTOMIZE SELECTED EXPERIENCES
        ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <span>Step 3 — Schedule & Customize Your Selected Experiences</span>
            </h3>

            <p className="text-xs text-slate-600">
              Assign a preferred date or specific notes for each selected activity in your custom itinerary.
            </p>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {selectedExpIds.map((id, index) => {
                const exp = INITIAL_EXPERIENCES.find((e) => e.id === id);
                if (!exp) return null;
                const details = experienceDetails[id] || { date: startDate, notes: '' };

                return (
                  <div key={id} className="p-4 rounded-xl border border-[#EAE4D9] bg-[#FBF9F5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{getLocalizedExpTitle(exp)}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExperience(id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Activity Date</label>
                        <input
                          type="date"
                          value={details.date}
                          onChange={(e) => setExperienceDetails({
                            ...experienceDetails,
                            [id]: { ...details, date: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Notes / Time</label>
                        <input
                          type="text"
                          value={details.notes}
                          onChange={(e) => setExperienceDetails({
                            ...experienceDetails,
                            [id]: { ...details, notes: e.target.value }
                          })}
                          placeholder="e.g. Morning session around 09:00 AM"
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] text-xs bg-white text-slate-900 focus:outline-hidden focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep3}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: CUSTOMER DETAILS
        ======================================================== */}
        {currentStep === 4 && (
          <form onSubmit={handleNextFromStep4} className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <User className="w-5 h-5 text-[#D4AF37]" />
              <span>Step 4 — Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.customerName && <p className="text-[11px] text-rose-600 mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 170 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Country / Nationality</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Germany, UK, Switzerland"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs font-medium text-slate-900 bg-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <span>Review Custom Trip</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            STEP 5: REVIEW & SUBMIT
        ======================================================== */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#0D1B2A] flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span>Step 5 — Review Your Custom Trip Request</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FBF9F5] p-5 rounded-xl border border-[#EAE4D9] text-xs">
              <div className="space-y-2">
                <div><span className="font-semibold text-slate-500">Customer Name:</span> <strong className="text-slate-900">{customerName}</strong></div>
                <div><span className="font-semibold text-slate-500">Email:</span> <strong className="text-slate-900">{email}</strong></div>
                <div><span className="font-semibold text-slate-500">Phone / WhatsApp:</span> <strong className="text-slate-900">{phone}</strong></div>
                <div><span className="font-semibold text-slate-500">Country:</span> <strong className="text-slate-900">{country}</strong></div>
              </div>

              <div className="space-y-2">
                <div><span className="font-semibold text-slate-500">Trip Dates:</span> <strong className="text-slate-900">{startDate} to {endDate}</strong></div>
                <div><span className="font-semibold text-slate-500">Passengers:</span> <strong className="text-slate-900">{passengerCount} Passenger(s)</strong></div>
                <div><span className="font-semibold text-slate-500">Pickup Location:</span> <strong className="text-slate-900">{pickup}</strong></div>
                <div><span className="font-semibold text-slate-500">Accommodation:</span> <strong className="text-slate-900">{accommodation}</strong></div>
              </div>
            </div>

            {/* Selected Experiences List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-3">
                Selected Experiences ({selectedExpIds.length}):
              </h4>
              <div className="space-y-2">
                {selectedExpIds.map((id) => {
                  const exp = INITIAL_EXPERIENCES.find((e) => e.id === id);
                  const details = experienceDetails[id];
                  return (
                    <div key={id} className="p-3 rounded-lg bg-white border border-[#EAE4D9] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#0D1B2A]">{exp ? getLocalizedExpTitle(exp) : id}</strong>
                        {details?.notes && <span className="block text-[11px] text-slate-500">Note: {details.notes}</span>}
                      </div>
                      <span className="text-[11px] font-semibold text-[#D4AF37] bg-[#0D1B2A] px-2 py-0.5 rounded">
                        {details?.date || startDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {specialRequests && (
              <div className="p-3 rounded-lg bg-[#FBF9F5] border border-[#EAE4D9] text-xs">
                <span className="font-bold text-slate-700 block mb-1">Special Requirements:</span>
                <p className="text-slate-600">{specialRequests}</p>
              </div>
            )}

            {/* Pricing Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Price: To be confirmed by PEGASUS</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Your trip will be reviewed by our team. We will calculate the best available price based on your selected experiences, transportation and availability.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#EAE4D9] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#ECC974] text-[#0D1B2A] font-bold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/20 hover:brightness-105 transition cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Submitting Request...' : 'Send Trip Request'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: SUCCESS CONFIRMATION SCREEN
        ======================================================== */}
        {currentStep === 6 && submittedTrip && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-10 text-center space-y-6 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-3 py-1 rounded-full">
                Status: Pending Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] font-heading">
                Custom Trip Request Received!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
                Thank you, {submittedTrip.customerName}. Your tailored trip itinerary has been submitted to PEGASUS dispatch. We will evaluate your selected experiences and contact you shortly with the final price.
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] max-w-md mx-auto flex items-center justify-between gap-3">
              <div className="text-left rtl:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Trip Reference Number</span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#0D1B2A]">{submittedTrip.referenceNumber}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold hover:bg-[#1B263B] transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {onTrackTrip && (
                <button
                  type="button"
                  onClick={() => onTrackTrip(submittedTrip.referenceNumber)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs sm:text-sm border border-[#D4AF37]/50 hover:bg-[#1B263B] transition cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Track Trip Request</span>
                </button>
              )}

              <a
                href={`https://wa.me/201000000000?text=Hello%20PEGASUS!%20I%20submitted%20a%20custom%20trip%20request%20with%20reference%20${submittedTrip.referenceNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs sm:text-sm hover:brightness-105 transition"
              >
                <Phone className="w-4 h-4" />
                <span>Contact via WhatsApp</span>
              </a>

              {onExploreOther && (
                <button
                  type="button"
                  onClick={onExploreOther}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#EAE4D9] text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>Return to Home</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
