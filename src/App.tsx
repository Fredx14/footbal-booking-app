import React, { useState, useEffect } from 'react';
import {
  INITIAL_PITCHES,
  INITIAL_BOOKINGS,
  INITIAL_PRICING_RULES,
  INITIAL_MAINTENANCE,
  INITIAL_USERS,
} from './data/mockData';
import {
  Pitch,
  Booking,
  PricingRule,
  MaintenanceBlock,
  UserProfile,
  TimeSlot,
} from './types/pitch';
import { Navbar } from './components/Navbar';
import { PitchDiscovery } from './components/customer/PitchDiscovery';
import { PitchDetailModal } from './components/customer/PitchDetailModal';
import { ScheduleSelector } from './components/customer/ScheduleSelector';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { BookingConfirmationModal } from './components/customer/BookingConfirmationModal';
import { MyBookingsView } from './components/customer/MyBookingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PitchManagement } from './components/admin/PitchManagement';
import { PricingRulesManager } from './components/admin/PricingRulesManager';
import { MaintenanceScheduler } from './components/admin/MaintenanceScheduler';
import { MasterBookingsManager } from './components/admin/MasterBookingsManager';
import { ArchitectureCenter } from './components/blueprint/ArchitectureCenter';

export default function App() {
  // Main Data States
  const [pitches, setPitches] = useState<Pitch[]>(INITIAL_PITCHES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(INITIAL_PRICING_RULES);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>(INITIAL_MAINTENANCE);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  // Navigation State
  const [currentView, setCurrentView] = useState<'customer' | 'admin' | 'blueprint'>('customer');
  const [customerSubTab, setCustomerSubTab] = useState<'discover' | 'my_bookings'>('discover');
  const [adminSubTab, setAdminSubTab] = useState<
    'dashboard' | 'pitches' | 'schedule' | 'master_bookings' | 'pricing'
  >('dashboard');

  // Customer Interaction States
  const [selectedPitchForSchedule, setSelectedPitchForSchedule] = useState<Pitch | null>(null);
  const [detailModalPitch, setDetailModalPitch] = useState<Pitch | null>(null);

  // Partial Slot Locking State (10-minute hold lock simulation)
  const [activeLock, setActiveLock] = useState<{
    slotId: string;
    pitchId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    expiresAt: number;
  } | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [justConfirmedBooking, setJustConfirmedBooking] = useState<Booking | null>(null);

  // Auto expire slot lock if timeout passed
  useEffect(() => {
    if (!activeLock) return;
    const interval = setInterval(() => {
      if (Date.now() >= activeLock.expiresAt) {
        setActiveLock(null);
        setIsCheckoutOpen(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeLock]);

  // Handle slot locking from ScheduleSelector
  const handleLockSlot = (slot: TimeSlot) => {
    // If user clicked the same slot they already locked, open checkout
    if (activeLock && activeLock.slotId === slot.id) {
      setIsCheckoutOpen(true);
      return;
    }

    // Lock the slot for 10 minutes (600,000 ms)
    const lockExpiresAt = Date.now() + 10 * 60 * 1000;
    setActiveLock({
      slotId: slot.id,
      pitchId: slot.pitchId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      expiresAt: lockExpiresAt,
    });
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveLock(null);
    setIsCheckoutOpen(false);
    setSelectedPitchForSchedule(null);
    setJustConfirmedBooking(newBooking);
  };

  const handleCancelBooking = (bookingId: string, reason: string, refundAmount: number) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'cancelled',
            cancellationReason: reason,
            refundAmount,
            paymentStatus: 'refunded',
          };
        }
        return b;
      })
    );
  };

  const handleRescheduleBooking = (b: Booking) => {
    const pitch = pitches.find((p) => p.id === b.pitchId);
    if (pitch) {
      setSelectedPitchForSchedule(pitch);
      setCustomerSubTab('discover');
    }
  };

  // Admin Pitch CRUD
  const handleAddPitch = (newPitch: Pitch) => {
    setPitches((prev) => [newPitch, ...prev]);
  };

  const handleUpdatePitch = (updatedPitch: Pitch) => {
    setPitches((prev) => prev.map((p) => (p.id === updatedPitch.id ? updatedPitch : p)));
  };

  const handleDeletePitch = (pitchId: string) => {
    setPitches((prev) => prev.filter((p) => p.id !== pitchId));
  };

  // Admin Pricing Rules
  const handleAddPricingRule = (rule: PricingRule) => {
    setPricingRules((prev) => [rule, ...prev]);
  };

  const handleTogglePricingRule = (ruleId: string) => {
    setPricingRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeletePricingRule = (ruleId: string) => {
    setPricingRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  // Admin Maintenance
  const handleAddMaintenance = (block: MaintenanceBlock) => {
    setMaintenanceBlocks((prev) => [block, ...prev]);
  };

  const handleDeleteMaintenance = (blockId: string) => {
    setMaintenanceBlocks((prev) => prev.filter((m) => m.id !== blockId));
  };

  // Admin Master Bookings
  const handleAddOfflineBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleRefundBooking = (bookingId: string, refundAmount: number, reason: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'refunded',
            refundAmount,
            cancellationReason: reason,
            paymentStatus: 'refunded',
          };
        }
        return b;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Navbar
        currentView={currentView}
        onChangeView={(v) => {
          setCurrentView(v);
          setSelectedPitchForSchedule(null);
        }}
        currentUser={currentUser}
        availableUsers={users}
        onSwitchUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'customer' && currentView === 'admin') {
            setCurrentView('customer');
          } else if (u.role !== 'customer' && currentView === 'customer') {
            // Keep on current or allow switching
          }
        }}
        activeLock={activeLock}
        onOpenCheckoutFromLock={() => setIsCheckoutOpen(true)}
        customerSubTab={customerSubTab}
        onSetCustomerSubTab={(tab) => {
          setCustomerSubTab(tab);
          setSelectedPitchForSchedule(null);
        }}
        adminSubTab={adminSubTab}
        onSetAdminSubTab={setAdminSubTab}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* CUSTOMER PORTAL VIEW */}
        {currentView === 'customer' && (
          <div>
            {customerSubTab === 'my_bookings' ? (
              <MyBookingsView
                bookings={bookings}
                currentUserId={currentUser.id}
                onCancelBooking={handleCancelBooking}
                onRescheduleBooking={handleRescheduleBooking}
              />
            ) : selectedPitchForSchedule ? (
              <ScheduleSelector
                pitch={selectedPitchForSchedule}
                bookings={bookings}
                maintenanceBlocks={maintenanceBlocks}
                pricingRules={pricingRules}
                currentUserId={currentUser.id}
                activeLock={activeLock}
                onLockSlot={handleLockSlot}
                onProceedToCheckout={() => setIsCheckoutOpen(true)}
                onBackToPitches={() => setSelectedPitchForSchedule(null)}
              />
            ) : (
              <PitchDiscovery
                pitches={pitches}
                onSelectPitchForBooking={(pitch) => setSelectedPitchForSchedule(pitch)}
                onOpenPitchDetails={(pitch) => setDetailModalPitch(pitch)}
              />
            )}
          </div>
        )}

        {/* ADMIN PORTAL VIEW */}
        {currentView === 'admin' && (
          <div>
            {adminSubTab === 'dashboard' && (
              <AdminDashboard
                pitches={pitches}
                bookings={bookings}
                maintenanceBlocks={maintenanceBlocks}
                onNavigateTab={(tab) => setAdminSubTab(tab)}
              />
            )}
            {adminSubTab === 'pitches' && (
              <PitchManagement
                pitches={pitches}
                onAddPitch={handleAddPitch}
                onUpdatePitch={handleUpdatePitch}
                onDeletePitch={handleDeletePitch}
              />
            )}
            {adminSubTab === 'pricing' && (
              <PricingRulesManager
                pitches={pitches}
                pricingRules={pricingRules}
                onAddRule={handleAddPricingRule}
                onToggleRule={handleTogglePricingRule}
                onDeleteRule={handleDeletePricingRule}
              />
            )}
            {adminSubTab === 'schedule' && (
              <MaintenanceScheduler
                pitches={pitches}
                maintenanceBlocks={maintenanceBlocks}
                onAddMaintenance={handleAddMaintenance}
                onDeleteMaintenance={handleDeleteMaintenance}
              />
            )}
            {adminSubTab === 'master_bookings' && (
              <MasterBookingsManager
                bookings={bookings}
                pitches={pitches}
                onAddOfflineBooking={handleAddOfflineBooking}
                onRefundBooking={handleRefundBooking}
              />
            )}
          </div>
        )}

        {/* TECHNICAL ARCHITECTURE & BLUEPRINT VIEW */}
        {currentView === 'blueprint' && <ArchitectureCenter />}
      </main>

      {/* Pitch Detail Modal */}
      {detailModalPitch && (
        <PitchDetailModal
          pitch={detailModalPitch}
          onClose={() => setDetailModalPitch(null)}
          onBookNow={(p) => {
            setSelectedPitchForSchedule(p);
            setDetailModalPitch(null);
          }}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && activeLock && (
        <CheckoutModal
          pitch={pitches.find((p) => p.id === activeLock.pitchId) || pitches[0]}
          activeLock={activeLock}
          currentUser={currentUser}
          onClose={() => {
            setIsCheckoutOpen(false);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Confirmation Pass Modal */}
      {justConfirmedBooking && (
        <BookingConfirmationModal
          booking={justConfirmedBooking}
          onClose={() => setJustConfirmedBooking(null)}
          onGoToMyBookings={() => {
            setJustConfirmedBooking(null);
            setCurrentView('customer');
            setCustomerSubTab('my_bookings');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">⚽ PitchMaster Architecture Platform</span>
            <span>•</span>
            <span>Production Blueprint & Interactive Booking Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setCurrentView('customer')}
              className="hover:text-emerald-400 transition-colors"
            >
              Customer App
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-emerald-400 transition-colors"
            >
              Admin Portal
            </button>
            <button
              onClick={() => setCurrentView('blueprint')}
              className="hover:text-emerald-400 transition-colors"
            >
              Database Schema & Mutex Specs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
