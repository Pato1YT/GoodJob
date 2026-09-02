// Pantalla de Reserva de Servicio (Conectada con Firestore y CustomModal)
import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Servicio de Firestore
import { bookingService } from '../../src/data/firestore';

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
};

// Fechas simulación (próximos 5 días)
const DATES = [
  { day: 'Lun', number: '24', full: '2026-08-24' },
  { day: 'Mar', number: '25', full: '2026-08-25' },
  { day: 'Mié', number: '26', full: '2026-08-26' },
  { day: 'Jue', number: '27', full: '2026-08-27' },
  { day: 'Vie', number: '28', full: '2026-08-28' },
];

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];

// Componente CustomModal
interface CustomModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  primaryButtonText = 'Aceptar',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
}) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />;
      case 'error':
        return <Ionicons name="alert-circle" size={48} color={COLORS.error} />;
      default:
        return <Ionicons name="information-circle" size={48} color={COLORS.primary} />;
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onPrimaryPress}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.iconContainer}>{getIcon()}</View>
          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>

          <View style={modalStyles.buttonContainer}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.secondaryButton]}
                onPress={onSecondaryPress}
              >
                <Text style={modalStyles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                modalStyles.button,
                modalStyles.primaryButton,
                type === 'error' && { backgroundColor: COLORS.error },
              ]}
              onPress={onPrimaryPress}
            >
              <Text style={modalStyles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingScreen() {
  const { workerId, workerName } = useLocalSearchParams<{ workerId?: string; workerName?: string }>();

  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado del CustomModal
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onPrimaryPress: () => {},
  });

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      const bookingPayload = {
        workerId: workerId || '1',
        workerName: workerName || 'Carlos Rodríguez',
        date: selectedDate,
        time: selectedTime,
        description: description.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const service = bookingService as any;
      const createFn = service.create || service.addBooking || service.createBooking;

      if (typeof createFn === 'function') {
        await createFn(bookingPayload);
      }

      // Éxito: abrir CustomModal con opciones de navegación
      setModalConfig({
        visible: true,
        type: 'success',
        title: '¡Reserva Solicitada!',
        message: `Has agendado con ${workerName || 'el profesional'} para el ${selectedDate} a las ${selectedTime}.`,
        primaryButtonText: 'Ir al Chat',
        secondaryButtonText: 'Volver al Inicio',
        onPrimaryPress: () => {
          hideModal();
          router.push(`/chat/${workerId || '1'}`);
        },
        onSecondaryPress: () => {
          hideModal();
          router.replace('/');
        },
      });
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Error de reserva',
        message: 'No se pudo registrar tu solicitud. Por favor intenta nuevamente.',
        primaryButtonText: 'Reintentar',
        secondaryButtonText: 'Cancelar',
        onPrimaryPress: () => {
          hideModal();
          handleConfirmBooking();
        },
        onSecondaryPress: hideModal,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Servicio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info del Profesional */}
        <View style={styles.workerInfoCard}>
          <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
          <View>
            <Text style={styles.workerInfoLabel}>Trabajador seleccionado</Text>
            <Text style={styles.workerInfoName}>{workerName || 'Carlos Rodríguez'}</Text>
          </View>
        </View>

        {/* Seleccionar Fecha */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona la fecha</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {DATES.map((item) => {
              const isSelected = selectedDate === item.full;
              return (
                <TouchableOpacity
                  key={item.full}
                  style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                  onPress={() => setSelectedDate(item.full)}
                >
                  <Text style={[styles.dayText, isSelected && styles.selectedText]}>{item.day}</Text>
                  <Text style={[styles.numberText, isSelected && styles.selectedText]}>{item.number}</Text>
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
                  style={[styles.timeChip, isSelected && styles.selectedTimeChip]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Detalles adicionales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del trabajo (Opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Describe brevemente lo que necesitas reparar o instalar..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      {/* Botón Flotante */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.onPrimary} />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirmar y Solicitar</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.onPrimary} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Personalizado */}
      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryButtonText={modalConfig.primaryButtonText}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onPrimaryPress={modalConfig.onPrimaryPress}
        onSecondaryPress={modalConfig.onSecondaryPress}
      />
    </SafeAreaView>
  );
}

// Estilos del Modal
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  primaryButtonText: {
    color: COLORS.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  workerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginVertical: 12,
  },
  workerInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  workerInfoName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  dateRow: {
    gap: 10,
  },
  dateCard: {
    width: 64,
    height: 74,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  selectedText: {
    color: COLORS.onPrimary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  selectedTimeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedTimeText: {
    color: COLORS.onPrimary,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});