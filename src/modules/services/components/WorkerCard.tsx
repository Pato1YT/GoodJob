import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Worker } from '../../../types';
import { COLORS } from '../../shared/theme/colors';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

interface WorkerCardProps {
  worker: Worker;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPressProfile: (id: string) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  isFavorite,
  onToggleFavorite,
  onPressProfile,
}) => {
  const name = worker.userNameSnapshot || 'Trabajador';
  const photo = worker.userPhotoSnapshot || DEFAULT_AVATAR;
  const rating = worker.avgRating ? worker.avgRating.toFixed(1) : '5.0';
  const experience = worker.yearsExperience ? `${worker.yearsExperience} años` : 'N/A';
  const bio = worker.bio || 'Profesional de servicios';

  return (
    <View style={styles.proCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo }} style={styles.proImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite(worker.id)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? COLORS.error : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.proContent}>
        <Text style={styles.proName}>{name}</Text>
        <Text style={styles.proCategory}>{bio}</Text>

        <View style={styles.proRatingRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.distanceBadge}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.distanceText}>Disponible</Text>
          </View>
        </View>

        <View style={styles.proDetailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>RESEÑAS</Text>
            <Text style={styles.detailValue}>{worker.totalReviews || 0}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>EXPERIENCIA</Text>
            <Text style={styles.detailValue}>{experience}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={() => onPressProfile(worker.id)}
        >
          <Text style={styles.profileButtonText}>Ver Perfil</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  proCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  proImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceVariant,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  proContent: {
    padding: 20,
  },
  proName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  proRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: COLORS.surfaceVariant,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  proDetailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  detailBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    padding: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    marginTop: 16,
    height: 48,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});