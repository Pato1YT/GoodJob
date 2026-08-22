import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { colors, spacing } from './common';

interface WorkerCardProps {
  name: string;
  title: string;
  rating: number;
  distance: number;
  photo?: string;
  onPress: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  name,
  title,
  rating,
  distance,
  photo,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Photo Placeholder */}
      <View style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.placeholderText}>👤</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Rating & Distance */}
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceIcon}>📍</Text>
            <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.md,
  },

  photoContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#2a2a2a',
  },

  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },

  placeholderText: {
    fontSize: 48,
  },

  infoContainer: {
    padding: spacing.md,
    backgroundColor: '#1a1a1a',
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },

  title: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.md,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  star: {
    fontSize: 12,
  },

  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },

  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  distanceIcon: {
    fontSize: 12,
  },

  distance: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default WorkerCard;
