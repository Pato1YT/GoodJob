/**
 * GoodJob Firestore Services
 * CRUD operations para todas las colecciones
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  User,
  Worker,
  Category,
  Booking,
  Review,
  Chat,
  ChatMessage,
  Notification,
  Favorite,
} from '../types';

// ============================================================================
// USUARIOS
// ============================================================================

export const userService = {
  // Crear usuario
  async create(userId: string, userData: Partial<User>) {
    try {
      const user: User = {
        id: userId,
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        secondLastName: userData.secondLastName || '',
        phone: userData.phone || '',
        role: userData.role || 'employer',
        emailVerified: false,
        isActive: true,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userId), user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async getById(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return {
          ...docSnap.data() as User,
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async update(userId: string, data: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

// ============================================================================
// TRABAJADORES
// ============================================================================

export const workerService = {
  // Obtener trabajadores disponibles
  /*async getAvailable(limit_count: number = 20): Promise<Worker[]> {
    try {
      const q = query(
        collection(db, 'workers'),
        where('available', '==', true),
        where('verified', '==', true),
        orderBy('avgRating', 'desc'),
        limit(limit_count)
      );*/

    async getAvailable(limit_count: number = 20): Promise<Worker[]> {
    try {
      const q = query(
        collection(db, 'workers'),
        where('available', '==', true),
        limit(limit_count)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Worker,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting available workers:', error);
      throw error;
    }
  },
  

  // Obtener trabajador por ID
  async getById(workerId: string): Promise<Worker | null> {
    try {
      const docSnap = await getDoc(doc(db, 'workers', workerId));
      if (docSnap.exists()) {
        return {
          ...docSnap.data() as Worker,
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting worker:', error);
      throw error;
    }
  },

  // Buscar trabajadores por categoría
  async getByCategory(categoryId: string): Promise<Worker[]> {
    try {
      const q = query(
        collection(db, 'workerCategories'),
        where('categoryId', '==', categoryId)
      );

      const querySnapshot = await getDocs(q);
      const workerIds = querySnapshot.docs.map((doc) => doc.data().workerId);

      // Obtener detalles de los trabajadores
      const workers: Worker[] = [];
      for (const workerId of workerIds) {
        const worker = await this.getById(workerId);
        if (worker) workers.push(worker);
      }

      return workers;
    } catch (error) {
      console.error('Error getting workers by category:', error);
      throw error;
    }
  },

  // Buscar trabajadores por rating mínimo
  async getByMinRating(minRating: number = 4.0): Promise<Worker[]> {
    try {
      const q = query(
        collection(db, 'workers'),
        where('avgRating', '>=', minRating),
        where('available', '==', true),
        orderBy('avgRating', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Worker,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting workers by rating:', error);
      throw error;
    }
  },

  // Crear perfil de trabajador
  async create(data: Partial<Worker>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'workers'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  },

  // Actualizar trabajador
  async update(workerId: string, data: Partial<Worker>) {
    try {
      await updateDoc(doc(db, 'workers', workerId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error;
    }
  },
};

// ============================================================================
// CATEGORÍAS
// ============================================================================

export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Category,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  async getById(categoryId: string): Promise<Category | null> {
    try {
      const docSnap = await getDoc(doc(db, 'categories', categoryId));
      if (docSnap.exists()) {
        return {
          ...docSnap.data() as Category,
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  },
};

// ============================================================================
// RESERVAS
// ============================================================================

export const bookingService = {
  // Crear reserva
  async create(data: Partial<Booking>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...data,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Obtener reservas del usuario
  async getByUserId(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Booking,
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  },

  // Obtener reservas del trabajador
  async getByWorkerId(workerId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('workerId', '==', workerId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Booking,
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting worker bookings:', error);
      throw error;
    }
  },

  // Obtener reserva por ID
  async getById(bookingId: string): Promise<Booking | null> {
    try {
      const docSnap = await getDoc(doc(db, 'bookings', bookingId));
      if (docSnap.exists()) {
        return {
          ...docSnap.data() as Booking,
          scheduledDate: docSnap.data().scheduledDate?.toDate() || new Date(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  },

  // Actualizar estado de reserva
  async updateStatus(bookingId: string, status: Booking['status']) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },
};

// ============================================================================
// RESEÑAS
// ============================================================================

export const reviewService = {
  // Crear reseña
  async create(data: Partial<Review>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Obtener reseñas del trabajador
  async getByWorkerId(workerId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('workerId', '==', workerId),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Review,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },
};

// ============================================================================
// CHATS
// ============================================================================

export const chatService = {
  // Crear chat
  async create(data: Partial<Chat>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Obtener chats del usuario
  async getByUserId(userId: string): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Chat,
        lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting chats:', error);
      throw error;
    }
  },

  // Obtener mensajes del chat
  async getMessages(chatId: string, limit_count: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'chats', chatId, 'chatMessages'),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => ({
          ...doc.data() as ChatMessage,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }))
        .reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Enviar mensaje
  async sendMessage(
    chatId: string,
    message: Partial<ChatMessage>
  ): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(db, 'chats', chatId, 'chatMessages'),
        {
          ...message,
          read: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
      );

      // Actualizar último mensaje en el chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: message.content,
        lastMessageAt: Timestamp.now(),
        lastMessageSender: message.senderId,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};

// ============================================================================
// FAVORITOS
// ============================================================================

export const favoriteService = {
  // Agregar a favoritos
  async add(data: Partial<Favorite>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'favorites'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Obtener favoritos del usuario
  async getByUserId(userId: string): Promise<Favorite[]> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Favorite,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  },

  // Eliminar de favoritos
  async remove(favoriteId: string) {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },
};

// ============================================================================
// NOTIFICACIONES
// ============================================================================

export const notificationService = {
  // Crear notificación
  async create(data: Partial<Notification>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        read: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Obtener notificaciones del usuario
  async getByUserId(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        ...doc.data() as Notification,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};

export default {
  userService,
  workerService,
  categoryService,
  bookingService,
  reviewService,
  chatService,
  favoriteService,
  notificationService,
};