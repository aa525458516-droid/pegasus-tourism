/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { FleetSection } from './components/FleetSection';
import { ToursSection } from './components/ToursSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { HomeTrackSection } from './components/HomeTrackSection';
import { TransfersPage } from './pages/TransfersPage';
import { TrackingPage } from './pages/TrackingPage';
import { TransferBookingModal } from './components/TransferBookingModal';
import { TourDetailModal } from './components/TourDetailModal';
import { BookingLookupModal } from './components/BookingLookupModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomTripBuilderPage } from './components/CustomTripBuilderPage';
import { Tour, ServiceType, Booking } from './types';
import { testFirestoreConnection } from './firebase';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<ServiceType>('airport_pickup');
  const [bookingTourId, setBookingTourId] = useState<string | undefined>(undefined);
  const [bookingTourTitle, setBookingTourTitle] = useState<string | undefined>(undefined);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackInitialRef, setTrackInitialRef] = useState('');

  // Initial Firestore connection validation test as required by skill
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  const handleOpenBooking = (serviceType?: string, preselectedTourId?: string, preselectedTourTitle?: string) => {
    setBookingServiceType((serviceType as ServiceType) || 'airport_pickup');
    setBookingTourId(preselectedTourId);
    setBookingTourTitle(preselectedTourTitle);
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

  const handleSelectVehicle = (vehicleId: string) => {
    handleOpenBooking('airport_pickup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1A2332]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenBooking={(type) => handleOpenBooking(type)}
        onOpenTrackBooking={() => setTrackModalOpen(true)}
        onOpenAdmin={() => setCurrentTab('admin')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HeroSection
              onOpenBooking={(type) => handleOpenBooking(type)}
              onTrackBooking={() => setTrackModalOpen(true)}
              onExploreTours={() => {
                setCurrentTab('tours');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCustomTrip={() => {
                setCurrentTab('customTrip');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ServicesSection
              onOpenBooking={(type) => handleOpenBooking(type)}
              onExploreTours={() => {
                setCurrentTab('tours');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <HomeTrackSection
              onTrack={(ref) => {
                setTrackInitialRef(ref);
                setCurrentTab('track');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FleetSection onSelectVehicle={handleSelectVehicle} />
            <ToursSection
              showOnlyFeatured={true}
              onSelectTour={handleSelectTourForDetails}
              onBookTour={handleBookTourFromModal}
            />
            <AboutSection />
            <GallerySection />
            <ContactSection />
          </>
        )}

        {currentTab === 'transfers' && (
          <TransfersPage
            onTrackBooking={(ref) => {
              setTrackInitialRef(ref);
              setCurrentTab('track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'track' && (
          <TrackingPage
            initialReference={trackInitialRef}
            onOpenBooking={() => handleOpenBooking('airport_pickup')}
          />
        )}

        {currentTab === 'customTrip' && (
          <CustomTripBuilderPage
            onTrackTrip={(ref) => {
              setTrackInitialRef(ref);
              setCurrentTab('track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreOther={() => {
              setCurrentTab('home');
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
            <FleetSection onSelectVehicle={handleSelectVehicle} />
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
          <AdminDashboard onClose={() => setCurrentTab('home')} />
        )}
      </main>

      {/* Global Footer (shown on all public pages) */}
      {currentTab !== 'admin' && (
        <Footer
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenBooking={() => handleOpenBooking('airport_pickup')}
          onOpenAdmin={() => setCurrentTab('admin')}
          onOpenTrackBooking={() => {
            setCurrentTab('track');
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
        onBookingSuccess={() => {}}
        onTrackBooking={(ref) => {
          setTrackInitialRef(ref);
          setBookingModalOpen(false);
          setCurrentTab('track');
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
