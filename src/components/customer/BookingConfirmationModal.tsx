import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Booking } from '../../types/pitch';
import { QrCode } from '../common/QrCode';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Mail,
  Phone,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';

interface BookingConfirmationModalProps {
  booking: Booking;
  onClose: () => void;
  onGoToMyBookings: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
  onGoToMyBookings,
}) => {
  useEffect(() => {
    // Fire celebratory confetti on confirmation
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#38bdf8', '#fbbf24'],
      });
    } catch (e) {
      // Ignore if canvas not supported
    }
  }, []);

  const handleDownloadIcs = () => {
    const calendarContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PitchMaster//Pitch Booking//EN
BEGIN:VEVENT
SUMMARY:Football Training at ${booking.pitchName}
DESCRIPTION:Pitch booking ref ${booking.referenceNumber}. Turnstile QR code active.
LOCATION:${booking.venueName}
DTSTART:${booking.date.replace(/-/g, '')}T${booking.startTime.replace(':', '')}00Z
DTEND:${booking.date.replace(/-/g, '')}T${booking.endTime.replace(':', '')}00Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([calendarContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pitch-booking-${booking.referenceNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Confirmed Banner */}
        <div className="bg-emerald-500 text-slate-950 p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/20 text-slate-950 hover:bg-slate-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center mb-2 shadow-lg">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-950">
            Booking Confirmed & Guaranteed
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">Your Pitch Is Ready!</h2>
          <p className="text-xs font-medium text-emerald-950/80 mt-1">
            Reference ID: <span className="font-mono font-bold">{booking.referenceNumber}</span>
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6">
          {/* Turnstile QR Code Ticket Pass */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
              <QrCode value={booking.qrCodeToken} size={130} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Smart Gate Turnstile Pass</span>
              </div>
              <h3 className="text-sm font-bold text-white">{booking.pitchName}</h3>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {booking.venueName}
              </p>
              <div className="pt-1 font-mono text-xs text-emerald-400 font-semibold">
                PIN: {booking.referenceNumber.replace('BK-', '#')}
              </div>
            </div>
          </div>

          {/* Details Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Match Date</span>
              </div>
              <p className="font-bold text-white text-sm">{booking.date}</p>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Slot</span>
              </div>
              <p className="font-bold text-white text-sm">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Booker</span>
              </div>
              <p className="font-medium text-white truncate">{booking.userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{booking.userEmail}</p>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <span>Amount Paid</span>
              </div>
              <p className="font-black text-emerald-400 text-sm">
                £{booking.totalPrice.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase">
                {booking.paymentMethod.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* SMS & Email preview toast */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <p className="text-[11px] leading-relaxed">
              Instant notification sent to <strong className="text-white">{booking.userPhone}</strong>{' '}
              and <strong className="text-white">{booking.userEmail}</strong> with turnstile access barcode.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadIcs}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Add to Calendar (.ics)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onGoToMyBookings();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>View in My Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
