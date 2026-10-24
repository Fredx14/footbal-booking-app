export type PitchSize = '5-a-side' | '7-a-side' | '9-a-side' | '11-a-side';

export type SurfaceType = 
  | '4G Artificial Turf'
  | '3G Rubber Infill'
  | 'Natural Grass'
  | 'Hybrid Carpet Turf'
  | 'Indoor Hardwood';

export type Amenity = 
  | 'Floodlights'
  | 'Changing Rooms'
  | 'Hot Showers'
  | 'Free Parking'
  | 'Bibs & Balls'
  | 'Referee Available'
  | 'Spectator Bleachers'
  | 'Café & Sports Bar'
  | 'Water Refill Station'
  | 'Locker Rooms'
  | 'First Aid / Defibrillator'
  | 'Smart Gate QR Access';

export interface Pitch {
  id: string;
  name: string;
  venueName: string;
  location: string;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  size: PitchSize;
  surface: SurfaceType;
  dimensions: string; // e.g., "105m x 68m" or "40m x 20m"
  basePricePerHour: number;
  peakHourPrice: number;
  weekendPrice: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  gallery: string[];
  amenities: Amenity[];
  description: string;
  rules: string[];
  operatingHours: {
    open: string;  // "07:00"
    close: string; // "23:00"
  };
  slotDurationMinutes: number; // 60 or 90
  isActive: boolean;
}

export type SlotStatus = 'available' | 'locked' | 'booked' | 'maintenance' | 'passed';

export interface TimeSlot {
  id: string;
  pitchId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "18:00"
  endTime: string; // "19:00"
  price: number;
  isPeak: boolean;
  status: SlotStatus;
  lockedByUserId?: string;
  lockedExpiresAt?: number; // timestamp ms
  bookingId?: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity?: number;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'refunded' | 'completed';

export interface Booking {
  id: string;
  referenceNumber: string; // e.g. "BK-94821"
  pitchId: string;
  pitchName: string;
  venueName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  durationMinutes: number;
  basePrice: number;
  addonsPrice: number;
  addons: { name: string; price: number; qty: number }[];
  subtotal: number;
  tax: number;
  totalPrice: number;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'offline_cash';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  status: BookingStatus;
  createdAt: string;
  qrCodeToken: string;
  cancellationReason?: string;
  refundAmount?: number;
  notes?: string;
}

export interface MaintenanceBlock {
  id: string;
  pitchId: string;
  title: string;
  reason: 'turf_resurfacing' | 'floodlight_repair' | 'private_academy_event' | 'weather_closure' | 'general_cleaning';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  pitchId: string; // 'all' or specific pitch id
  name: string;
  type: 'peak_hours' | 'weekend_surcharge' | 'youth_academy_discount' | 'seasonal_winter';
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  priceModifierType: 'fixed_increase' | 'percentage_increase' | 'percentage_discount';
  value: number; // e.g., 20 ($20 or 20%)
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'pitch_admin' | 'super_admin';
  avatar: string;
  loyaltyPoints: number;
}
