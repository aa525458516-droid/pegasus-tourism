import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookingForm } from './BookingForm';
import { ServiceType, Booking } from '../types';
import { X, Car } from 'lucide-react';

interface TransferBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: ServiceType;
  tourId?: string;
  tourTitle?: string;
  onBookingSuccess?: (b: Booking) => void;
  onTrackBooking?: (reference: string) => void;
}

export const TransferBookingModal: React.FC<TransferBookingModalProps> = ({
  isOpen,
  onClose,
  serviceType = 'airport_pickup',
  tourId,
  tourTitle,
  onBookingSuccess,
  onTrackBooking,
}) => {
  const { t, direction } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-[#FBF9F5] rounded-2xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden my-auto"
        dir={direction}
      >
        {/* Modal Header */}
        <div className="bg-[#0D1B2A] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                {tourTitle ? `Book Tour: ${tourTitle}` : t('booking.title')}
              </h3>
              <p className="text-xs text-slate-300">
                {t('booking.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <BookingForm
            isModal={true}
            initialServiceType={serviceType}
            initialTourId={tourId}
            initialTourTitle={tourTitle}
            onCancel={onClose}
            onSuccess={(b) => {
              if (onBookingSuccess) onBookingSuccess(b);
            }}
            onTrackBooking={(ref) => {
              onClose();
              if (onTrackBooking) onTrackBooking(ref);
            }}
          />
        </div>
      </div>
    </div>
  );
};
