import React, { useState, useMemo } from 'react';
import { Booking, Pitch } from '../../types/pitch';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  RotateCcw,
  DollarSign,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';

interface MasterBookingsManagerProps {
  bookings: Booking[];
  pitches: Pitch[];
  onAddOfflineBooking: (booking: Booking) => void;
  onRefundBooking: (bookingId: string, refundAmount: number, reason: string) => void;
}

export const MasterBookingsManager: React.FC<MasterBookingsManagerProps> = ({
  bookings,
  pitches,
  onAddOfflineBooking,
  onRefundBooking,
}) => {
  const [search, setSearch] = useState('');
  const [pitchFilter, setPitchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [refundingBooking, setRefundingBooking] = useState<Booking | null>(null);
  const [refundReason, setRefundReason] = useState('Customer requested cancellation via phone');

  // Walk-in form state
  const [walkinPitchId, setWalkinPitchId] = useState(pitches[0]?.id || '');
  const [walkinName, setWalkinName] = useState('Coach Bradley');
  const [walkinPhone, setWalkinPhone] = useState('+44 7988 555111');
  const [walkinEmail, setWalkinEmail] = useState('bradley@localfc.org');
  const [walkinDate, setWalkinDate] = useState('2026-10-24');
  const [walkinStartTime, setWalkinStartTime] = useState('20:00');
  const [walkinEndTime, setWalkinEndTime] = useState('21:00');
  const [walkinPrice, setWalkinPrice] = useState(110);
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState<'offline_cash' | 'card'>('offline_cash');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        b.referenceNumber.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userEmail.toLowerCase().includes(q) ||
        b.pitchName.toLowerCase().includes(q);

      const matchPitch = pitchFilter === 'all' || b.pitchId === pitchFilter;
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;

      return matchQuery && matchPitch && matchStatus;
    });
  }, [bookings, search, pitchFilter, statusFilter]);

  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    const pitch = pitches.find((p) => p.id === walkinPitchId) || pitches[0];
    const ref = `BK-WALK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `bk_walk_${Date.now()}`,
      referenceNumber: ref,
      pitchId: pitch.id,
      pitchName: pitch.name,
      venueName: pitch.venueName,
      userId: 'user_walkin',
      userName: walkinName,
      userEmail: walkinEmail,
      userPhone: walkinPhone,
      date: walkinDate,
      startTime: walkinStartTime,
      endTime: walkinEndTime,
      durationMinutes: pitch.slotDurationMinutes,
      basePrice: Number(walkinPrice),
      addonsPrice: 0,
      addons: [],
      subtotal: Number(walkinPrice),
      tax: Math.round(Number(walkinPrice) * 0.2),
      totalPrice: Math.round(Number(walkinPrice) * 1.2),
      paymentMethod: walkinPaymentMethod,
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      qrCodeToken: `PM-WALKIN-${ref}-${walkinDate}`,
      notes: 'Front Desk Walk-in / Phone Reservation',
    };

    onAddOfflineBooking(newBooking);
    setShowWalkinModal(false);
  };

  const handleProcessRefund = () => {
    if (!refundingBooking) return;
    onRefundBooking(refundingBooking.id, refundingBooking.totalPrice, refundReason);
    setRefundingBooking(null);
  };

  const handleExportCSV = () => {
    const headers = 'Reference,Customer,Email,Phone,Pitch,Date,Time,Total,Payment,Status\n';
    const rows = filteredBookings
      .map(
        (b) =>
          `"${b.referenceNumber}","${b.userName}","${b.userEmail}","${b.userPhone}","${b.pitchName}","${b.date}","${b.startTime}-${b.endTime}","${b.totalPrice}","${b.paymentMethod}","${b.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pitch-master-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Master Reservations & Turnstile Log</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed across all grounds. Process refunds, log offline phone bookings, and audit ground security.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowWalkinModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Walk-in Booking</span>
          </button>
        </div>
      </div>

      {/* Filters & Search row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, customer name, email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={pitchFilter}
            onChange={(e) => setPitchFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white"
          >
            <option value="all">All Pitches</option>
            {pitches.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Customer & Contact</th>
                <th className="py-3 px-4">Target Pitch</th>
                <th className="py-3 px-4">Session Date & Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {b.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{b.userName}</span>
                    <span className="text-[10px] text-slate-400 block">{b.userPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                    {b.pitchName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="font-semibold text-slate-200 block">{b.date}</span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {b.startTime} - {b.endTime}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">£{b.totalPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-4 uppercase text-[10px] text-slate-400">
                    {b.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4">
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
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status === 'confirmed' ? (
                      <button
                        onClick={() => setRefundingBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-300 text-[11px] font-medium transition-colors border border-red-900/40"
                      >
                        Refund / Cancel
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offline Walk-in Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Walk-in / Phone Reservation</h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Pitch</label>
                <select
                  value={walkinPitchId}
                  onChange={(e) => setWalkinPitchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                >
                  {pitches.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (£{p.basePricePerHour}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Customer / Team Name</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Booking Date</label>
                  <input
                    type="date"
                    value={walkinDate}
                    onChange={(e) => setWalkinDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={walkinStartTime}
                    onChange={(e) => setWalkinStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={walkinEndTime}
                    onChange={(e) => setWalkinEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Base Fee (£)</label>
                  <input
                    type="number"
                    value={walkinPrice}
                    onChange={(e) => setWalkinPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Collection Method</label>
                  <select
                    value={walkinPaymentMethod}
                    onChange={(e) => setWalkinPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  >
                    <option value="offline_cash">Front Desk Cash / Terminal</option>
                    <option value="card">Card Reader (POS)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Create & Lock Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Processor Modal */}
      {refundingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Process Admin Refund</h3>
            </div>

            <p className="text-xs text-slate-300">
              You are about to cancel booking{' '}
              <strong className="text-white">{refundingBooking.referenceNumber}</strong> for{' '}
              <strong className="text-emerald-400">{refundingBooking.userName}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Refund Amount:</span>
                <span className="font-black text-white text-sm">
                  £{refundingBooking.totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Will be credited back to {refundingBooking.paymentMethod.replace('_', ' ')}.
              </p>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-xs">Admin Audit Reason</label>
              <textarea
                rows={2}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRefundingBooking(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30"
              >
                Process Refund & Release Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
