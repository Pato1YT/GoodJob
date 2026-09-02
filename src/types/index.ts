/**
 * GoodJob - Complete TypeScript Types
 * Basado en el esquema Firestore de 21 colecciones
 * Generado automáticamente para Expo + Firebase
 */

// ============================================================================
// USUARIOS Y PERFILES
// ============================================================================

export interface User {
  id: string; // Firebase Auth UID
  role: 'employer' | 'worker' | 'both';
  firstName: string;
  lastName: string;
  secondLastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string; // FK → users
  alias: 'home' | 'work' | 'other';
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker {
  id: string;
  userId: string; // FK → users
  userNameSnapshot: string;
  userPhotoSnapshot?: string;
  bio?: string;
  yearsExperience: number;
  avgRating: number;
  totalReviews: number;
  verified: boolean;
  available: boolean;
  status: 'active' | 'suspended' | 'pending';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CATEGORÍAS Y SERVICIOS
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerCategory {
  id: string;
  workerId: string; // FK → workers
  categoryId: string; // FK → categories
  categoryNameSnapshot: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  workerId: string; // FK → workers
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkEvidence {
  id: string;
  workerId: string; // FK → workers
  type: 'photo' | 'certificate' | 'id';
  title: string;
  description?: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// IA Y DIAGNÓSTICOS
// ============================================================================

export interface AIConversation {
  id: string;
  userId: string; // FK → users
  userNameSnapshot: string;
  status: 'active' | 'closed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  conversationId: string; // FK → aiConversations
  sender: 'user' | 'ai';
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIDiagnostic {
  id: string;
  userId: string; // FK → users
  conversationId?: string; // FK → aiConversations (opcional)
  userDescription: string;
  aiResult: string;
  topCategory: string;
  topCategorySnapshot: string;
  confidenceScore: number; // 0.0 - 1.0
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  id: string;
  diagnosticId: string; // FK → aiDiagnostics
  workerId: string; // FK → workers
  workerNameSnapshot: string;
  workerPhotoSnapshot?: string;
  workerRatingSnapshot: number;
  matchScore: number; // 0.0 - 1.0
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// RESERVAS Y SERVICIOS
// ============================================================================

export interface ServiceRequest {
  id: string;
  userId: string; // FK → users
  categoryId: string; // FK → categories
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string; // FK → users (empleador)
  workerId: string; // FK → workers
  serviceType: string;
  categoryId?: string; // FK → categories
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  scheduledTime?: string; // HH:mm
  location?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  estimatedCost?: number;
  finalCost?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MENSAJERÍA
// ============================================================================

export interface Chat {
  id: string;
  userId: string; // FK → users (empleador)
  workerId: string; // FK → workers
  userNameSnapshot: string;
  userPhotoSnapshot?: string;
  workerNameSnapshot: string;
  workerPhotoSnapshot?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string; // FK → chats
  senderId: string; // FK → users
  senderRole: 'user' | 'worker';
  senderNameSnapshot: string;
  content: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  read: boolean;
  readAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// RESEÑAS Y FAVORITOS
// ============================================================================

export interface Review {
  id: string;
  bookingId: string; // FK → bookings
  userId: string; // FK → users
  workerId: string; // FK → workers
  userNameSnapshot: string;
  userPhotoSnapshot?: string;
  workerNameSnapshot: string;
  rating: number; // 1-5
  comment?: string;
  isVisible: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string; // FK → users
  workerId: string; // FK → workers
  workerNameSnapshot: string;
  workerPhotoSnapshot?: string;
  workerRatingSnapshot: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export interface Notification {
  id: string;
  userId: string; // FK → users
  type: 'booking' | 'payment' | 'message' | 'review' | 'system';
  title: string;
  body: string;
  relatedCollection?: string;
  relatedId?: string;
  read: boolean;
  readAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PAGOS
// ============================================================================

export interface PaymentMethod {
  id: string;
  userId: string; // FK → users
  type: 'card' | 'bank' | 'wallet';
  provider: string; // Stripe, Conekta, MercadoPago
  externalToken: string; // Nunca guardar datos sensibles
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string; // FK → bookings
  userId: string; // FK → users
  workerId: string; // FK → workers
  paymentMethodId: string; // FK → paymentMethods
  amount: number;
  currency: 'MXN' | 'USD';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REPORTES
// ============================================================================

export interface Report {
  id: string;
  reporterId: string; // FK → users
  reporterNameSnapshot: string;
  reportedUserId?: string; // FK → users (nullable)
  reportedWorkerId?: string; // FK → workers (nullable)
  reportedNameSnapshot: string;
  reason: 'fraud' | 'abuse' | 'no_show' | 'fake_profile' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'closed';
  resolvedBy?: string;
  resolvedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TIPOS DE ESTADO Y CONTEXTO
// ============================================================================

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  profile?: Worker | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// TIPOS PARA BÚSQUEDA Y FILTROS
// ============================================================================

export interface WorkerFilters {
  categoryId?: string;
  minRating?: number;
  maxDistance?: number;
  latitude?: number;
  longitude?: number;
  available?: boolean;
  verified?: boolean;
  sortBy?: 'rating' | 'experience' | 'distance';
}

export interface BookingFilters {
  status?: Booking['status'];
  dateFrom?: Date;
  dateTo?: Date;
  categoryId?: string;
}

export interface SearchParams {
  query: string;
  type: 'workers' | 'services' | 'bookings';
  filters?: Record<string, any>;
}