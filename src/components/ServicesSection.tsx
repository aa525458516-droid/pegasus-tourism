import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Plane, 
  Car, 
  Compass, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Headphones, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ServicesSectionProps {
  onOpenBooking: (serviceType?: string, preselectedTourId?: string) => void;
  onExploreTours: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenBooking,
  onExploreTours,
}) => {
  const { t, direction, language } = useLanguage();

  const services = [
    {
      id: 'airport_transfers',
      title: language === 'ar' ? 'توصيل واستقبال المطار' : language === 'de' ? 'Flughafentransfers' : 'Airport Transfers',
      badge: language === 'ar' ? 'مطار الغردقة HRG' : language === 'de' ? 'Flughafen Hurghada HRG' : 'Hurghada Airport HRG',
      desc: language === 'ar'
        ? 'خدمة استقبال شخصية داخل صالة الوصول مع متابعة حية لرحلات الطيران بدون أي رسوم إضافية في حالة التأخير.'
        : language === 'de'
        ? 'Persönlicher Empfang mit Namensschild in der Ankunftshalle und Live-Flugüberwachung ohne Wartegebühren bei Verspätung.'
        : 'VIP meet & greet inside the arrival hall with live flight tracking to adjust pickup timing automatically for delays.',
      icon: Plane,
      action: () => onOpenBooking('airport_pickup'),
      btnLabel: language === 'ar' ? 'حجز توصيل المطار' : language === 'de' ? 'Flughafentransfer buchen' : 'Book Airport Transfer',
    },
    {
      id: 'private_transfers',
      title: language === 'ar' ? 'نقل وتوصيل خاص' : language === 'de' ? 'Private Transfers' : 'Private Transfers',
      badge: language === 'ar' ? 'من الباب إلى الباب' : language === 'de' ? 'Tür-zu-Tür' : 'Door-to-Door',
      desc: language === 'ar'
        ? 'تنقلات خاصة مريحة بين منتجعات الجونة، مكادي باي، سهل حشيش، سوما باي، وسفاجا في سيارات مجهزة ومعقمة.'
        : language === 'de'
        ? 'Komfortabler Chauffeurservice zwischen El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay und Safaga in klimatisierten Fahrzeugen.'
        : 'Point-to-point private transfers between El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, and Safaga resorts.',
      icon: Car,
      action: () => onOpenBooking('private_transfer'),
      btnLabel: language === 'ar' ? 'طلب نقل خاص' : language === 'de' ? 'Transfer anfragen' : 'Book Private Transfer',
    },
    {
      id: 'tours_excursions',
      title: language === 'ar' ? 'جولات ورحلات سياحية' : language === 'de' ? 'Touren & Ausflüge' : 'Tours & Excursions',
      badge: language === 'ar' ? 'الأقصر والقاهرة والبحر الأحمر' : language === 'de' ? 'Luxor, Kairo & Rotes Meer' : 'Luxor, Cairo & Red Sea',
      desc: language === 'ar'
        ? 'رحلات يومية خاصة ومنظمة إلى معالم الأقصر الأثرية، أهرامات الجيزة، ورحلات بحرية وسفاري مع مرشد سياحي متخصص.'
        : language === 'de'
        ? 'Individuelle Tagesausflüge nach Luxor ins Tal der Könige, zu den Pyramiden von Gizeh sowie Schnorchelausflüge.'
        : 'Curated private day tours to the Valley of the Kings in Luxor, Giza Pyramids in Cairo, and Red Sea coral reefs.',
      icon: Compass,
      action: onExploreTours,
      btnLabel: language === 'ar' ? 'استعراض الرحلات' : language === 'de' ? 'Touren entdecken' : 'Explore Tours',
    },
    {
      id: 'custom_trips',
      title: language === 'ar' ? 'رحلات مخصصة' : language === 'de' ? 'Individuelle Fahrten' : 'Custom Trips',
      badge: language === 'ar' ? 'حدد مسارك على الخريطة' : language === 'de' ? 'Freie Routenwahl' : 'Bespoke Itinerary',
      desc: language === 'ar'
        ? 'صمم مسارك الخاص واختر مكان الانطلاق والوصول مباشرة من الخريطة التفاعلية مع سائق خاص تحت الطلب.'
        : language === 'de'
        ? 'Planen Sie Ihre individuelle Route mit freier Wahl von Abhol- und Zielort direkt auf der interaktiven Karte.'
        : 'Design your own route and pick any hotel, street, or landmark across Egypt directly on the interactive map.',
      icon: MapPin,
      action: () => onOpenBooking('custom_trip'),
      btnLabel: language === 'ar' ? 'تصميم رحلة مخصصة' : language === 'de' ? 'Fahrt zusammenstellen' : 'Plan Custom Trip',
    },
  ];

  const whyChooseBenefits = [
    {
      title: language === 'ar' ? 'خدمة خاصة بالكامل' : language === 'de' ? 'Private Service' : 'Private Service',
      desc: language === 'ar'
        ? 'مركبة خاصة مخصصة لك ولمرافقيك فقط بدون مشاركة مع غرباء، لأعلى درجات الخصوصية والراحة.'
        : language === 'de'
        ? 'Ausschließlich private Fahrzeuge für Sie und Ihre Reisebegleiter – keine geteilten Fahrten mit Fremden.'
        : 'Exclusively private vehicles reserved solely for you and your travel companions, with zero shared rides.',
      icon: ShieldCheck,
    },
    {
      title: language === 'ar' ? 'حجز سهل ومباشر' : language === 'de' ? 'Einfache Buchung' : 'Easy Booking',
      desc: language === 'ar'
        ? 'احصل على رقم حجز فوري بدون دفع إلكتروني مسبق. الدفع للسائق عند الوصول بكل شفافية.'
        : language === 'de'
        ? 'Sofortige Buchungsreferenz ohne Vorauszahlung. Bezahlen Sie bequem bei Ankunft direkt beim Chauffeur.'
        : 'Immediate booking reference with zero upfront card payment. Settle comfortably upon arrival.',
      icon: CheckCircle2,
    },
    {
      title: language === 'ar' ? 'وجهات مرنة ومتعددة' : language === 'de' ? 'Flexible Reiseziele' : 'Flexible Destinations',
      desc: language === 'ar'
        ? 'توصيل مباشر لجميع فنادق ومنتجعات البحر الأحمر والمدن المصرية مع إمكانية التحديد عبر الخريطة.'
        : language === 'de'
        ? 'Direkte Fahrten zu allen Resorts am Roten Meer sowie zwischen ägyptischen Städten nach Ihren Wünschen.'
        : 'Direct door-to-door transit across all Red Sea resorts, airports, and major Egyptian historic cities.',
      icon: MapPin,
    },
    {
      title: language === 'ar' ? 'دعم وتنسيق محترف' : language === 'de' ? 'Professionelle Betreuung' : 'Professional Support',
      desc: language === 'ar'
        ? 'فريق تنسيق محلي بالغردقة متواجد على مدار الساعة للمساعدة عبر واتساب والهاتف المباشر.'
        : language === 'de'
        ? 'Lokales Dispositionsteam in Hurghada steht Ihnen rund um die Uhr per WhatsApp und Telefon zur Seite.'
        : 'Local 24/7 dispatch office in Hurghada ready to assist you in English, German, and Arabic via WhatsApp.',
      icon: Headphones,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section 1: Services Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>PEGASUS Core Services</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0D1B2A] tracking-tight mb-3">
            {language === 'ar' ? 'خدمات النقل والرحلات السياحية' : language === 'de' ? 'Unsere Transfer- & Tourendienste' : 'Our Services & Private Transfers'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'ar'
              ? 'خدمات نقل وتوصيل راقية ورحلات استكشافية خاصة في الغردقة ومصر بأعلى معايير الأمان والراحة.'
              : language === 'de'
              ? 'Erstklassige Transfers und private Ausflüge in Hurghada und ganz Ägypten mit höchstem Komfort.'
              : 'Premium private transportation and organized excursions across Hurghada and Egypt, tailored to individual travelers, families, and executive VIPs.'}
          </p>
        </div>

        {/* 4 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service) => {
            const IconComp = service.icon;
            return (
              <div
                key={service.id}
                className="bg-[#FBF9F5] rounded-2xl border border-[#EAE4D9] p-6 hover:border-[#D4AF37] hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0D1B2A] text-[#D4AF37] flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#0D1B2A] px-2.5 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-2">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {service.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={service.action}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#0D1B2A] text-[#0D1B2A] hover:text-[#D4AF37] border border-[#D5CDBD] hover:border-[#0D1B2A] font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  <span>{service.btnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Section 2: Why Choose PEGASUS (Zero invented claims or numbers) */}
        <div className="bg-[#0D1B2A] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#D4AF37]/40 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] block mb-2">
                Why Choose PEGASUS
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#FBF9F5]">
                {language === 'ar' ? 'لماذا يفضل المسافرون بيجاسوس' : language === 'de' ? 'Warum PEGASUS' : 'Why Travelers Choose PEGASUS'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                {language === 'ar'
                  ? 'خدمات موثوقة تركز على راحتك التامة ووضوح المواعيد بدون رسوم خفية أو وسطاء.'
                  : language === 'de'
                  ? 'Zuverlässige Mobilität mit Fokus auf Privatsphäre, Pünktlichkeit und transparente Konditionen.'
                  : 'Reliable private transportation focused on discretion, punctual service, and completely transparent rates.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseBenefits.map((item, index) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 backdrop-blur-xs transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mb-3">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">
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
