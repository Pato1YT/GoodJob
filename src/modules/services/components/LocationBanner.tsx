import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../shared/theme/colors';

interface LocationBannerProps {
  location?: string;
  onEditPress?: () => void;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  location = 'Av. de la Castellana 95, Madrid, España',
  onEditPress,
}) => {
  return (
    <View style={styles.locationCard}>
      <Ionicons name="location" size={22} color={COLORS.primary} style={styles.locationIcon} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationLabel}>Tu ubicación</Text>
        <Text style={styles.locationValue} numberOfLines={1}>
          {location}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={onEditPress}>
        <Ionicons name="pencil" size={14} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
});