import React, { useState } from 'react';
import {
  Database,
  Layers,
  Cpu,
  Lock,
  GitBranch,
  Terminal,
  Server,
  Code2,
  Copy,
  Check,
  Zap,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Workflow,
  Globe,
} from 'lucide-react';

export const ArchitectureCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'architecture' | 'schema' | 'concurrency' | 'api' | 'roadmap'
  >('concurrency');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Concurrency Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simResults, setSimResults] = useState<{
    userAStatus: 'waiting' | 'locked' | 'failed';
    userBStatus: 'waiting' | 'locked' | 'failed';
    userALatency: number;
    userBLatency: number;
    lockToken: string;
    log: string[];
  }>({
    userAStatus: 'waiting',
    userBStatus: 'waiting',
    userALatency: 0,
    userBLatency: 0,
    lockToken: '',
    log: [],
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const runConcurrencySimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    const logs: string[] = [];

    logs.push('[T+00ms] User A (Marcus) & User B (Dave) click "Lock 19:00 Slot" concurrently');
    setSimResults({
      userAStatus: 'waiting',
      userBStatus: 'waiting',
      userALatency: 0,
      userBLatency: 0,
      lockToken: '',
      log: [...logs],
    });

    setTimeout(() => {
      setSimStep(2);
      logs.push('[T+12ms] API Gateway receives both HTTP requests on worker pool');
      logs.push('[T+18ms] Node.js cluster evaluates Redis distributed mutex: SET slot:lock:pitch_1:2026-10-24:1900');
      setSimResults((prev) => ({ ...prev, log: [...logs] }));
    }, 600);

    setTimeout(() => {
      setSimStep(3);
      // User A wins the race by 4 milliseconds
      const token = `lock_${Math.random().toString(36).substring(2, 9)}`;
      logs.push(`[T+24ms] Redis SETNX executed atomically for User A -> Return OK (PX=600000)`);
      logs.push(`[T+28ms] Redis SETNX for User B -> Return (nil). Mutex already acquired by User A`);
      logs.push(`[T+35ms] PostgreSQL Transaction initiated for User A: SELECT * FROM slot_reservations FOR UPDATE`);
      logs.push(`[T+42ms] User A slot lock confirmed. HTTP 201 Created sent to Marcus`);
      logs.push(`[T+45ms] User B rejected. HTTP 409 Conflict returned: "Slot is currently being reserved by another player"`);
      setSimResults({
        userAStatus: 'locked',
        userBStatus: 'failed',
        userALatency: 42,
        userBLatency: 45,
        lockToken: token,
        log: [...logs],
      });
      setIsSimulating(false);
      setSimStep(4);
    }, 1500);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimStep(0);
    setSimResults({
      userAStatus: 'waiting',
      userBStatus: 'waiting',
      userALatency: 0,
      userBLatency: 0,
      lockToken: '',
      log: [],
    });
  };

  const sqlSchemaDDL = `-- ========================================================
-- PRODUCTION POSTGRESQL SCHEMA FOR PITCHMASTER
-- Concurrency-Safe with Row-Level Locks & Partial Unique Index
-- ========================================================

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('customer', 'pitch_admin', 'super_admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'customer',
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VENUES (Sports complexes)
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    contact_phone VARCHAR(30),
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PITCHES (Individual 5v5, 7v7, 11v11 pitches inside venues)
CREATE TYPE pitch_size AS ENUM ('5-a-side', '7-a-side', '9-a-side', '11-a-side');
CREATE TYPE pitch_surface AS ENUM (
    '4G Artificial Turf', 
    '3G Rubber Infill', 
    'Natural Grass', 
    'Indoor Hardwood', 
    'Hybrid Carpet Turf'
);

CREATE TABLE pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    size pitch_size NOT NULL,
    surface pitch_surface NOT NULL,
    dimensions VARCHAR(50) NOT NULL,
    base_price_per_hour NUMERIC(10, 2) NOT NULL,
    peak_hour_price NUMERIC(10, 2) NOT NULL,
    weekend_price NUMERIC(10, 2) NOT NULL,
    slot_duration_mins INT DEFAULT 60 CHECK (slot_duration_mins IN (60, 90)),
    operating_open TIME NOT NULL DEFAULT '07:00:00',
    operating_close TIME NOT NULL DEFAULT '23:00:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SLOT RESERVATIONS (Partial Locking / TTL Checkout Holds)
-- Prevents double-booking via Redis and DB level locks
CREATE TABLE slot_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    lock_token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index ensuring only ONE unexpired hold can exist for a slot
CREATE UNIQUE INDEX idx_unique_active_slot_lock 
ON slot_reservations (pitch_id, slot_date, start_time) 
WHERE (is_active = TRUE);

-- 5. BOOKINGS (Confirmed Bookings)
CREATE TYPE booking_status AS ENUM ('confirmed', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_gateway AS ENUM ('stripe', 'apple_pay', 'google_pay', 'paypal', 'offline_cash');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    pitch_id UUID NOT NULL REFERENCES pitches(id),
    user_id UUID NOT NULL REFERENCES users(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    addons_price NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_gateway NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'paid',
    status booking_status DEFAULT 'confirmed',
    qr_code_token VARCHAR(255) NOT NULL,
    cancellation_reason TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL CONCURRENCY SAFEGUARD:
-- Unique partial index preventing two concurrent CONFIRMED bookings for same pitch & time
CREATE UNIQUE INDEX idx_prevent_double_booking 
ON bookings (pitch_id, booking_date, start_time) 
WHERE (status = 'confirmed');

-- 6. BOOKING ADDONS (Referee, balls, bibs)
CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_name VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- 7. MAINTENANCE BLOCKS
CREATE TABLE maintenance_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Architecture & Blueprint Center</span>
          </div>
          <h2 className="text-2xl font-black text-white">System Architecture & Engineering Specs</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete production-ready blueprints, relational database schema, concurrency mutex protocols, API endpoints, and step-by-step roadmap.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('concurrency')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'concurrency'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Concurrency & Locks</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'architecture'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Stack</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'schema'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Schema DDL</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'api'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'roadmap'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Launch Roadmap</span>
          </button>
        </div>
      </div>

      {/* 1. CONCURRENCY TAB & INTERACTIVE SIMULATOR */}
      {activeTab === 'concurrency' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Interactive Live Concurrency Race Condition Simulator */}
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Live Race Condition Engine Simulator
                </span>
                <h3 className="text-xl font-bold text-white">
                  Simultaneous Slot Locking: User A vs User B
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate two customers attempting to checkout Wembley Pitch 1 at 19:00 at the exact same millisecond.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetSimulation}
                  disabled={isSimulating}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={runConcurrencySimulation}
                  disabled={isSimulating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isSimulating ? 'Simulating Lock Contention...' : 'Fire Concurrent Requests'}</span>
                </button>
              </div>
            </div>

            {/* Visual Contenders Arena */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* User A Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simResults.userAStatus === 'locked'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white text-sm">User A (Alex Morgan)</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">Request: T+00ms</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Slot:</span>
                    <span className="text-white font-mono">Pitch 1 (19:00 – 20:00)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Acquisition Latency:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {simResults.userALatency ? `${simResults.userALatency}ms` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Lock Outcome:</span>
                    {simResults.userAStatus === 'locked' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black uppercase text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Acquired Lock (10m TTL)</span>
                      </span>
                    ) : simResults.userAStatus === 'waiting' && isSimulating ? (
                      <span className="text-amber-400 font-mono">Attempting Mutex...</span>
                    ) : (
                      <span className="text-slate-500 font-mono">Idle</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User B Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simResults.userBStatus === 'failed'
                    ? 'bg-red-950/30 border-red-500/60 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="font-bold text-white text-sm">User B (Coach Dave)</span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">Request: T+04ms</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Slot:</span>
                    <span className="text-white font-mono">Pitch 1 (19:00 – 20:00)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rejection Latency:</span>
                    <span className="text-red-400 font-mono font-bold">
                      {simResults.userBLatency ? `${simResults.userBLatency}ms` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Lock Outcome:</span>
                    {simResults.userBStatus === 'failed' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold uppercase text-[10px] flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>HTTP 409 Conflict (Protected)</span>
                      </span>
                    ) : isSimulating ? (
                      <span className="text-amber-400 font-mono">Attempting Mutex...</span>
                    ) : (
                      <span className="text-slate-500 font-mono">Idle</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Logs Terminal */}
            <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-900 mb-2">
                <span>Distributed Mutex & Redis Redlock Audit Stream</span>
                <span>Port 6379 & PgBouncer</span>
              </div>
              {simResults.log.length === 0 ? (
                <p className="text-slate-600">
                  Ready to test. Click "Fire Concurrent Requests" above to execute real-time mutex contention.
                </p>
              ) : (
                simResults.log.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.includes('User A')
                        ? 'text-emerald-400'
                        : line.includes('User B') || line.includes('409')
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3-Tier Defensive Architecture Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20 font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Tier 1: Redis Distributed Mutex (Redlock)</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                When a user enters checkout, backend executes atomic:
                <code className="block bg-slate-950 p-2 rounded-lg text-emerald-400 my-1 font-mono text-[10px]">
                  SET slot:lock:pitch:date:time user_id NX PX 600000
                </code>
                Guarantees sub-millisecond contention resolution at memory speed before hitting database.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 border border-sky-500/20 font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Tier 2: PostgreSQL Row-Level Lock</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                On payment finalization, checkout API executes:
                <code className="block bg-slate-950 p-2 rounded-lg text-sky-400 my-1 font-mono text-[10px]">
                  SELECT id FROM slot_reservations WHERE pitch_id = $1 AND slot_date = $2 FOR UPDATE
                </code>
                Serializes writes within ACID transaction at database engine level.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 border border-purple-500/20 font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Tier 3: Database Partial Unique Constraint</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hard relational constraint in PostgreSQL:
                <code className="block bg-slate-950 p-2 rounded-lg text-purple-400 my-1 font-mono text-[10px]">
                  CREATE UNIQUE INDEX idx_no_double ON bookings (pitch_id, booking_date, start_time) WHERE status = 'confirmed';
                </code>
                Mathematically impossible for 2 confirmed bookings to co-exist in storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM ARCHITECTURE & STACK TAB */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Tech Stack Recommendation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Frontend (Web & Mobile)
              </span>
              <h4 className="text-base font-bold text-white mt-1">Next.js 15 & React Native</h4>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>• <strong>Web:</strong> Next.js App Router + Tailwind CSS</li>
                <li>• <strong>Mobile:</strong> React Native / Expo (Shared code)</li>
                <li>• <strong>State:</strong> TanStack Query + Zustand</li>
                <li>• <strong>Realtime:</strong> Server-Sent Events (SSE)</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Backend Services
              </span>
              <h4 className="text-base font-bold text-white mt-1">Node.js / Fastify / Go</h4>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>• <strong>API:</strong> Fastify / Express with TypeScript</li>
                <li>• <strong>ORM:</strong> Drizzle ORM or Prisma</li>
                <li>• <strong>Auth:</strong> JWT + Google OAuth + Phone OTP</li>
                <li>• <strong>RBAC:</strong> Casbin or Middleware Guard</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Storage & Cache
              </span>
              <h4 className="text-base font-bold text-white mt-1">PostgreSQL + Redis 7</h4>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>• <strong>Primary DB:</strong> PostgreSQL 16 (Relational)</li>
                <li>• <strong>Pooling:</strong> PgBouncer</li>
                <li>• <strong>Cache & Mutex:</strong> Redis cluster (Redlock)</li>
                <li>• <strong>File Storage:</strong> Cloudflare R2 / AWS S3</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Payments & Gateways
              </span>
              <h4 className="text-base font-bold text-white mt-1">Stripe & Apple Pay</h4>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                <li>• <strong>Processor:</strong> Stripe Payment Intents API</li>
                <li>• <strong>Wallets:</strong> Apple Pay, Google Pay</li>
                <li>• <strong>Webhooks:</strong> Idempotent event verification</li>
                <li>• <strong>SMS:</strong> Twilio for turnstile PIN codes</li>
              </ul>
            </div>
          </div>

          {/* Visual Architecture Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-emerald-400" />
              High-Level End-to-End System Topology
            </h3>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-center">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">CLIENT LAYER</span>
                  <p className="text-white font-bold mt-1">Customer Web / iOS / Android</p>
                  <p className="text-[11px] text-slate-500">React & React Native Apps</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 hidden sm:block" />
                <div className="text-center">
                  <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">EDGE & GATEWAY</span>
                  <p className="text-white font-bold mt-1">Cloudflare / NGINX Ingress</p>
                  <p className="text-[11px] text-slate-500">SSL, Rate Limiting & CDN</p>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-400 hidden sm:block" />
                <div className="text-center">
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">MICROSERVICES</span>
                  <p className="text-white font-bold mt-1">Booking & Lock Engine</p>
                  <p className="text-[11px] text-slate-500">Node.js Fastify Cluster</p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 hidden sm:block" />
                <div className="text-center">
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">DATA PERSISTENCE</span>
                  <p className="text-white font-bold mt-1">PostgreSQL + Redis Mutex</p>
                  <p className="text-[11px] text-slate-500">ACID + Redlock Locks</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <p>
                  <strong className="text-emerald-400">1. Discovery:</strong> Customer app queries pitch list with geo-distance bounding box and availability filter.
                </p>
                <p>
                  <strong className="text-sky-400">2. Temporary Lock:</strong> Selecting a slot invokes <code className="text-white">POST /api/v1/slots/lock</code>. Redis issues a 10-minute lease token. Broadcasts SSE lock event to prevent other clients from clicking.
                </p>
                <p>
                  <strong className="text-amber-400">3. Checkout & Payment:</strong> User supplies team info, selects match add-ons, and authorizes payment via Stripe PaymentIntent.
                </p>
                <p>
                  <strong className="text-purple-400">4. Finalization & Ticket Issue:</strong> Stripe webhook confirms transaction. SQL insert into <code className="text-white">bookings</code> executes within ACID transaction. QR code token is generated and dispatched via Twilio SMS & SendGrid email.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DATABASE SCHEMA DDL TAB */}
      {activeTab === 'schema' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">PostgreSQL 16 Relational Schema DDL</h3>
              <p className="text-xs text-slate-400">
                Production DDL script with foreign keys, checks, enums, and concurrency-proof partial unique indexes.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(sqlSchemaDDL, 'sql_ddl')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
            >
              {copiedCode === 'sql_ddl' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy DDL Script</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto max-h-[550px]">
            <pre className="font-mono text-xs text-emerald-300/90 leading-relaxed">
              {sqlSchemaDDL}
            </pre>
          </div>
        </div>
      )}

      {/* 4. REST API SPECIFICATION TAB */}
      {activeTab === 'api' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Key RESTful API Endpoints Spec</h3>
              <p className="text-xs text-slate-400">
                Specification for Customer Discovery, Slot Locking, Payment Webhooks, and Admin CRUD.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {/* Endpoint 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    GET
                  </span>
                  <span className="font-mono font-bold text-white">/api/v1/pitches</span>
                </div>
                <p className="text-slate-400">
                  Search and retrieve football pitches with query params: <code className="text-slate-300">?size=7-a-side&surface=4G&date=2026-10-24&max_price=120</code>
                </p>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    POST
                  </span>
                  <span className="font-mono font-bold text-white">/api/v1/slots/lock</span>
                </div>
                <p className="text-slate-400">
                  Acquires a 10-minute exclusive checkout lease token on a training slot via Redis Redlock.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300">
                  {`Request: { "pitch_id": "pitch_1", "date": "2026-10-24", "start_time": "19:00", "ttl_seconds": 600 }
Response (201): { "lock_token": "lk_994a28", "expires_at": "2026-10-24T19:10:00Z" }`}
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    POST
                  </span>
                  <span className="font-mono font-bold text-white">/api/v1/bookings/checkout</span>
                </div>
                <p className="text-slate-400">
                  Completes reservation, verifies valid lock token, creates Stripe charge, and generates Turnstile Pass.
                </p>
              </div>

              {/* Endpoint 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    POST
                  </span>
                  <span className="font-mono font-bold text-white">/api/v1/admin/maintenance</span>
                </div>
                <p className="text-slate-400">
                  Admin facility blockout: blocks out turf dates/slots for maintenance or private club tournaments.
                </p>
              </div>

              {/* Endpoint 5 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    POST
                  </span>
                  <span className="font-mono font-bold text-white">/api/v1/admin/bookings/:id/refund</span>
                </div>
                <p className="text-slate-400">
                  Processes refund to customer card or issues credit note with reason audit record.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DEVELOPMENT ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Step-by-Step Implementation Roadmap</h3>
              <p className="text-xs text-slate-400">
                Structured phased delivery schedule from initial MVP foundation to stadium IoT scale.
              </p>
            </div>

            <div className="space-y-6">
              {/* Phase 1 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                      Phase 1 (Weeks 1–3)
                    </span>
                    <h4 className="text-sm font-bold text-white">MVP Core Foundation</h4>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">Done / Ready</span>
                </div>
                <p className="text-xs text-slate-300">
                  Setup PostgreSQL database schema, basic user authentication (Customer & Admin roles), Pitch discovery with filter engine, and interactive date & time slot selection.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold font-mono">
                      Phase 2 (Weeks 4–6)
                    </span>
                    <h4 className="text-sm font-bold text-white">Concurrency Lock Engine & Payments</h4>
                  </div>
                  <span className="text-xs text-sky-400 font-semibold">In Progress</span>
                </div>
                <p className="text-xs text-slate-300">
                  Integrate Redis Redlock distributed mutex for 10-min slot checkout holds. Implement Stripe Payment Intents and webhook listeners with automated QR pass generation.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                      Phase 3 (Weeks 7–8)
                    </span>
                    <h4 className="text-sm font-bold text-white">Admin Operations & Dynamic Yield Pricing</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Scheduled</span>
                </div>
                <p className="text-xs text-slate-300">
                  Venue operator portal with revenue analytics, automated peak-hour surcharges, maintenance blockout scheduler, and offline phone booking manager.
                </p>
              </div>

              {/* Phase 4 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold font-mono">
                      Phase 4 (Weeks 9–11)
                    </span>
                    <h4 className="text-sm font-bold text-white">IoT Smart Gates & Mobile Apps</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Future Scale</span>
                </div>
                <p className="text-xs text-slate-300">
                  React Native iOS/Android app store release. Hardware integration with venue turnstile QR barcode scanners and automated IoT floodlight relays synced to booked slot times.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
