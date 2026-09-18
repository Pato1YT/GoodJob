import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../shared/theme/colors';

interface DateItem {
  day: string;
  number: string;
  full: string;
  status: string;
}

interface DatePickerSectionProps {
  dates: DateItem[];
  selectedDate: string;
  onSelectDate: (fullDate: string) => void;
}

export const DatePickerSection: React.FC<DatePickerSectionProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Selecciona la fecha</Text>
          <Text style={styles.sectionSubText}>Septiembre 2026</Text>
        </View>
        <View style={styles.weekSelector}>
          <TouchableOpacity><Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} /></TouchableOpacity>
          <Text style={styles.weekText}>Semana</Text>
          <TouchableOpacity><Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dates.map((item) => {
          const isSelected = selectedDate === item.full;
          const isDisabled = item.status === 'disabled';

          return (
            <TouchableOpacity
              key={item.full}
              disabled={isDisabled}
              activeOpacity={0.8}
              style={[
                styles.dateCard,
                isSelected && styles.selectedDateCard,
                isDisabled && styles.disabledDateCard,
              ]}
              onPress={() => onSelectDate(item.full)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText, isDisabled && styles.disabledText]}>
                {item.day}
              </Text>
              <Text style={[styles.numberText, isSelected && styles.selectedText, isDisabled && styles.disabledText]}>
                {item.number}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  sectionSubText: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weekText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  dateRow: { gap: 10, paddingVertical: 2 },
  dateCard: {
    width: 66,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedDateCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledDateCard: { opacity: 0.45 },
  dayText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  numberText: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  selectedText: { color: '#FFFFFF' },
  disabledText: { color: COLORS.textMuted },
});