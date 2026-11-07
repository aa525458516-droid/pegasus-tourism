import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Booking, Tour, ContactMessage, CompanySettings, BookingStatus, CustomTripRequest } from '../types';
import { 
  subscribeToBookings, 
  updateBookingStatus, 
  deleteBooking 
} from '../services/bookingService';
import { 
  subscribeToTours, 
  saveTour, 
  deleteTour, 
  seedInitialTours 
} from '../services/tourService';
import { 
  subscribeToMessages, 
  updateMessageStatus, 
  deleteMessage 
} from '../services/messageService';
import { 
  getCompanySettings, 
  saveCompanySettings 
} from '../services/settingsService';
import {
  getAllCustomTripRequests,
  updateCustomTripPricing,
  updateCustomTripStatus
} from '../services/customTripService';
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
  Compass
} from 'lucide-react';

const AdminCustomTripCard: React.FC<{
  trip: CustomTripRequest;
  onUpdate: () => void;
  showFeedback: (msg: string, type?: 'success' | 'error') => void;
}> = ({ trip, onUpdate, showFeedback }) => {
  const [internalCost, setInternalCost] = useState(trip.pricing?.internalCost?.toString() || '');
  const [margin, setMargin] = useState(trip.pricing?.margin?.toString() || '');
  const [finalPrice, setFinalPrice] = useState(trip.pricing?.finalPrice?.toString() || '');

  return (
    <div className="bg-white rounded-2xl border border-[#EAE4D9] p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
        <div>
          <span className="font-mono font-bold text-xs bg-[#0D1B2A] text-[#D4AF37] px-2.5 py-1 rounded">
            {trip.referenceNumber}
          </span>
          <span className={`ml-2 px-2.5 py-0.5 rounded text-[11px] font-bold ${
            trip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
            trip.status === 'Price Sent' ? 'bg-blue-100 text-blue-800' :
            trip.status === 'Customer Approved' ? 'bg-purple-100 text-purple-800' :
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
          <div><strong className="text-slate-500">Passengers:</strong> {trip.passengerCount} (Max 2)</div>
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

      {/* Admin Pricing & Status Control Box */}
      <div className="pt-3 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500">Internal Cost (€)</label>
            <input
              type="number"
              value={internalCost}
              onChange={(e) => setInternalCost(e.target.value)}
              placeholder="0"
              className="w-24 px-2.5 py-1 rounded-lg border text-xs bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500">Margin (€)</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              placeholder="0"
              className="w-24 px-2.5 py-1 rounded-lg border text-xs bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#D4AF37]">Final Customer Price (€)</label>
            <input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="0"
              className="w-28 px-2.5 py-1 rounded-lg border border-[#D4AF37] text-xs font-bold bg-white text-[#0D1B2A]"
            />
          </div>

          <button
            type="button"
            onClick={async () => {
              if (!trip.id) return;
              await updateCustomTripPricing(trip.id, Number(internalCost) || 0, Number(margin) || 0, Number(finalPrice) || 0);
              showFeedback(`Price sent for ${trip.referenceNumber}`, 'success');
              onUpdate();
            }}
            className="px-4 py-2 rounded-lg bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs hover:bg-[#1B263B] transition cursor-pointer self-end"
          >
            Send Price to Customer
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={trip.status}
            onChange={async (e) => {
              if (!trip.id) return;
              await updateCustomTripStatus(trip.id, e.target.value as any);
              showFeedback(`Status updated to ${e.target.value}`, 'success');
              onUpdate();
            }}
            className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-white text-slate-900"
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
  );
};

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { isAdmin, adminDisplayName, loginWithGoogle, loginWithEmailPassword, logout } = useAuth();
  const { t, direction } = useLanguage();

  const [activeTab, setActiveTab] = useState<'bookings' | 'tours' | 'messages' | 'settings' | 'customTrips'>('bookings');
  
  // Real Firebase credentials state (No hardcoded passcodes)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [customTrips, setCustomTrips] = useState<CustomTripRequest[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  // Filters & selection
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);

  // Tour edit state
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isNewTourModalOpen, setIsNewTourModalOpen] = useState(false);

  // Settings saving state
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Status feedback toast & cancel confirmation modal
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    // Optimistic local UI update
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
        b.adminNotes
      );
      showFeedback(`Booking ${b.bookingReference} status changed to ${newStatus}.`, 'success');
    } catch (err) {
      console.error('Failed to update booking status:', err);
      // Revert on error
      setBookings((prev) =>
        prev.map((item) =>
          (item.id && item.id === b.id) || item.bookingReference === b.bookingReference
            ? { ...item, status: b.status }
            : item
        )
      );
      showFeedback(`Failed to update ${b.bookingReference}: check network or credentials.`, 'error');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    const b = cancelModalBooking;
    const targetId = b.id || b.bookingReference;
    setCancelModalBooking(null);

    setBookings((prev) =>
      prev.map((item) =>
        (item.id && item.id === b.id) || item.bookingReference === b.bookingReference
          ? { ...item, status: 'Cancelled' }
          : item
      )
    );

    try {
      await updateBookingStatus(
        targetId,
        b.bookingReference,
        'Cancelled',
        b.adminNotes
      );
      showFeedback(`Booking ${b.bookingReference} has been cancelled.`, 'success');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setBookings((prev) =>
        prev.map((item) =>
          (item.id && item.id === b.id) || item.bookingReference === b.bookingReference
            ? { ...item, status: b.status }
            : item
        )
      );
      showFeedback(`Failed to cancel ${b.bookingReference}.`, 'error');
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    const unsubBookings = subscribeToBookings(setBookings);
    const unsubTours = subscribeToTours(setTours);
    const unsubMessages = subscribeToMessages(setMessages);
    getCompanySettings().then(setCompanySettings);
    getAllCustomTripRequests().then(setCustomTrips);

    return () => {
      unsubBookings();
      unsubTours();
      unsubMessages();
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
              Authorized PEGASUS Dispatch & Fleet Administration
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Google Sign In option */}
            <button
              onClick={async () => {
                try {
                  setLoginError(null);
                  setLoggingIn(true);
                  await loginWithGoogle();
                } catch (err: unknown) {
                  setLoginError(err instanceof Error ? err.message : 'Google sign in was canceled or failed.');
                } finally {
                  setLoggingIn(false);
                }
              }}
              disabled={loggingIn}
              className="w-full py-3 px-4 rounded-xl border border-[#D5CDBD] bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loggingIn ? 'Authenticating...' : t('admin.signInGoogle')}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">Or Email Credentials</span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError(null);
                setLoggingIn(true);
                try {
                  await loginWithEmailPassword(adminEmail, adminPassword);
                } catch (err: unknown) {
                  setLoginError(err instanceof Error ? err.message : 'Invalid administrator credentials.');
                } finally {
                  setLoggingIn(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBD] text-xs focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-xl bg-[#0D1B2A] hover:bg-[#1B263B] text-[#D4AF37] font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {loggingIn ? 'Signing in...' : 'Sign In with Firebase Auth'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Primary Admin: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">aa525458516@gmail.com</code></span>
            <button onClick={onClose} className="hover:text-slate-700">Exit</button>
          </div>
        </div>
      </div>
    );
  }

  // Stats calculation
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  const filteredBookings = bookings
    .filter((b) => (bookingFilter === 'all' ? true : b.status === bookingFilter))
    .filter((b) => {
      if (!bookingSearch.trim()) return true;
      const s = bookingSearch.toLowerCase();
      return (
        b.bookingReference.toLowerCase().includes(s) ||
        b.customerName.toLowerCase().includes(s) ||
        b.phone.toLowerCase().includes(s) ||
        b.email.toLowerCase().includes(s) ||
        b.destination.toLowerCase().includes(s)
      );
    });

  return (
    <div className="bg-[#F8F5EE] min-h-screen pb-16" dir={direction}>
      {/* Admin Top Navigation */}
      <div className="bg-[#0D1B2A] text-white px-4 sm:px-8 py-4 border-b border-[#D4AF37]/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <span>PEGASUS Dispatch Center</span>
                <span className="text-[10px] bg-[#D4AF37] text-[#0D1B2A] font-bold px-2 py-0.5 rounded font-sans uppercase">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-medium">{adminDisplayName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => seedInitialTours()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-semibold border border-[#D4AF37]/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Seed Tours in Firestore if empty"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.seedBtn')}</span>
            </button>

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
        {/* KPI Metric Cards */}
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
              <Clock className="w-3 h-3" /> Pending Requests
            </span>
            <div className="text-2xl font-bold font-heading text-amber-800">
              {pendingCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Confirmed Trips
            </span>
            <div className="text-2xl font-bold font-heading text-emerald-800">
              {confirmedCount}
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

        {/* Dashboard Tabs */}
        <div className="flex border-b border-[#EAE4D9] mb-6 gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.bookingsTab')} ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.messagesTab')} ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customTrips')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'customTrips'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Custom Trips ({customTrips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-[#0D1B2A] text-[#0D1B2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('admin.settingsTab')}</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search & filter toolbar */}
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by reference, name, phone, email or destination..."
                  className="w-full text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      bookingFilter === st
                        ? 'bg-[#0D1B2A] text-[#D4AF37]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-[#EAE4D9] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#0D1B2A] text-[#FBF9F5] font-heading uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Route & Service</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Status & Notes</th>
                      <th className="p-4 text-right rtl:text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No bookings found. Try a different search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id || b.bookingReference} className="hover:bg-slate-50/70 transition">
                          <td className="p-4 font-mono font-bold text-slate-900">
                            <span className="block">{b.bookingReference}</span>
                            <span className="text-[10px] text-slate-400 font-sans font-normal">
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-900">{b.customerName}</div>
                            <div className="text-[11px] text-slate-500">{b.phone}</div>
                            <div className="text-[11px] text-slate-400">{b.email}</div>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {b.nationality || 'Intl'} • {b.passengerCount} pax
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{b.pickupDate}</div>
                            <div className="text-slate-500">{b.pickupTime || 'TBD'}</div>
                            {b.flightNumber && (
                              <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded inline-block mt-0.5">
                                Flight: {b.flightNumber}
                              </div>
                            )}
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="font-semibold text-slate-900 line-clamp-1 flex items-center justify-between gap-1">
                              <span>{b.origin}</span>
                              {b.pickupLocation?.latitude && b.pickupLocation?.longitude && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${b.pickupLocation.latitude},${b.pickupLocation.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#D4AF37] hover:text-[#0D1B2A] bg-[#0D1B2A]/5 hover:bg-[#0D1B2A]/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono shrink-0"
                                  title="Open Pickup in Google Maps"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>Pickup Map</span>
                                  <ExternalLink className="w-2 h-2" />
                                </a>
                              )}
                            </div>
                            <div className="text-slate-400 text-[10px] my-0.5">➔ to</div>
                            <div className="text-[#0D1B2A] font-bold line-clamp-1 flex items-center justify-between gap-1">
                              <span>{b.destination}</span>
                              {b.destinationLocation?.latitude && b.destinationLocation?.longitude && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${b.destinationLocation.latitude},${b.destinationLocation.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#D4AF37] hover:text-[#0D1B2A] bg-[#0D1B2A]/5 hover:bg-[#0D1B2A]/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1 font-mono shrink-0"
                                  title="Open Destination in Google Maps"
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>Dest Map</span>
                                  <ExternalLink className="w-2 h-2" />
                                </a>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 capitalize mt-1 flex flex-wrap items-center gap-1">
                              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                                {b.serviceType.replace('_', ' ')}
                              </span>
                              {b.tripType && (
                                <span className={`px-1.5 py-0.2 rounded font-medium ${
                                  b.tripType === 'round_trip' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {b.tripType.replace('_', ' ')}
                                </span>
                              )}
                              {b.airline && (
                                <span className="bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                                  {b.airline}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className="font-medium text-slate-700 capitalize">
                              {b.vehicleType.replace('_', ' ')}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {b.luggageCount || 0} luggage
                            </div>
                          </td>

                          <td className="p-4">
                            {/* Status Change Selector */}
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateStatus(b, e.target.value as BookingStatus)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
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

                            {/* Dispatch notes */}
                            <div className="mt-1">
                              <input
                                type="text"
                                defaultValue={b.adminNotes || ''}
                                placeholder="Add driver / dispatch note..."
                                onBlur={async (e) => {
                                  const newNotes = e.target.value.trim();
                                  const targetId = b.id || b.bookingReference;
                                  if (targetId && newNotes !== (b.adminNotes || '')) {
                                    setBookings((prev) =>
                                      prev.map((item) =>
                                        (item.id && item.id === b.id) || item.bookingReference === b.bookingReference
                                          ? { ...item, adminNotes: newNotes }
                                          : item
                                      )
                                    );
                                    try {
                                      await updateBookingStatus(
                                        targetId,
                                        b.bookingReference,
                                        b.status,
                                        newNotes
                                      );
                                    } catch (err) {
                                      console.error('Failed to update booking notes:', err);
                                    }
                                  }
                                }}
                                className="w-full text-[10px] px-1.5 py-1 border border-slate-200 rounded text-slate-600 focus:border-[#D4AF37]"
                              />
                            </div>
                          </td>

                          <td className="p-4 text-right rtl:text-left whitespace-nowrap">
                            <div className="flex items-center justify-end rtl:justify-start gap-1">
                              {/* WhatsApp Direct */}
                              <a
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customerName)}%2C%20this%20is%20PEGASUS%20Hurghada%20regarding%20your%20transfer%20request%20${b.bookingReference}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition"
                                title="Message Customer on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 fill-current" />
                              </a>

                              {/* View Voucher */}
                              <button
                                onClick={() => setSelectedBookingForVoucher(b)}
                                className="p-1.5 text-slate-600 hover:text-[#0D1B2A] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="View / Print Voucher"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (b.id && confirm(`Delete booking ${b.bookingReference}?`)) {
                                    deleteBooking(b.id, b.bookingReference);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOURS MANAGER */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0D1B2A]">
                Organized Tour Catalog ({tours.length} Active Tours)
              </h3>
              <button
                onClick={() => {
                  setEditingTour({
                    id: `tour-${Date.now()}`,
                    title: '',
                    titleDe: '',
                    titleAr: '',
                    category: 'historical',
                    destination: '[Insert Destination - Editable]',
                    duration: '[Customizable Schedule - Editable]',
                    pricePerPerson: null,
                    priceNotice: '[Quote upon Request - Editable]',
                    description: '',
                    descriptionDe: '',
                    descriptionAr: '',
                    highlights: ['[Custom Itinerary Highlight 1]', '[Private Transport Option]', '[Meal Inclusion Option]'],
                    included: ['[Included Service 1 - Editable]', '[Licensed Guide - Editable]', '[Permits - Editable]'],
                    excluded: ['[Excluded Item 1 - Editable]', '[Gratuities - Discretionary]'],
                    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
                    featured: false,
                    active: true,
                    priceMode: 'request',
                    displayOrder: 99
                  });
                  setIsNewTourModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.addTour')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tr) => (
                <div key={tr.id} className="bg-white rounded-2xl border border-[#EAE4D9] p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                      <img src={tr.imageUrl} alt={tr.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        {tr.pricePerPerson ? `€${tr.pricePerPerson} / person` : (tr.priceNotice || '[Price on Request]')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0D1B2A] mb-1 line-clamp-1">{tr.title}</h4>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{tr.description}</p>
                    <div className="text-[11px] text-slate-400">
                      <span>{tr.destination} • {tr.duration}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tr.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {tr.active ? 'Active' : 'Hidden'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTour(tr);
                          setIsNewTourModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-[#0D1B2A] hover:bg-slate-100 rounded-lg cursor-pointer"
                        title={t('admin.editTour')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete tour "${tr.title}"?`)) {
                            deleteTour(tr.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title={t('admin.deleteTour')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-heading text-[#0D1B2A]">
              Visitor Messages & Inquiries ({messages.length})
            </h3>

            {messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-[#EAE4D9]">
                No contact inquiries received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition ${
                      m.status === 'unread' ? 'border-amber-300 bg-amber-50/20' : 'border-[#EAE4D9]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                        <span className="text-xs text-slate-400 mx-2">•</span>
                        <span className="text-xs text-slate-500">{m.email}</span>
                        {m.phone && <span className="text-xs text-slate-500 ml-2 font-mono">({m.phone})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={m.status}
                          onChange={(e) => {
                            if (m.id) {
                              updateMessageStatus(m.id, e.target.value as 'unread' | 'read' | 'replied');
                            }
                          }}
                          className="text-xs px-2 py-0.5 rounded border border-slate-300 bg-white cursor-pointer"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>

                        <button
                          onClick={() => {
                            if (m.id && confirm('Delete this message?')) {
                              deleteMessage(m.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-[#0D1B2A] mb-1">
                      Subject: {m.subject || 'General Inquiry'}
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed mb-3">
                      {m.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Received: {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Recent'}</span>

                      <div className="flex items-center gap-2">
                        {m.phone && (
                          <a
                            href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(m.name)}%2C%20regarding%20your%20inquiry%20to%20PEGASUS%20Hurghada`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#25D366] hover:underline font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" /> Reply WhatsApp
                          </a>
                        )}

                        <a
                          href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject || 'PEGASUS Hurghada')}`}
                          className="inline-flex items-center gap-1 text-slate-700 hover:underline font-semibold"
                        >
                          <Mail className="w-3.5 h-3.5" /> Reply Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: CUSTOM TRIP REQUESTS */}
        {activeTab === 'customTrips' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#EAE4D9] p-4 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B2A]">Custom Trip Requests ({customTrips.length})</h3>
                <p className="text-xs text-slate-500">Review bespoke trip itineraries, set internal cost/margin, and send final customer pricing.</p>
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

        {/* TAB 4: COMPANY INFO & SETTINGS */}
        {activeTab === 'settings' && companySettings && (
          <div className="bg-white rounded-2xl border border-[#EAE4D9] p-7 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold font-heading text-[#0D1B2A] mb-4 border-b pb-3">
              Company Contact Information & Placeholders
            </h3>

            {settingsSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Company information saved successfully to Firestore!</span>
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
                } catch (err) {
                  console.error(err);
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
                  <label className="block font-semibold text-slate-700 mb-1">Official Telephone (Editable Placeholder)</label>
                  <input
                    type="text"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Direct Hotline (Editable Placeholder)</label>
                  <input
                    type="text"
                    value={companySettings.whatsapp}
                    onChange={(e) => setCompanySettings({ ...companySettings, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email Address (Editable Placeholder)</label>
                  <input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency 24/7 Phone (Editable Placeholder)</label>
                  <input
                    type="text"
                    value={companySettings.emergencyPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Office Address (Editable Placeholder)</label>
                <input
                  type="text"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Egyptian Ministry of Tourism License No. (Editable Placeholder)</label>
                <input
                  type="text"
                  value={companySettings.licenseNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating / Dispatch Hours (Editable Placeholder)</label>
                <input
                  type="text"
                  value={companySettings.officeHours}
                  onChange={(e) => setCompanySettings({ ...companySettings, officeHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CDBD]"
                />
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-auto">
            <h3 className="text-lg font-bold font-heading text-[#0D1B2A] mb-4">
              {editingTour.title ? 'Edit Tour' : 'Create New Tour'}
            </h3>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold mb-1">Title (English) *</label>
                <input
                  type="text"
                  value={editingTour.title}
                  onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Title (German)</label>
                  <input
                    type="text"
                    value={editingTour.titleDe || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, titleDe: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingTour.titleAr || ''}
                    onChange={(e) => setEditingTour({ ...editingTour, titleAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editingTour.category}
                    onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="historical">Historical</option>
                    <option value="marine">Marine</option>
                    <option value="safari">Safari</option>
                    <option value="daytrip">Day Trip</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    value={editingTour.destination}
                    onChange={(e) => setEditingTour({ ...editingTour, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price / Person (€)</label>
                  <input
                    type="number"
                    value={editingTour.pricePerPerson ?? ''}
                    onChange={(e) => setEditingTour({ ...editingTour, pricePerPerson: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Leave empty for quote on request"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Price Notice Placeholder (if price not set)</label>
                <input
                  type="text"
                  value={editingTour.priceNotice || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, priceNotice: e.target.value })}
                  placeholder="e.g. [Price on Request - Editable Placeholder]"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Duration / Schedule Placeholder</label>
                <input
                  type="text"
                  value={editingTour.duration}
                  onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                  placeholder="e.g. [Customizable Schedule - Editable]"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingTour.imageUrl}
                  onChange={(e) => setEditingTour({ ...editingTour, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description (English)</label>
                <textarea
                  rows={3}
                  value={editingTour.description}
                  onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.featured}
                    onChange={(e) => setEditingTour({ ...editingTour, featured: e.target.checked })}
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.active}
                    onChange={(e) => setEditingTour({ ...editingTour, active: e.target.checked })}
                  />
                  <span>Active & Bookable</span>
                </label>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsNewTourModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!editingTour.title.trim()) return;
                  await saveTour(editingTour);
                  setIsNewTourModalOpen(false);
                }}
                className="px-5 py-2 rounded-lg bg-[#0D1B2A] text-[#D4AF37] font-bold text-xs cursor-pointer"
              >
                Save Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOUCHER MODAL */}
      {selectedBookingForVoucher && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D4AF37]">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-bold font-heading text-sm text-[#0D1B2A]">
                  PEGASUS Transfer Voucher
                </span>
              </div>
              <button
                onClick={() => setSelectedBookingForVoucher(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FBF9F5] p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-4 font-mono">
              <div className="flex justify-between font-bold text-sm text-[#0D1B2A]">
                <span>REF: {selectedBookingForVoucher.bookingReference}</span>
                <span className="text-amber-800">{selectedBookingForVoucher.status}</span>
              </div>
              <div>Passenger: {selectedBookingForVoucher.customerName}</div>
              <div>Phone/WhatsApp: {selectedBookingForVoucher.phone}</div>
              <div>Pickup: {selectedBookingForVoucher.pickupDate} at {selectedBookingForVoucher.pickupTime}</div>
              <div>Route: {selectedBookingForVoucher.origin} ➔ {selectedBookingForVoucher.destination}</div>
              {selectedBookingForVoucher.pickupLocation && (
                <div className="text-[11px] text-slate-600 pl-2">
                  <span>Pickup: {selectedBookingForVoucher.pickupLocation.name} ({selectedBookingForVoucher.pickupLocation.address})</span>
                  {selectedBookingForVoucher.pickupLocation.latitude && selectedBookingForVoucher.pickupLocation.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedBookingForVoucher.pickupLocation.latitude},${selectedBookingForVoucher.pickupLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 underline inline-flex items-center gap-0.5"
                    >
                      [View on Google Maps]
                    </a>
                  )}
                </div>
              )}
              {selectedBookingForVoucher.destinationLocation && (
                <div className="text-[11px] text-slate-600 pl-2">
                  <span>Destination: {selectedBookingForVoucher.destinationLocation.name} ({selectedBookingForVoucher.destinationLocation.address})</span>
                  {selectedBookingForVoucher.destinationLocation.latitude && selectedBookingForVoucher.destinationLocation.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedBookingForVoucher.destinationLocation.latitude},${selectedBookingForVoucher.destinationLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 underline inline-flex items-center gap-0.5"
                    >
                      [View on Google Maps]
                    </a>
                  )}
                </div>
              )}
              {selectedBookingForVoucher.tripType && (
                <div>Trip Type: {selectedBookingForVoucher.tripType.replace('_', ' ')}</div>
              )}
              {selectedBookingForVoucher.airline && (
                <div>Airline: {selectedBookingForVoucher.airline}</div>
              )}
              <div>Flight: {selectedBookingForVoucher.flightNumber || 'None specified'}</div>
              <div>Vehicle: {selectedBookingForVoucher.vehicleType}</div>
              <div>Passengers: {selectedBookingForVoucher.passengerCount} | Bags: {selectedBookingForVoucher.luggageCount || 0}</div>
              {selectedBookingForVoucher.notes && <div>Notes: {selectedBookingForVoucher.notes}</div>}
              {selectedBookingForVoucher.adminNotes && (
                <div className="text-amber-900 font-bold">Dispatch: {selectedBookingForVoucher.adminNotes}</div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#0D1B2A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-300">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#0D1B2A] mb-1">
              Confirm Booking Cancellation
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to mark reservation <span className="font-mono font-bold text-slate-900">{cancelModalBooking.bookingReference}</span> for <span className="font-semibold text-slate-900">{cancelModalBooking.customerName}</span> as <span className="text-rose-600 font-bold">Cancelled</span>?
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Yes, Mark Cancelled
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Feedback Toast */}
      {feedbackToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-200 ${
          feedbackToast.type === 'success'
            ? 'bg-[#0D1B2A] text-[#D4AF37] border-[#D4AF37]/50'
            : 'bg-rose-900 text-white border-rose-500'
        }`}>
          {feedbackToast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}
    </div>
  );
};
