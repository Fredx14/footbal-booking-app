import React, { useState } from 'react';
import { MaintenanceBlock, Pitch } from '../../types/pitch';
import { Plus, Trash2, AlertTriangle, Calendar, Clock, Wrench, Shield } from 'lucide-react';

interface MaintenanceSchedulerProps {
  pitches: Pitch[];
  maintenanceBlocks: MaintenanceBlock[];
  onAddMaintenance: (block: MaintenanceBlock) => void;
  onDeleteMaintenance: (blockId: string) => void;
}

export const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({
  pitches,
  maintenanceBlocks,
  onAddMaintenance,
  onDeleteMaintenance,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [pitchId, setPitchId] = useState(pitches[0]?.id || '');
  const [title, setTitle] = useState('Turf Infill Brushing & Decompaction');
  const [reason, setReason] = useState<MaintenanceBlock['reason']>('turf_resurfacing');
  const [startDate, setStartDate] = useState('2026-10-27');
  const [endDate, setEndDate] = useState('2026-10-27');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock: MaintenanceBlock = {
      id: `maint_${Date.now()}`,
      pitchId,
      title,
      reason,
      startDate,
      endDate,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    };
    onAddMaintenance(newBlock);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Turf Maintenance & Facility Blockouts</h2>
          <p className="text-xs text-slate-400 mt-1">
            Reserve downtime for grass seeding, floodlight repairs, or private academy tournaments to block online customer bookings.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule Blockout Window</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maintenanceBlocks.map((block) => {
          const pitch = pitches.find((p) => p.id === block.pitchId);

          return (
            <div
              key={block.id}
              className="p-5 rounded-2xl border border-amber-900/40 bg-slate-900/90 shadow-lg relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  <span>{block.reason.replace('_', ' ')}</span>
                </span>
                <button
                  onClick={() => onDeleteMaintenance(block.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove blockout and reopen slots"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white mt-3">{block.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pitch?.name || 'All Pitches'}</p>

              <div className="my-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {block.startDate} {block.startDate !== block.endDate ? `to ${block.endDate}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {block.startTime} – {block.endTime}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-amber-400/80 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                Slots during this window are hidden from customer booking calendar.
              </p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Block Out Pitch For Maintenance</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Target Pitch</label>
                <select
                  value={pitchId}
                  onChange={(e) => setPitchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                >
                  {pitches.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Title / Maintenance Subject</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  placeholder="e.g. Grass aeration and overseeding"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason Category</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                >
                  <option value="turf_resurfacing">Turf Resurfacing / Brushing</option>
                  <option value="floodlight_repair">Floodlight Electrical Repair</option>
                  <option value="private_academy_event">Private Academy / Closed Club Event</option>
                  <option value="weather_closure">Severe Weather Closure</option>
                  <option value="general_cleaning">Deep Sanitization & Goal Net Replacement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Apply Blockout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
