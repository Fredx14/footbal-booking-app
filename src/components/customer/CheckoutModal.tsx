import React, { useState, useEffect } from 'react';
import { Pitch, BookingAddon, Booking } from '../../types/pitch';
import { AVAILABLE_ADDONS } from '../../data/mockData';
import {
  X,
  Lock,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Phone,
  Mail,
  User,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface CheckoutModalProps {
  pitch: Pitch;
  activeLock: {
    slotId: string;
    pitchId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    expiresAt: number;
  };
  currentUser: {
    name: string;
    email: string;
    phone: string;
    id: string;
  };
  onClose: () => void;
  onBookingSuccess: (newBooking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  pitch,
  activeLock,
  currentUser,
  onClose,
  onBookingSuccess,
}) => {
  // Countdown timer for partial slot lock
  const [timeLeftMs, setTimeLeftMs] = useState(
    Math.max(0, activeLock.expiresAt - Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, activeLock.expiresAt - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLock.expiresAt]);

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);

  // Selected Add-ons
  const [selectedAddons, setSelectedAddons] = useState<{ [id: string]: number }>({});

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      } else {
        return { ...prev, [addonId]: 1 };
      }
    });
  };

  // Contact Info
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [notes, setNotes] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'paypal' | 'offline_cash'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('982');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Price calculations
  const baseSlotPrice = activeLock.price;
  const addonsTotal = AVAILABLE_ADDONS.reduce((sum, item) => {
    const qty = selectedAddons[item.id] || 0;
    return sum + item.price * qty;
  }, 0);

  const subtotal = baseSlotPrice + addonsTotal;
  const tax = Math.round(subtotal * 0.2); // 20% VAT
  const total = subtotal + tax;

  const handleCompleteBooking = () => {
    if (timeLeftMs <= 0) {
      alert('Your slot hold expired. Please re-select the slot.');
      onClose();
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const referenceNumber = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
      const addonsSummary = AVAILABLE_ADDONS.filter(
        (a) => (selectedAddons[a.id] || 0) > 0
      ).map((a) => ({
        name: a.name,
        price: a.price,
        qty: selectedAddons[a.id],
      }));

      const newBooking: Booking = {
        id: `bk_${Date.now()}`,
        referenceNumber,
        pitchId: pitch.id,
        pitchName: pitch.name,
        venueName: pitch.venueName,
        userId: currentUser.id,
        userName: name,
        userEmail: email,
        userPhone: phone,
        date: activeLock.date,
        startTime: activeLock.startTime,
        endTime: activeLock.endTime,
        durationMinutes: pitch.slotDurationMinutes,
        basePrice: baseSlotPrice,
        addonsPrice: addonsTotal,
        addons: addonsSummary,
        subtotal,
        tax,
        totalPrice: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'offline_cash' ? 'pending' : 'paid',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        qrCodeToken: `PM-TICKET-${pitch.id.toUpperCase()}-${referenceNumber}-${activeLock.date.replace(/-/g, '')}-${activeLock.startTime.replace(':', '')}`,
        notes,
      };

      setIsProcessing(false);
      onBookingSuccess(newBooking);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Slot Hold Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 font-black" />
            <span className="text-xs font-black uppercase tracking-wider">
              Slot Exclusively Reserved
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-black bg-black/20 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} remaining
            </span>
          </div>
        </div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Review & Complete Pitch Reservation</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant booking confirmation with ground turnstile QR code
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Reservation Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={pitch.imageUrl}
                alt={pitch.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  {pitch.venueName}
                </span>
                <h3 className="text-base font-bold text-white">{pitch.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-300">{activeLock.date}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeLock.startTime} - {activeLock.endTime}
                  </span>
                  <span>•</span>
                  <span>{pitch.size} ({pitch.surface})</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-xs text-slate-400">Pitch Base Hire</span>
              <p className="text-xl font-black text-white">£{baseSlotPrice}</p>
            </div>
          </div>

          {/* Add-ons Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Optional Training & Matchday Add-ons
              </h4>
              <span className="text-[11px] text-slate-500">Pick any extra match gear</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_ADDONS.map((addon) => {
                const isSelected = (selectedAddons[addon.id] || 0) > 0;
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{addon.name}</span>
                        <span className="text-xs font-extrabold text-emerald-400">
                          +£{addon.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {addon.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booker Information Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Team Captain / Booker Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email for QR Ticket</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="alex@team.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mobile Phone (SMS Gate PIN)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+44 7911 123456"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Special Session Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Academy U16 tactical prep"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Payment Gateway
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold">Credit Card / Stripe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base font-bold"> Pay</span>
                <span className="text-xs font-semibold">Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-base font-extrabold text-sky-400">PayPal</span>
                <span className="text-xs font-semibold">PayPal Express</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('offline_cash')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'offline_cash'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold">Pay at Venue</span>
              </button>
            </div>

            {/* Simulated Card Input Fields */}
            {paymentMethod === 'card' && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Card Details (Mock Sandbox)</span>
                  <div className="flex gap-2">
                    <span className="font-mono text-emerald-400">Visa / Mastercard 256-bit SSL</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs font-mono text-white"
                      placeholder="Card number"
                    />
                  </div>
                  <div className="flex gap-2 col-span-3 sm:col-span-1">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs font-mono text-center text-white"
                      placeholder="MM/YY"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs font-mono text-center text-white"
                      placeholder="CVC"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Pitch Hire ({pitch.slotDurationMinutes} mins)</span>
              <span>£{baseSlotPrice.toFixed(2)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Selected Add-ons</span>
                <span>£{addonsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>VAT (20%)</span>
              <span>£{tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline text-sm">
              <span className="font-bold text-white text-base">Total Payable</span>
              <span className="text-xl font-black text-emerald-400">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancellation Policy reminder */}
          <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Cancellation Guarantee:</strong> Free 100% refund
              if cancelled at least 24 hours prior to slot kick-off. Cancellations under 24 hours
              receive 80% pitch credit.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 transition-colors"
          >
            Cancel & Release Lock
          </button>

          <button
            onClick={handleCompleteBooking}
            disabled={isProcessing || timeLeftMs <= 0}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Securing Slot & Processing...</span>
              </>
            ) : (
              <>
                <span>Pay £{total.toFixed(2)} & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
