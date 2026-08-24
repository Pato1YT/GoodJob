// Pantalla de Detalle de Profesional
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// --- Paleta de colores Monochrome Premium ---
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
};

// Mock data extendida del profesional
const WORKER_DATA = {
  id: '1',
  name: 'Carlos Rodríguez',
  category: 'Fontanero Profesional',
  rating: 4.8,
  reviewsCount: 42,
  completedJobs: 128,
  distance: '1.2 km',
  price: '$30',
  priceUnit: '/hora',
  experience: '8 años',
  about:
    'Especialista en fontanería residencial y comercial. Diagnóstico rápido de fugas, instalación de grifería, desatascos e instalaciones complejas con más de 8 años de experiencia en el sector.',
  imageUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  portfolio: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Laura M.',
      rating: 5,
      date: 'Hace 2 días',
      comment: 'Excelente servicio. Llegó puntual, resolvió la fuga rápidamente y dejó todo limpio.',
    },
    {
      id: 'r2',
      author: 'Andrés P.',
      rating: 4.5,
      date: 'Hace 1 semana',
      comment: 'Muy profesional y amable. Explica con claridad el problema antes de reparar.',
    },
  ],
};

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // En producción buscarías el registro según el 'id'
  const worker = WORKER_DATA;

  const handleRequestService = () => {
    // Redirige al flujo de reserva pasando el ID del trabajador
    router.push({
      pathname: '/booking',
      params: { workerId: worker.id, workerName: worker.name },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* --- Header Superior --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil Profesional</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setIsFavorite(!isFavorite)}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? COLORS.error : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* --- Card de Información Principal --- */}
        <View style={styles.profileHeaderCard}>
          <Image source={{ uri: worker.imageUrl }} style={styles.avatar} />
          <Text style={styles.workerName}>{worker.name}</Text>
          <Text style={styles.workerCategory}>{worker.category}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>{worker.rating} ({worker.reviewsCount})</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.badge}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.badgeText}>{worker.distance}</Text>
            </View>
          </View>
        </View>

        {/* --- Estadísticas Rápidas --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TRABAJOS</Text>
            <Text style={styles.statValue}>{worker.completedJobs}+</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>EXPERIENCIA</Text>
            <Text style={styles.statValue}>{worker.experience}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TARIFA</Text>
            <Text style={styles.statValue}>{worker.price}<Text style={styles.statUnit}>{worker.priceUnit}</Text></Text>
          </View>
        </View>

        {/* --- Biografía --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>{worker.about}</Text>
        </View>

        {/* --- Galería de Trabajos Anteriores --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos recientes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            {worker.portfolio.map((imgUrl, index) => (
              <Image key={index} source={{ uri: imgUrl }} style={styles.portfolioImage} />
            ))}
          </ScrollView>
        </View>

        {/* --- Reseñas --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Opiniones</Text>
            <Text style={styles.ratingSummary}>★ {worker.rating}</Text>
          </View>

          {worker.reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{rev.author}</Text>
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>
              <View style={styles.reviewRatingRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(rev.rating) ? 'star' : 'star-outline'}
                    size={14}
                    color={COLORS.primary}
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{rev.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- Barra Inferior Flotante de Acción --- */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bottomPriceLabel}>Precio orientativo</Text>
          <Text style={styles.bottomPriceValue}>{worker.price}<Text style={styles.bottomPriceUnit}>{worker.priceUnit}</Text></Text>
        </View>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} onPress={handleRequestService}>
          <Text style={styles.ctaButtonText}>Solicitar Servicio</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: COLORS.surfaceVariant,
  },
  workerName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  workerCategory: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dot: {
    color: COLORS.surfaceVariant,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceVariant,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  galleryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  portfolioImage: {
    width: 140,
    height: 100,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: COLORS.surfaceVariant,
  },
  ratingSummary: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  reviewComment: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bottomPriceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});