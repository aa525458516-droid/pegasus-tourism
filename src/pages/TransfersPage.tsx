import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookingForm } from '../components/BookingForm';
import {
  subscribeToTransferPricingRules,
  subscribeToVehicleOptions,
  resolveVehicleDisplayName,
} from '../services/settingsService';
import { TransferPriceRule, VehicleOption } from '../types';
import {
  Plane,
  Car,
  CheckCircle,
  Sparkles,
  Tag,
} from 'lucide-react';

interface TransfersPageProps {
  onTrackBooking?: (ref: string, contact?: string) => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ onTrackBooking }) => {
  const { t, language, direction } = useLanguage();
  const [pricingRules, setPricingRules] = useState<TransferPriceRule[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  useEffect(() => {
    const unsubRules = subscribeToTransferPricingRules(setPricingRules);
    const unsubVeh = subscribeToVehicleOptions(setVehicles);
    return () => {
      unsubRules();
      unsubVeh();
    };
  }, []);

  const activeRules = pricingRules.filter((r) => r.active !== false);

  return (
    <div className="py-12 bg-[#FBF9F5]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <Plane className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {language === 'ru'
                ? 'Частный водитель из/в международный аэропорт Хургады (HRG)'
                : language === 'ar'
                ? 'سائق خاص بمطار الغردقة الدولي (HRG)'
                : language === 'de'
                ? 'Privater Chauffeur am Flughafen Hurghada (HRG)'
                : 'Hurghada International Airport (HRG) Private Chauffeur'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('nav.transfers')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {language === 'ru'
              ? 'Забронируйте частный трансфер от двери до двери из аэропорта Хургады прямо в ваш отель или курорт. Отдельный автомобиль для вашей компании и оплата наличными по прибытии.'
              : language === 'ar'
              ? 'احجز توصيلك الخاص من الباب إلى الباب من مطار الغردقة مباشرة إلى فندقك أو منتجعك. سيارة خاصة لمجموعتك مع الدفع نقداً عند الوصول.'
              : language === 'de'
              ? 'Reservieren Sie Ihren privaten Tür-zu-Tür-Transfer vom Flughafen Hurghada direkt zu Ihrem Hotel. Exklusives Privatfahrzeug mit Barzahlung vor Ort.'
              : 'Reserve your private door-to-door transfer from Hurghada Airport directly to your hotel or resort. Individual private vehicle with cash payment upon arrival.'}
          </p>
        </div>

        {/* Main Grid: Form on Left, Side Info on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          {/* Booking Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE4D9] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0ECE1]">
              <div>
                <h2 className="text-xl font-bold font-heading text-[#0D1B2A]">
                  {language === 'ru' ? 'Заказать трансфер' : language === 'ar' ? 'حجز خدمة النقل' : language === 'de' ? 'Transfer reservieren' : 'Reserve Transfer'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'ru'
                    ? 'Мгновенный код бронирования • Статус «Ожидает» • Оплата наличными'
                    : language === 'ar'
                    ? 'رمز حجز فوري • الحالة قيد المراجعة • الدفع نقداً عند الوصول'
                    : language === 'de'
                    ? 'Sofortiger Referenzcode • Status Ausstehend • Bar bei Ankunft'
                    : 'Instant reference code • Status set to Pending • Cash on arrival'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#0D1B2A] border border-[#D4AF37]/40">
                {language === 'ru' ? 'Маршрут + Авто' : language === 'ar' ? 'المسار + السيارة' : language === 'de' ? 'Route + Fahrzeug' : 'Route + Vehicle Pricing'}
              </span>
            </div>

            <BookingForm initialServiceType="airport_pickup" onTrackBooking={onTrackBooking} />
          </div>

          {/* Side Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Service Standards */}
            <div className="bg-[#0D1B2A] text-white rounded-2xl p-6 sm:p-7 border border-[#D4AF37]/40 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-white">
                  {language === 'ru' ? 'Что вас ждёт в поездке' : language === 'ar' ? 'ما تتوقعه في رحلتك' : language === 'de' ? 'Was Sie bei Ihrem Transfer erwartet' : 'What to Expect on Your Transfer'}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{language === 'ru' ? 'Координация по расписанию рейса:' : language === 'ar' ? 'تنسيق مواعيد الطيران:' : language === 'de' ? 'Flugzeit-Koordination:' : 'Flight Schedule Coordination:'}</strong>
                    {language === 'ru'
                      ? 'Мы согласуем подачу авто с вашим плановым прилётом, чтобы водитель ждал вас при выходе из терминала.'
                      : language === 'ar'
                      ? 'ننسق الاستقبال وفق موعد وصولك المجدول ليكون السائق جاهزاً فور خروجك من الصالة.'
                      : language === 'de'
                      ? 'Wir stimmen die Abholung auf Ihre Landung ab, damit Ihr Fahrer direkt am Ausgang bereitsteht.'
                      : 'We coordinate pickup with your scheduled arrival so your driver is ready when you step out of the terminal.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{language === 'ru' ? 'Персональная табличка с именем:' : language === 'ar' ? 'لافتة استقبال شخصية باسمك:' : language === 'de' ? 'Persönliches Namensschild:' : 'Personal Name Sign:'}</strong>
                    {language === 'ru'
                      ? 'Ваш водитель ожидает у выхода из зоны прилёта с чёткой табличкой с вашим именем.'
                      : language === 'ar'
                      ? 'ينتظرك السائق خارج منطقة الوصول حاملاً لافتة واضحة باسمك.'
                      : language === 'de'
                      ? 'Ihr Fahrer erwartet Sie am Ausgang des Ankunftsbereichs mit einem klaren Namensschild.'
                      : 'Your driver awaits you outside the arrival area holding a clear name sign.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{language === 'ru' ? 'Чистый автомобиль с кондиционером:' : language === 'ar' ? 'سيارة نظيفة ومكيفة:' : language === 'de' ? 'Sauberes, klimatisiertes Fahrzeug:' : 'Clean Air-Conditioned Vehicle:'}</strong>
                    {language === 'ru'
                      ? 'Бронируется исключительно для вашей частной группы.'
                      : language === 'ar'
                      ? 'مخصصة بالكامل لمجموعتك الخاصة فقط.'
                      : language === 'de'
                      ? 'Exklusiv für Ihre private Reisegruppe reserviert.'
                      : 'Reserved solely for your private travel group.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{language === 'ru' ? 'Оплата наличными при встрече:' : language === 'ar' ? 'الدفع نقداً عند الوصول:' : language === 'de' ? 'Barzahlung bei Ankunft:' : 'Cash Payment on Arrival:'}</strong>
                    {language === 'ru'
                      ? 'Оплачивайте согласованную сумму наличными водителю после встречи.'
                      : language === 'ar'
                      ? 'سدد المبلغ المتفق عليه نقداً للسائق فور لقائك به.'
                      : language === 'de'
                      ? 'Zahlen Sie den vereinbarten Betrag direkt bar nach der Begrüßung durch Ihren Fahrer.'
                      : 'Pay the agreed amount directly in cash after meeting your driver.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Vehicle-Based Transfer Rates Card */}
            <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-heading text-[#0D1B2A] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {language === 'ar'
                      ? 'أسعار التوصيل حسب المسار والسيارة'
                      : language === 'de'
                      ? 'Transferpreise nach Route & Fahrzeug'
                      : language === 'ru'
                      ? 'Тарифы по маршруту и авто'
                      : 'Vehicle-Based Transfer Rates'}
                  </span>
                </h3>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {language === 'ru' ? 'Маршрут + Авто' : language === 'ar' ? 'المسار + السيارة' : 'Route + Vehicle'}
                </span>
              </div>

              {activeRules.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-[#0D1B2A] mb-1">
                    {t('booking.priceOnRequest')}
                  </p>
                  <p>
                    {language === 'ar'
                      ? 'يتم تحديد السعر حسب نقطة الانطلاق، الوجهة، فئة السيارة (بما في ذلك Toyota Hiace)، ونوع الرحلة داخل نموذج الحجز.'
                      : language === 'de'
                      ? 'Transferpreise richten sich nach Strecke, Fahrtrichtung und Fahrzeugkategorie (inkl. Toyota Hiace) im Buchungsformular.'
                      : language === 'ru'
                      ? 'Стоимость трансфера зависит от места подачи, назначения, типа поездки и выбранного авто (включая Toyota Hiace) в форме заказа.'
                      : 'Transfer quotes depend on pickup location, destination, trip type, and selected vehicle (including Toyota Hiace) in the booking form.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto pr-1">
                  {activeRules.map((rule) => {
                    const vehName = resolveVehicleDisplayName(rule.vehicleId, vehicles, language);
                    return (
                      <div key={rule.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 block truncate">
                            {rule.origin} ➔ {rule.destination}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Car className="w-3 h-3 text-[#D4AF37] shrink-0" />
                            <span className="truncate">{vehName}</span>
                          </span>
                        </div>
                        <div className="text-right rtl:text-left shrink-0 space-y-0.5">
                          <span className="block text-[11px] font-bold text-[#0D1B2A]">
                            {t('booking.oneWay')}:{' '}
                            {typeof rule.oneWayPrice === 'number' && rule.oneWayPrice > 0
                              ? `${rule.oneWayPrice} ${rule.currency}`
                              : t('booking.priceOnRequest')}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {t('booking.roundTrip')}:{' '}
                            {typeof rule.roundTripPrice === 'number' && rule.roundTripPrice > 0
                              ? `${rule.roundTripPrice} ${rule.currency}`
                              : t('booking.priceOnRequest')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
