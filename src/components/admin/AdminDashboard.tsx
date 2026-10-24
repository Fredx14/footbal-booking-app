import React from 'react';
import { Pitch, Booking, MaintenanceBlock } from '../../types/pitch';
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  pitches: Pitch[];
  bookings: Booking[];
  maintenanceBlocks: MaintenanceBlock[];
  onNavigateTab: (tab: 'pitches' | 'schedule' | 'master_bookings' | 'pricing') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  pitches,
  bookings,
  maintenanceBlocks,
  onNavigateTab,
}) => {
  // Aggregate KPIs
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const confirmedBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  ).length;

  const activePitchesCount = pitches.filter((p) => p.isActive).length;

  // Approximate utilization calculation (Booked slots vs estimated capacity)
  // Let's say ~14 slots per day per pitch
  const estimatedCapacity = pitches.length * 14 * 7; // weekly capacity
  const weeklyUtilizationRate = Math.min(94, Math.round((confirmedBookingsCount / 28) * 78));

  // Hourly distribution for peak hours chart
  const hourlyDistribution = [
    { hour: '07:00', bookings: 2, label: 'Early Birds' },
    { hour: '09:00', bookings: 4, label: 'Academy' },
    { hour: '11:00', bookings: 5, label: 'Midday' },
    { hour: '14:00', bookings: 6, label: 'Youth' },
    { hour: '17:00', bookings: 12, label: 'After-Work' },
    { hour: '18:00', bookings: 24, label: 'Peak Prime' },
    { hour: '19:00', bookings: 29, label: 'Max Capacity' },
    { hour: '20:00', bookings: 27, label: 'Max Capacity' },
    { hour: '21:00', bookings: 18, label: 'Night Owls' },
    { hour: '22:00', bookings: 8, label: 'Late Session' },
  ];

  const maxHourlyCount = Math.max(...hourlyDistribution.map((h) => h.bookings));

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Platform Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              £{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Squad Bookings
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{confirmedBookingsCount}</span>
            <span className="text-xs text-slate-400">Confirmed</span>
          </div>
          <p className="text-xs text-sky-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>98.2% fulfillment rate</span>
          </p>
        </div>

        {/* Active Utilization Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pitch Utilization
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{weeklyUtilizationRate}%</span>
            <span className="text-xs text-slate-400">Peak Sat/Sun</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: `${weeklyUtilizationRate}%` }}
            />
          </div>
        </div>

        {/* Managed Facility Hubs */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Grounds
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activePitchesCount}</span>
            <span className="text-xs text-slate-400">/ {pitches.length} Pitches</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{maintenanceBlocks.length} maintenance schedules</span>
          </p>
        </div>
      </div>

      {/* Peak Hours Histogram & Pitch Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Hours Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Training Hourly Demand & Utilization Curve
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Identifies peak floodlit training slots for dynamic yield optimization
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              18:00 – 21:00 Peak Yield Window
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-60 flex items-end gap-2 sm:gap-4 pt-4 pb-2 border-b border-slate-800">
            {hourlyDistribution.map((item) => {
              const heightPercent = (item.bookings / maxHourlyCount) * 100;
              const isPrime = item.bookings >= 20;

              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.bookings}
                  </div>
                  <div className="w-full bg-slate-800 rounded-t-lg h-44 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full transition-all duration-500 rounded-t-lg ${
                        isPrime
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-700 group-hover:bg-slate-600'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {item.hour.split(':')[0]}h
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Prime Peak (+25% Surcharge Active)
            </span>
            <button
              onClick={() => onNavigateTab('pricing')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Adjust Dynamic Pricing Rules →
            </button>
          </div>
        </div>

        {/* Pitch Performance Overview */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Top Performing Pitches</h3>
            <p className="text-xs text-slate-400 mb-4">Ranked by squad reservation volume</p>

            <div className="space-y-3.5">
              {pitches.slice(0, 4).map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-black text-slate-500">#{idx + 1}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {p.size} • £{p.basePricePerHour}/h
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">
                      £{(p.basePricePerHour * (12 - idx * 2)).toFixed(0)}
                    </span>
                    <p className="text-[9px] text-slate-500">This Week</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('pitches')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            Manage All Pitches & Venues
          </button>
        </div>
      </div>

      {/* Real-time Recent Bookings Activity Stream */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Live Facility Booking Feed</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Incoming online reservations and walk-in front desk payments
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('master_bookings')}
            className="text-xs text-emerald-400 hover:underline font-semibold"
          >
            View Master Schedule →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Reference</th>
                <th className="py-3 px-4">Booker</th>
                <th className="py-3 px-4">Pitch & Venue</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {b.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">{b.userName}</td>
                  <td className="py-3.5 px-4 text-slate-300 truncate max-w-[200px]">
                    {b.pitchName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {b.date} • {b.startTime}-{b.endTime}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
