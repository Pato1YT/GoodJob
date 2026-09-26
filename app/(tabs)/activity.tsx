// Pantalla de Actividad: Gestión de Reservas, Bandeja de Chats y Calificaciones
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
  bookingService,
  chatService,
  favoriteService,
  workerService,
  reviewService,
  userService,
  notificationService,
} from '../../src/data/firestore';
import { Booking, Chat, Favorite, Notification } from '../../src/types';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { auth, db } from '../../src/config/firebase';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { appNotificationService } from '../../src/services/notificationManager';
import { useThemeStore } from '../../src/utils/themeStore';

const COLORS = {
  background: '#F9F9FB',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceVariant: '#E2E2E4',
  textPrimary: '#1A1C1D',
  textSecondary: '#4C4546',
  primary: '#000000',
  onPrimary: '#FFFFFF',
  error: '#BA1A1A',
  success: '#2E7D32',
  warning: '#F57C00',
  star: '#FFB800',
};

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

type ActivityTab = 'bookings' | 'chats' | 'notifications' | 'favorites';

export default function ActivityScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = useThemeStore((s) => s.colors);

  const [activeTab, setActiveTab] = useState<ActivityTab>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [workerBookings, setWorkerBookings] = useState<any[]>([]);
  const [isWorker, setIsWorker] = useState<boolean>(false);
  const [bookingsSubTab, setBookingsSubTab] = useState<'requests' | 'client'>('requests');
  const [chats, setChats] = useState<Chat[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  // Estados para Modal de Calificación / Reseña
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Modal de notificación/errores
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    message: string;
  }>({
    type: 'info',
    message: '',
  });

  const showModal = (type: ModalType, message: string) => {
    setModalConfig({ type, message });
    setModalVisible(true);
  };

  const loadAllData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // 1. Verificar si el usuario es trabajador
      let userIsWorker = false;
      try {
        const userDoc = await userService.getById(currentUser.uid);
        if (userDoc && (userDoc.role === 'worker' || userDoc.role === 'both')) {
          userIsWorker = true;
          setIsWorker(true);
        }
      } catch (roleErr) {
        console.warn('Error checking user role:', roleErr);
      }

      // 2. Cargar reservas del usuario como CLIENTE
      try {
        const userBookings = await bookingService.getByUserId(currentUser.uid);
        setBookings(userBookings || []);
      } catch (err) {
        console.warn('Error loading client bookings:', err);
      }

      // 3. Cargar reservas recibidas como TRABAJADOR
      try {
        const receivedBookings = await bookingService.getByWorkerId(currentUser.uid);
        setWorkerBookings(receivedBookings || []);
        if (receivedBookings && receivedBookings.length > 0) {
          setIsWorker(true);
        }
      } catch (wErr) {
        console.warn('Error loading worker bookings:', wErr);
      }

      // 4. Cargar chats: tanto donde soy userId (cliente) como donde soy workerId (profesional)
      try {
        const clientChats = await chatService.getByUserId(currentUser.uid);
        let workerSideChats: Chat[] = [];
        try {
          const wQuery = query(collection(db, 'chats'), where('workerId', '==', currentUser.uid));
          const wSnap = await getDocs(wQuery);
          workerSideChats = wSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as any),
          }));
        } catch (wChatErr) {
          console.warn('Error loading worker-side chats:', wChatErr);
        }

        // Combinar chats sin duplicados
        const allChatsMap = new Map<string, Chat>();
        (clientChats || []).forEach((c) => allChatsMap.set(c.id, c));
        workerSideChats.forEach((c) => allChatsMap.set(c.id, c));
        
        const mergedChats = Array.from(allChatsMap.values()).sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });

        setChats(mergedChats);
      } catch (err) {
        console.warn('Error loading chats:', err);
      }

      // 5. Cargar favoritos del usuario
      try {
        const userFavorites = await favoriteService.getByUserId(currentUser.uid);
        setFavorites(userFavorites || []);
      } catch (err) {
        console.warn('Error loading favorites:', err);
      }

      // 6. Cargar notificaciones del usuario
      try {
        const userNotifs = await notificationService.getByUserId(currentUser.uid);
        setNotifications(userNotifs || []);
      } catch (nErr) {
        console.warn('Error loading notifications:', nErr);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manejar Aceptar, Rechazar o Finalizar trabajo recibido como trabajador
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: 'accepted' | 'cancelled' | 'completed'
  ) => {
    try {
      setProcessingBookingId(bookingId);
      await bookingService.updateStatus(bookingId, newStatus);

      let successMsg = 'Estado de la reserva actualizado.';
      // Buscar la reserva actual para conocer el userId del cliente
      const targetBooking = workerBookings.find((b) => b.id === bookingId);

      if (newStatus === 'accepted') {
        successMsg = '¡Solicitud aceptada! Comunícate con el cliente mediante el chat para coordinar el trabajo.';
        if (targetBooking?.userId) {
          appNotificationService.notifyUser({
            userId: targetBooking.userId,
            title: '✅ ¡Solicitud Aceptada!',
            body: 'El profesional ha aceptado tu reserva. Puedes coordinar detalles por el chat.',
            type: 'booking',
            relatedId: bookingId,
            relatedCollection: 'bookings',
          });
        }
      } else if (newStatus === 'completed') {
        successMsg = '¡Excelente trabajo! Has marcado este servicio como completado. Se le solicitará al cliente que califique tu atención.';
        if (targetBooking?.userId) {
          appNotificationService.notifyUser({
            userId: targetBooking.userId,
            title: '🎉 ¡Servicio Finalizado!',
            body: 'El profesional ha marcado el trabajo como completado. ¡Entra a calificarlo!',
            type: 'booking',
            relatedId: bookingId,
            relatedCollection: 'bookings',
          });
        }
      } else if (newStatus === 'cancelled') {
        successMsg = 'Solicitud rechazada.';
      }

      showModal('success', successMsg);
      // Recargar datos
      await loadAllData();
    } catch (err) {
      console.error('Error actualizando estado de reserva:', err);
      showModal('danger', 'No se pudo actualizar el estado de la reserva. Intenta de nuevo.');
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Recargar cada vez que la pestaña entra en foco
  useFocusEffect(
    React.useCallback(() => {
      loadAllData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  // Abrir modal de calificar (solo si el servicio ya fue completado)
  const handleOpenReviewModal = (booking: any) => {
    if (booking.status !== 'completed') {
      showModal(
        'info',
        'Podrás calificar y dejar tu reseña una vez que el profesional haya marcado el trabajo como finalizado.'
      );
      return;
    }
    setSelectedBookingForReview(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  // Enviar reseña a Firestore
  const handleSubmitReview = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !selectedBookingForReview) return;

    if (!reviewComment.trim()) {
      showModal('warning', 'Por favor escribe un breve comentario sobre el servicio recibido.');
      return;
    }

    try {
      setSubmittingReview(true);

      // Obtener el nombre real guardado en Firestore (users/{uid})
      let resolvedUserName = currentUser.displayName || '';
      let resolvedUserPhoto = currentUser.photoURL || '';

      try {
        const userDoc = await userService.getById(currentUser.uid);
        if (userDoc) {
          const combined = `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim();
          if (combined) resolvedUserName = combined;
          if (userDoc.photoUrl) resolvedUserPhoto = userDoc.photoUrl;
        }
      } catch (uErr) {
        console.warn('Could not fetch user profile for review:', uErr);
      }

      await reviewService.submitReview({
        workerId: selectedBookingForReview.workerId,
        userId: currentUser.uid,
        bookingId: selectedBookingForReview.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        userName: resolvedUserName || 'Usuario GoodJob',
        userPhoto: resolvedUserPhoto,
      });

      setReviewModalVisible(false);
      showModal('success', '¡Gracias por tu opinión! Tu calificación ha sido registrada.');
      // Refrescar para reflejar que ya fue calificada
      loadAllData();
    } catch (error) {
      console.error('Error enviando reseña:', error);
      showModal('danger', 'No se pudo guardar la reseña. Inténtalo de nuevo.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Badge de estado de la reserva
  const renderStatusBadge = (status: string) => {
    let bg = '#E3F2FD';
    let textCol = '#1976D2';
    let label = 'Pendiente';

    if (status === 'confirmed' || status === 'accepted') {
      bg = '#E8F5E9';
      textCol = COLORS.success;
      label = 'Confirmada';
    } else if (status === 'completed') {
      bg = '#F3F4F6';
      textCol = COLORS.textSecondary;
      label = 'Completada';
    } else if (status === 'cancelled') {
      bg = '#FFEBEE';
      textCol = COLORS.error;
      label = 'Cancelada';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color: textCol }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeColors.statusBar} backgroundColor={themeColors.background} />

      {/* Header */}
      <View style={[styles.header, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, isDark && { color: themeColors.text }]}>Mi Actividad</Text>
        <TouchableOpacity
          style={[styles.refreshButton, isDark && { backgroundColor: themeColors.surfaceLow }]}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={22} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Selector de Pestañas con Scroll Horizontal (Pill Bar) */}
      <View style={[styles.tabBarWrapper, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          <TouchableOpacity
            style={[
              styles.tabItem,
              isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border },
              activeTab === 'bookings' && (isDark ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : styles.activeTabItem),
            ]}
            onPress={() => setActiveTab('bookings')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color={activeTab === 'bookings' ? (isDark ? themeColors.onPrimary : COLORS.primary) : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                isDark && { color: themeColors.textSecondary },
                activeTab === 'bookings' && (isDark ? { color: themeColors.onPrimary, fontWeight: '700' } : styles.activeTabItemText),
              ]}
            >
              Reservas
            </Text>
            {(bookings.length + workerBookings.length) > 0 && (
              <View style={[styles.tabBadge, isDark && { backgroundColor: themeColors.surfaceVariant }, activeTab === 'bookings' && (isDark ? { backgroundColor: '#3F3F46' } : styles.tabBadgeActive)]}>
                <Text style={[styles.tabBadgeText, activeTab === 'bookings' && (isDark ? { color: '#FFFFFF' } : styles.tabBadgeTextActive)]}>
                  {bookings.length + workerBookings.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border },
              activeTab === 'chats' && (isDark ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : styles.activeTabItem),
            ]}
            onPress={() => setActiveTab('chats')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color={activeTab === 'chats' ? (isDark ? themeColors.onPrimary : COLORS.primary) : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                isDark && { color: themeColors.textSecondary },
                activeTab === 'chats' && (isDark ? { color: themeColors.onPrimary, fontWeight: '700' } : styles.activeTabItemText),
              ]}
            >
              Chats
            </Text>
            {chats.length > 0 && (
              <View style={[styles.tabBadge, isDark && { backgroundColor: themeColors.surfaceVariant }, activeTab === 'chats' && (isDark ? { backgroundColor: '#3F3F46' } : styles.tabBadgeActive)]}>
                <Text style={[styles.tabBadgeText, activeTab === 'chats' && (isDark ? { color: '#FFFFFF' } : styles.tabBadgeTextActive)]}>
                  {chats.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border },
              activeTab === 'notifications' && (isDark ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : styles.activeTabItem),
            ]}
            onPress={() => setActiveTab('notifications')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={17}
              color={activeTab === 'notifications' ? (isDark ? themeColors.onPrimary : COLORS.primary) : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                isDark && { color: themeColors.textSecondary },
                activeTab === 'notifications' && (isDark ? { color: themeColors.onPrimary, fontWeight: '700' } : styles.activeTabItemText),
              ]}
            >
              Avisos
            </Text>
            {notifications.filter((n) => !n.read).length > 0 && (
              <View style={[styles.tabBadgeUnread]}>
                <Text style={styles.tabBadgeUnreadText}>
                  {notifications.filter((n) => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border },
              activeTab === 'favorites' && (isDark ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : styles.activeTabItem),
            ]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="heart-outline"
              size={17}
              color={activeTab === 'favorites' ? (isDark ? themeColors.onPrimary : COLORS.primary) : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                isDark && { color: themeColors.textSecondary },
                activeTab === 'favorites' && (isDark ? { color: themeColors.onPrimary, fontWeight: '700' } : styles.activeTabItemText),
              ]}
            >
              Favoritos
            </Text>
            {favorites.length > 0 && (
              <View style={[styles.tabBadge, isDark && { backgroundColor: themeColors.surfaceVariant }, activeTab === 'favorites' && (isDark ? { backgroundColor: '#3F3F46' } : styles.tabBadgeActive)]}>
                <Text style={[styles.tabBadgeText, activeTab === 'favorites' && (isDark ? { color: '#FFFFFF' } : styles.tabBadgeTextActive)]}>
                  {favorites.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contenido Principal */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando tu actividad...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* TAB 1: RESERVAS */}
          {activeTab === 'bookings' && (
            <View>
              {/* Si es trabajador o tiene solicitudes, mostrar sub-selector */}
              {(isWorker || workerBookings.length > 0) && (
                <View style={[styles.subTabBar, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                  <TouchableOpacity
                    style={[
                      styles.subTabItem,
                      isDark && { backgroundColor: 'transparent' },
                      bookingsSubTab === 'requests' && (isDark ? { backgroundColor: themeColors.surfaceVariant } : styles.subTabItemActive),
                    ]}
                    onPress={() => setBookingsSubTab('requests')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="briefcase-outline"
                      size={16}
                      color={bookingsSubTab === 'requests' ? themeColors.primary : themeColors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.subTabText,
                        isDark && { color: themeColors.textSecondary },
                        bookingsSubTab === 'requests' && (isDark ? { color: themeColors.text, fontWeight: '700' } : styles.subTabTextActive),
                      ]}
                    >
                      Mis Solicitudes ({workerBookings.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subTabItem,
                      isDark && { backgroundColor: 'transparent' },
                      bookingsSubTab === 'client' && (isDark ? { backgroundColor: themeColors.surfaceVariant } : styles.subTabItemActive),
                    ]}
                    onPress={() => setBookingsSubTab('client')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={bookingsSubTab === 'client' ? themeColors.primary : themeColors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.subTabText,
                        isDark && { color: themeColors.textSecondary },
                        bookingsSubTab === 'client' && (isDark ? { color: themeColors.text, fontWeight: '700' } : styles.subTabTextActive),
                      ]}
                    >
                      Mis Reservas ({bookings.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* VISTA 1.A: SOLICITUDES RECIBIDAS (COMO PROFESIONAL) */}
              {(isWorker || workerBookings.length > 0) && bookingsSubTab === 'requests' ? (
                workerBookings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="briefcase-outline" size={54} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                    <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>No tienes solicitudes pendientes</Text>
                    <Text style={[styles.emptySubtitle, isDark && { color: themeColors.textSecondary }]}>
                      Cuando los clientes soliciten tus servicios profesionales desde tu perfil, las verás aquí en tiempo real.
                    </Text>
                  </View>
                ) : (
                  workerBookings.map((b) => {
                    const clientName = b.clientNameSnapshot || 'Cliente GoodJob';
                    const clientPhoto = b.clientPhotoSnapshot || DEFAULT_AVATAR;
                    const dateStr = b.date || (b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Por acordar');
                    const timeSlot = b.timeSlot || 'Horario pactado';
                    const isPending = !b.status || b.status === 'pending';
                    const isProcessing = processingBookingId === b.id;

                    return (
                      <View key={b.id} style={[styles.bookingCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                        <View style={styles.bookingCardHeader}>
                          <Image source={{ uri: clientPhoto }} style={styles.bookingWorkerAvatar} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.bookingWorkerName, isDark && { color: themeColors.text }]}>{clientName}</Text>
                            <Text style={[styles.bookingWorkerCategory, isDark && { color: themeColors.textSecondary }]}>
                              {b.clientPhoneSnapshot ? `📞 ${b.clientPhoneSnapshot}` : 'Solicitud de cliente'}
                            </Text>
                            <Text style={[styles.bookingDateTime, isDark && { color: themeColors.textSecondary }]}>
                              📅 {dateStr} • ⏰ {timeSlot}
                            </Text>
                          </View>
                          {renderStatusBadge(b.status || 'pending')}
                        </View>

                        {!!b.notes && (
                          <View style={[styles.bookingNotesContainer, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                            <Text style={[styles.bookingNotesLabel, isDark && { color: themeColors.textSecondary }]}>Detalle del trabajo:</Text>
                            <Text style={[styles.bookingNotesText, isDark && { color: themeColors.text }]}>{b.notes}</Text>
                          </View>
                        )}

                        {/* Botones de acción para el trabajador según el estado */}
                        {isPending ? (
                          <View style={styles.workerActionRow}>
                            <TouchableOpacity
                              style={[styles.rejectBtn, isProcessing && { opacity: 0.5 }]}
                              onPress={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              disabled={isProcessing}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
                              <Text style={styles.rejectBtnText}>Rechazar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.acceptBtn, isProcessing && { opacity: 0.5 }]}
                              onPress={() => handleUpdateBookingStatus(b.id, 'accepted')}
                              disabled={isProcessing}
                              activeOpacity={0.8}
                            >
                              {isProcessing ? (
                                <ActivityIndicator size="small" color={COLORS.onPrimary} />
                              ) : (
                                <>
                                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.onPrimary} />
                                  <Text style={styles.acceptBtnText}>Aceptar Solicitud</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        ) : (b.status === 'accepted' || b.status === 'confirmed') ? (
                          <View style={{ marginTop: 12 }}>
                            <TouchableOpacity
                              style={[styles.completeJobBtn, isProcessing && { opacity: 0.5 }]}
                              onPress={() => handleUpdateBookingStatus(b.id, 'completed')}
                              disabled={isProcessing}
                              activeOpacity={0.8}
                            >
                              {isProcessing ? (
                                <ActivityIndicator size="small" color={COLORS.onPrimary} />
                              ) : (
                                <>
                                  <Ionicons name="shield-checkmark" size={18} color={COLORS.onPrimary} />
                                  <Text style={styles.completeJobBtnText}>Marcar Trabajo como Finalizado</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        ) : null}

                        {/* Botón de Chat con el cliente */}
                        <TouchableOpacity
                          style={styles.workerChatBtn}
                          onPress={async () => {
                            const currentUser = auth.currentUser;
                            if (!currentUser) return;
                            // Buscar chat directo con este cliente
                            try {
                              const q = query(
                                collection(db, 'chats'),
                                where('workerId', '==', currentUser.uid),
                                where('userId', '==', b.userId)
                              );
                              const snap = await getDocs(q);
                              if (!snap.empty) {
                                router.push(`/(chat)/${snap.docs[0].id}`);
                                return;
                              }
                            } catch (e) {
                              console.warn('Error finding chat for worker:', e);
                            }
                            // Si no se encuentra con la query exacta, intentar abrir por workerId
                            router.push(`/(chat)/${b.userId}`);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.workerChatBtnText}>Contactar al Cliente</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )
              ) : (
                /* VISTA 1.B: RESERVAS HECHAS (COMO CLIENTE) */
                bookings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={54} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                    <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>No tienes reservas activas</Text>
                    <Text style={[styles.emptySubtitle, isDark && { color: themeColors.textSecondary }]}>
                      Cuando solicites un servicio desde la búsqueda o el perfil de un profesional, aparecerá aquí.
                    </Text>
                    <TouchableOpacity
                      style={[styles.actionButton, isDark && { backgroundColor: themeColors.primary }]}
                      onPress={() => router.push('/(tabs)/search')}
                    >
                      <Text style={[styles.actionButtonText, isDark && { color: themeColors.onPrimary }]}>Explorar profesionales</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  bookings.map((booking) => {
                    const workerName = booking.workerNameSnapshot || 'Profesional GoodJob';
                    const workerCategory = booking.workerCategorySnapshot || booking.serviceType || 'Especialista en servicios';
                    const photo = getWorkerPhoto({
                      id: booking.workerId,
                      userPhotoSnapshot: booking.workerPhotoSnapshot,
                      userNameSnapshot: booking.workerNameSnapshot,
                    });
                    const dateStr = booking.date || (booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Por acordar');
                    const timeSlot = booking.timeSlot || 'Horario pactado';
                    const isReviewed = booking.isReviewed;

                    return (
                      <View key={booking.id} style={[styles.bookingCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                        <View style={styles.bookingCardHeader}>
                          <Image source={{ uri: photo }} style={styles.bookingWorkerAvatar} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.bookingWorkerName, isDark && { color: themeColors.text }]}>{workerName}</Text>
                            <Text style={[styles.bookingWorkerCategory, isDark && { color: themeColors.textSecondary }]}>{workerCategory}</Text>
                            <Text style={[styles.bookingDateTime, isDark && { color: themeColors.textSecondary }]}>
                              📅 {dateStr} • ⏰ {timeSlot}
                            </Text>
                          </View>
                          {renderStatusBadge(booking.status || 'pending')}
                        </View>

                        {!!booking.notes && (
                          <View style={[styles.bookingNotesContainer, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                            <Text style={[styles.bookingNotesLabel, isDark && { color: themeColors.textSecondary }]}>Detalle:</Text>
                            <Text style={[styles.bookingNotesText, isDark && { color: themeColors.text }]} numberOfLines={2}>
                              {booking.notes}
                            </Text>
                          </View>
                        )}

                        {/* Banner destacado para calificar si el trabajo fue completado y aún no tiene reseña */}
                        {booking.status === 'completed' && !isReviewed && (
                          <View style={styles.completedNoticeBanner}>
                            <View style={styles.completedNoticeIcon}>
                              <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.completedNoticeTitle}>¡Servicio Concluido!</Text>
                              <Text style={styles.completedNoticeDesc}>
                                El profesional ha finalizado el trabajo. Cuéntanos cómo fue tu experiencia.
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Botón de Calificación si está completada o disponible para calificar */}
                        <View style={styles.bookingCardFooter}>
                          <TouchableOpacity
                            style={styles.cardSecondaryBtn}
                            onPress={() => router.push(`/(workers)/${booking.workerId}`)}
                          >
                            <Text style={styles.cardSecondaryBtnText}>Ver Perfil</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.cardPrimaryBtn}
                            onPress={async () => {
                              const currentUser = auth.currentUser;
                              if (!currentUser) return;
                              let chatId = booking.workerId;
                              try {
                                const wData = await workerService.getById(booking.workerId);
                                if (wData) {
                                  chatId = await chatService.getOrCreateByWorker(currentUser.uid, wData);
                                }
                              } catch (e) {
                                console.warn('Error opening chat:', e);
                              }
                              router.push(`/(chat)/${chatId}`);
                            }}
                          >
                            <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.onPrimary} />
                            <Text style={styles.cardPrimaryBtnText}>Abrir Chat</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Botón Dejar Reseña (Solo visible o habilitado cuando el trabajo esté completado) */}
                        {booking.status === 'completed' ? (
                          <TouchableOpacity
                            style={[
                              styles.rateWorkerBtn,
                              !isReviewed && styles.rateWorkerBtnHighlighted,
                              isReviewed && styles.ratedWorkerBtn,
                            ]}
                            onPress={() => {
                              if (isReviewed) {
                                showModal('info', 'Ya has calificado el servicio de esta reserva. ¡Muchas gracias!');
                              } else {
                                handleOpenReviewModal(booking);
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isReviewed ? 'checkmark-circle' : 'star'}
                              size={18}
                              color={isReviewed ? COLORS.success : COLORS.onPrimary}
                            />
                            <Text
                              style={[
                                styles.rateWorkerBtnText,
                                !isReviewed && styles.rateWorkerBtnHighlightedText,
                                isReviewed && styles.ratedWorkerBtnText,
                              ]}
                            >
                              {isReviewed ? 'Servicio Calificado' : '⭐ Calificar y Opinar Ahora'}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.pendingCompletionHint}>
                            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.pendingCompletionHintText}>
                              La calificación se habilitará cuando el profesional finalice el servicio.
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )
              )}
            </View>
          )}

          {/* TAB 2: CHATS */}
          {activeTab === 'chats' && (
            <View>
              {chats.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={54} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                  <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>Bandeja de chats vacía</Text>
                  <Text style={[styles.emptySubtitle, isDark && { color: themeColors.textSecondary }]}>
                    Tus conversaciones y mensajes directos con los profesionales contratados o tus clientes aparecerán aquí.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isDark && { backgroundColor: themeColors.primary }]}
                    onPress={() => router.push('/(tabs)/search')}
                  >
                    <Text style={[styles.actionButtonText, isDark && { color: themeColors.onPrimary }]}>Buscar trabajadores</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                chats.map((c: any) => {
                  const currentUser = auth.currentUser;
                  const isMeWorker = currentUser && c.workerId === currentUser.uid;

                  const displayName = isMeWorker
                    ? (c.clientNameSnapshot || 'Cliente GoodJob')
                    : (c.workerNameSnapshot || 'Profesional GoodJob');

                  const photo = isMeWorker
                    ? (c.clientPhotoSnapshot || DEFAULT_AVATAR)
                    : getWorkerPhoto({
                        id: c.workerId,
                        userPhotoSnapshot: c.workerPhotoSnapshot,
                        userNameSnapshot: c.workerNameSnapshot,
                      });

                  const roleLabel = isMeWorker ? 'Cliente' : 'Profesional';
                  const lastMsg = c.lastMessage || 'Conversación iniciada';
                  const lastTime = c.lastMessageAt
                    ? new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : '';

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chatCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(chat)/${c.id}`)}
                    >
                      <Image source={{ uri: photo }} style={styles.chatAvatar} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.chatCardTop}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.chatWorkerName, isDark && { color: themeColors.text }]}>{displayName}</Text>
                            <View style={[styles.chatRoleBadge, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}>
                              <Text style={[styles.chatRoleText, isDark && { color: themeColors.textSecondary }]}>{roleLabel}</Text>
                            </View>
                          </View>
                          {!!lastTime && <Text style={[styles.chatTime, isDark && { color: themeColors.textSecondary }]}>{lastTime}</Text>}
                        </View>
                        <Text style={[styles.chatLastMessage, isDark && { color: themeColors.textSecondary }]} numberOfLines={1}>
                          {lastMsg}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: NOTIFICACIONES / AVISOS */}
          {activeTab === 'notifications' && (
            <View>
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={54} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                  <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>No tienes avisos nuevos</Text>
                  <Text style={[styles.emptySubtitle, isDark && { color: themeColors.textSecondary }]}>
                    Las actualizaciones sobre tus reservas, chats y cambios de estado aparecerán aquí.
                  </Text>
                </View>
              ) : (
                notifications.map((n: any) => {
                  const isRead = n.read;
                  const timeFormatted = n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  let iconName = 'notifications-outline';
                  let iconColor = isDark ? themeColors.primary : COLORS.primary;
                  if (n.type === 'booking') {
                    iconName = 'calendar-outline';
                    iconColor = '#3B82F6';
                  } else if (n.type === 'message') {
                    iconName = 'chatbubble-outline';
                    iconColor = '#10B981';
                  }

                  return (
                    <TouchableOpacity
                      key={n.id}
                      style={[
                        styles.notifCard,
                        isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border },
                        !isRead && (isDark ? { backgroundColor: '#1E1E28', borderLeftColor: '#3B82F6', borderLeftWidth: 4 } : styles.notifCardUnread),
                      ]}
                      activeOpacity={0.8}
                      onPress={async () => {
                        if (!isRead) {
                          try {
                            await notificationService.markAsRead(n.id);
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                            );
                          } catch (e) {
                            console.warn('Error marking read:', e);
                          }
                        }
                        if (n.relatedCollection === 'chats' && n.relatedId) {
                          router.push(`/(chat)/${n.relatedId}`);
                        } else if (n.relatedCollection === 'bookings') {
                          setActiveTab('bookings');
                        }
                      }}
                    >
                      <View style={[styles.notifIconContainer, { backgroundColor: isDark ? themeColors.surfaceLow : COLORS.surfaceLow }]}>
                        <Ionicons name={iconName as any} size={22} color={iconColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.notifTitle, isDark && { color: themeColors.text }, !isRead && (isDark ? { color: '#60A5FA', fontWeight: '700' } : styles.notifTitleUnread)]}>{n.title}</Text>
                          {!isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={[styles.notifBody, isDark && { color: themeColors.textSecondary }]}>{n.body}</Text>
                        {!!timeFormatted && <Text style={[styles.notifTime, isDark && { color: themeColors.textSecondary }]}>{timeFormatted}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 4: FAVORITOS */}
          {activeTab === 'favorites' && (
            <View>
              {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={54} color={isDark ? themeColors.border : COLORS.surfaceVariant} />
                  <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>Sin favoritos guardados</Text>
                  <Text style={[styles.emptySubtitle, isDark && { color: themeColors.textSecondary }]}>
                    Toca el icono de corazón en cualquier profesional para guardarlo en tu lista personal.
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionButton, isDark && { backgroundColor: themeColors.primary }]}
                    onPress={() => router.push('/(tabs)/search')}
                  >
                    <Text style={[styles.actionButtonText, isDark && { color: themeColors.onPrimary }]}>Explorar profesionales</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                favorites.map((fav) => {
                  const name = fav.workerNameSnapshot || 'Profesional GoodJob';
                  const photo = getWorkerPhoto({
                    id: fav.workerId,
                    userPhotoSnapshot: fav.workerPhotoSnapshot,
                    userNameSnapshot: fav.workerNameSnapshot,
                  });
                  const rating = fav.workerRatingSnapshot ? Number(fav.workerRatingSnapshot).toFixed(1) : '5.0';

                  return (
                    <TouchableOpacity
                      key={fav.id}
                      style={styles.favCard}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/(workers)/${fav.workerId}`)}
                    >
                      <Image source={{ uri: photo }} style={styles.favAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.favWorkerName}>{name}</Text>
                        <View style={styles.favRatingRow}>
                          <Ionicons name="star" size={14} color={COLORS.primary} />
                          <Text style={styles.favRatingText}>{rating}</Text>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Text style={styles.favSubtext}>Guardado en favoritos</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal para Calificar Servicio */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.reviewModalCard}>
                <Text style={styles.reviewModalTitle}>Calificar Servicio</Text>
                <Text style={styles.reviewModalSubtitle}>
                  ¿Cómo fue tu experiencia con {selectedBookingForReview?.workerNameSnapshot || 'el profesional'}?
                </Text>

                {/* Estrellas Interactivas (1 a 5) */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                      activeOpacity={0.7}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name={star <= reviewRating ? 'star' : 'star-outline'}
                        size={34}
                        color={star <= reviewRating ? COLORS.star : COLORS.surfaceVariant}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comentario */}
                <TextInput
                  style={styles.reviewTextInput}
                  placeholder="Escribe tu opinión (ej. Puntual, excelente acabado, muy educado)..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  textAlignVertical="top"
                />

                {/* Botones */}
                <View style={styles.reviewModalActions}>
                  <TouchableOpacity
                    style={styles.reviewModalCancelBtn}
                    onPress={() => setReviewModalVisible(false)}
                    disabled={submittingReview}
                  >
                    <Text style={styles.reviewModalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reviewModalSubmitBtn, submittingReview && { opacity: 0.6 }]}
                    onPress={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <ActivityIndicator size="small" color={COLORS.onPrimary} />
                    ) : (
                      <Text style={styles.reviewModalSubmitText}>Enviar Reseña</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal General */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarWrapper: {
    marginBottom: 16,
  },
  tabBarScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabItem: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabItemText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabBadgeTextActive: {
    color: COLORS.onPrimary,
  },
  tabBadgeUnread: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeUnreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Tarjeta de Reserva
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingWorkerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceVariant,
  },
  bookingWorkerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bookingWorkerCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 1,
    marginBottom: 2,
  },
  bookingDateTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingNotesContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 10,
  },
  bookingNotesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bookingNotesText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bookingCardFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cardSecondaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardPrimaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cardPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  rateWorkerBtn: {
    marginTop: 10,
    height: 38,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  ratedWorkerBtn: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  rateWorkerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  ratedWorkerBtnText: {
    color: COLORS.success,
  },
  // Modal de Reseña
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewModalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  reviewModalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reviewTextInput: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 90,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 18,
  },
  reviewModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewModalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewModalSubmitBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  // Tarjeta de Chat
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 10,
    gap: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceVariant,
  },
  chatCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatWorkerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chatTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  chatLastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  // Tarjeta de Favoritos
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 10,
    gap: 12,
  },
  favAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceVariant,
  },
  favWorkerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  favRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  favRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: COLORS.surfaceVariant,
  },
  favSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Sub-tabs para Trabajador vs Cliente
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  subTabItemActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  subTabTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Acciones del Trabajador
  workerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  rejectBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  acceptBtn: {
    flex: 1.4,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  workerChatBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  workerChatBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Badge de rol en el chat
  chatRoleBadge: {
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLORS.surfaceVariant,
  },
  chatRoleText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // Botón Finalizar Trabajo para el Trabajador
  completeJobBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1B5E20', // Verde oscuro profesional
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeJobBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  // Banner de aviso de trabajo completado para el Cliente
  completedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  completedNoticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  completedNoticeDesc: {
    fontSize: 12,
    color: '#388E3C',
    marginTop: 2,
    lineHeight: 16,
  },
  // Botón de calificar destacado
  rateWorkerBtnHighlighted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    height: 42,
  },
  rateWorkerBtnHighlightedText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  // Indicador de calificación pendiente
  pendingCompletionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 10,
  },
  pendingCompletionHintText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  // Tarjetas de Notificaciones
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 10,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    borderLeftWidth: 4,
  },
  notifIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notifBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
