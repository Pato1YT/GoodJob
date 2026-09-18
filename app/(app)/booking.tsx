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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { bookingService } from '../../src/data/firestore';
import { COLORS } from '../../src/modules/shared/theme/colors';
import { CustomModal, ModalType } from '../../src/modules/shared/components/CustomModal';

// Submódulos de Booking
import { WorkerCard } from '../../src/modules/booking/components/WorkerCard';
import { DatePickerSection } from '../../src/modules/booking/components/DatePickerSection';
import { TimePickerSection } from '../../src/modules/booking/components/TimePickerSection';

const DATES = [
  { day: 'Lun', number: '07', full: '2026-09-07', status: 'available' },
  { day: 'Mar', number: '08', full: '2026-09-08', status: 'available' },
  { day: 'Mié', number: '09', full: '2026-09-09', status: 'available' },
  { day: 'Jue', number: '10', full: '2026-09-10', status: 'available' },
  { day: 'Vie', number: '11', full: '2026-09-11', status: 'disabled' },
];

const TIME_SLOTS = [
  { time: '09:00 AM', label: 'Más solicitado', state: 'active' },
  { time: '11:00 AM', label: 'Libre', state: 'available' },
  { time: '02:00 PM', label: 'Libre', state: 'available' },
  { time: '04:00 PM', label: 'Libre', state: 'available' },
  { time: '06:00 PM', label: 'Último turno', state: 'available' },
  { time: '07:30 PM', label: 'Ocupado', state: 'disabled' },
];

const QUICK_TAGS = ['+ Reparación urgente', '+ Revisión de instalación', '+ Cotización'];

export default function BookingScreen() {
  const { workerId, workerName } = useLocalSearchParams<{ workerId?: string; workerName?: string }>();

  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].time);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: ModalType;
    title: string;
    message: string;
    buttonText: string;
    onCloseAction: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttonText: 'Aceptar',
    onCloseAction: () => {},
  });

  const hideModal = () => setModalConfig((prev) => ({ ...prev, visible: false }));

  const handleQuickTagPress = (tag: string) => {
    const cleanTag = tag.replace('+ ', '');
    if (!description.includes(cleanTag)) {
      setDescription((prev) => (prev ? `${prev}, ${cleanTag}` : cleanTag));
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const bookingPayload = {
        workerId: workerId || '1',
        workerName: workerName || 'Ing. Miguel Ángel Flores',
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

      setModalConfig({
        visible: true,
        type: 'success',
        title: '¡Reserva Solicitada!',
        message: `Has agendado con ${workerName || 'el profesional'} para el ${selectedDate} a las ${selectedTime}.`,
        buttonText: 'Ir al Chat',
        onCloseAction: () => {
          hideModal();
          router.push(`/chat/${workerId || '1'}`);
        },
      });
    } catch (error) {
      setModalConfig({
        visible: true,
        type: 'danger',
        title: 'Error de reserva',
        message: 'No se pudo registrar tu solicitud. Por favor intenta nuevamente.',
        buttonText: 'Entendido',
        onCloseAction: hideModal,
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
        <TouchableOpacity style={styles.iconCircleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.stepIndicator}>PASO 2 DE 3</Text>
          <Text style={styles.headerTitle}>Agendar Servicio</Text>
        </View>
        <TouchableOpacity style={styles.iconCircleBtn}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={styles.progressBarFill} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WorkerCard workerName={workerName} />

        <DatePickerSection
          dates={DATES}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <TimePickerSection
          timeSlots={TIME_SLOTS}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        {/* Sección Notas */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Detalles del trabajo <Text style={styles.optionalText}>(Opcional)</Text>
            </Text>
            <Text style={styles.charCountText}>Máx. 250 caracteres</Text>
          </View>

          <View style={styles.quickTagsRow}>
            {QUICK_TAGS.map((tag, idx) => (
              <TouchableOpacity key={idx} style={styles.chipButton} onPress={() => handleQuickTagPress(tag)}>
                <Text style={styles.chipText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.notesBox}>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe brevemente lo que necesitas reparar o instalar..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={250}
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.88}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Confirmar y Solicitar</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onClose={modalConfig.onCloseAction}
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
    paddingVertical: 10,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: { alignItems: 'center' },
  stepIndicator: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  progressBarTrack: { height: 3, backgroundColor: COLORS.border, width: '100%', marginBottom: 4 },
  progressBarFill: { height: '100%', width: '66%', backgroundColor: COLORS.primary },
  content: { paddingHorizontal: 20, paddingBottom: 110 },
  section: { marginTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  optionalText: { fontSize: 12, fontWeight: '400', color: COLORS.textMuted },
  charCountText: { fontSize: 10, color: COLORS.textMuted },
  quickTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chipButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary },
  notesBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  notesInput: { fontSize: 13, color: COLORS.textPrimary, height: 75 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});