import React, { useState } from 'react';
import { Booking } from '../../types/pitch';
import { QrCode } from '../common/QrCode';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  QrCode as QrIcon,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';

interface MyBookingsViewProps {
  bookings: Booking[];
  currentUserId: string;
  onCancelBooking: (bookingId: string, reason: string, refundAmount: number) => void;
  onRescheduleBooking: (booking: Booking) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currentUserId,
  onCancelBooking,
  onRescheduleBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Schedule conflict with squad members');

  // Filter bookings for current user
  const userBookings = bookings.filter((b) => b.userId === currentUserId || b.userId === 'user_cust_1');

  const todayIso = '2026-10-24';

  const upcomingBookings = userBookings.filter(
    (b) => b.date >= todayIso && b.status !== 'completed'
  );
  const pastBookings = userBookings.filter(
    (b) => b.date < todayIso || b.status === 'completed'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  // Calculate refund policy for a booking
  const getRefundPolicyInfo = (booking: Booking) => {
    // Check difference in days from 2026-10-24
    const bookingDate = new Date(booking.date);
    const currentDate = new Date('2026-10-24');
    const diffHours = (bookingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      return {
        isFullRefund: true,
        refundPercent: 100,
        refundAmount: booking.totalPrice,
        message: 'Eligible for 100% full refund to original payment method (> 24 hours prior).',
      };
    } else {
      const partial = Math.round(booking.totalPrice * 0.8 * 100) / 100;
      return {
        isFullRefund: false,
        refundPercent: 80,
        refundAmount: partial,
        message: 'Late notice (< 24 hours). Eligible for 80% facility pitch credit voucher (£' + partial.toFixed(2) + ').',
      };
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    const policy = getRefundPolicyInfo(cancellingBooking);
    onCancelBooking(cancellingBooking.id, cancellationReason, policy.refundAmount);
    setCancellingBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">My Pitch Bookings & Match Passes</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your squad training sessions, access smart turnstile QR codes, or reschedule.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past History ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No {activeTab} pitch bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Explore our FIFA-accredited pitches and reserve your squad session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedBookings.map((b) => {
            const isCancelled = b.status === 'cancelled' || b.status === 'refunded';
            const policy = getRefundPolicyInfo(b);

            return (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all bg-slate-900/90 ${
                  isCancelled
                    ? 'border-red-900/40 opacity-75'
                    : 'border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                {/* Status & Reference Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {b.referenceNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Pitch Info */}
                <h3 className="text-base font-bold text-white">{b.pitchName}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {b.venueName}
                </p>

                {/* Date & Time pills */}
                <div className="flex flex-wrap items-center gap-3 my-3 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-white ml-auto">
                    £{b.totalPrice.toFixed(2)}
                  </div>
                </div>

                {/* Add-ons list if any */}
                {b.addons.length > 0 && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 mb-3">
                    <span className="font-semibold text-slate-300">Add-ons: </span>
                    {b.addons.map((a) => `${a.name} (x${a.qty})`).join(', ')}
                  </div>
                )}

                {/* Cancellation status if cancelled */}
                {isCancelled && b.refundAmount && (
                  <div className="text-[11px] text-red-300 bg-red-950/30 p-2 rounded-lg border border-red-900/40 mb-3">
                    Cancelled: £{b.refundAmount.toFixed(2)} processed to refund/credit.
                  </div>
                )}

                {/* Actions */}
                {!isCancelled && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedTicket(b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>QR Entry Pass</span>
                    </button>

                    {activeTab === 'upcoming' && (
                      <>
                        <button
                          onClick={() => onRescheduleBooking(b)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                          title="Reschedule to another time"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-medium transition-colors border border-red-900/40"
                          title="Cancel Booking"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {selectedTicket.referenceNumber}
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-white">{selectedTicket.pitchName}</h3>
            <p className="text-xs text-slate-400">
              {selectedTicket.date} • {selectedTicket.startTime} - {selectedTicket.endTime}
            </p>

            <div className="p-3 bg-white rounded-2xl inline-block shadow-lg">
              <QrCode value={selectedTicket.qrCodeToken} size={160} />
            </div>

            <p className="text-[11px] text-slate-400">
              Scan barcode at electronic pitch turnstiles. Gates unlock 15 minutes before slot time.
            </p>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Confirm Booking Cancellation</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to cancel booking for{' '}
              <strong className="text-white">{cancellingBooking.pitchName}</strong> on{' '}
              <span className="text-emerald-400">{cancellingBooking.date}</span> at{' '}
              <span className="text-emerald-400">{cancellingBooking.startTime}</span>?
            </p>

            {/* Refund calculation breakdown */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Original Booking Total:</span>
                <span>£{cancellingBooking.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Refund Policy Result:</span>
                <span className="text-emerald-400">
                  £{getRefundPolicyInfo(cancellingBooking).refundAmount.toFixed(2)} ({getRefundPolicyInfo(cancellingBooking).refundPercent}%)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                {getRefundPolicyInfo(cancellingBooking).message}
              </p>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Reason for cancellation</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
              >
                <option value="Schedule conflict with squad members">Schedule conflict with squad members</option>
                <option value="Weather / Rain forecast">Weather / Rain forecast</option>
                <option value="Player injuries in team">Player injuries in team</option>
                <option value="Booked wrong date/time by accident">Booked wrong date/time by accident</option>
                <option value="Other personal reasons">Other personal reasons</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
