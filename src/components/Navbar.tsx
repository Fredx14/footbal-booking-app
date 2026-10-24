import React from 'react';
import { UserProfile } from '../types/pitch';
import {
  Shield,
  Layers,
  Calendar,
  Lock,
  ChevronDown,
  LayoutDashboard,
  Cpu,
  Ticket,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'customer' | 'admin' | 'blueprint';
  onChangeView: (view: 'customer' | 'admin' | 'blueprint') => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  activeLock: {
    slotId: string;
    pitchId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    expiresAt: number;
  } | null;
  onOpenCheckoutFromLock: () => void;
  customerSubTab: 'discover' | 'my_bookings';
  onSetCustomerSubTab: (tab: 'discover' | 'my_bookings') => void;
  adminSubTab: 'dashboard' | 'pitches' | 'schedule' | 'master_bookings' | 'pricing';
  onSetAdminSubTab: (tab: 'dashboard' | 'pitches' | 'schedule' | 'master_bookings' | 'pricing') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  currentUser,
  availableUsers,
  onSwitchUser,
  activeLock,
  onOpenCheckoutFromLock,
  customerSubTab,
  onSetCustomerSubTab,
  adminSubTab,
  onSetAdminSubTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onChangeView('customer')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-emerald-400 font-black text-lg">⚽</span>
                </div>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  PitchMaster
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                  Football Pitch Booking Platform
                </span>
              </div>
            </div>

            {/* Mode Switcher Nav Pills */}
            <div className="hidden md:flex items-center gap-1 ml-6 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                onClick={() => onChangeView('customer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'customer'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Customer App</span>
              </button>

              <button
                onClick={() => onChangeView('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>

              <button
                onClick={() => onChangeView('blueprint')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'blueprint'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Architecture Blueprint</span>
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Active Lock Countdown Alert */}
            {activeLock && (
              <button
                onClick={onOpenCheckoutFromLock}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-pulse hover:bg-emerald-500/25 transition-colors"
                title="Slot locked for 10 minutes"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Slot Reserved ({activeLock.startTime})</span>
              </button>
            )}

            {/* Customer Sub-links if in customer view */}
            {currentView === 'customer' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetCustomerSubTab('discover')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    customerSubTab === 'discover'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pitches
                </button>
                <button
                  onClick={() => onSetCustomerSubTab('my_bookings')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    customerSubTab === 'my_bookings'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Bookings</span>
                </button>
              </div>
            )}

            {/* User Profile / Role Switcher dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono block leading-tight">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Dropdown Menu for quick role switching */}
              <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test User & RBAC Role
                  </span>
                </div>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                      currentUser.id === u.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{u.name}</p>
                      <p className="text-[10px] text-emerald-400 uppercase font-mono">
                        {u.role.replace('_', ' ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onChangeView('customer')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              currentView === 'customer' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Pitches</span>
          </button>
          <button
            onClick={() => onChangeView('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              currentView === 'admin' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => onChangeView('blueprint')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
              currentView === 'blueprint' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Blueprint</span>
          </button>
        </div>

        {/* Admin Subtabs Bar if in Admin view */}
        {currentView === 'admin' && (
          <div className="flex items-center gap-2 py-2 overflow-x-auto border-t border-slate-800/80 text-xs scrollbar-none">
            <button
              onClick={() => onSetAdminSubTab('dashboard')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                adminSubTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => onSetAdminSubTab('pitches')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                adminSubTab === 'pitches'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pitch CRUD & Facilities
            </button>
            <button
              onClick={() => onSetAdminSubTab('pricing')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                adminSubTab === 'pricing'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dynamic Pricing Rules
            </button>
            <button
              onClick={() => onSetAdminSubTab('schedule')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                adminSubTab === 'schedule'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Turf Maintenance Scheduler
            </button>
            <button
              onClick={() => onSetAdminSubTab('master_bookings')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                adminSubTab === 'master_bookings'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Master Bookings & Walk-ins
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
