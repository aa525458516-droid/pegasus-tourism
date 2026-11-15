import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSiteImage, HAS_REAL_IMAGES } from '../config/images';
import { ShieldCheck, Compass, CheckCircle2, Car, Calendar, Users, Phone, MapPin } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t, direction, language } = useLanguage();

  const steps = language === 'ru'
    ? [
        {
          num: '01',
          title: 'Прямая онлайн-заявка',
          desc: 'Укажите маршрут или данные прилёта. Получите мгновенный номер бронирования без онлайн-оплаты картой.'
        },
        {
          num: '02',
          title: 'Проверка авиабилета',
          desc: 'Наш координатор в Хургаде сверяет копию авиабилета и время прилёта, чтобы закрепить за вами личного водителя.'
        },
        {
          num: '03',
          title: 'Персональная встреча',
          desc: 'Водитель встречает вас сразу при выходе из терминала или в лобби отеля с именной табличкой.'
        },
        {
          num: '04',
          title: 'Частная поездка и оплата на месте',
          desc: 'Комфортная поездка на чистом авто с кондиционером только для вашей компании. Оплата наличными при встрече.'
        }
      ]
    : language === 'ar'
    ? [
        {
          num: '01',
          title: 'طلب حجز إلكتروني مباشر',
          desc: 'أدخل تفاصيل رحلتك أو الوصول واحصل على رقم مرجعي فوري دون الحاجة للدفع بالبطاقة عبر الإنترنت.'
        },
        {
          num: '02',
          title: 'مراجعة تذكرة الطيران',
          desc: 'يتحقق منسق الرحلات في الغردقة من تذكرة الطيران وموعد الهبوط لتخصيص سائقك الخاص.'
        },
        {
          num: '03',
          title: 'استقبال شخصي بالاسم',
          desc: 'ينتظرك السائق أمام بوابة الخروج من الصالة أو في بهو الفندق حاملاً لافتة باسمك.'
        },
        {
          num: '04',
          title: 'رحلة خاصة والدفع نقداً',
          desc: 'انطلق براحة في سيارة مكيفة مخصصة لمجموعتك فقط، مع تسديد المبلغ نقداً عند الوصول.'
        }
      ]
    : language === 'de'
    ? [
        {
          num: '01',
          title: 'Direkte Online-Anfrage',
          desc: 'Übermitteln Sie Ihre Reisedaten und erhalten Sie sofort eine Referenznummer ohne Online-Kartenzahlung.'
        },
        {
          num: '02',
          title: 'Flugdaten-Prüfung',
          desc: 'Unser Team in Hurghada prüft Ihr Flugticket und teilt Ihnen rechtzeitig Ihren persönlichen Fahrer zu.'
        },
        {
          num: '03',
          title: 'Persönlicher Empfang',
          desc: 'Ihr Chauffeur erwartet Sie am Terminalausgang oder an der Hotelrezeption mit einem Namensschild.'
        },
        {
          num: '04',
          title: 'Privatfahrt & Barzahlung',
          desc: 'Reisen Sie entspannt im klimatisierten Privatfahrzeug exklusiv für Ihre Gruppe und zahlen Sie bar vor Ort.'
        }
      ]
    : [
        {
          num: '01',
          title: 'Direct Online Request',
          desc: 'Submit your journey or airport details. Receive an instant booking reference number without any online card payment.'
        },
        {
          num: '02',
          title: 'Flight Ticket Verification',
          desc: 'Our Hurghada coordinator verifies your flight ticket copy and scheduled arrival time to assign a dedicated driver.'
        },
        {
          num: '03',
          title: 'Personal Meet & Greet',
          desc: 'Your driver meets you directly outside the terminal exit or hotel lobby holding a personalized name sign.'
        },
        {
          num: '04',
          title: 'Private Ride & Cash Payment',
          desc: 'Travel comfortably in a clean, air-conditioned vehicle dedicated solely to you and your party. Settle payment in cash.'
        }
      ];

  const aboutImage = getSiteImage('about');

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {language === 'ru'
                  ? 'Частный транспорт и экскурсии в Хургаде'
                  : language === 'ar'
                  ? 'النقل الخاص والرحلات في الغردقة'
                  : language === 'de'
                  ? 'Privater Transport & Ausflüge in Hurghada'
                  : 'Hurghada Private Transport & Excursions'}
              </span>
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

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#EAE4D9]">
              <div className="p-3.5 bg-white rounded-xl border border-[#EAE4D9]">
                <span className="block text-xs font-bold text-[#0D1B2A] mb-1">{t('about.commit1Title')}</span>
                <span className="text-[11px] text-slate-600 leading-snug">{t('about.commit1Desc')}</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-[#EAE4D9]">
                <span className="block text-xs font-bold text-[#0D1B2A] mb-1">{t('about.commit2Title')}</span>
                <span className="text-[11px] text-slate-600 leading-snug">{t('about.commit2Desc')}</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-[#EAE4D9]">
                <span className="block text-xs font-bold text-[#0D1B2A] mb-1">{t('about.commit3Title')}</span>
                <span className="text-[11px] text-slate-600 leading-snug">{t('about.commit3Desc')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {HAS_REAL_IMAGES.about && aboutImage ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={aboutImage.path}
                  alt="PEGASUS Chauffeur Service Hurghada"
                  className="w-full h-[420px] object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl p-8 bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0D1B2A] text-white shadow-2xl border border-[#D4AF37]/40 flex flex-col justify-between min-h-[380px]">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-white">
                    {language === 'ru'
                      ? 'Частный трансфер с водителем в Хургаде'
                      : language === 'ar'
                      ? 'خدمة السائق الخاص في الغردقة'
                      : language === 'de'
                      ? 'Privater Chauffeurservice in Hurghada'
                      : 'Private Chauffeur Service in Hurghada'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'ru'
                      ? 'Мы подаём отдельные кондиционированные автомобили по каждой подтверждённой заявке. Никаких общих автобусов и толп — строго индивидуальный сервис с оплатой наличными по прибытии.'
                      : language === 'ar'
                      ? 'نوفر سيارات ركاب خاصة ومكيفة لكل حجز مؤكد. لا حافلات مشتركة ولا مجموعات مزدحمة — خدمة خاصة مع الدفع نقداً عند الوصول.'
                      : language === 'de'
                      ? 'Wir stellen für jede bestätigte Buchung ein klimatisiertes Privatfahrzeug bereit. Keine Sammelbusse — streng privater Service mit Barzahlung bei Ankunft.'
                      : 'We arrange private, air-conditioned passenger cars per confirmed reservation. No shared buses, no crowded tour groups — strictly personalized service with cash payment on arrival.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#D4AF37] font-bold block">
                      {language === 'ru' ? 'Вместимость' : language === 'ar' ? 'السعة' : language === 'de' ? 'Kapazität' : 'Capacity'}
                    </span>
                    <span className="text-slate-300">
                      {language === 'ru' ? 'До 4 чел. (до 8 в Hiace)' : language === 'ar' ? 'حتى ٤ ركاب (٨ في Hiace)' : language === 'de' ? 'Bis zu 4 Pers. (8 im Hiace)' : 'Max 4 pax (8 in Hiace)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#D4AF37] font-bold block">
                      {language === 'ru' ? 'Оплата' : language === 'ar' ? 'الدفع' : language === 'de' ? 'Zahlung' : 'Payment'}
                    </span>
                    <span className="text-slate-300">
                      {language === 'ru' ? 'Наличными по прилёте' : language === 'ar' ? 'نقداً عند الوصول' : language === 'de' ? 'Bar bei Ankunft' : 'Cash upon arrival'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Airport Arrival Protocol */}
        <div className="bg-white rounded-2xl border border-[#EAE4D9] p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold font-heading text-[#0D1B2A] mb-2">
              {language === 'ru'
                ? 'Как проходит частная встреча PEGASUS'
                : language === 'ar'
                ? 'تجربة الاستقبال الخاص مع بيجاسوس'
                : language === 'de'
                ? 'Das PEGASUS Privat-Ankunftserlebnis'
                : 'The PEGASUS Private Arrival Experience'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ru'
                ? 'Понятные шаги для комфортного прилёта в международный аэропорт Хургады (HRG):'
                : language === 'ar'
                ? 'خطوات واضحة لوصول سلس ومريح في مطار الغردقة الدولي (HRG):'
                : language === 'de'
                ? 'Klare Schritte für eine entspannte Ankunft am Flughafen Hurghada (HRG):'
                : 'Clear steps for a smooth arrival at Hurghada International Airport (HRG):'}
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
