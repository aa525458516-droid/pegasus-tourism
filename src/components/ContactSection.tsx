import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sendContactMessage } from '../services/messageService';
import { getCompanySettings, getWhatsAppLink, subscribeToCompanySettings, COMPANY_SOCIAL_LINKS } from '../services/settingsService';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { InstagramIcon, TikTokIcon } from './SocialLinks';

export const ContactSection: React.FC = () => {
  const { t, direction, language } = useLanguage();
  const [companySettings, setCompanySettings] = useState(getCompanySettings());

  useEffect(() => {
    const unsub = subscribeToCompanySettings(setCompanySettings);
    return () => unsub();
  }, []);

  const instagramUrl = companySettings.socialMedia?.instagramUrl || COMPANY_SOCIAL_LINKS.instagramUrl;
  const instagramHandle = companySettings.socialMedia?.instagramHandle || COMPANY_SOCIAL_LINKS.instagramHandle;
  const tiktokUrl = companySettings.socialMedia?.tiktokUrl || COMPANY_SOCIAL_LINKS.tiktokUrl;
  const tiktokHandle = companySettings.socialMedia?.tiktokHandle || COMPANY_SOCIAL_LINKS.tiktokHandle;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) {
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(
        language === 'ru'
          ? 'Пожалуйста, заполните все обязательные поля (Имя, Email, Сообщение).'
          : language === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، الرسالة).'
          : language === 'de'
          ? 'Bitte füllen Sie alle Pflichtfelder aus (Name, E-Mail, Nachricht).'
          : 'Please fill in all required fields (Name, Email, Message).'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setError(
        language === 'ru'
          ? 'Не удалось отправить сообщение. Пожалуйста, свяжитесь с нами напрямую в WhatsApp.'
          : language === 'ar'
          ? 'تعذر إرسال الرسالة. يرجى التواصل معنا مباشرة عبر واتساب.'
          : language === 'de'
          ? 'Nachricht konnte nicht gesendet werden. Bitte kontaktieren Sie uns direkt per WhatsApp.'
          : 'Failed to send message. Please connect with us directly via WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = getWhatsAppLink(
    companySettings.whatsapp,
    'Hello PEGASUS! I have an inquiry regarding private transfers and tours in Hurghada.'
  );

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {language === 'ru'
                ? 'Прямая координация клиентов'
                : language === 'ar'
                ? 'تنسيق مباشر مع العملاء'
                : language === 'de'
                ? 'Direkte Kundenbetreuung'
                : 'Direct Client Coordination'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-[#0D1B2A] mb-3">
            {t('contact.title')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#EAE4D9] p-7 shadow-xs">
              <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-6 flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
                <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>
                  {language === 'ru'
                    ? 'Контактная информация'
                    : language === 'ar'
                    ? 'بيانات التواصل'
                    : language === 'de'
                    ? 'Kontaktinformationen'
                    : 'Contact Information'}
                </span>
              </h3>

              <div className="space-y-5 text-sm text-slate-700">
                {/* Only display physical address if admin actually set a non-empty address */}
                {companySettings.address && companySettings.address.trim() && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#0D1B2A] shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                        {t('contact.office')}
                      </span>
                      <span className="font-medium text-slate-900 block">
                        {companySettings.address}
                      </span>
                      <span className="text-xs text-slate-500">
                        {language === 'ru' ? 'Хургада, Красное море, Египет' : language === 'ar' ? 'الغردقة، البحر الأحمر، مصر' : language === 'de' ? 'Hurghada, Rotes Meer, Ägypten' : 'Hurghada, Red Sea, Egypt'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.whatsapp')}
                    </span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-700 block font-mono text-xs hover:underline"
                      dir="ltr"
                    >
                      {companySettings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#0D1B2A] shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.phone')}
                    </span>
                    <a
                      href={`tel:${companySettings.phone}`}
                      className="font-medium text-slate-900 block font-mono text-xs hover:text-[#D4AF37]"
                      dir="ltr"
                    >
                      {companySettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#0D1B2A] shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.email')}
                    </span>
                    <a
                      href={`mailto:${companySettings.email}`}
                      className="font-medium text-slate-900 hover:underline block"
                      dir="ltr"
                    >
                      {companySettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#0D1B2A] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.hours')}
                    </span>
                    <span className="font-medium text-slate-900 block">
                      {t('contact.hoursValue', 'Daily coordination for scheduled arrivals & trips')}
                    </span>
                  </div>
                </div>

                {/* Official Social Media Accounts */}
                <div className="pt-4 border-t border-[#F0ECE1]">
                  <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-2.5">
                    {t('social.followUs')}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Instagram @${instagramHandle}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE4D9] bg-[#FBF9F5] hover:border-[#D4AF37] text-[#0D1B2A] text-xs font-semibold transition"
                    >
                      <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                      <span>{t('social.instagram')} (@{instagramHandle})</span>
                    </a>
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`TikTok @${tiktokHandle}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE4D9] bg-[#FBF9F5] hover:border-[#D4AF37] text-[#0D1B2A] text-xs font-semibold transition"
                    >
                      <TikTokIcon className="w-4 h-4 text-[#0D1B2A]" />
                      <span>{t('social.tiktok')} (@{tiktokHandle})</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Card */}
            <div className="bg-[#0D1B2A] text-white rounded-2xl p-6 border border-[#D4AF37]/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#D4AF37] uppercase font-bold tracking-wider">
                  {language === 'ru' ? 'География сервиса' : language === 'ar' ? 'نطاق الخدمة' : language === 'de' ? 'Servicegebiet' : 'Service Coverage'}
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  {language === 'ru' ? 'Красное море и Египет' : language === 'ar' ? 'البحر الأحمر ومصر' : language === 'de' ? 'Rotes Meer & darüber hinaus' : 'Red Sea & Beyond'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ru'
                  ? 'Мы организуем частные трансферы из аэропорта Хургады (HRG), в Эль-Гуну, Макади-Бэй, Сахль-Хашиш, Сома-Бэй, Сафагу, Марса-Алам, а также индивидуальные междугородние поездки в Луксор и Каир.'
                  : language === 'ar'
                  ? 'ننسق تنقلات خاصة عبر مطار الغردقة (HRG)، الجونة، مكادي باي، سهل حشيش، سوما باي، سفاجا، مرسى علم، بالإضافة إلى رحلات خاصة إلى الأقصر والقاهرة.'
                  : language === 'de'
                  ? 'Wir koordinieren Privattransfers ab Flughafen Hurghada (HRG), El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Safaga, Marsa Alam sowie Fernfahrten nach Luxor und Kairo.'
                  : 'We coordinate private transfers across Hurghada Airport (HRG), El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Safaga, Marsa Alam, plus custom long-distance journeys to Luxor and Cairo.'}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                <span className="bg-white/10 px-2 py-1 rounded">Hurghada (HRG)</span>
                <span className="bg-white/10 px-2 py-1 rounded">El Gouna</span>
                <span className="bg-white/10 px-2 py-1 rounded">Makadi Bay</span>
                <span className="bg-white/10 px-2 py-1 rounded">Sahl Hasheesh</span>
                <span className="bg-white/10 px-2 py-1 rounded">Soma Bay</span>
                <span className="bg-white/10 px-2 py-1 rounded">Marsa Alam</span>
                <span className="bg-white/10 px-2 py-1 rounded">Luxor</span>
                <span className="bg-white/10 px-2 py-1 rounded">Cairo</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#EAE4D9] p-7 shadow-xs">
              <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-2">
                {t('contact.formTitle')}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                {language === 'ru'
                  ? 'Есть вопросы по трансферам, индивидуальным маршрутам или групповым поездкам? Отправьте сообщение, и наша команда оперативно ответит.'
                  : language === 'ar'
                  ? 'هل لديك استفسار حول التوصيل أو تصميم برنامج خاص؟ أرسل لنا رسالة وسيتواصل معك فريقنا سريعاً.'
                  : language === 'de'
                  ? 'Haben Sie Fragen zu Transfers, individuellen Routen oder Gruppenbuchungen? Schreiben Sie uns eine Nachricht.'
                  : 'Have questions regarding transfers, customized itineraries or private group bookings? Send us a message and our team will get back to you promptly.'}
              </p>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('contact.sentSuccess')}</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {language === 'ru'
                        ? 'Наш координатор скоро ответит вам на электронную почту или в WhatsApp.'
                        : language === 'ar'
                        ? 'سيتواصل معك منسقنا عبر البريد الإلكتروني أو واتساب قريباً.'
                        : language === 'de'
                        ? 'Unser Koordinator antwortet Ihnen zeitnah per E-Mail oder WhatsApp.'
                        : 'Our coordinator will respond to your email or WhatsApp number promptly.'}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 mb-6">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                  <label htmlFor="contact_website_url">Do not fill this</label>
                  <input
                    type="text"
                    id="contact_website_url"
                    name="contact_website_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('contact.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('booking.namePlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('booking.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('booking.emailPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('booking.phone')}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 ... / +49 ... / +20 ..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('contact.subject')}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={language === 'ru' ? 'Например, трансфер из аэропорта Хургады' : language === 'ar' ? 'مثال: توصيل من مطار الغردقة لـ ٣ أفراد' : language === 'de' ? 'z.B. Flughafentransfer Hurghada' : 'e.g. Hurghada Airport Transfer for 3'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'ru' ? 'Напишите данные прилёта, отель назначения или вопросы по экскурсии...' : language === 'ar' ? 'أخبرنا بموعد رحلتك، اسم الفندق، أو استفسارك السياحي...' : language === 'de' ? 'Nennen Sie uns Flugzeiten, Zielhotel oder Ihre Fragen...' : 'Tell us about your flight arrival, hotel destination, or tour questions...'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] text-[#D4AF37] font-bold text-sm shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>{t('contact.sending')}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('contact.send')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
