import React, { useState, useMemo } from 'react';
import { Pitch, PitchSize, SurfaceType, Amenity } from '../../types/pitch';
import { PitchMapView } from './PitchMapView';
import {
  Search,
  Filter,
  Map,
  List,
  Star,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  Layers,
} from 'lucide-react';

interface PitchDiscoveryProps {
  pitches: Pitch[];
  onSelectPitchForBooking: (pitch: Pitch) => void;
  onOpenPitchDetails: (pitch: Pitch) => void;
}

export const PitchDiscovery: React.FC<PitchDiscoveryProps> = ({
  pitches,
  onSelectPitchForBooking,
  onOpenPitchDetails,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedSurface, setSelectedSurface] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const allAmenities: Amenity[] = [
    'Floodlights',
    'Changing Rooms',
    'Hot Showers',
    'Free Parking',
    'Bibs & Balls',
    'Referee Available',
    'Spectator Bleachers',
    'Café & Sports Bar',
    'Smart Gate QR Access',
  ];

  const toggleAmenity = (amenity: Amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Filtered pitches
  const filteredPitches = useMemo(() => {
    return pitches.filter((pitch) => {
      // Query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = pitch.name.toLowerCase().includes(q);
        const matchesVenue = pitch.venueName.toLowerCase().includes(q);
        const matchesLocation = pitch.location.toLowerCase().includes(q);
        const matchesCity = pitch.city.toLowerCase().includes(q);
        if (!matchesName && !matchesVenue && !matchesLocation && !matchesCity) {
          return false;
        }
      }

      // Size filter
      if (selectedSize !== 'all' && pitch.size !== selectedSize) {
        return false;
      }

      // Surface filter
      if (selectedSurface !== 'all' && pitch.surface !== selectedSurface) {
        return false;
      }

      // Price filter
      if (pitch.basePricePerHour > maxPrice) {
        return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllSelected = selectedAmenities.every((a) => pitch.amenities.includes(a));
        if (!hasAllSelected) return false;
      }

      return true;
    });
  }, [pitches, searchQuery, selectedSize, selectedSurface, maxPrice, selectedAmenities]);

  const activeFiltersCount =
    (selectedSize !== 'all' ? 1 : 0) +
    (selectedSurface !== 'all' ? 1 : 0) +
    (maxPrice < 200 ? 1 : 0) +
    selectedAmenities.length;

  const resetFilters = () => {
    setSelectedSize('all');
    setSelectedSurface('all');
    setMaxPrice(200);
    setSelectedAmenities([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Search & Controls Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FIFA & FA Certified Training Grounds</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Find & Book London's Best Football Pitches
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Reserve floodlit 4G astro, championship natural grass, and fast-paced 5-a-side cages with real-time slot locking and instant QR turnstile passes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800/80">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue name, Wembley, Shoreditch, postcode..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl py-3 px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Any Pitch Size</option>
              <option value="5-a-side">5-a-side (Cages & Futsal)</option>
              <option value="7-a-side">7-a-side (Training Hubs)</option>
              <option value="11-a-side">11-a-side (Full Squad Pro)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-sm font-semibold transition-all ${
                activeFiltersCount > 0
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-700/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tactical Map View"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable / Popover Filter Drawer */}
      {showFiltersModal && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Detailed Pitch & Ground Filters</span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Surface Type */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Turf & Surface Type
              </label>
              <select
                value={selectedSurface}
                onChange={(e) => setSelectedSurface(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
              >
                <option value="all">All Surfaces</option>
                <option value="4G Artificial Turf">4G Artificial Turf (Rubber Infill)</option>
                <option value="3G Rubber Infill">3G Rubber Infill (Cage)</option>
                <option value="Natural Grass">Natural Grass (Rye Blend)</option>
                <option value="Indoor Hardwood">Indoor Hardwood (Futsal)</option>
                <option value="Hybrid Carpet Turf">Hybrid Carpet Turf</option>
              </select>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Max Hourly Rate
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Up to £{maxPrice}/hr
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={200}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>£50/h</span>
                <span>£120/h</span>
                <span>£200/h</span>
              </div>
            </div>

            {/* Amenities Chips */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Facility Amenities & Gear
              </label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <PitchMapView
          pitches={filteredPitches}
          selectedPitchId={null}
          onSelectPitch={(p) => onSelectPitchForBooking(p)}
          onViewDetails={(p) => onOpenPitchDetails(p)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredPitches.length}</strong> available pitches
            </span>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="text-emerald-400 hover:underline">
                Clear all filters
              </button>
            )}
          </div>

          {filteredPitches.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No pitches match your current filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Try widening your price range, choosing another pitch size, or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPitches.map((pitch) => (
                <div
                  key={pitch.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                >
                  {/* Pitch Image & Badges */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={pitch.imageUrl}
                      alt={pitch.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                        {pitch.size}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{pitch.rating}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 text-xs font-semibold text-emerald-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
                      {pitch.surface}
                    </div>
                  </div>

                  {/* Pitch Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        {pitch.venueName}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mt-0.5 line-clamp-1">
                        {pitch.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {pitch.location}
                      </p>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {pitch.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {amenity}
                          </span>
                        ))}
                        {pitch.amenities.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-500 border border-slate-800">
                            +{pitch.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Booking CTA */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-white">
                            £{pitch.basePricePerHour}
                          </span>
                          <span className="text-[11px] text-slate-400">/hr</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">
                          Peak: £{pitch.peakHourPrice}/hr
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenPitchDetails(pitch)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          Specs
                        </button>
                        <button
                          onClick={() => onSelectPitchForBooking(pitch)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <span>Book Slot</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
