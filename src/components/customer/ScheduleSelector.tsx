import React, { useState, useMemo } from 'react';
import { Pitch, TimeSlot, Booking, MaintenanceBlock, PricingRule } from '../../types/pitch';
import {
  Calendar as CalendarIcon,
  Clock,
  Lock,
  CheckCircle,
  AlertCircle,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ScheduleSelectorProps {
  pitch: Pitch;
  bookings: Booking[];
  maintenanceBlocks: MaintenanceBlock[];
  pricingRules: PricingRule[];
  currentUserId: string;
  activeLock: {
    slotId: string;
    pitchId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    expiresAt: number;
  } | null;
  onLockSlot: (slot: TimeSlot) => void;
  onProceedToCheckout: () => void;
  onBackToPitches: () => void;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  pitch,
  bookings,
  maintenanceBlocks,
  pricingRules,
  currentUserId,
  activeLock,
  onLockSlot,
  onProceedToCheckout,
  onBackToPitches,
}) => {
  // Generate next 14 dates starting from 2026-10-24
  const availableDates = useMemo(() => {
    const dates = [];
    const base = new Date(2026, 9, 24); // 2026-10-24
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-GB', { month: 'short' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      dates.push({ iso, dayName, dayNumber, monthName, isWeekend });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].iso);

  // Generate slots for the selected pitch & date
  const timeSlots: TimeSlot[] = useMemo(() => {
    const [openH] = pitch.operatingHours.open.split(':').map(Number);
    const [closeH] = pitch.operatingHours.close.split(':').map(Number);
    const duration = pitch.slotDurationMinutes; // 60 or 90 mins
    const slots: TimeSlot[] = [];

    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let currentMinutes = openH * 60;
    const endMinutes = closeH * 60;

    while (currentMinutes + duration <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endH = Math.floor((currentMinutes + duration) / 60);
      const endM = (currentMinutes + duration) % 60;

      const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      const slotId = `${pitch.id}_${selectedDate}_${startTime}`;

      // Calculate price based on peak rules & weekend
      const isPeak = startH >= 18 && startH < 22;
      let slotPrice = pitch.basePricePerHour * (duration / 60);

      if (isWeekend) {
        slotPrice = pitch.weekendPrice * (duration / 60);
      } else if (isPeak) {
        slotPrice = pitch.peakHourPrice * (duration / 60);
      }

      // Check maintenance status
      const isUnderMaintenance = maintenanceBlocks.some(
        (m) =>
          m.pitchId === pitch.id &&
          selectedDate >= m.startDate &&
          selectedDate <= m.endDate &&
          startTime >= m.startTime &&
          startTime < m.endTime
      );

      // Check booking status
      const existingBooking = bookings.find(
        (b) =>
          b.pitchId === pitch.id &&
          b.date === selectedDate &&
          b.startTime === startTime &&
          b.status !== 'cancelled'
      );

      // Check lock status
      const isLockedBySelf =
        activeLock?.pitchId === pitch.id &&
        activeLock?.date === selectedDate &&
        activeLock?.startTime === startTime;

      let status: TimeSlot['status'] = 'available';
      if (isUnderMaintenance) {
        status = 'maintenance';
      } else if (existingBooking) {
        status = 'booked';
      } else if (isLockedBySelf) {
        status = 'locked';
      }

      slots.push({
        id: slotId,
        pitchId: pitch.id,
        date: selectedDate,
        startTime,
        endTime,
        price: Math.round(slotPrice),
        isPeak,
        status,
        lockedByUserId: isLockedBySelf ? currentUserId : undefined,
        lockedExpiresAt: isLockedBySelf ? activeLock?.expiresAt : undefined,
        bookingId: existingBooking?.id,
      });

      currentMinutes += duration;
    }

    return slots;
  }, [pitch, selectedDate, bookings, maintenanceBlocks, activeLock, currentUserId]);

  const morningSlots = timeSlots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h < 12;
  });

  const afternoonSlots = timeSlots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 12 && h < 18;
  });

  const eveningSlots = timeSlots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 18;
  });

  return (
    <div className="space-y-6">
      {/* Header bar with Pitch summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToPitches}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to all pitches"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img
            src={pitch.imageUrl}
            alt={pitch.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-700 hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {pitch.venueName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300">{pitch.size}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{pitch.name}</h2>
            <p className="text-xs text-slate-400">{pitch.location} — {pitch.dimensions}</p>
          </div>
        </div>

        {/* Dynamic Pricing Note */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs text-emerald-300">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Real-time Slot Locking active (10m checkout hold)</span>
        </div>
      </div>

      {/* Date Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            Select Training Date
          </span>
          <span className="text-slate-500">14-Day Advance Booking Window</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] py-3 px-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-lg shadow-emerald-500/25 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`text-[11px] uppercase ${isSelected ? 'text-slate-950 font-extrabold' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-xl font-black mt-0.5">{item.dayNumber}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                  {item.monthName}
                </span>
                {item.isWeekend && (
                  <span
                    className={`mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                      isSelected ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    Matchday
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-900 border border-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span>Your Selected Lock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/50" />
          <span>Peak Demand (££)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-800 opacity-60 border border-slate-700" />
          <span>Booked / Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-red-950/40 border border-red-800/40" />
          <span>Maintenance</span>
        </div>
      </div>

      {/* Time Slots Sections */}
      <div className="space-y-6">
        {/* Morning */}
        {morningSlots.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Morning Sessions (07:00 – 12:00)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {morningSlots.map((slot) => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  onLock={() => onLockSlot(slot)}
                  isLockedByMe={activeLock?.slotId === slot.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Afternoon */}
        {afternoonSlots.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Afternoon Training (12:00 – 18:00)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {afternoonSlots.map((slot) => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  onLock={() => onLockSlot(slot)}
                  isLockedByMe={activeLock?.slotId === slot.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Evening Peak */}
        {eveningSlots.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Evening Prime Floodlit Sessions (18:00 – 23:00)
              </h4>
              <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                High Demand Peak
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {eveningSlots.map((slot) => (
                <SlotButton
                  key={slot.id}
                  slot={slot}
                  onLock={() => onLockSlot(slot)}
                  isLockedByMe={activeLock?.slotId === slot.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Checkout Confirmation Dock */}
      {activeLock && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Slot Locked & Reserved
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-white font-mono">
                  {activeLock.date} at {activeLock.startTime}–{activeLock.endTime}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Total Price: <span className="font-extrabold text-white text-base">£{activeLock.price}</span> (Includes pitch hire + floodlights)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onProceedToCheckout}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SlotButtonProps {
  slot: TimeSlot;
  onLock: () => void;
  isLockedByMe: boolean;
}

const SlotButton: React.FC<SlotButtonProps> = ({ slot, onLock, isLockedByMe }) => {
  const isBooked = slot.status === 'booked';
  const isMaintenance = slot.status === 'maintenance';
  const isAvailable = slot.status === 'available' || isLockedByMe;

  if (isMaintenance) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 flex flex-col items-center justify-center cursor-not-allowed opacity-60">
        <span className="text-xs font-mono font-bold line-through">{slot.startTime}</span>
        <span className="text-[10px] text-red-400/80 mt-1">Maintenance</span>
      </div>
    );
  }

  if (isBooked) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-600 flex flex-col items-center justify-center cursor-not-allowed">
        <span className="text-xs font-mono font-bold line-through">{slot.startTime}</span>
        <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Booked
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onLock}
      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all group relative overflow-hidden ${
        isLockedByMe
          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-lg shadow-emerald-500/30 scale-105'
          : slot.isPeak
          ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/40 hover:border-amber-400 text-slate-200'
          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/60 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-sm font-black font-mono tracking-tight">{slot.startTime}</span>
      </div>
      <span className={`text-[11px] mt-0.5 ${isLockedByMe ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
        £{slot.price}
      </span>

      {slot.isPeak && !isLockedByMe && (
        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-semibold mt-1 bg-amber-500/10 px-1.5 py-0.2 rounded">
          Peak
        </span>
      )}
      {isLockedByMe && (
        <span className="text-[9px] uppercase tracking-wider text-slate-950 font-black mt-1 bg-black/20 px-1.5 py-0.2 rounded">
          Selected
        </span>
      )}
    </button>
  );
};
