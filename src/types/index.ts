// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'employer' | 'worker' | 'both';
  photoUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Worker profile
export interface Worker {
  id: string;
  userId: string;
  userNameSnapshot: string;
  userPhotoSnapshot?: string;
  bio?: string;
  yearsExperience: number;
  avgRating: number;
  totalReviews: number;
  verified: boolean;
  available: boolean;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking
export interface Booking {
  id: string;
  userId: string;
  workerId: string;
  serviceType: string;
  categoryId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  scheduledTime?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  estimatedCost?: number;
  finalCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review
export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  workerId: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth state
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}