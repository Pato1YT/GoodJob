// Pantalla de Reserva de Servicio - Conectada a Firestore con fechas dinámicas
import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { doc, updateDoc } from 'firebase/firestore';
import { bookingService, chatService, workerService, userService } from '../../src/data/firestore';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { auth, db } from '../../src/config/firebase';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { appNotificationService } from '../../src/services/notificationManager';
import { useThemeStore } from '../../src/utils/themeStore';

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

// Generador de los próximos 7 días a partir de hoy
function generateUpcomingDays() {
  const days: { day: string; number: string; full: string; label: string }[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const full = `${year}-${month}-${day}`;

    days.push({
      day: i === 0 ? 'Hoy' : dayNames[d.getDay()],
      number: String(d.getDate()),
      full,
      label: `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`,
    });
  }
  return days;
}

export default function BookingScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = useThemeStore((s) => s.colors);
  const styles = React.useMemo(() => createStyles(themeColors, isDark), [themeColors, isDark]);

  const { workerId, workerName, workerCategory } = useLocalSearchParams<{
    workerId?: string;
    workerName?: string;
    workerCategory?: string;
  }>();

  const availableDates = useMemo(() => generateUpcomingDays(), []);
  const [selectedDate, setSelectedDate] = useState(availableDates[0].full);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado del CustomModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    message: string;
    onCloseAction?: () => void;
  }>({
    type: 'danger',
    message: '',
  });

  const showModal = (type: ModalType, message: string, onCloseAction?: () => void) => {
    setModalConfig({ type, message, onCloseAction });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
    }
  };

  const handleConfirmBooking = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showModal('info', 'Debes iniciar sesión para agendar un servicio.');
      return;
    }

    if (!workerId) {
      showModal('danger', 'No se ha especificado el profesional.');
      return;
    }

    try {
      setLoading(true);

      // Obtener datos del cliente y del trabajador
      const [workerData, clientData] = await Promise.all([
        workerService.getById(workerId),
        userService.getById(currentUser.uid),
      ]);

      const w = workerData as any;
      const c = clientData as any;
      const resolvedWorkerName = `${w?.firstName || ''} ${w?.lastName || ''}`.trim() || workerData?.userNameSnapshot || workerName || 'Profesional';
      const resolvedWorkerCategory = w?.title || w?.category || (w?.bio ? w.bio.split('.')[0] : '') || workerCategory || 'Especialista en servicios';
      const resolvedWorkerPhoto = getWorkerPhoto({ id: workerId, ...w, ...workerData });

      const resolvedClientName = `${c?.firstName || ''} ${c?.lastName || ''}`.trim() || currentUser.displayName || 'Cliente GoodJob';
      const resolvedClientPhone = c?.phone || '';
      const resolvedClientPhoto = c?.photoUrl || currentUser.photoURL || '';

      // Guardar reserva en Firestore con datos completos de ambas partes
      await bookingService.create({
        userId: currentUser.uid,
        workerId,
        workerNameSnapshot: resolvedWorkerName,
        workerCategorySnapshot: resolvedWorkerCategory,
        workerPhotoSnapshot: resolvedWorkerPhoto,
        clientNameSnapshot: resolvedClientName,
        clientPhoneSnapshot: resolvedClientPhone,
        clientPhotoSnapshot: resolvedClientPhoto,
        date: selectedDate,
        timeSlot: selectedTime,
        notes: description.trim(),
        status: 'pending',
      } as any);

      // Obtener o crear chat con este profesional para iniciar comunicación de inmediato
      let chatId = workerId;
      try {
        if (workerData) {
          chatId = await chatService.getOrCreateByWorker(currentUser.uid, workerData);
          // Actualizar snapshot del cliente en el chat para que el trabajador vea quién le escribe
          if (chatId) {
            await updateDoc(doc(db, 'chats', chatId), {
              clientNameSnapshot: resolvedClientName,
              clientPhotoSnapshot: resolvedClientPhoto,
              clientPhoneSnapshot: resolvedClientPhone,
            }).catch(() => {});
          }
        }
      } catch (chatErr) {
        console.warn('Could not auto-create chat channel:', chatErr);
      }

      // Notificar al trabajador de la nueva reserva entrante
      await appNotificationService.notifyUser({
        userId: workerId,
        title: '💼 ¡Nueva Solicitud de Reserva!',
        body: `${resolvedClientName} ha solicitado tus servicios para el ${selectedDate} a las ${selectedTime}.`,
        type: 'booking',
        relatedId: workerId,
        relatedCollection: 'bookings',
      });

      showModal(
        'success',
        `¡Reserva solicitada con éxito!\nHas agendado con ${workerName || 'el profesional'} para el ${selectedDate} a las ${selectedTime}.`,
        () => {
          router.replace(`/(chat)/${chatId}`);
        }
      );
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      showModal('danger', 'No se pudo registrar tu solicitud. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={themeColors.statusBar} backgroundColor={themeColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Servicio</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info del Profesional */}
        <View style={styles.workerInfoCard}>
          <View style={styles.workerIconContainer}>
            <Ionicons name="construct-outline" size={24} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerInfoLabel}>Profesional a contratar</Text>
            <Text style={styles.workerInfoName}>{workerName || 'Profesional GoodJob'}</Text>
            {!!workerCategory && (
              <Text style={styles.workerInfoCategory}>{workerCategory}</Text>
            )}
          </View>
        </View>

        {/* Seleccionar Fecha */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona la fecha</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.full;
              return (
                <TouchableOpacity
                  key={item.full}
                  style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                  onPress={() => setSelectedDate(item.full)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.numberText, isSelected && styles.selectedText]}>
                    {item.number}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Seleccionar Horario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona el horario</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
                  onPress={() => setSelectedTime(time)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isSelected ? themeColors.onPrimary : themeColors.textSecondary}
                  />
                  <Text style={[styles.timeText, isSelected && styles.selectedText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Detalles del trabajo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles o requerimientos (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe brevemente qué necesitas realizar (ej. fuga en lavabo, cambio de cerradura, revisión eléctrica)..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Confirmar */}
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton]}
          activeOpacity={0.85}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={themeColors.onPrimary} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar y Solicitar</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color={themeColors.onPrimary} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Reutilizable */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({
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
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  workerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card || COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.surfaceVariant,
    marginBottom: 24,
    gap: 14,
  },
  workerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  workerInfoName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  workerInfoCategory: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  dateRow: {
    gap: 10,
  },
  dateCard: {
    width: 66,
    height: 74,
    backgroundColor: COLORS.card || COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedText: {
    color: COLORS.onPrimary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.card || COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.surfaceVariant,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textInput: {
    backgroundColor: COLORS.inputBg || COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.surfaceVariant,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});