import React, { useState } from 'react';
import { Pitch, PitchSize, SurfaceType, Amenity } from '../../types/pitch';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  Check,
  Power,
} from 'lucide-react';

interface PitchManagementProps {
  pitches: Pitch[];
  onAddPitch: (pitch: Pitch) => void;
  onUpdatePitch: (pitch: Pitch) => void;
  onDeletePitch: (pitchId: string) => void;
}

export const PitchManagement: React.FC<PitchManagementProps> = ({
  pitches,
  onAddPitch,
  onUpdatePitch,
  onDeletePitch,
}) => {
  const [search, setSearch] = useState('');
  const [editingPitch, setEditingPitch] = useState<Pitch | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formVenue, setFormVenue] = useState('London Olympic Complex');
  const [formAddress, setFormAddress] = useState('10 Olympic Way, London');
  const [formLocation, setFormLocation] = useState('Stratford, London');
  const [formSize, setFormSize] = useState<PitchSize>('7-a-side');
  const [formSurface, setFormSurface] = useState<SurfaceType>('4G Artificial Turf');
  const [formDimensions, setFormDimensions] = useState('60m × 40m');
  const [formBasePrice, setFormBasePrice] = useState(85);
  const [formPeakPrice, setFormPeakPrice] = useState(110);
  const [formWeekendPrice, setFormWeekendPrice] = useState(120);
  const [formSlotDuration, setFormSlotDuration] = useState(60);
  const [formOpenTime, setFormOpenTime] = useState('07:00');
  const [formCloseTime, setFormCloseTime] = useState('23:00');
  const [formDescription, setFormDescription] = useState('State-of-the-art training pitch with latest shockpad system.');
  const [formImageUrl, setFormImageUrl] = useState(
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
  );
  const [formAmenities, setFormAmenities] = useState<Amenity[]>([
    'Floodlights',
    'Changing Rooms',
    'Free Parking',
    'Bibs & Balls',
  ]);

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
    'Water Refill Station',
  ];

  const handleOpenEdit = (p: Pitch) => {
    setEditingPitch(p);
    setFormName(p.name);
    setFormVenue(p.venueName);
    setFormAddress(p.address);
    setFormLocation(p.location);
    setFormSize(p.size);
    setFormSurface(p.surface);
    setFormDimensions(p.dimensions);
    setFormBasePrice(p.basePricePerHour);
    setFormPeakPrice(p.peakHourPrice);
    setFormWeekendPrice(p.weekendPrice);
    setFormSlotDuration(p.slotDurationMinutes);
    setFormOpenTime(p.operatingHours.open);
    setFormCloseTime(p.operatingHours.close);
    setFormDescription(p.description);
    setFormImageUrl(p.imageUrl);
    setFormAmenities(p.amenities);
    setIsCreatingNew(false);
  };

  const handleOpenCreate = () => {
    setEditingPitch(null);
    setFormName('');
    setFormVenue('Wembley Sports Park');
    setFormAddress('20 South Way, London HA9 0HB');
    setFormLocation('Wembley, London');
    setFormSize('7-a-side');
    setFormSurface('4G Artificial Turf');
    setFormDimensions('60m × 40m');
    setFormBasePrice(85);
    setFormPeakPrice(115);
    setFormWeekendPrice(125);
    setFormSlotDuration(60);
    setFormOpenTime('07:00');
    setFormCloseTime('23:00');
    setFormDescription('High performance 4G shockpad surface with tournament goals.');
    setFormImageUrl(
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80'
    );
    setFormAmenities(['Floodlights', 'Changing Rooms', 'Free Parking', 'Bibs & Balls']);
    setIsCreatingNew(true);
  };

  const handleSavePitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      const newPitch: Pitch = {
        id: `pitch_${Date.now()}`,
        name: formName || 'New Community Pitch',
        venueName: formVenue,
        location: formLocation,
        address: formAddress,
        city: 'London',
        coordinates: { lat: 51.52 + (Math.random() - 0.5) * 0.05, lng: -0.12 + (Math.random() - 0.5) * 0.05 },
        size: formSize,
        surface: formSurface,
        dimensions: formDimensions,
        basePricePerHour: Number(formBasePrice),
        peakHourPrice: Number(formPeakPrice),
        weekendPrice: Number(formWeekendPrice),
        rating: 5.0,
        reviewCount: 1,
        imageUrl: formImageUrl,
        gallery: [formImageUrl],
        amenities: formAmenities,
        description: formDescription,
        rules: [
          'Moulded studs and turf blades only.',
          'No glass bottles or food on pitch.',
          'Vacate 3 minutes before slot completion.',
        ],
        operatingHours: { open: formOpenTime, close: formCloseTime },
        slotDurationMinutes: Number(formSlotDuration),
        isActive: true,
      };
      onAddPitch(newPitch);
    } else if (editingPitch) {
      const updated: Pitch = {
        ...editingPitch,
        name: formName,
        venueName: formVenue,
        location: formLocation,
        address: formAddress,
        size: formSize,
        surface: formSurface,
        dimensions: formDimensions,
        basePricePerHour: Number(formBasePrice),
        peakHourPrice: Number(formPeakPrice),
        weekendPrice: Number(formWeekendPrice),
        slotDurationMinutes: Number(formSlotDuration),
        operatingHours: { open: formOpenTime, close: formCloseTime },
        description: formDescription,
        imageUrl: formImageUrl,
        amenities: formAmenities,
      };
      onUpdatePitch(updated);
    }

    setEditingPitch(null);
    setIsCreatingNew(false);
  };

  const toggleAmenity = (a: Amenity) => {
    setFormAmenities((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const toggleActiveStatus = (p: Pitch) => {
    onUpdatePitch({
      ...p,
      isActive: !p.isActive,
    });
  };

  const filtered = pitches.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.venueName.toLowerCase().includes(search.toLowerCase()) ||
      p.size.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header bar with Add Pitch CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Pitch & Facility Inventory Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure turf surfaces, dimensions, hourly rates, operating hours, and active statuses.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Pitch</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter pitches by name, venue or size..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Pitches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pitch Name</th>
                <th className="py-3 px-4">Size & Surface</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Standard Rate</th>
                <th className="py-3 px-4">Peak Rate</th>
                <th className="py-3 px-4">Operating Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((pitch) => (
                <tr key={pitch.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pitch.imageUrl}
                        alt={pitch.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{pitch.name}</span>
                        <span className="text-[10px] text-slate-400">{pitch.venueName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 font-semibold text-emerald-400 border border-slate-800">
                      {pitch.size}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{pitch.surface}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{pitch.dimensions}</td>
                  <td className="py-3.5 px-4 font-bold text-white">£{pitch.basePricePerHour}/h</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">£{pitch.peakHourPrice}/h</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {pitch.operatingHours.open} - {pitch.operatingHours.close}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleActiveStatus(pitch)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        pitch.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{pitch.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pitch)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Pitch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${pitch.name}?`)) {
                            onDeletePitch(pitch.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 transition-colors"
                        title="Delete Pitch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Pitch Modal */}
      {(isCreatingNew || editingPitch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {isCreatingNew ? 'Create New Football Pitch' : `Edit ${editingPitch?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingPitch(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePitch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Pitch Display Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                    placeholder="e.g. Stamford Field 3G Cage"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Venue Name</label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Location / Borough</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Full Street Address</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Pitch Size</label>
                  <select
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value as PitchSize)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  >
                    <option value="5-a-side">5-a-side</option>
                    <option value="7-a-side">7-a-side</option>
                    <option value="9-a-side">9-a-side</option>
                    <option value="11-a-side">11-a-side</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Surface Type</label>
                  <select
                    value={formSurface}
                    onChange={(e) => setFormSurface(e.target.value as SurfaceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  >
                    <option value="4G Artificial Turf">4G Artificial Turf</option>
                    <option value="3G Rubber Infill">3G Rubber Infill</option>
                    <option value="Natural Grass">Natural Grass</option>
                    <option value="Indoor Hardwood">Indoor Hardwood</option>
                    <option value="Hybrid Carpet Turf">Hybrid Carpet Turf</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                    placeholder="e.g. 100m × 64m"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Slot Duration</label>
                  <select
                    value={formSlotDuration}
                    onChange={(e) => setFormSlotDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  >
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Standard Hourly Rate (£)</label>
                  <input
                    type="number"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Peak Hourly Rate (£)</label>
                  <input
                    type="number"
                    value={formPeakPrice}
                    onChange={(e) => setFormPeakPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Weekend Hourly Rate (£)</label>
                  <input
                    type="number"
                    value={formWeekendPrice}
                    onChange={(e) => setFormWeekendPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-slate-400 block mb-1">Opening Time</label>
                    <input
                      type="text"
                      value={formOpenTime}
                      onChange={(e) => setFormOpenTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-slate-400 block mb-1">Closing Time</label>
                    <input
                      type="text"
                      value={formCloseTime}
                      onChange={(e) => setFormCloseTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Available Amenities</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allAmenities.map((amenity) => {
                      const active = formAmenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                            active
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingPitch(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Pitch Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
