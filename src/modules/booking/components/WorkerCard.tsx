import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../shared/theme/colors';

interface WorkerCardProps {
  workerName?: string;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ workerName }) => {
  return (
    <View style={styles.workerCard}>
      <View style={styles.workerCardTop}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.badgeVerified}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.workerInfoMain}>
          <Text style={styles.workerLabel}>TRABAJADOR SELECCIONADO</Text>
          <Text style={styles.workerName}>{workerName || 'Ing. Miguel Ángel Flores'}</Text>
          <Text style={styles.workerSpecialty}>Especialista Eléctrico & Telecomunicaciones</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Disponible hoy</Text>
        </View>
      </View>

      <View style={styles.workerCardBottom}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>4.9</Text>
          <Text style={styles.reviewsText}>(128 reseñas)</Text>
        </View>
        <Text style={styles.bulletSeparator}>•</Text>
        <Text style={styles.priceText}>$350/visita</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  workerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
  },
  workerCardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeVerified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfoMain: { flex: 1 },
  workerLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5 },
  workerName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginTop: 1 },
  workerSpecialty: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  workerCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary },
  reviewsText: { fontSize: 11, color: COLORS.textMuted },
  bulletSeparator: { marginHorizontal: 8, color: COLORS.textMuted, fontSize: 10 },
  priceText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
});