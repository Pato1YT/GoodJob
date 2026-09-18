import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../shared/theme/colors';

interface PasswordStrengthBarProps {
  strength: number;
  label: string;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({
  strength,
  label,
}) => {
  const getLabelColor = () => {
    if (strength <= 1) return COLORS.error;
    if (strength === 2) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < strength && { backgroundColor: getLabelColor() },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: getLabelColor() }]}>
        Fortaleza: {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
  },
  bar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceVariant,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});