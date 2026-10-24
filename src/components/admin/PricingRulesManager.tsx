import React, { useState } from 'react';
import { PricingRule, Pitch } from '../../types/pitch';
import { Plus, Trash2, Zap, Calendar, Clock, DollarSign, Power, Check } from 'lucide-react';

interface PricingRulesManagerProps {
  pitches: Pitch[];
  pricingRules: PricingRule[];
  onAddRule: (rule: PricingRule) => void;
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
}

export const PricingRulesManager: React.FC<PricingRulesManagerProps> = ({
  pitches,
  pricingRules,
  onAddRule,
  onToggleRule,
  onDeleteRule,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('Friday Night Lights Surge');
  const [pitchId, setPitchId] = useState('all');
  const [type, setType] = useState<PricingRule['type']>('peak_hours');
  const [timeStart, setTimeStart] = useState('18:00');
  const [timeEnd, setTimeEnd] = useState('22:00');
  const [modifierType, setModifierType] = useState<PricingRule['priceModifierType']>('percentage_increase');
  const [value, setValue] = useState(25);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (d: number) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: PricingRule = {
      id: `rule_${Date.now()}`,
      name,
      pitchId,
      type,
      timeStart,
      timeEnd,
      daysOfWeek: selectedDays,
      priceModifierType: modifierType,
      value: Number(value),
      isActive: true,
    };
    onAddRule(newRule);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Dynamic Pricing & Rate Modifiers</h2>
          <p className="text-xs text-slate-400 mt-1">
            Maximize ground revenue by automating peak hour surcharges, weekend multipliers, and academy discounts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Pricing Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricingRules.map((rule) => {
          const targetPitch =
            rule.pitchId === 'all'
              ? 'All Facility Pitches'
              : pitches.find((p) => p.id === rule.pitchId)?.name || 'Custom Pitch';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                rule.isActive
                  ? 'bg-slate-900 border-slate-800 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {rule.type.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      rule.isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                    title={rule.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mt-3">{rule.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{targetPitch}</p>

              <div className="my-3 space-y-1.5 text-xs">
                {rule.timeStart && (
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {rule.timeStart} – {rule.timeEnd}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Days: {rule.daysOfWeek.map((d) => daysLabels[d]).join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Price Adjustment</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {rule.priceModifierType === 'percentage_discount' ? '-' : '+'}
                  {rule.value}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Custom Pricing Rule</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Description Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Apply To Pitch</label>
                <select
                  value={pitchId}
                  onChange={(e) => setPitchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                >
                  <option value="all">All Pitches (Global Rule)</option>
                  {pitches.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Active Days</label>
                <div className="flex gap-1.5">
                  {daysLabels.map((lbl, idx) => {
                    const active = selectedDays.includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleDay(idx)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Modifier Type</label>
                  <select
                    value={modifierType}
                    onChange={(e) => setModifierType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white"
                  >
                    <option value="percentage_increase">+% Increase (Peak)</option>
                    <option value="percentage_discount">-% Discount (Off-peak)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
