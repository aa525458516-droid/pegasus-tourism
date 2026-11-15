import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  playBookingChime, 
  requestNotificationPermission, 
  isNotificationPermissionGranted, 
  sendDesktopNotification 
} from '../services/notificationService';
import { 
  Booking, 
  Tour, 
  ContactMessage, 
  CompanySettings, 
  BookingStatus, 
  CustomTripRequest, 
  AdminEmailRecord, 
  CompanyPolicies,
  DestinationItem,
  VehicleOption,
  TransferPriceRule
} from '../types';
import { 
  subscribeToBookings, 
  updateBookingStatus, 
  deleteBooking 
} from '../services/bookingService';
import { 
  subscribeToTours, 
  saveTour, 
  deleteTour 
} from '../services/tourService';
import { 
  subscribeToMessages, 
  updateMessageStatus, 
  deleteMessage 
} from '../services/messageService';
import { 
  getCompanySettings, 
  subscribeToCompanySettings,
  saveCompanySettings,
  getWhatsAppLink,
  getVehicleOptions,
  subscribeToVehicleOptions,
  saveVehicleOptions,
  resolveVehicleDisplayName,
  subscribeToTransferPricingRules,
  saveTransferPricingRules
} from '../services/settingsService';
import { POPULAR_LOCATIONS } from '../data/initialData';
import {
  subscribeToDestinations,
  saveDestination,
  deleteDestination
} from '../services/destinationService';
import { AdminImageUploader } from './AdminImageUploader';
import {
  getAllCustomTripRequests,
  updateCustomTripPricing,
  updateCustomTripStatus,
  saveCustomTripAdminPricing,
  getCustomTripAdminPricing
} from '../services/customTripService';
import {
  subscribeToAdminEmails,
  addAdminEmail,
  removeAdminEmail,
  isBootstrapAdmin
} from '../services/adminService';
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  Car, 
  Calendar, 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Mail, 
  Printer, 
  RefreshCw,
  Lock,
  Eye,
  AlertCircle,
  MapPin,
  ExternalLink,
  Compass,
  UserCheck,
  FileText,
  DollarSign,
  Send,
  Calculator,
  Download,
  Image as ImageIcon,
  Check,
  Bell,
  Volume2,
  X,
  Tag
} from 'lucide-react';

const AdminCustomTripCard: React.FC<{
  trip: CustomTripRequest;
  onUpdate: () => void;
  showFeedback: (msg: string, type?: 'success' | 'error') => void;
}> = ({ trip, onUpdate, showFeedback }) => {
  const [internalCost, setInternalCost] = useState('');
  const [margin, setMargin] = useState('');
  const [finalPrice, setFinalPrice] = useState(trip.price?.toString() || '');
  const [currency, setCurrency] = useState(trip.currency || 'EUR');
  const [customerMessage, setCustomerMessage] = useState(trip.customerMessage || '');
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    // Load confidential pricing from /customTripAdminPricing
    getCustomTripAdminPricing(trip.referenceNumber).then((pricing) => {
      if (pricing) {
        if (pricing.internalCost !== undefined) setInternalCost(pricing.internalCost.toString());
        if (pricing.margin !== undefined) setMargin(pricing.margin.toString());
      }
    });
  }, [trip.referenceNumber]);

  const applyBenchmark = (price: number, cost: number, marginVal: number) => {
    setFinalPrice(price.toString());
    setInternalCost(cost.toString());
    setMargin(marginVal.toString());
    showFeedback(`تم تطبيق السعر المعتمد: ${price} €`, 'success');
  };

  const handleSendPrice = async () => {
    setSavingPrice(true);
    try {
      const costNum = Number(internalCost) || 0;
      const marginNum = Number(margin) || 0;
      const priceNum = Number(finalPrice) || 0;

      // 1. Save confidential admin pricing & public quote
      await updateCustomTripPricing(trip.referenceNumber, costNum, marginNum, priceNum, currency);

      // 3. Update customer message if provided
      if (customerMessage.trim()) {
        await updateCustomTripStatus(trip.referenceNumber, 'Price Sent', customerMessage.trim());
      }

      showFeedback(`Quoted price of ${priceNum} ${currency} sent for ${trip.referenceNumber}`, 'success');
      onUpdate();
    } catch (err) {
      console.error(err);
      showFeedback('Failed to update custom trip pricing.', 'error');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE4D9] p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs bg-[#0D1B2A] text-[#D4AF37] px-2.5 py-1 rounded">
            {trip.referenceNumber}
          </span>
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
            trip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
            trip.status === 'Price Sent' ? 'bg-purple-100 text-purple-800' :
            (trip.status === 'Customer Approved' || trip.status === 'Price Approved') ? 'bg-emerald-100 text-emerald-900' :
            trip.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {trip.status}
          </span>
        </div>
        <span className="text-xs text-slate-500">Requested: {new Date(trip.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div><strong className="text-slate-500">Customer:</strong> {trip.customerName}</div>
          <div><strong className="text-slate-500">Email:</strong> {trip.email}</div>
          <div><strong className="text-slate-500">Phone:</strong> {trip.phone}</div>
          <div><strong className="text-slate-500">Country:</strong> {trip.country}</div>
        </div>

        <div className="space-y-1">
          <div><strong className="text-slate-500">Dates:</strong> {trip.startDate} to {trip.endDate}</div>
          <div><strong className="text-slate-500">Passengers:</strong> {trip.passengerCount} (Max 4)</div>
          <div><strong className="text-slate-500">Pickup:</strong> {trip.pickup}</div>
          <div><strong className="text-slate-500">Accommodation:</strong> {trip.accommodation}</div>
        </div>

        <div className="space-y-1 bg-[#FBF9F5] p-3 rounded-xl border border-[#EAE4D9]">
          <strong className="text-[#0D1B2A] block mb-1">Selected Experiences ({trip.experiences?.length || 0}):</strong>
          <ul className="space-y-1 max-h-28 overflow-y-auto">
            {trip.experiences?.map((exp, i) => (
              <li key={i} className="text-[11px] text-slate-700 flex items-center justify-between">
                <span>• {exp.title}</span>
                <span className="text-slate-400 text-[10px]">{exp.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {trip.specialRequests && (
        <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700">
          <strong>Special Requests:</strong> {trip.specialRequests}
        </div>
      )}

      {/* Admin PEGASUS Excursion Rate Helper Toolbar */}
      <div className="p-3.5 bg-gradient-to-r from-[#F4EFE6] to-[#FAF8F3] rounded-xl border border-[#D4AF37]/50 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#0D1B2A] flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>دليل تسعير الرحلات المخصصة (قابل للتعديل)</span>
          </span>
          <span className="text-[11px] text-[#0D1B2A] bg-white px-2.5 py-0.5 rounded border border-[#EAE4D9] font-semibold">
            PEGASUS Custom Quote Helper
          </span>
        </div>

        {/* Quick Reference Pricing Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyBenchmark(220, 150, 70)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Cairo (Pyramids & Museum) = 220 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>القاهرة والأهرامات (220€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(185, 125, 60)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Luxor (Valley of the Kings & Karnak) = 185 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>الأقصر ووادي الملوك (185€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(70, 45, 25)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Orange Bay Island Sea Trip = 70 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>أورانج باي (70€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(99, 65, 34)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Marsa Alam Abu Dabbab = 99 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>مرسى علم وأبو دباب (99€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(85, 55, 30)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Dolphin House Snorkeling = 85 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span>رحلة الدلافين (85€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(75, 50, 25)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Coral Reef Snorkeling = 75 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>كورال جاردن (75€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(60, 40, 20)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="El Gouna Lagoon & Tour = 60 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>الجونة (60€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(45, 30, 15)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Desert Quad Safari = 45 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>سفاري الدبابات (45€)</span>
          </button>

          <button
            type="button"
            onClick={() => applyBenchmark(40, 25, 15)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FDFBF7] border border-[#D5CDBD] hover:border-[#D4AF37] text-[11px] font-semibold text-slate-800 transition shadow-2xs cursor-pointer flex items-center gap-1"
            title="Hurghada City Tour = 40 EUR"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>جولة الغردقة (40€)</span>
          </button>
        </div>
      </div>

      {/* Admin Pricing & Status Control Box */}
      <div className="pt-3 border-t border-[#F0ECE1] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500">Internal Cost (Confidential)</label>
            <input
              type="number"
              value={internalCost}
              onChange={(e) => setInternalCost(e.target.value)}
              placeholder="0"
              className="w-24 px-2.5 py-1 rounded-lg border text-xs bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500">Margin (Confidential)</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              placeholder="0"
              className="w-24 px-2.5 py-1 rounded-lg border text-xs bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#D4AF37]">Final Customer Price</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="0"
                className="w-24 px-2.5 py-1 rounded-lg border border-[#D4AF37] text-xs font-bold bg-white text-[#0D1B2A]"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-1.5 py-1 rounded-lg border text-xs font-bold bg-white text-slate-800"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="EGP">EGP</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={savingPrice}
            onClick={handleSendPrice}
            className="px-4 py-2 rounded-lg bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer self-end"
          >
            {savingPrice ? 'Saving...' : 'Send / Update Price'}
          </button>
        </div>

        {/* Customer message and status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Message to Customer (Visible in Customer Tracking)
            </label>
            <input
              type="text"
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="e.g. Price includes private chauffeur, vehicle, and all entrance tickets."
              className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
            <select
              value={trip.status}
              onChange={async (e) => {
                await updateCustomTripStatus(trip.referenceNumber, e.target.value as any, customerMessage);
                showFeedback(`Status updated to ${e.target.value}`, 'success');
                onUpdate();
              }}
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-bold bg-white text-slate-900"
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Price Sent">Price Sent</option>
              <option value="Customer Approved">Customer Approved</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { isAdmin, adminDisplayName, loginWithGoogle, loginWithEmailPassword, logout } = useAuth();
  const { t, direction } = useLanguage();

  const [activeTab, setActiveTab] = useState<'bookings' | 'customTrips' | 'destinations' | 'fleet' | 'pricing' | 'tours' | 'messages' | 'admins' | 'settings'>('bookings');
  
  // Real Firebase credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [customTrips, setCustomTrips] = useState<CustomTripRequest[]>([]);
  const [adminEmailsList, setAdminEmailsList] = useState<AdminEmailRecord[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());

  // Destinations state
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [editingDestination, setEditingDestination] = useState<DestinationItem | null>(null);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);

  // Fleet state
  const [vehiclesList, setVehiclesList] = useState<VehicleOption[]>(getVehicleOptions());
  const [editingVehicle, setEditingVehicle] = useState<VehicleOption | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [savingVehicles, setSavingVehicles] = useState(false);

  // Vehicle-Based Transfer Pricing state
  const [pricingRules, setPricingRules] = useState<TransferPriceRule[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleOrigin, setRuleOrigin] = useState('');
  const [ruleDestination, setRuleDestination] = useState('');
  const [ruleVehicleId, setRuleVehicleId] = useState('toyota_corolla');
  const [ruleOneWayPrice, setRuleOneWayPrice] = useState('');
  const [ruleRoundTripPrice, setRuleRoundTripPrice] = useState('');
  const [ruleCurrency, setRuleCurrency] = useState<'EUR' | 'USD' | 'EGP'>('EUR');
  const [ruleActive, setRuleActive] = useState(true);
  const [pricingSearch, setPricingSearch] = useState('');
  const [savingPricing, setSavingPricing] = useState(false);

  // Filters & selection
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Tour edit state
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isNewTourModalOpen, setIsNewTourModalOpen] = useState(false);

  // Admins management state
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  // Settings saving state
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Status feedback toast & cancel confirmation modal
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Real-time booking alert and desktop notifications
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState<boolean>(() => isNotificationPermissionGranted());
  const [newBookingAlert, setNewBookingAlert] = useState<Booking | null>(null);
  const previousBookingsCountRef = useRef<number>(-1);
  const previousCustomTripsCountRef = useRef<number>(-1);

  useEffect(() => {
    const unsubDest = subscribeToDestinations((items) => {
      setDestinations(items);
    });
    const unsubVehicles = subscribeToVehicleOptions((items) => {
      setVehiclesList(items);
    });
    const unsubPricing = subscribeToTransferPricingRules((rules) => {
      setPricingRules(rules);
    });
    const unsubSettings = subscribeToCompanySettings((settings) => {
      setCompanySettings(settings);
    });
    return () => {
      unsubDest();
      unsubVehicles();
      unsubPricing();
      unsubSettings();
    };
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleUpdateStatus = async (b: Booking, newStatus: BookingStatus) => {
    const targetId = b.id || b.bookingReference;
    if (!targetId) return;

    if (newStatus === 'Cancelled') {
      setCancelModalBooking(b);
      return;
    }

    setBookings((prev) =>
      prev.map((item) =>
        (item.id && item.id === b.id) || item.bookingReference === b.bookingReference
          ? { ...item, status: newStatus }
          : item
      )
    );

    try {
      await updateBookingStatus(
        targetId,
        b.bookingReference,
        newStatus,
        b.adminNotes,
        b.customerMessage
      );
      showFeedback(`Booking ${b.bookingReference} status changed to ${newStatus}.`, 'success');
    } catch (err) {
      console.error('Failed to update booking status:', err);
      showFeedback(`Failed to update ${b.bookingReference}.`, 'error');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    const b = cancelModalBooking;
    const targetId = b.id || b.bookingReference;
    setCancelModalBooking(null);

    try {
      await updateBookingStatus(
        targetId,
        b.bookingReference,
        'Cancelled',
        b.adminNotes,
        b.customerMessage
      );
      showFeedback(`Booking ${b.bookingReference} has been cancelled.`, 'success');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      showFeedback(`Failed to cancel ${b.bookingReference}.`, 'error');
    }
  };

  // Real-time subscriptions with instant audio chime and desktop push alerts
  useEffect(() => {
    if (!isAdmin) return;

    const unsubBookings = subscribeToBookings((list) => {
      setBookings(list);
      // If bookings list grew after initial load, play chime & notify admin
      if (previousBookingsCountRef.current !== -1 && list.length > previousBookingsCountRef.current) {
        const newest = list[0];
        playBookingChime();
        if (newest) {
          setNewBookingAlert(newest);
          sendDesktopNotification('🚨 حجز جديد في بيجاسوس توريزم!', {
            body: `حجز جديد من ${newest.customerName || 'عميل'} برقم ${newest.bookingReference}`,
          });
        }
      }
      previousBookingsCountRef.current = list.length;
    });

    const unsubTours = subscribeToTours(setTours);
    const unsubMessages = subscribeToMessages(setMessages);
    const unsubAdmins = subscribeToAdminEmails(setAdminEmailsList);
    setCompanySettings(getCompanySettings());

    const refreshCustomTrips = () => {
      getAllCustomTripRequests().then((trips) => {
        setCustomTrips(trips);
        if (previousCustomTripsCountRef.current !== -1 && trips.length > previousCustomTripsCountRef.current) {
          playBookingChime();
          const newestTrip = trips[0];
          sendDesktopNotification('🌟 طلب رحلة مخصصة جديد في بيجاسوس!', {
            body: `طلب رحلة جديد من ${newestTrip?.customerName || 'عميل'} برقم ${newestTrip?.referenceNumber}`,
          });
        }
        previousCustomTripsCountRef.current = trips.length;
      });
    };
    refreshCustomTrips();
    const tripsInterval = setInterval(refreshCustomTrips, 25000);

    return () => {
      unsubBookings();
      unsubTours();
      unsubMessages();
      unsubAdmins();
      clearInterval(tripsInterval);
    };
  }, [isAdmin]);

  // LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F5F1E9]" dir={direction}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#D4AF37]/50 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37] flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-[#0D1B2A]">
              {t('admin.loginTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized PEGASUS Dispatch & Management
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  setLoginError(null);
                  await loginWithGoogle();
                } catch (err: any) {
                  setLoginError(err.message || 'Google sign in failed. Ensure your email is authorized.');
                }
              }}
              className="w-full py-3 px-4 rounded-xl border border-[#D5CDBD] hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('admin.signInGoogle')}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] text-slate-400 uppercase tracking-widest absolute">
                OR EMAIL & PASSWORD
              </span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoggingIn(true);
                setLoginError(null);
                try {
                  await loginWithEmailPassword(adminEmail, adminPassword);
                } catch (err: any) {
                  setLoginError(err.message || 'Invalid credentials or unverified email.');
                } finally {
                  setLoggingIn(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {loggingIn ? 'Authenticating...' : t('admin.enter')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Counts for KPI and Badges
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;
  const pendingCustomTripsCount = customTrips.filter((ct) => ct.status === 'Pending Review' || ct.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#F5F1E9] pb-16" dir={direction}>
      {/* Top Banner */}
      <div className="bg-[#0D1B2A] text-white border-b border-[#D4AF37]/40 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-white">
                {t('admin.title')}
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-medium">{adminDisplayName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission();
                setBrowserNotifEnabled(granted);
                if (granted) {
                  playBookingChime();
                  sendDesktopNotification('تم تفعيل إشعارات بيجاسوس بنجاح!', {
                    body: 'ستتلقى إشعاراً فورياً على شاشتك عند وصول أي حجز جديد أو طلب رحلة.',
                  });
                  showFeedback('تم تفعيل إشعارات المتصفح الفورية بنجاح!', 'success');
                } else {
                  showFeedback('يرجى السماح بالإشعارات في إعدادات متصفحك.', 'error');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                browserNotifEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                  : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40'
              }`}
              title="تفعيل الإشعارات الفورية على شاشة الكمبيوتر أو الموبايل"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{browserNotifEnabled ? 'الإشعارات الفورية: مفعلة ✓' : 'تفعيل إشعارات المتصفح'}</span>
            </button>

            <a
              href="/logo.png"
              download="pegasus-luxury-logo.png"
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#ECC974] text-[#0D1B2A] text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="تحميل اللوجو الرسمي بصيغة PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل اللوجو (PNG)</span>
            </a>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              View Site
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Real-time Incoming Booking Alert Banner */}
        {newBookingAlert && (
          <div className="mb-6 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4 animate-gentle-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-sm sm:text-base">🚨 حجز جديد وصل الآن!</span>
                  <span className="font-mono bg-black/40 text-emerald-200 px-2.5 py-0.5 rounded-md text-xs font-bold">
                    {newBookingAlert.bookingReference}
                  </span>
                  <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded">
                    {newBookingAlert.serviceType === 'airport_pickup' ? 'استقبال مطار' : newBookingAlert.serviceType === 'airport_dropoff' ? 'توصيل مطار' : newBookingAlert.serviceType}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  العميل: <strong className="text-white">{newBookingAlert.customerName}</strong> • هاتف: <strong className="text-white">{newBookingAlert.phone}</strong> • تاريخ: {newBookingAlert.pickupDate} ({newBookingAlert.pickupTime}) • من {newBookingAlert.origin} إلى {newBookingAlert.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getWhatsAppLink(companySettings.whatsapp, `مرحباً بيجاسوس! تم استلام حجزك برقم ${newBookingAlert.bookingReference} من ${newBookingAlert.customerName}. هل ترغب بمتابعة التفاصيل؟`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>مراسلة العميل</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  playBookingChime();
                  showFeedback('تم فحص صوت التنبيه', 'success');
                }}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-emerald-200 transition"
                title="اختبار صوت الإشعار"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setNewBookingAlert(null)}
                className="px-3 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition"
              >
                إغلاق التنبيه
              </button>
            </div>
          </div>
        )}

        {/* Dispatch Notification Channels Status Bar */}
        <div className="mb-6 bg-white rounded-xl border border-[#EAE4D9] p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#0D1B2A]">نظام إشعارات الحجوزات الذكي:</span>
            <span className="text-slate-500 hidden sm:inline">
              صوت التنبيه (Chime) يعمل تلقائياً عند وصول حجز جديد • إمكانية الإرسال المباشر للواتساب (+201109790984)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBookingChime();
                showFeedback('تم تجربة صوت التنبيه بنجاح!', 'success');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>تجربة صوت التنبيه</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Bookings
            </span>
            <div className="text-2xl font-bold font-heading text-[#0D1B2A]">
              {bookings.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-300 shadow-xs">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Bookings
            </span>
            <div className="text-2xl font-bold font-heading text-amber-800">
              {pendingCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-purple-300 shadow-xs">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Pending Custom Trips
            </span>
            <div className="text-2xl font-bold font-heading text-purple-800">
              {pendingCustomTripsCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#EAE4D9] shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Inquiries
            </span>
            <div className="text-2xl font-bold font-heading text-[#0D1B2A]">
              {messages.length} {unreadMessagesCount > 0 && <span className="text-xs text-amber-600 font-sans">({unreadMessagesCount} unread)</span>}
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className={`p-3.5 mb-6 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedbackToast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {/* Dashboard Tabs with Badges */}
        <div className="flex border-b border-[#EAE4D9] mb-6 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.bookingsTab')} ({bookings.length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customTrips')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'customTrips'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Custom Trips ({customTrips.length})</span>
            {pendingCustomTripsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500 text-white font-bold">
                {pendingCustomTripsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'destinations'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>الوجهات والمعالم ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4 text-[#D4AF37]" />
            <span>فئات السيارات ({vehiclesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            <span>تسعير المسارات والسيارات ({pricingRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tours'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.toursTab')} ({tours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.messagesTab')} ({messages.length})</span>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'admins'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Admins ({adminEmailsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.settingsTab')}</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, ref, hotel..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full text-xs border-0 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      bookingFilter === st
                        ? 'bg-[#0D1B2A] text-[#D4AF37]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#EAE4D9] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Ref & Status</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Route, Vehicle & Price</th>
                      <th className="p-4">Notes & Message to Customer</th>
                      <th className="p-4 text-right rtl:text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {bookings
                      .filter((b) => (bookingFilter === 'all' ? true : b.status === bookingFilter))
                      .filter((b) => {
                        if (!bookingSearch) return true;
                        const s = bookingSearch.toLowerCase();
                        return (
                          b.bookingReference.toLowerCase().includes(s) ||
                          b.customerName.toLowerCase().includes(s) ||
                          b.origin.toLowerCase().includes(s) ||
                          b.destination.toLowerCase().includes(s) ||
                          (b.vehicleName || '').toLowerCase().includes(s)
                        );
                      })
                      .map((b) => (
                        <tr key={b.id || b.bookingReference} className="hover:bg-[#FBF9F5]/70 transition">
                          <td className="p-4">
                            <span className="font-mono font-bold text-xs bg-[#0D1B2A] text-[#D4AF37] px-2 py-0.5 rounded block w-fit mb-1">
                              {b.bookingReference}
                            </span>
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateStatus(b, e.target.value as BookingStatus)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : b.status === 'Completed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : b.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{b.customerName}</span>
                            <span className="text-[11px] text-slate-500 block" dir="ltr">{b.phone}</span>
                            <span className="text-[11px] text-slate-400 block" dir="ltr">{b.email}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-900 block">{b.pickupDate}</span>
                            <span className="text-slate-500 block">{b.pickupTime}</span>
                            <span className="text-[10px] text-[#D4AF37] font-semibold">
                              {b.passengerCount} Pax • {b.tripType === 'round_trip' ? 'Round Trip' : 'One Way'}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-medium text-slate-800 block">{b.origin}</span>
                            <span className="text-slate-400 text-[10px] block">➔ {b.destination}</span>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#0D1B2A] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#EAE4D9]">
                              <Car className="w-3 h-3 text-[#D4AF37]" />
                              {b.vehicleName || resolveVehicleDisplayName(b.vehicleType, vehiclesList)}
                            </span>
                            <span className={`block mt-1 text-[11px] font-bold ${
                              typeof b.quotedPrice === 'number' && b.quotedPrice > 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {typeof b.quotedPrice === 'number' && b.quotedPrice > 0
                                ? `${b.quotedPrice} ${b.priceCurrency || 'EUR'}`
                                : 'السعر عند الطلب (Price on Request)'}
                            </span>
                          </td>

                          <td className="p-4 space-y-1.5 min-w-[220px]">
                            {/* Internal Notes */}
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block">
                                Internal Dispatch Notes (Private):
                              </label>
                              <input
                                type="text"
                                defaultValue={b.adminNotes || ''}
                                placeholder="Internal note..."
                                onBlur={async (e) => {
                                  const text = e.target.value.trim();
                                  if (text !== (b.adminNotes || '')) {
                                    await updateBookingStatus(b.id || b.bookingReference, b.bookingReference, b.status, text, b.customerMessage);
                                    showFeedback('Internal note saved.', 'success');
                                  }
                                }}
                                className="w-full text-[10px] px-2 py-1 border border-slate-200 rounded bg-white text-slate-700"
                              />
                            </div>

                            {/* Customer Message */}
                            <div>
                              <label className="text-[9px] uppercase font-bold text-[#D4AF37] block">
                                Message to Customer (Visible in Tracking):
                              </label>
                              <input
                                type="text"
                                defaultValue={b.customerMessage || ''}
                                placeholder="Message to customer..."
                                onBlur={async (e) => {
                                  const text = e.target.value.trim();
                                  if (text !== (b.customerMessage || '')) {
                                    await updateBookingStatus(b.id || b.bookingReference, b.bookingReference, b.status, b.adminNotes, text);
                                    showFeedback('Customer message updated in tracking.', 'success');
                                  }
                                }}
                                className="w-full text-[10px] px-2 py-1 border border-[#D4AF37]/50 rounded bg-amber-50/40 text-slate-800"
                              />
                            </div>
                          </td>

                          <td className="p-4 text-right rtl:text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedBookingDetails(b)}
                                className="p-1.5 rounded-lg bg-slate-100 text-[#0D1B2A] hover:bg-slate-200 cursor-pointer"
                                title="View Booking Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={getWhatsAppLink(b.phone, `Hello ${b.customerName}, regarding your PEGASUS booking ${b.bookingReference}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#25D366] text-white hover:brightness-105"
                                title="Chat with Customer on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              </a>

                              <a
                                href={getWhatsAppLink(companySettings.whatsapp, `New Booking Received\n• Booking Reference: ${b.bookingReference}\n• Customer Name: ${b.customerName}\n• Phone: ${b.phone}\n• Email: ${b.email}\n• Service Type: ${b.serviceType}\n• Pickup: ${b.origin}\n• Destination: ${b.destination}\n• Date: ${b.pickupDate}\n• Time: ${b.pickupTime}\n• Trip Type: ${b.tripType}\n• Passengers: ${b.passengerCount}\n• Vehicle: ${b.vehicleName || resolveVehicleDisplayName(b.vehicleType, vehiclesList)}\n• Notes: ${b.notes || 'None'}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#0D1B2A] text-[#D4AF37] hover:bg-[#1B263B] border border-[#D4AF37]/40"
                                title="إرسال إشعار الحجز لرقم الإدارة على واتساب"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={async () => {
                                  if (confirm(`Delete booking ${b.bookingReference}?`)) {
                                    await deleteBooking(b.id || b.bookingReference, b.bookingReference);
                                    showFeedback(`Booking ${b.bookingReference} deleted.`, 'success');
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM TRIPS */}
        {activeTab === 'customTrips' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B2A]">Custom Trip Requests ({customTrips.length})</h3>
                <p className="text-xs text-slate-500">Internal cost and margin are stored confidentially in /customTripAdminPricing. Only final price is quoted to customer.</p>
              </div>
              <button
                onClick={() => getAllCustomTripRequests().then(setCustomTrips)}
                className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {customTrips.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EAE4D9] p-12 text-center text-slate-500 text-xs">
                No custom trip requests submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {customTrips.map((trip) => (
                  <AdminCustomTripCard
                    key={trip.id || trip.referenceNumber}
                    trip={trip}
                    onUpdate={async () => {
                      const updated = await getAllCustomTripRequests();
                      setCustomTrips(updated);
                    }}
                    showFeedback={showFeedback}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: DESTINATIONS & LANDMARKS */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B2A] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>إدارة أشهر المعالم والوجهات السياحية ({destinations.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  يمكنك تعديل صور وأسماء وأوصاف ومسافات جميع المعالم السياحية المعروضة في الموقع.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingDestination({
                    id: `dest-${Date.now()}`,
                    name: '',
                    nameAr: '',
                    nameDe: '',
                    category: 'red_sea',
                    imageUrl: '',
                    description: '',
                    descriptionAr: '',
                    descriptionDe: '',
                    distanceFromHurghada: '0 km',
                    suggestedTripDuration: 'Full Day',
                    active: true,
                    featured: true,
                    displayOrder: destinations.length + 1,
                  });
                  setIsDestinationModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#1B263B]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة معلم سياحي جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs hover:border-[#D4AF37] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 bg-slate-900 overflow-hidden">
                      {dest.imageUrl ? (
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5 p-4 bg-gradient-to-br from-[#0D1B2A] to-[#1B263B]">
                          <ImageIcon className="w-8 h-8 text-[#D4AF37]/70" />
                          <span className="text-[10px] text-slate-400">لم يتم رفع صورة بعد</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dest.active !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {dest.active !== false ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 text-white text-xs font-semibold bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {dest.distanceFromHurghada}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                        {dest.category}
                      </div>
                      <h4 className="font-bold text-sm text-[#0D1B2A]">{dest.name}</h4>
                      <p className="text-xs text-slate-700 font-medium font-arabic">{dest.nameAr}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{dest.descriptionAr || dest.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDestination({ ...dest });
                        setIsDestinationModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`هل أنت متأكد من حذف الوجهة "${dest.name}"؟`)) {
                          await deleteDestination(dest.id);
                          showFeedback('تم حذف الوجهة بنجاح.', 'success');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف الوجهة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: VEHICLE FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B2A] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#D4AF37]" />
                  <span>فئات وأسطول السيارات السياحية ({vehiclesList.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  تشمل تويوتا كورولا، تويوتا روميون، فورتشنر، إكسباندر، سنترا، إلنترا، وتويوتا هايس (Toyota Hiace). يمكن تعديل السعة وسنة الموديل والصورة في أي وقت.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingVehicle({
                    id: `vehicle_${Date.now()}`,
                    name: '',
                    nameDe: '',
                    nameAr: '',
                    category: 'Private Tourist Vehicle',
                    capacityPassengers: null,
                    capacityLuggage: null,
                    modelYear: '',
                    description: '',
                    descriptionDe: '',
                    descriptionAr: '',
                    imageUrl: '',
                    features: [],
                    active: true,
                  });
                  setIsVehicleModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#1B263B]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فئة سيارة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesList.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs hover:border-[#D4AF37] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] overflow-hidden">
                      {veh.imageUrl ? (
                        <img
                          src={veh.imageUrl}
                          alt={veh.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-4">
                          <Car className="w-10 h-10 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-white text-center">{veh.name}</span>
                          <span className="text-[10px] text-slate-400">لا توجد صورة محددة بعد (قابل للتعديل)</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          veh.active !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {veh.active !== false ? 'متاح للحجز' : 'غير نشط'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 text-white text-xs font-bold bg-black/65 px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#D4AF37]" />
                        <span>
                          {typeof veh.capacityPassengers === 'number' && veh.capacityPassengers > 0
                            ? `حتى ${veh.capacityPassengers} ركاب`
                            : 'السعة غير محددة بعد'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-[#0D1B2A]">{veh.name}</h4>
                      {veh.nameAr && <p className="text-xs text-[#0D1B2A] font-semibold">{veh.nameAr}</p>}
                      {(veh.descriptionAr || veh.description) ? (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {veh.descriptionAr || veh.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          المواصفات التفصيلية وسنة الموديل غير محددة بعد — قابلة للتعديل من لوحة التحكم.
                        </p>
                      )}

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-medium bg-[#F4EFE6] text-slate-700 px-2.5 py-1 rounded-md border border-[#EAE4D9]">
                          {typeof veh.capacityLuggage === 'number' && veh.capacityLuggage > 0
                            ? `حقائب: ${veh.capacityLuggage}`
                            : 'سعة الحقائب: غير محددة بعد'}
                        </span>
                        {veh.modelYear && (
                          <span className="text-[11px] font-medium bg-[#F4EFE6] text-slate-700 px-2.5 py-1 rounded-md border border-[#EAE4D9]">
                            الموديل: {veh.modelYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVehicle({ ...veh });
                        setIsVehicleModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل بيانات وصورة السيارة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: VEHICLE-BASED TRANSFER PRICING */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#EAE4D9] p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#0D1B2A] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                    <span>نظام تسعير التوصيل حسب المسار والسيارة (Route + Vehicle Pricing)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يعتمد السعر على: المسار (من ➔ إلى) + فئة السيارة (بما فيها Toyota Hiace) + نوع الرحلة (ذهاب فقط / ذهاب وعودة). أي مسار أو سيارة بدون سعر محدد يظهر تلقائياً للعملاء كـ "السعر عند الطلب / Price on Request".
                  </p>
                </div>
              </div>

              <datalist id="pegasus-route-locations">
                <option value="Hurghada International Airport (HRG)" />
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const originClean = ruleOrigin.trim();
                  const destClean = ruleDestination.trim();
                  if (!originClean || !destClean || !ruleVehicleId) {
                    showFeedback('يرجى إدخال نقطة الانطلاق والوجهة واختيار السيارة.', 'error');
                    return;
                  }

                  const oneWayNum = ruleOneWayPrice.trim() ? Number(ruleOneWayPrice.trim()) : null;
                  const roundTripNum = ruleRoundTripPrice.trim() ? Number(ruleRoundTripPrice.trim()) : null;

                  if (oneWayNum !== null && (!Number.isFinite(oneWayNum) || oneWayNum <= 0)) {
                    showFeedback('يجب أن يكون سعر الذهاب فقط أكبر من 0 أو فارغاً ليظهر السعر عند الطلب.', 'error');
                    return;
                  }
                  if (roundTripNum !== null && (!Number.isFinite(roundTripNum) || roundTripNum <= 0)) {
                    showFeedback('يجب أن يكون سعر الذهاب والعودة أكبر من 0 أو فارغاً ليظهر السعر عند الطلب.', 'error');
                    return;
                  }

                  setSavingPricing(true);
                  try {
                    const nowIso = new Date().toISOString();
                    const newRule: TransferPriceRule = {
                      id: editingRuleId || `rule_${Date.now()}`,
                      origin: originClean,
                      destination: destClean,
                      vehicleId: ruleVehicleId,
                      oneWayPrice: oneWayNum,
                      roundTripPrice: roundTripNum,
                      currency: ruleCurrency || 'EUR',
                      active: ruleActive,
                      updatedAt: nowIso,
                    };

                    const updatedRules = editingRuleId
                      ? pricingRules.map((r) => (r.id === editingRuleId ? newRule : r))
                      : [newRule, ...pricingRules];

                    await saveTransferPricingRules(updatedRules);
                    setPricingRules(updatedRules);
                    setEditingRuleId(null);
                    setRuleOrigin('');
                    setRuleDestination('');
                    setRuleOneWayPrice('');
                    setRuleRoundTripPrice('');
                    setRuleActive(true);
                    showFeedback(editingRuleId ? 'تم تحديث تسعيرة المسار والسيارة بنجاح.' : 'تمت إضافة تسعيرة المسار والسيارة بنجاح.', 'success');
                  } catch (err) {
                    console.error(err);
                    showFeedback('تعذر حفظ التسعيرة.', 'error');
                  } finally {
                    setSavingPricing(false);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نقطة الانطلاق (Origin) *</label>
                  <input
                    type="text"
                    required
                    list="pegasus-route-locations"
                    value={ruleOrigin}
                    onChange={(e) => setRuleOrigin(e.target.value)}
                    placeholder="مثال: Hurghada International Airport (HRG)"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الوجهة (Destination) *</label>
                  <input
                    type="text"
                    required
                    list="pegasus-route-locations"
                    value={ruleDestination}
                    onChange={(e) => setRuleDestination(e.target.value)}
                    placeholder="مثال: El Gouna"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">فئة السيارة (Vehicle) *</label>
                  <select
                    value={ruleVehicleId}
                    onChange={(e) => setRuleVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white font-semibold"
                  >
                    {vehiclesList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.id === 'toyota_hiace' ? '(Toyota Hiace)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">العملة (Currency)</label>
                  <select
                    value={ruleCurrency}
                    onChange={(e) => setRuleCurrency(e.target.value as 'EUR' | 'USD' | 'EGP')}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white font-bold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EGP">EGP (ج.م)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سعر ذهاب فقط (One Way - اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={ruleOneWayPrice}
                    onChange={(e) => setRuleOneWayPrice(e.target.value)}
                    placeholder="اتركه فارغاً للسعر عند الطلب"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سعر ذهاب وعودة (Round Trip - اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={ruleRoundTripPrice}
                    onChange={(e) => setRuleRoundTripPrice(e.target.value)}
                    placeholder="اتركه فارغاً للسعر عند الطلب"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={ruleActive}
                      onChange={(e) => setRuleActive(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>نشط في نموذج الحجز</span>
                  </label>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={savingPricing}
                    className="flex-1 py-2 px-4 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold hover:bg-[#1B263B] transition cursor-pointer"
                  >
                    {savingPricing ? 'جاري الحفظ...' : editingRuleId ? 'تحديث التسعيرة' : 'إضافة التسعيرة'}
                  </button>
                  {editingRuleId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRuleId(null);
                        setRuleOrigin('');
                        setRuleDestination('');
                        setRuleOneWayPrice('');
                        setRuleRoundTripPrice('');
                        setRuleActive(true);
                      }}
                      className="py-2 px-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="font-bold text-xs text-[#0D1B2A]">
                  قواعد الأسعار المضافة ({pricingRules.length})
                </span>
                <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={pricingSearch}
                    onChange={(e) => setPricingSearch(e.target.value)}
                    placeholder="ابحث بالمسار أو السيارة..."
                    className="w-full text-xs bg-transparent border-0 focus:outline-hidden"
                  />
                </div>
              </div>

              {pricingRules.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  لا توجد أسعار محددة حالياً — سيظهر للعملاء "السعر عند الطلب / Price on Request" لجميع المسارات والسيارات حتى تقوم بإضافة الأسعار هنا.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#EAE4D9] text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-3.5">Route (Origin ➔ Destination)</th>
                        <th className="p-3.5">Vehicle</th>
                        <th className="p-3.5">One Way</th>
                        <th className="p-3.5">Round Trip</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right rtl:text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {pricingRules
                        .filter((r) => {
                          if (!pricingSearch.trim()) return true;
                          const q = pricingSearch.toLowerCase();
                          const vehName = resolveVehicleDisplayName(r.vehicleId, vehiclesList).toLowerCase();
                          return (
                            r.origin.toLowerCase().includes(q) ||
                            r.destination.toLowerCase().includes(q) ||
                            vehName.includes(q)
                          );
                        })
                        .map((rule) => (
                          <tr key={rule.id} className="hover:bg-[#FBF9F5]/70">
                            <td className="p-3.5">
                              <span className="font-semibold text-[#0D1B2A]">{rule.origin}</span>
                              <span className="text-slate-400 mx-1.5">➔</span>
                              <span className="font-semibold text-[#0D1B2A]">{rule.destination}</span>
                            </td>
                            <td className="p-3.5 font-medium text-slate-700">
                              {resolveVehicleDisplayName(rule.vehicleId, vehiclesList)}
                            </td>
                            <td className="p-3.5 font-bold text-[#0D1B2A]">
                              {typeof rule.oneWayPrice === 'number' && rule.oneWayPrice > 0
                                ? `${rule.oneWayPrice} ${rule.currency || 'EUR'}`
                                : 'السعر عند الطلب'}
                            </td>
                            <td className="p-3.5 font-bold text-[#0D1B2A]">
                              {typeof rule.roundTripPrice === 'number' && rule.roundTripPrice > 0
                                ? `${rule.roundTripPrice} ${rule.currency || 'EUR'}`
                                : 'السعر عند الطلب'}
                            </td>
                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  const updated = pricingRules.map((item) =>
                                    item.id === rule.id ? { ...item, active: item.active === false } : item
                                  );
                                  await saveTransferPricingRules(updated);
                                  setPricingRules(updated);
                                  showFeedback('تم تحديث حالة التسعيرة.', 'success');
                                }}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                  rule.active !== false
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {rule.active !== false ? 'نشط' : 'معطل'}
                              </button>
                            </td>
                            <td className="p-3.5 text-right rtl:text-left">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRuleId(rule.id);
                                    setRuleOrigin(rule.origin);
                                    setRuleDestination(rule.destination);
                                    setRuleVehicleId(rule.vehicleId);
                                    setRuleOneWayPrice(
                                      typeof rule.oneWayPrice === 'number' && rule.oneWayPrice > 0
                                        ? String(rule.oneWayPrice)
                                        : ''
                                    );
                                    setRuleRoundTripPrice(
                                      typeof rule.roundTripPrice === 'number' && rule.roundTripPrice > 0
                                        ? String(rule.roundTripPrice)
                                        : ''
                                    );
                                    setRuleCurrency((rule.currency as 'EUR' | 'USD' | 'EGP') || 'EUR');
                                    setRuleActive(rule.active !== false);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`حذف تسعيرة ${rule.origin} ➔ ${rule.destination}؟`)) {
                                      const updated = pricingRules.filter((item) => item.id !== rule.id);
                                      await saveTransferPricingRules(updated);
                                      setPricingRules(updated);
                                      showFeedback('تم حذف التسعيرة.', 'success');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TOURS */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B2A]">Ready-Made Tours & Excursions ({tours.length})</h3>
                <p className="text-xs text-slate-500">Admin-controlled availability, descriptions, and duration.</p>
              </div>
              <button
                onClick={() => {
                  setEditingTour({
                    id: `tour-${Date.now()}`,
                    title: '',
                    titleDe: '',
                    titleAr: '',
                    category: 'safari',
                    destination: 'Hurghada',
                    duration: 'Half Day',
                    description: '',
                    descriptionDe: '',
                    descriptionAr: '',
                    imageUrl: '',
                    highlights: [],
                    included: [],
                    excluded: [],
                    priceMode: 'request',
                    available: true,
                    active: true,
                    featured: false,
                    displayOrder: tours.length + 1,
                  });
                  setIsNewTourModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.addTour')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tr) => (
                <div key={tr.id} className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] overflow-hidden">
                      {tr.imageUrl ? (
                        <img
                          src={tr.imageUrl}
                          alt={tr.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5 p-4">
                          <ImageIcon className="w-8 h-8 text-[#D4AF37]/70" />
                          <span className="text-[10px] text-slate-400">لا توجد صورة مرفوعة</span>
                        </div>
                      )}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0D1B2A]/85 text-[#D4AF37] border border-[#D4AF37]/40">
                          {tr.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tr.available !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                        }`}>
                          {tr.available !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 pb-3">
                      <h4 className="font-bold text-base text-[#0D1B2A]">{tr.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tr.description}</p>
                      <div className="text-[11px] text-slate-600 mt-2">
                        <span>Duration: <strong>{tr.duration}</strong></span> • <span>Destination: <strong>{tr.destination}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingTour(tr);
                        setIsNewTourModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{t('admin.editTour')}</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete tour "${tr.title}"?`)) {
                          await deleteTour(tr.id);
                          showFeedback('Tour deleted.', 'success');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete tour"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex items-center justify-between shadow-xs">
              <h3 className="font-bold text-sm text-[#0D1B2A]">Customer Inquiries ({messages.length})</h3>
            </div>

            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-[#EAE4D9] p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <strong className="text-sm text-slate-900">{m.name}</strong>
                      <span className="text-xs text-slate-500 ml-2" dir="ltr">({m.email} {m.phone ? `• ${m.phone}` : ''})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">{m.subject}</div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ADMINS MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-6 max-w-2xl shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-heading text-[#0D1B2A]">
                Authorized Administrators
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage accounts authorized to log in to the PEGASUS management portal. All admin accounts require a verified email.
              </p>
            </div>

            {/* Add new admin email form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const emailClean = newAdminEmailInput.trim().toLowerCase();
                if (!emailClean) return;
                setAdminActionLoading(true);
                try {
                  await addAdminEmail(emailClean, adminDisplayName || 'Admin');
                  setNewAdminEmailInput('');
                  showFeedback(`Added ${emailClean} as authorized admin.`, 'success');
                } catch (err) {
                  showFeedback('Failed to add admin email.', 'error');
                } finally {
                  setAdminActionLoading(false);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                value={newAdminEmailInput}
                onChange={(e) => setNewAdminEmailInput(e.target.value)}
                placeholder="new-admin@example.com"
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5CDBD] text-xs bg-white text-slate-900"
              />
              <button
                type="submit"
                disabled={adminActionLoading}
                className="px-5 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer"
              >
                Add Admin
              </button>
            </form>

            {/* List of admin emails */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {adminEmailsList.map((rec) => {
                const isBootstrap = isBootstrapAdmin(rec.email);
                return (
                  <div key={rec.email} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-semibold text-slate-900 block" dir="ltr">{rec.email}</span>
                      <span className="text-[10px] text-slate-400">
                        {isBootstrap ? 'Primary Owner (Protected)' : `Added by ${rec.addedBy || 'Owner'} on ${new Date(rec.addedAt || rec.createdAt || Date.now()).toLocaleDateString()}`}
                      </span>
                    </div>

                    {isBootstrap ? (
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                        Primary Owner
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm(`Remove admin permissions from ${rec.email}?`)) {
                            await removeAdminEmail(rec.email);
                            showFeedback(`Removed ${rec.email}.`, 'success');
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & POLICIES */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-7 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="text-base font-bold font-heading text-[#0D1B2A] border-b pb-3">
                Company Information & Operations
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Update the official contact details used across the website, footer, and WhatsApp concierge.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSettingsSaving(true);
                setSettingsSuccess(false);
                try {
                  await saveCompanySettings(companySettings);
                  setSettingsSuccess(true);
                  showFeedback('Company settings updated.', 'success');
                } catch (err) {
                  console.error(err);
                  showFeedback('Failed to save settings.', 'error');
                } finally {
                  setSettingsSaving(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Trade Name</label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Hotline</label>
                  <input
                    type="text"
                    value={companySettings.whatsapp}
                    onChange={(e) => setCompanySettings({ ...companySettings, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Optional Physical Office Address (Leave empty to keep hidden)
                </label>
                <input
                  type="text"
                  value={companySettings.address || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  placeholder="Leave blank if online service only"
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                />
              </div>

              {/* Social Media Accounts */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-sm text-[#0D1B2A]">Official Social Media Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={companySettings.socialMedia?.instagramUrl || ''}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        socialMedia: {
                          instagramHandle: companySettings.socialMedia?.instagramHandle || 'pegasus_eg2',
                          instagramUrl: e.target.value,
                          tiktokHandle: companySettings.socialMedia?.tiktokHandle || 'pegasus_eg2',
                          tiktokUrl: companySettings.socialMedia?.tiktokUrl || 'https://www.tiktok.com/@pegasus_eg2',
                        }
                      })}
                      placeholder="https://www.instagram.com/pegasus_eg2/"
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">TikTok URL</label>
                    <input
                      type="url"
                      value={companySettings.socialMedia?.tiktokUrl || ''}
                      onChange={(e) => setCompanySettings({
                        ...companySettings,
                        socialMedia: {
                          instagramHandle: companySettings.socialMedia?.instagramHandle || 'pegasus_eg2',
                          instagramUrl: companySettings.socialMedia?.instagramUrl || 'https://www.instagram.com/pegasus_eg2/',
                          tiktokHandle: companySettings.socialMedia?.tiktokHandle || 'pegasus_eg2',
                          tiktokUrl: e.target.value,
                        }
                      })}
                      placeholder="https://www.tiktok.com/@pegasus_eg2"
                      className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Company Policies Sub-section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-sm text-[#0D1B2A]">Company Policies (Displayed in Confirmations)</h4>
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cancellation Terms</label>
                  <input
                    type="text"
                    value={companySettings.policies?.cancellationPolicyEn || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      policies: {
                        cancellationPolicyEn: e.target.value,
                        waitingTimePolicyEn: companySettings.policies?.waitingTimePolicyEn || 'Driver waits up to 60 minutes after scheduled landing',
                        paymentTermsEn: companySettings.policies?.paymentTermsEn || 'Cash payment upon arrival',
                      }
                    })}
                    placeholder="e.g. Free cancellation up to 6 hours prior to pickup"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Airport Waiting Policy</label>
                  <input
                    type="text"
                    value={companySettings.policies?.waitingTimePolicyEn || ''}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      policies: {
                        cancellationPolicyEn: companySettings.policies?.cancellationPolicyEn || 'Free cancellation up to 6 hours prior to pickup',
                        waitingTimePolicyEn: e.target.value,
                        paymentTermsEn: companySettings.policies?.paymentTermsEn || 'Cash payment upon arrival',
                      }
                    })}
                    placeholder="e.g. Driver waits for delayed flights without charge"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-2.5 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 transition cursor-pointer"
              >
                {settingsSaving ? 'Saving...' : t('admin.saveChanges')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* TOUR EDIT / ADD MODAL */}
      {isNewTourModalOpen && editingTour && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-auto space-y-4">
            <h3 className="text-lg font-bold font-heading text-[#0D1B2A]">
              {editingTour.id ? 'Edit Tour' : 'Create New Tour'}
            </h3>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold mb-1">Title (English) *</label>
                <input
                  type="text"
                  value={editingTour.title}
                  onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                  placeholder="e.g. Quad Bike Desert Safari"
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editingTour.category}
                    onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border bg-white"
                  >
                    <option value="safari">Safari & Desert</option>
                    <option value="marine">Boat & Sea</option>
                    <option value="kite">Kite & Water</option>
                    <option value="historical">Cultural / Day Trips</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Availability Status</label>
                  <select
                    value={editingTour.available !== false ? 'available' : 'unavailable'}
                    onChange={(e) => setEditingTour({ ...editingTour, available: e.target.value === 'available' })}
                    className="w-full px-3 py-2 rounded-lg border bg-white font-bold"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Currently Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingTour.duration}
                    onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                    placeholder="e.g. 3 Hours or Full Day"
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Destination / Meeting</label>
                  <input
                    type="text"
                    value={editingTour.destination}
                    onChange={(e) => setEditingTour({ ...editingTour, destination: e.target.value })}
                    placeholder="e.g. Hurghada Desert / Marina"
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  value={editingTour.description}
                  onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                  placeholder="Summary of the experience..."
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingTour.fullDescription || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, fullDescription: e.target.value })}
                  placeholder="Detailed tour itinerary..."
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Meeting & Pickup Information</label>
                <input
                  type="text"
                  value={editingTour.meetingPickupInfo || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, meetingPickupInfo: e.target.value })}
                  placeholder="e.g. Hotel lobby pickup included across Hurghada"
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">What is Included (one per line)</label>
                <textarea
                  rows={3}
                  value={editingTour.included?.join('\n') || ''}
                  onChange={(e) => setEditingTour({
                    ...editingTour,
                    included: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Hotel pickup&#10;Equipment&#10;Guide"
                  className="w-full px-3 py-2 rounded-lg border font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">What is Not Included (one per line)</label>
                <textarea
                  rows={2}
                  value={editingTour.excluded?.join('\n') || ''}
                  onChange={(e) => setEditingTour({
                    ...editingTour,
                    excluded: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Personal expenses&#10;Gratuities"
                  className="w-full px-3 py-2 rounded-lg border font-mono text-[11px]"
                />
              </div>

              <AdminImageUploader
                label="صورة الرحلة (Tour Photo - اختياري)"
                value={editingTour.imageUrl || ''}
                onChange={(val) => setEditingTour({ ...editingTour, imageUrl: val })}
                optionalRemove={true}
                maxWidth={1000}
                maxHeight={700}
                targetMaxBytes={140000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsNewTourModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!editingTour.title.trim()) return;
                  await saveTour(editingTour);
                  setIsNewTourModalOpen(false);
                  showFeedback('Tour saved successfully!', 'success');
                }}
                className="px-6 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer"
              >
                Save Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESTINATION EDIT / ADD MODAL */}
      {isDestinationModalOpen && editingDestination && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold font-heading text-[#0D1B2A] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingDestination.name ? `تعديل معلم: ${editingDestination.name}` : 'إضافة معلم سياحي جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDestinationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">اسم المعلم بالإنجليزية (Name EN) *</label>
                  <input
                    type="text"
                    value={editingDestination.name}
                    onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                    placeholder="e.g. Orange Bay & Giftun Island"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">اسم المعلم بالعربية (Name AR) *</label>
                  <input
                    type="text"
                    value={editingDestination.nameAr}
                    onChange={(e) => setEditingDestination({ ...editingDestination, nameAr: e.target.value })}
                    placeholder="مثل: جزيرة الجفتون وأورانج باي"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">التصنيف (Category)</label>
                  <select
                    value={editingDestination.category}
                    onChange={(e) => setEditingDestination({ ...editingDestination, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white font-medium"
                  >
                    <option value="red_sea">البحر الأحمر والجزر (Red Sea & Islands)</option>
                    <option value="cairo">القاهرة والجيزة (Cairo & Giza)</option>
                    <option value="luxor">الأقصر والمعابد (Luxor & Temples)</option>
                    <option value="sinai">سيناء وشرم الشيخ (Sinai)</option>
                    <option value="alexandria">الإسكندرية (Alexandria)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">حالة العرض في الموقع</label>
                  <select
                    value={editingDestination.active !== false ? 'active' : 'inactive'}
                    onChange={(e) => setEditingDestination({ ...editingDestination, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white font-bold"
                  >
                    <option value="active">نشط ومعروض للزوار</option>
                    <option value="inactive">معطل ومخفي مؤقتاً</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">المسافة من الغردقة (Distance)</label>
                  <input
                    type="text"
                    value={editingDestination.distanceFromHurghada || ''}
                    onChange={(e) => setEditingDestination({ ...editingDestination, distanceFromHurghada: e.target.value })}
                    placeholder="مثال: 60 km (~45 mins)"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                  {/* Quick distance presets */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingDestination({ ...editingDestination, distanceFromHurghada: '60 km (~45 mins)' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                    >
                      سفاجا 60كم
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDestination({ ...editingDestination, distanceFromHurghada: '310 km (~3.5 hrs)' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                    >
                      الأقصر 310كم
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDestination({ ...editingDestination, distanceFromHurghada: '460 km (~5 hrs)' })}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                    >
                      القاهرة 460كم
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">مدة الرحلة أو ملاحظة (Duration / Note)</label>
                  <input
                    type="text"
                    value={editingDestination.suggestedTripDuration || ''}
                    onChange={(e) => setEditingDestination({ ...editingDestination, suggestedTripDuration: e.target.value })}
                    placeholder="مثال: Day Trip أو 45 mins by boat"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
              </div>

              <AdminImageUploader
                label="صورة المعلم السياحي (Destination Photo)"
                value={editingDestination.imageUrl}
                onChange={(val) => setEditingDestination({ ...editingDestination, imageUrl: val })}
                required={true}
                optionalRemove={true}
                maxWidth={1000}
                maxHeight={700}
                targetMaxBytes={140000}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">الوصف بالإنجليزية (Description EN)</label>
                  <textarea
                    rows={2}
                    value={editingDestination.description}
                    onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">الوصف بالعربية (Description AR)</label>
                  <textarea
                    rows={2}
                    value={editingDestination.descriptionAr}
                    onChange={(e) => setEditingDestination({ ...editingDestination, descriptionAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] font-arabic"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsDestinationModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={savingDestination}
                onClick={async () => {
                  if (!editingDestination.name.trim() || !editingDestination.nameAr.trim()) {
                    showFeedback('يرجى إدخال اسم المعلم بالعربية والإنجليزية.', 'error');
                    return;
                  }
                  if (!editingDestination.imageUrl?.trim()) {
                    showFeedback('يرجى رفع صورة للمعلم السياحي من جهازك.', 'error');
                    return;
                  }
                  setSavingDestination(true);
                  try {
                    await saveDestination(editingDestination);
                    setIsDestinationModalOpen(false);
                    showFeedback('تم حفظ بيانات المعلم السياحي بنجاح!', 'success');
                  } catch (err) {
                    console.error(err);
                    showFeedback('فشل حفظ المعلم السياحي', 'error');
                  } finally {
                    setSavingDestination(false);
                  }
                }}
                className="px-6 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer"
              >
                {savingDestination ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE EDIT / ADD MODAL */}
      {isVehicleModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold font-heading text-[#0D1B2A] flex items-center gap-2">
                <Car className="w-5 h-5 text-[#D4AF37]" />
                <span>{vehiclesList.some((v) => v.id === editingVehicle.id) ? `تعديل سيارة: ${editingVehicle.name}` : 'إضافة فئة سيارة جديدة'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">اسم الفئة بالإنجليزية (Name EN) *</label>
                  <input
                    type="text"
                    value={editingVehicle.name}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                    placeholder="e.g. Toyota Hiace"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">اسم الفئة بالعربية (Name AR)</label>
                  <input
                    type="text"
                    value={editingVehicle.nameAr || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, nameAr: e.target.value })}
                    placeholder="مثال: تويوتا هايس"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">سنة الموديل (اختياري)</label>
                  <input
                    type="text"
                    value={editingVehicle.modelYear || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, modelYear: e.target.value })}
                    placeholder="غير محدد (قابل للتعديل)"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">عدد الركاب (اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editingVehicle.capacityPassengers ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setEditingVehicle({
                        ...editingVehicle,
                        capacityPassengers: val === '' ? null : Math.max(1, Number(val)),
                      });
                    }}
                    placeholder="غير محدد بعد"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">سعة الشنط (اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editingVehicle.capacityLuggage ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setEditingVehicle({
                        ...editingVehicle,
                        capacityLuggage: val === '' ? null : Math.max(1, Number(val)),
                      });
                    }}
                    placeholder="غير محدد بعد"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                    dir="ltr"
                  />
                </div>
              </div>

              <AdminImageUploader
                label="صورة السيارة (Vehicle Photo - اختياري)"
                value={editingVehicle.imageUrl || ''}
                onChange={(val) => setEditingVehicle({ ...editingVehicle, imageUrl: val })}
                optionalRemove={true}
                maxWidth={800}
                maxHeight={520}
                targetMaxBytes={85000}
                helperText="يتم ضغط الصورة تلقائياً لحفظها بأمان في قائمة السيارات."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">الوصف بالإنجليزية (اختياري)</label>
                  <textarea
                    rows={2}
                    value={editingVehicle.description || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">الوصف بالعربية (اختياري)</label>
                  <textarea
                    rows={2}
                    value={editingVehicle.descriptionAr || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, descriptionAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] font-arabic"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">حالة الفئة</label>
                <select
                  value={editingVehicle.active !== false ? 'active' : 'inactive'}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, active: e.target.value === 'active' })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD] bg-white font-bold"
                >
                  <option value="active">مفعلة ومتاحة للحجز</option>
                  <option value="inactive">معطلة مؤقتاً</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={savingVehicles}
                onClick={async () => {
                  if (!editingVehicle.name.trim()) {
                    showFeedback('يرجى إدخال اسم فئة السيارة.', 'error');
                    return;
                  }
                  const exists = vehiclesList.some((v) => v.id === editingVehicle.id);
                  const updated = exists
                    ? vehiclesList.map((v) => (v.id === editingVehicle.id ? editingVehicle : v))
                    : [...vehiclesList, editingVehicle];

                  const totalPayloadBytes = new Blob([JSON.stringify({ options: updated })]).size;
                  if (totalPayloadBytes > 920000) {
                    showFeedback('حجم صور السيارات الإجمالي تجاوز الحد المسموح (1MB). يرجى تقليل أو إزالة صورة واحدة على الأقل.', 'error');
                    return;
                  }

                  setSavingVehicles(true);
                  try {
                    await saveVehicleOptions(updated);
                    setVehiclesList(updated);
                    setIsVehicleModalOpen(false);
                    showFeedback('تم حفظ بيانات فئة السيارة بنجاح!', 'success');
                  } catch (err) {
                    console.error(err);
                    showFeedback('فشل حفظ بيانات السيارة', 'error');
                  } finally {
                    setSavingVehicles(false);
                  }
                }}
                className="px-6 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer"
              >
                {savingVehicles ? 'جاري الحفظ...' : 'حفظ الفئة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm bg-[#0D1B2A] text-[#D4AF37] px-3 py-1 rounded-lg">
                  {selectedBookingDetails.bookingReference}
                </span>
                <h3 className="text-base font-bold font-heading text-[#0D1B2A]">
                  Booking Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FBF9F5] p-4 rounded-xl border border-[#EAE4D9]">
              <div><strong className="text-slate-500">Status:</strong> {selectedBookingDetails.status}</div>
              <div><strong className="text-slate-500">Service Type:</strong> {selectedBookingDetails.serviceType}</div>
              <div><strong className="text-slate-500">Customer Name:</strong> {selectedBookingDetails.customerName}</div>
              <div dir="ltr"><strong className="text-slate-500">Phone:</strong> {selectedBookingDetails.phone}</div>
              <div dir="ltr"><strong className="text-slate-500">Email:</strong> {selectedBookingDetails.email}</div>
              <div><strong className="text-slate-500">Nationality:</strong> {selectedBookingDetails.nationality || '—'}</div>
              <div><strong className="text-slate-500">Pickup:</strong> {selectedBookingDetails.origin}</div>
              <div><strong className="text-slate-500">Destination:</strong> {selectedBookingDetails.destination}</div>
              <div><strong className="text-slate-500">Date:</strong> {selectedBookingDetails.pickupDate}</div>
              <div><strong className="text-slate-500">Time:</strong> {selectedBookingDetails.pickupTime}</div>
              <div><strong className="text-slate-500">Trip Type:</strong> {selectedBookingDetails.tripType === 'round_trip' ? 'Round Trip' : 'One Way'}</div>
              <div><strong className="text-slate-500">Passengers / Luggage:</strong> {selectedBookingDetails.passengerCount} Pax / {selectedBookingDetails.luggageCount} Bags</div>
              <div>
                <strong className="text-slate-500">Vehicle:</strong>{' '}
                <span className="font-bold text-[#0D1B2A]">
                  {selectedBookingDetails.vehicleName || resolveVehicleDisplayName(selectedBookingDetails.vehicleType, vehiclesList)}
                </span>
              </div>
              <div>
                <strong className="text-slate-500">Price:</strong>{' '}
                <span className="font-bold text-emerald-700">
                  {typeof selectedBookingDetails.quotedPrice === 'number' && selectedBookingDetails.quotedPrice > 0
                    ? `${selectedBookingDetails.quotedPrice} ${selectedBookingDetails.priceCurrency || 'EUR'}`
                    : 'Price on Request (السعر عند الطلب)'}
                </span>
              </div>
              {selectedBookingDetails.flightNumber && (
                <div><strong className="text-slate-500">Flight:</strong> {selectedBookingDetails.flightNumber} ({selectedBookingDetails.airline || '—'} / {selectedBookingDetails.flightTime || '—'})</div>
              )}
              {selectedBookingDetails.tourTitle && (
                <div><strong className="text-slate-500">Tour:</strong> {selectedBookingDetails.tourTitle}</div>
              )}
            </div>

            {selectedBookingDetails.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <strong className="block text-slate-600 mb-1">Customer Notes:</strong>
                <p className="text-slate-800 whitespace-pre-wrap">{selectedBookingDetails.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedBookingDetails(null)}
                className="px-5 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h4 className="font-bold text-base text-slate-900">
              Cancel Booking {cancelModalBooking.bookingReference}?
            </h4>
            <p className="text-xs text-slate-500">
              The status will be updated to Cancelled.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
