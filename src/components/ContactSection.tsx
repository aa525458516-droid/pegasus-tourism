import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { sendContactMessage } from '../services/messageService';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { t, direction } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Message).');
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
      setError('Failed to send message. Please connect with us directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#FBF9F5] border-b border-[#EAE4D9]" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#0D1B2A] text-xs font-semibold mb-3">
            <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>24/7 Red Sea Concierge</span>
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
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>Hurghada Head Office</span>
              </h3>

              <div className="space-y-5 text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#0D1B2A] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.office')}
                    </span>
                    <span className="font-medium text-slate-900 block">
                      [Insert Office Street Address - Editable Placeholder]
                    </span>
                    <span className="text-xs text-slate-500">Hurghada, Red Sea Governorate, Egypt</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                      {t('contact.whatsapp')}
                    </span>
                    <span className="font-medium text-emerald-700 block font-mono text-xs">
                      +20 [Insert WhatsApp Number - Editable Placeholder]
                    </span>
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
                    <span className="font-medium text-slate-900 block font-mono text-xs">
                      +20 [Insert Contact Phone - Editable Placeholder]
                    </span>
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
                    <a href="mailto:info@pegasus-hurghada.com" className="font-medium text-slate-900 hover:underline block">
                      info@pegasus-hurghada.com
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
                      24 Hours / 7 Days a Week
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">Night flights & emergency dispatch active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Map Location Preview card */}
            <div className="bg-[#0D1B2A] text-white rounded-2xl p-6 border border-[#D4AF37]/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#D4AF37] uppercase font-bold tracking-wider">
                  Service Coverage Map
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">
                  Egypt Red Sea Coast
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                We operate across Hurghada Int'l Airport (HRG), El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Safaga, Marsa Alam, plus private long-distance journeys to Luxor and Cairo.
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
                Have questions regarding transfers, customized itineraries or private group charters? Send us a message and our team will get back to you promptly.
              </p>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 mb-6 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('contact.sentSuccess')}</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      Our dispatch manager will respond to your email or WhatsApp number shortly.
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
                      placeholder="e.g. Thomas Weber"
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
                      placeholder="e.g. thomas@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
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
                      placeholder="+49 ... or +20 ..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDBD] text-sm focus:outline-hidden focus:border-[#D4AF37]"
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
                      placeholder="e.g. Luxor Private Day Trip for 4"
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
                    placeholder="Tell us about your flight arrival, hotel destination, or tour questions..."
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
