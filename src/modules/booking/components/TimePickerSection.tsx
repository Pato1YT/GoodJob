import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../../shared/theme/colors';

interface TimeSlot {
  time: string;
  label: string;
  state: string;
}

interface TimePickerSectionProps {
  timeSlots: TimeSlot[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  timeSlots,
  selectedTime,
  onSelectTime,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Selecciona el horario</Text>
      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = slot.state === 'disabled';

          return (
            <TouchableOpacity
              key={slot.time}
              disabled={isDisabled}
              activeOpacity={0.8}
              style={[
                styles.timeCard,
                isSelected && styles.selectedTimeCard,
                isDisabled && styles.disabledTimeCard,
              ]}
              onPress={() => onSelectTime(slot.time)}
            >
              <Text style={[styles.timeText, isSelected && styles.selectedTimeText, isDisabled && styles.disabledText]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeCard: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedTimeCard: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  disabledTimeCard: { opacity: 0.4 },
  timeText: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  selectedTimeText: { color: '#FFFFFF' },
  disabledText: { color: COLORS.textMuted },
});