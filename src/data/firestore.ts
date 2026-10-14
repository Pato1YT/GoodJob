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
  Timestamp,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  User,
  Address,
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
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as User;
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
  async getAvailable(limit_count: number = 20): Promise<Worker[]> {
    try {
      const q = query(
        collection(db, 'workers'),
        where('available', '==', true),
        limit(limit_count)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Worker;
      });
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
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Worker;
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
      const workerIds = querySnapshot.docs.map((docSnap) => docSnap.data().workerId);

      const workers: Worker[] = [];
      for (const workerId of workerIds) {
        const worker = await workerService.getById(workerId);
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
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Worker;
      });
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
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Category;
      });
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
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Category;
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
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Booking;
      });

      // Ordenar en memoria descendentemente sin requerir índice compuesto
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
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
        where('workerId', '==', workerId)
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Booking;
      });

      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
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
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Booking;
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
  // Crear reseña y actualizar la calificación promedio del trabajador
  async submitReview(data: {
    workerId: string;
    userId: string;
    bookingId?: string;
    rating: number;
    comment: string;
    userName?: string;
    userPhoto?: string;
  }): Promise<string> {
    try {
      // 1. Guardar la reseña en la colección 'reviews'
      const reviewRef = await addDoc(collection(db, 'reviews'), {
        workerId: data.workerId,
        userId: data.userId,
        bookingId: data.bookingId || '',
        userName: data.userName || 'Usuario GoodJob',
        userPhoto: data.userPhoto || '',
        rating: data.rating,
        comment: data.comment.trim(),
        isVisible: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 2. Si venía asociada a una reserva, marcar la reserva como 'completed' y 'reviewed'
      if (data.bookingId) {
        try {
          await updateDoc(doc(db, 'bookings', data.bookingId), {
            status: 'completed',
            isReviewed: true,
            reviewId: reviewRef.id,
            updatedAt: Timestamp.now(),
          });
        } catch (bErr) {
          console.warn('Could not update booking reviewed status:', bErr);
        }
      }

      // 3. Recalcular el promedio de calificación y total de reseñas del trabajador
      try {
        const workerReviews = await reviewService.getByWorkerId(data.workerId);
        const total = workerReviews.length;
        const sum = workerReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0);
        const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : data.rating;

        await updateDoc(doc(db, 'workers', data.workerId), {
          avgRating: avg,
          totalReviews: total,
          updatedAt: Timestamp.now(),
        });
      } catch (wErr) {
        console.warn('Could not recalculate worker rating:', wErr);
      }

      return reviewRef.id;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  // Obtener reseñas del trabajador
  async getByWorkerId(workerId: string): Promise<Review[]> {
    try {
      // 1. Consultamos únicamente por workerId para evitar conflictos de índices compuestos
      const q = query(
        collection(db, 'reviews'),
        where('workerId', '==', workerId)
      );

      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
          } as Review;
        })
        // 2. Filtramos visible en JS si existe la propiedad
        .filter((review) => review.isVisible !== false);

      // 3. Ordenamos las reseñas localmente por fecha descendente
      return reviews.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
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
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          lastMessageAt: data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Chat;
      });

      return list.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
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
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          } as ChatMessage;
        })
        .reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Suscribirse a mensajes en tiempo real con onSnapshot
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    limit_count: number = 50
  ) {
    const q = query(
      collection(db, 'chats', chatId, 'chatMessages'),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              ...data,
              id: docSnap.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            } as ChatMessage;
          })
          .reverse();
        callback(messages);
      },
      (error) => {
        console.error('Error listening to chat messages:', error);
      }
    );
  },

  // Obtener o crear un chat entre usuario y trabajador
  async getOrCreateByWorker(userId: string, worker: Worker): Promise<string> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        where('workerId', '==', worker.id),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      // Si no existe, lo creamos
      const w = worker as any;
      const workerName = `${w.firstName || ''} ${w.lastName || ''}`.trim() || worker.userNameSnapshot || 'Profesional';
      const docRef = await addDoc(collection(db, 'chats'), {
        userId,
        workerId: worker.id,
        workerNameSnapshot: workerName,
        workerPhotoSnapshot: worker.userPhotoSnapshot || '',
        lastMessage: '',
        unreadCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error getting or creating chat:', error);
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
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Favorite;
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  },

  // Eliminar de favoritos por ID de documento
  async remove(favoriteId: string) {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Alternar favorito (guardar o remover según exista)
  async toggle(userId: string, worker: Worker): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('workerId', '==', worker.id),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Ya existía: lo eliminamos
        const favDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'favorites', favDoc.id));
        return false; // ya no es favorito
      } else {
        // No existía: lo agregamos
        const w = worker as any;
        const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || worker.userNameSnapshot || 'Trabajador';
        await addDoc(collection(db, 'favorites'), {
          userId,
          workerId: worker.id,
          workerNameSnapshot: name,
          workerPhotoSnapshot: worker.userPhotoSnapshot || '',
          workerRatingSnapshot: worker.avgRating || 5.0,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return true; // ahora es favorito
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as Notification;
      });

      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Escuchar notificaciones no leídas en tiempo real
  subscribeToUnread(userId: string, callback: (count: number) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        callback(snapshot.docs.length);
      },
      (error) => {
        console.warn('Error listening to unread notifications:', error);
      }
    );
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

// ============================================================================
// DIRECCIONES
// ============================================================================

export const addressService = {
  // Obtener dirección predeterminada o la primera del usuario
  async getDefaultByUserId(userId: string): Promise<Address | null> {
    try {
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      } as Address;
    } catch (error) {
      console.error('Error getting address:', error);
      throw error;
    }
  },

  // Guardar o actualizar la dirección del usuario
  async saveOrUpdate(userId: string, addressData: Partial<Address>): Promise<string> {
    try {
      const existing = await this.getDefaultByUserId(userId);

      if (existing) {
        await updateDoc(doc(db, 'addresses', existing.id), {
          ...addressData,
          updatedAt: Timestamp.now(),
        });
        return existing.id;
      } else {
        const docRef = await addDoc(collection(db, 'addresses'), {
          userId,
          alias: addressData.alias || 'home',
          street: addressData.street || '',
          number: addressData.number || '',
          neighborhood: addressData.neighborhood || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zipCode: addressData.zipCode || '',
          country: addressData.country || 'México',
          lat: addressData.lat || 0,
          lng: addressData.lng || 0,
          isDefault: true,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  },
};

// ============================================================================
// MÉTODOS DE PAGO DEL USUARIO
// ============================================================================

export interface UserPaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'cash' | 'transfer';
  title: string; // ej: 'Tarjeta Débito BBVA', 'Efectivo al finalizar'
  cardBrand?: 'VISA' | 'MasterCard' | 'AMEX' | 'Otro';
  last4?: string; // ej: '4242'
  expiryDate?: string; // ej: '12/28'
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentMethodService = {
  // Obtener métodos de pago del usuario
  async getByUserId(userId: string): Promise<UserPaymentMethod[]> {
    try {
      const q = query(
        collection(db, 'paymentMethods'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as UserPaymentMethod;
      });

      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  // Agregar nuevo método de pago
  async add(userId: string, data: Partial<UserPaymentMethod>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'paymentMethods'), {
        ...data,
        userId,
        type: data.type || 'card',
        title: data.title || 'Tarjeta Personal',
        cardBrand: data.cardBrand || 'VISA',
        last4: data.last4 || '1234',
        expiryDate: data.expiryDate || '12/28',
        isDefault: data.isDefault ?? false,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Eliminar método de pago
  async remove(paymentMethodId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'paymentMethods', paymentMethodId));
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  },
};

export default {
  userService,
  addressService,
  workerService,
  categoryService,
  bookingService,
  reviewService,
  chatService,
  favoriteService,
  notificationService,
  paymentMethodService,
};