import React, { useState } from 'react';
import { Pitch } from '../../types/pitch';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Share2,
} from 'lucide-react';

interface PitchDetailModalProps {
  pitch: Pitch | null;
  onClose: () => void;
  onBookNow: (pitch: Pitch) => void;
}

export const PitchDetailModal: React.FC<PitchDetailModalProps> = ({
  pitch,
  onClose,
  onBookNow,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!pitch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Gallery */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-950">
          <img
            src={pitch.gallery[selectedPhotoIndex] || pitch.imageUrl}
            alt={pitch.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Thumbnail Strip */}
          {pitch.gallery.length > 1 && (
            <div className="absolute bottom-4 left-6 flex gap-2 z-10">
              {pitch.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhotoIndex === idx
                      ? 'border-emerald-400 scale-105 shadow-lg'
                      : 'border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Badges on hero */}
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-lg">
              {pitch.size}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              {pitch.surface}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title & Pricing */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {pitch.venueName}
                </span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{pitch.rating}</span>
                  <span className="text-slate-500">({pitch.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {pitch.name}
              </h2>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                {pitch.address}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex sm:flex-col justify-between items-center sm:items-end min-w-[170px]">
              <span className="text-xs text-slate-400 font-medium">Standard Off-Peak</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white">£{pitch.basePricePerHour}</span>
                <span className="text-xs text-slate-400">/hr</span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono mt-1">
                Peak: £{pitch.peakHourPrice}/hr
              </span>
            </div>
          </div>

          {/* Quick Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Dimensions</span>
              </div>
              <p className="text-sm font-semibold text-white">{pitch.dimensions}</p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Surface Cert</span>
              </div>
              <p className="text-sm font-semibold text-white">{pitch.surface}</p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Operating Hours</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {pitch.operatingHours.open} - {pitch.operatingHours.close}
              </p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Slot Duration</span>
              </div>
              <p className="text-sm font-semibold text-white">{pitch.slotDurationMinutes} mins</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
              Pitch Overview
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{pitch.description}</p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
              Included Amenities & Facility Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {pitch.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Footwear Guidelines */}
          <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Venue Ground Rules & Footwear Guidelines
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {pitch.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modal Footer / Action CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Back to Pitches
            </button>
            <button
              onClick={() => {
                onClose();
                onBookNow(pitch);
              }}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Select Date & Book Slots</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
