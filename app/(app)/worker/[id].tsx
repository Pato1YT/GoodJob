// Pantalla de Detalle de Profesional (Vinculada con Firestore)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importación de servicios de Firestore y tipos
import { workerService, reviewService } from '../../../src/data/firestore';
import { Worker, Review } from '../../../src/types';

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

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);

  // Estados para los datos de Firestore
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      loadWorkerData(id);
    }
  }, [id]);

  const loadWorkerData = async (workerId: string) => {
    try {
      setLoading(true);
      // Consulta a Firestore: Obtener perfil del profesional
      const workerData = await workerService.getById(workerId);
      setWorker(workerData);

      // Consulta a Firestore: Obtener colección de reseñas relacionadas
      const reviewData = await reviewService.getByWorkerId(workerId);
      setReviews(reviewData);
    } catch (error) {
      console.error('Error al cargar datos de Firestore:', error);
      Alert.alert('Error', 'No se pudieron obtener los detalles del profesional.');
    } finally {
      setLoading(false);
    }
  };

  // Mapeo flexible para asegurar lectura de campos de Firestore sin romper TypeScript
  const w = worker as any;

  const handleRequestService = () => {
    if (!worker) return;
    
    // Obtener nombre formateado desde los campos de Firebase
    const name = `${w?.firstName || ''} ${w?.lastName || ''}`.trim() || w?.userNameSnapshot || 'Profesional';

    router.push({
      pathname: '/worker/booking' as any,
      params: { 
        workerId: worker.id, 
        workerName: name
      },
    });
  };

  // Pantalla de carga mientras responde Firebase
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando perfil desde Firestore...</Text>
      </SafeAreaView>
    );
  }

  // Si el id no existe en la colección 'workers' o 'users'
  if (!worker) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.textSecondary} />
        <Text style={styles.notFoundText}>No se encontró información de este profesional.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Mapeo seguro de campos de Firestore ---
  const fullName = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.userNameSnapshot || 'Profesional GoodJob';
  const categoryTitle = w.title || w.category || (w.bio ? w.bio.split('.')[0] : 'Especialista en servicios');
  const ratingValue = w.avgRating !== undefined ? Number(w.avgRating).toFixed(1) : 'Nuevo';
  const totalReviewsCount = w.totalReviews ?? reviews.length;
  
  // Soporte para arreglos de imágenes en Firestore
  const portfolioImages: string[] = (w.portfolio && w.portfolio.length > 0)
    ? w.portfolio 
    : (w.portfolioUrls && w.portfolioUrls.length > 0)
    ? w.portfolioUrls
    : [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* --- Header --- */}
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
        {/* --- Card Principal de Usuario --- */}
        <View style={styles.profileHeaderCard}>
          <Image 
            source={{ uri: w.avatarUrl || w.photoURL || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.workerName}>{fullName}</Text>
          <Text style={styles.workerCategory}>{categoryTitle}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>{ratingValue} ({totalReviewsCount})</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.badge}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.badgeText}>{w.available !== false ? 'Disponible' : 'Ocupado'}</Text>
            </View>
          </View>
        </View>

        {/* --- Métricas / Stats de Firestore --- */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TRABAJOS</Text>
            <Text style={styles.statValue}>{(w.completedJobs ?? w.completedJobsCount) ?? 0}+</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>EXPERIENCIA</Text>
            <Text style={styles.statValue}>{(w.yearsExperience ?? w.experienceYears) ?? 1} años</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TARIFA</Text>
            <Text style={styles.statValue}>
              ${w.hourlyRate || 0}
              <Text style={styles.statUnit}>/hr</Text>
            </Text>
          </View>
        </View>

        {/* --- Biografía --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>
            {w.bio || 'Este profesional aún no ha añadido una descripción a su perfil.'}
          </Text>
        </View>

        {/* --- Galería de Trabajos --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos recientes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            {portfolioImages.map((imgUrl: string, index: number) => (
              <Image key={index} source={{ uri: imgUrl }} style={styles.portfolioImage} />
            ))}
          </ScrollView>
        </View>

        {/* --- Reseñas obtenidas de Firebase --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Opiniones</Text>
            <Text style={styles.ratingSummary}>★ {ratingValue}</Text>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.emptyReviewsText}>Aún no hay opiniones registradas para este profesional.</Text>
          ) : (
            reviews.map((rev: any) => (
              <View key={rev.id || Math.random().toString()} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{rev.userName || rev.authorName || 'Usuario'}</Text>
                  <Text style={styles.reviewDate}>
                    {rev.createdAt?.toDate 
                      ? rev.createdAt.toDate().toLocaleDateString() 
                      : rev.createdAt 
                      ? new Date(rev.createdAt).toLocaleDateString() 
                      : 'Reciente'}
                  </Text>
                </View>
                <View style={styles.reviewRatingRow}>
                  {Array.from({ length: 5 }).map((_, i: number) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(rev.rating || 5) ? 'star' : 'star-outline'}
                      size={14}
                      color={COLORS.primary}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* --- Footer de Acción --- */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bottomPriceLabel}>Precio orientativo</Text>
          <Text style={styles.bottomPriceValue}>
            ${w.hourlyRate || 0}
            <Text style={styles.bottomPriceUnit}>/hora</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} onPress={handleRequestService}>
          <Text style={styles.ctaButtonText}>Solicitar Servicio</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos de UI ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.onPrimary,
    fontWeight: 'bold',
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
  emptyReviewsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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