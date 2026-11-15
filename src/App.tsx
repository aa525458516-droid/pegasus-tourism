/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { LanguageProvider, useLanguage, Language } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { DestinationsSection } from './components/DestinationsSection';
import { ToursSection } from './components/ToursSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { HomeTrackSection } from './components/HomeTrackSection';
import { HomeCtaSection } from './components/HomeCtaSection';
import { TransfersPage } from './pages/TransfersPage';
import { TrackingPage } from './pages/TrackingPage';
import { TransferBookingModal } from './components/TransferBookingModal';
import { TourDetailModal } from './components/TourDetailModal';
import { BookingLookupModal } from './components/BookingLookupModal';
import { CustomTripBuilderPage } from './components/CustomTripBuilderPage';
import { Tour, ServiceType } from './types';
import { testFirestoreConnection } from './firebase';

// Lazy-load AdminDashboard for reduced initial bundle footprint
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const VALID_LANGS: Language[] = ['en', 'de', 'ar', 'ru'];

const ROUTE_MAP: Record<string, string> = {
  '': 'home',
  'home': 'home',
  'transfers': 'transfers',
  'tours': 'tours',
  'custom-trip': 'customTrip',
  'customtrip': 'customTrip',
  'track': 'track',
  'about': 'about',
  'gallery': 'gallery',
  'contact': 'contact',
  'admin': 'admin',
};

const TAB_TO_ROUTE: Record<string, string> = {
  home: '',
  transfers: 'transfers',
  tours: 'tours',
  customTrip: 'custom-trip',
  track: 'track',
  about: 'about',
  gallery: 'gallery',
  contact: 'contact',
  admin: 'admin',
};

const PAGE_METADATA: Record<string, Record<Language, { title: string; desc: string }>> = {
  home: {
    en: {
      title: 'PEGASUS Tourism | Private Transfers & Experiences in Hurghada',
      desc: 'Private airport transfers, custom excursions, and personal travel arrangements in Hurghada and the Red Sea.',
    },
    de: {
      title: 'PEGASUS Tourism | Private Transfers & Ausflüge in Hurghada',
      desc: 'Private Flughafentransfers, individuelle Ausflüge und persönliche Reiseplanung in Hurghada und am Roten Meer.',
    },
    ar: {
      title: 'بيجاسوس توريزم | نقل خاص وتجارب سياحية في الغردقة',
      desc: 'خدمات التوصيل الخاص من وإلى مطار الغردقة، وتجارب سياحية مخصصة في البحر الأحمر مع حجز مباشر وسريع.',
    },
    ru: {
      title: 'PEGASUS Tourism | Частные трансферы и экскурсии в Хургаде',
      desc: 'Индивидуальные трансферы из аэропорта, авторские экскурсии и персональная организация поездок в Хургаде и по Египту.',
    },
  },
  transfers: {
    en: {
      title: 'Airport & Private Transfers | PEGASUS Hurghada',
      desc: 'Reliable private passenger transfers across Hurghada, El Gouna, Makadi Bay, Soma Bay, and Marsa Alam. Up to 4 passengers or up to 8 with Toyota Hiace.',
    },
    de: {
      title: 'Flughafentransfers & Private Fahrten | PEGASUS Hurghada',
      desc: 'Zuverlässige private Fahrgasttransfers in Hurghada, El Gouna, Makadi Bay, Soma Bay und Marsa Alam. Bis 4 Passagiere oder bis 8 mit Toyota Hiace.',
    },
    ar: {
      title: 'توصيل المطار والتنقلات الخاصة | بيجاسوس الغردقة',
      desc: 'خدمات التوصيل الخاص من وإلى مطار الغردقة، الجونة، مكادي باي، سوما باي، ومرسى علم حتى 4 ركاب أو حتى 8 ركاب مع Toyota Hiace.',
    },
    ru: {
      title: 'Трансферы из аэропорта и частные поездки | PEGASUS Хургада',
      desc: 'Надёжные индивидуальные трансферы в Хургаде, Эль-Гуне, Макади-Бэй, Сома-Бэй и Марса-Аламе. До 4 пассажиров или до 8 в Toyota Hiace.',
    },
  },
  tours: {
    en: {
      title: 'Excursions & Experiences | PEGASUS Hurghada',
      desc: 'Browse pre-designed safari, marine, kitesurfing, and cultural day trips in Hurghada and Egypt.',
    },
    de: {
      title: 'Ausflüge & Erlebnisse | PEGASUS Hurghada',
      desc: 'Entdecken Sie geführte Wüstensafaris, Bootsfahrten, Kitesurf-Spots und Tagesausflüge in Hurghada und Ägypten.',
    },
    ar: {
      title: 'الرحلات والتجارب السياحية | بيجاسوس الغردقة',
      desc: 'استكشف رحلات السفاري الصحراوية، والرحلات البحرية، وأنشطة الكايت سيرف والرحلات اليومية في الغردقة ومصر.',
    },
    ru: {
      title: 'Экскурсии и туры | PEGASUS Хургада',
      desc: 'Готовые морские прогулки, сафари в пустыне, кайтсёрфинг и культурные однодневные туры в Хургаде и по Египту.',
    },
  },
  customTrip: {
    en: {
      title: 'Build Your Perfect Trip | PEGASUS Hurghada',
      desc: 'Design a bespoke itinerary across Hurghada and Egypt with personal destinations, private vehicle, and custom schedule.',
    },
    de: {
      title: 'Wunschreise zusammenstellen | PEGASUS Hurghada',
      desc: 'Gestalten Sie Ihre maßgeschneiderte Reiseroute in Hurghada und Ägypten mit individuellen Zielen und persönlichem Zeitplan.',
    },
    ar: {
      title: 'صمم رحلتك المخصصة | بيجاسوس الغردقة',
      desc: 'صمم برنامج رحلتك المفضل في الغردقة ومصر مع اختيار وجهاتك وسيارة خاصة وجدول زمني يناسبك تماماً.',
    },
    ru: {
      title: 'Создайте свой идеальный маршрут | PEGASUS Хургада',
      desc: 'Соберите индивидуальный маршрут по Хургаде и Египту: выберите направления, частный автомобиль и удобное расписание.',
    },
  },
  track: {
    en: {
      title: 'Track Your Booking | PEGASUS Hurghada',
      desc: 'Check the real-time status, driver assignment, and details of your PEGASUS transfer or custom trip with your reference code.',
    },
    de: {
      title: 'Buchung verfolgen | PEGASUS Hurghada',
      desc: 'Überprüfen Sie den Live-Status und die Details Ihres gebuchten Transfers oder Ausflugs mit Ihrer Referenznummer.',
    },
    ar: {
      title: 'متابعة الحجز | بيجاسوس الغردقة',
      desc: 'تابع حالة حجزك وتفاصيل رحلتك مع بيجاسوس مباشرة عبر كود الحجز التعريفي الخاص بك.',
    },
    ru: {
      title: 'Отслеживание бронирования | PEGASUS Хургада',
      desc: 'Проверьте актуальный статус, детали поездки и расчёт стоимости вашего трансфера или индивидуального тура по номеру брони.',
    },
  },
  about: {
    en: {
      title: 'About PEGASUS | Private Tourism Services Hurghada',
      desc: 'Dedicated private passenger transport and excursion coordination based in Hurghada, Egypt.',
    },
    de: {
      title: 'Über PEGASUS | Privater Reiseservice Hurghada',
      desc: 'Ihr zuverlässiger Partner für private Fahrgastbeförderung und individuelle Touren in Hurghada, Ägypten.',
    },
    ar: {
      title: 'عن بيجاسوس | خدمات النقل والرحلات الخاصة',
      desc: 'تعرف على بيجاسوس لخدمات النقل الخاص بالركاب وتنظيم الجولات السياحية في الغردقة والبحر الأحمر.',
    },
    ru: {
      title: 'О компании PEGASUS | Частные трансферы и туры в Хургаде',
      desc: 'Индивидуальные пассажирские перевозки и организация экскурсий в Хургаде и на Красном море, Египет.',
    },
  },
  gallery: {
    en: {
      title: 'Gallery | PEGASUS Hurghada',
      desc: 'Photos and impressions of our private transfers and excursion destinations around the Red Sea.',
    },
    de: {
      title: 'Galerie | PEGASUS Hurghada',
      desc: 'Eindrücke und Impressionen unserer Transfers und Ausflugsziele am Roten Meer.',
    },
    ar: {
      title: 'معرض الصور | بيجاسوس الغردقة',
      desc: 'صور ومشاهد من وجهات رحلاتنا وتوصيلاتنا الخاصة في البحر الأحمر.',
    },
    ru: {
      title: 'Галерея | PEGASUS Хургада',
      desc: 'Фотографии и впечатления от наших частных трансферов и экскурсионных маршрутов по Красному морю.',
    },
  },
  contact: {
    en: {
      title: 'Contact Us | PEGASUS Hurghada',
      desc: 'Get in touch directly with our team via WhatsApp or email for bookings, custom inquiries, and assistance.',
    },
    de: {
      title: 'Kontakt | PEGASUS Hurghada',
      desc: 'Kontaktieren Sie uns direkt per WhatsApp oder E-Mail für Buchungen, individuelle Anfragen und Betreuung.',
    },
    ar: {
      title: 'تواصل معنا | بيجاسوس الغردقة',
      desc: 'تواصل معنا مباشرة عبر واتساب أو البريد الإلكتروني للاستفسارات والحجوزات والمساعدة الفورية.',
    },
    ru: {
      title: 'Контакты | PEGASUS Хургада',
      desc: 'Свяжитесь с нашей командой напрямую через WhatsApp или электронную почту для бронирования и консультаций.',
    },
  },
  admin: {
    en: {
      title: 'Admin Portal | PEGASUS Tourism',
      desc: 'Admin dashboard for booking management, fleet settings, tour catalog, and customer quotes.',
    },
    de: {
      title: 'Admin-Bereich | PEGASUS Tourism',
      desc: 'Verwaltungsportal für Buchungen, Fahrzeugkategorien, Tourenkatalog und Preiskalkulation.',
    },
    ar: {
      title: 'لوحة الإدارة | بيجاسوس توريزم',
      desc: 'لوحة تحكم إدارة الحجوزات، إعدادات الفئات، كتالوج الرحلات، والتسعير المخصص.',
    },
    ru: {
      title: 'Панель управления | PEGASUS Tourism',
      desc: 'Панель администратора для управления бронированиями, автопарком, каталогом экскурсий и тарифами.',
    },
  },
};

function parsePath(pathname: string): { lang?: Language; page: string } {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { page: 'home' };
  }

  // Check if first segment is a valid language code
  if (VALID_LANGS.includes(segments[0] as Language)) {
    const lang = segments[0] as Language;
    const pageSegment = segments[1] || '';
    const page = ROUTE_MAP[pageSegment.toLowerCase()] || 'home';
    return { lang, page };
  }

  // No language prefix
  const page = ROUTE_MAP[segments[0].toLowerCase()] || 'home';
  return { page };
}

function MainApp() {
  const { language, setLanguage } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<ServiceType>('airport_pickup');
  const [bookingTourId, setBookingTourId] = useState<string | undefined>(undefined);
  const [bookingTourTitle, setBookingTourTitle] = useState<string | undefined>(undefined);
  const [bookingPassengers, setBookingPassengers] = useState<number>(2);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackInitialRef, setTrackInitialRef] = useState('');
  const [trackInitialContact, setTrackInitialContact] = useState('');

  // Initial Firestore connection validation test
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Synchronize state from URL on initial load and handle query params
  useEffect(() => {
    const { lang, page } = parsePath(window.location.pathname);
    if (lang && lang !== language) {
      setLanguage(lang);
    }
    setCurrentTab(page);

    // Parse URL search params (e.g. ?ref=PEG-XXXX)
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get('ref');
    if (refParam) {
      setTrackInitialRef(refParam.trim());
    }
  }, []);

  // Listen to browser Back and Forward history events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const { lang, page } = parsePath(window.location.pathname);
      if (lang && lang !== language) {
        setLanguage(lang);
      }
      setCurrentTab(page);

      const searchParams = new URLSearchParams(window.location.search);
      const refParam = searchParams.get('ref');
      if (refParam) {
        setTrackInitialRef(refParam.trim());
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language, setLanguage]);

  // Push new history state when navigating
  const navigateTo = useCallback(
    (tab: string, customRef?: string) => {
      setCurrentTab(tab);
      const routeSegment = TAB_TO_ROUTE[tab] || '';
      const path = routeSegment ? `/${language}/${routeSegment}` : `/${language}`;
      const search = customRef ? `?ref=${encodeURIComponent(customRef)}` : '';
      const targetUrl = `${path}${search}`;

      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState({ tab, language }, '', targetUrl);
      }
    },
    [language]
  );

  // Update URL if language changes while staying on current tab
  useEffect(() => {
    const routeSegment = TAB_TO_ROUTE[currentTab] || '';
    const path = routeSegment ? `/${language}/${routeSegment}` : `/${language}`;
    const search = window.location.search;
    const currentFull = window.location.pathname + search;
    const targetUrl = `${path}${search}`;

    if (currentFull !== targetUrl && !(window.location.pathname === '/' && language === 'en')) {
      window.history.replaceState({ tab: currentTab, language }, '', targetUrl);
    }
  }, [language, currentTab]);

  // Dynamic document title, meta description, canonical, Open Graph, and hreflang links
  useEffect(() => {
    const currentLang = (language || 'en') as Language;
    const metaInfo = (PAGE_METADATA[currentTab] && PAGE_METADATA[currentTab][currentLang]) || PAGE_METADATA.home[currentLang];
    const origin = window.location.origin;
    const routeSegment = TAB_TO_ROUTE[currentTab] || '';
    const canonicalPath = routeSegment ? `/${currentLang}/${routeSegment}` : `/${currentLang}`;
    const canonicalUrl = `${origin}${canonicalPath}`;

    if (metaInfo) {
      document.title = metaInfo.title;

      const setMetaTag = (attrName: 'name' | 'property', attrVal: string, content: string) => {
        let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMetaTag('name', 'description', metaInfo.desc);
      setMetaTag('property', 'og:title', metaInfo.title);
      setMetaTag('property', 'og:description', metaInfo.desc);
      setMetaTag('property', 'og:url', canonicalUrl);

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);

      (['en', 'de', 'ar', 'ru'] as Language[]).forEach((langCode) => {
        const altPath = routeSegment ? `/${langCode}/${routeSegment}` : `/${langCode}`;
        let altLink = document.querySelector(`link[rel="alternate"][hreflang="${langCode}"]`);
        if (!altLink) {
          altLink = document.createElement('link');
          altLink.setAttribute('rel', 'alternate');
          altLink.setAttribute('hreflang', langCode);
          document.head.appendChild(altLink);
        }
        altLink.setAttribute('href', `${origin}${altPath}`);
      });

      let xDefaultLink = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
      if (!xDefaultLink) {
        xDefaultLink = document.createElement('link');
        xDefaultLink.setAttribute('rel', 'alternate');
        xDefaultLink.setAttribute('hreflang', 'x-default');
        document.head.appendChild(xDefaultLink);
      }
      xDefaultLink.setAttribute('href', routeSegment ? `${origin}/en/${routeSegment}` : `${origin}/`);
    }
  }, [currentTab, language]);

  const handleOpenBooking = (serviceType?: string, preselectedTourId?: string, preselectedTourTitle?: string, initialPassengers?: number) => {
    setBookingServiceType((serviceType as ServiceType) || 'airport_pickup');
    setBookingTourId(preselectedTourId);
    setBookingTourTitle(preselectedTourTitle);
    setBookingPassengers(typeof initialPassengers === 'number' ? Math.min(8, Math.max(1, initialPassengers)) : 2);
    setBookingModalOpen(true);
  };

  const handleSelectTourForDetails = (tour: Tour) => {
    setSelectedTour(tour);
    setDetailModalOpen(true);
  };

  const handleBookTourFromModal = (tour: Tour) => {
    setSelectedTour(tour);
    handleOpenBooking('tour', tour.id, tour.title);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1A2332]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          navigateTo(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenBooking={(type) => handleOpenBooking(type)}
        onOpenTrackBooking={() => setTrackModalOpen(true)}
        onOpenAdmin={() => {
          navigateTo('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HeroSection
              onOpenBooking={(type, tourId, tourTitle, initialPax) => handleOpenBooking(type, tourId, tourTitle, initialPax)}
              onTrackBooking={() => setTrackModalOpen(true)}
              onExploreTours={() => {
                navigateTo('tours');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCustomTrip={() => {
                navigateTo('customTrip');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ServicesSection
              onOpenBooking={(type) => handleOpenBooking(type)}
              onExploreTours={() => {
                navigateTo('tours');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCustomTrip={() => {
                navigateTo('customTrip');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <DestinationsSection
              onOpenBooking={(type) => handleOpenBooking(type)}
              onOpenCustomTrip={() => {
                navigateTo('customTrip');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ToursSection
              showOnlyFeatured={true}
              onSelectTour={handleSelectTourForDetails}
              onBookTour={handleBookTourFromModal}
            />
            <HomeTrackSection
              onTrack={(ref, contact) => {
                setTrackInitialRef(ref);
                setTrackInitialContact(contact || '');
                navigateTo('track', ref);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <HomeCtaSection
              onOpenBooking={(type) => handleOpenBooking(type)}
              onOpenCustomTrip={() => {
                navigateTo('customTrip');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackBooking={() => setTrackModalOpen(true)}
            />
          </>
        )}

        {currentTab === 'transfers' && (
          <TransfersPage
            onTrackBooking={(ref, contact) => {
              setTrackInitialRef(ref);
              setTrackInitialContact(contact || '');
              navigateTo('track', ref);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'track' && (
          <TrackingPage
            initialReference={trackInitialRef}
            initialContact={trackInitialContact}
            onOpenBooking={() => handleOpenBooking('airport_pickup')}
          />
        )}

        {currentTab === 'customTrip' && (
          <CustomTripBuilderPage
            onTrackTrip={(ref, contact) => {
              setTrackInitialRef(ref);
              setTrackInitialContact(contact || '');
              navigateTo('track', ref);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreOther={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'tours' && (
          <div className="pt-6">
            <ToursSection
              showOnlyFeatured={false}
              onSelectTour={handleSelectTourForDetails}
              onBookTour={handleBookTourFromModal}
            />
          </div>
        )}

        {currentTab === 'about' && (
          <div className="pt-6">
            <AboutSection />
          </div>
        )}

        {currentTab === 'gallery' && (
          <div className="pt-6">
            <GallerySection />
          </div>
        )}

        {currentTab === 'contact' && (
          <div className="pt-6">
            <ContactSection />
          </div>
        )}

        {currentTab === 'admin' && (
          <Suspense
            fallback={
              <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-[#C5A880]/30 border-t-[#C5A880] rounded-full animate-spin mb-4" />
                <p className="text-[#1A2332]/60 font-medium">Loading Admin Portal...</p>
              </div>
            }
          >
            <AdminDashboard
              onClose={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        )}
      </main>

      {/* Global Footer (shown on all public pages) */}
      {currentTab !== 'admin' && (
        <Footer
          onNavigate={(tab) => {
            navigateTo(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenBooking={() => handleOpenBooking('airport_pickup')}
          onOpenAdmin={() => {
            navigateTo('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTrackBooking={() => {
            navigateTo('track');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Transfer Booking Modal */}
      <TransferBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        serviceType={bookingServiceType}
        tourId={bookingTourId}
        tourTitle={bookingTourTitle}
        initialPassengers={bookingPassengers}
        onBookingSuccess={() => {}}
        onTrackBooking={(ref, contact) => {
          setTrackInitialRef(ref);
          setTrackInitialContact(contact || '');
          setBookingModalOpen(false);
          navigateTo('track', ref);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Individual Tour Details Modal */}
      <TourDetailModal
        tour={selectedTour}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onBookTour={handleBookTourFromModal}
      />

      {/* Customer Booking Tracking Modal */}
      <BookingLookupModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialReference={trackInitialRef}
        initialContact={trackInitialContact}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
