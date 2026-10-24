import React, { useState } from 'react';
import { Pitch } from '../../types/pitch';
import { MapPin, Navigation, Star, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PitchMapViewProps {
  pitches: Pitch[];
  selectedPitchId: string | null;
  onSelectPitch: (pitch: Pitch) => void;
  onViewDetails: (pitch: Pitch) => void;
}

export const PitchMapView: React.FC<PitchMapViewProps> = ({
  pitches,
  selectedPitchId,
  onSelectPitch,
  onViewDetails,
}) => {
  const [hoveredPitch, setHoveredPitch] = useState<Pitch | null>(null);

  // Map coordinates normalized inside our visual canvas
  // London bounding box approx: lat 51.48 to 51.58, lng -0.32 to +0.05
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = 51.48;
    const maxLat = 51.58;
    const minLng = -0.32;
    const maxLng = 0.05;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const activePitch = hoveredPitch || pitches.find((p) => p.id === selectedPitchId) || pitches[0];

  return (
    <div className="relative w-full h-[600px] bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Pitch Tactical Grid Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Stylized River Thames SVG Path overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none">
        <path
          d="M 0,380 Q 200,360 380,410 T 650,370 T 950,440 T 1300,390"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 0,380 Q 200,360 380,410 T 650,370 T 950,440 T 1300,390"
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Live London Training Pitch Radar
        </span>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
          {pitches.length} Available
        </span>
      </div>

      {/* Pitch Location Pins */}
      {pitches.map((pitch) => {
        const pos = getMapPosition(pitch.coordinates.lat, pitch.coordinates.lng);
        const isSelected = selectedPitchId === pitch.id;
        const isHovered = hoveredPitch?.id === pitch.id;

        return (
          <div
            key={pitch.id}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredPitch(pitch)}
            onMouseLeave={() => setHoveredPitch(null)}
            onClick={() => {
              onSelectPitch(pitch);
            }}
          >
            {/* Pulse Wave on Selected/Hovered */}
            {(isSelected || isHovered) && (
              <span className="absolute -inset-3 rounded-full bg-emerald-400/30 animate-ping" />
            )}

            {/* Marker Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-xl transition-all border ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-110 shadow-emerald-500/30'
                  : isHovered
                  ? 'bg-emerald-600 text-white border-emerald-400 scale-105'
                  : 'bg-slate-900/90 text-emerald-400 border-slate-700 hover:border-emerald-500/60'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              <span>£{pitch.basePricePerHour}/h</span>
              <span className="text-[10px] px-1 rounded bg-black/25">
                {pitch.size.replace('-side', '')}
              </span>
            </div>
          </div>
        );
      })}

      {/* Floating Pitch Preview Flyout Card */}
      {activePitch && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-20 bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl transition-all">
          <div className="flex gap-3.5">
            <img
              src={activePitch.imageUrl}
              alt={activePitch.name}
              className="w-24 h-24 object-cover rounded-xl border border-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activePitch.surface}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{activePitch.rating}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white truncate">{activePitch.name}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                {activePitch.location}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-base font-extrabold text-white">
                    £{activePitch.basePricePerHour}
                  </span>
                  <span className="text-[11px] text-slate-400"> / hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetails(activePitch)}
                    className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
                  >
                    Info
                  </button>
                  <button
                    onClick={() => onSelectPitch(activePitch)}
                    className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <span>View Slots</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Tactical Mini Legend */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> 11-a-side
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" /> 7-a-side
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> 5-a-side
        </span>
      </div>
    </div>
  );
};
