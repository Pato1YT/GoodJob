// pantalla principal de Good Job - Conectada a Firestore con datos reales
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { categoryService, workerService } from '../../src/data/firestore';
import { Category, Worker } from '../../src/types';
import { CustomModal, ModalType } from '../../src/components/CustomModal';

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

// Imagen por defecto si un trabajador no tiene foto en Firestore
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para el Modal Reutilizable
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    message: string;
    onCloseAction?: () => void;
  }>({
    type: 'danger',
    message: '',
  });

  const showModal = (type: ModalType, message: string, onCloseAction?: () => void) => {
    setModalConfig({
      type,
      message,
      onCloseAction,
    });
    setModalVisible(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Peticiones en paralelo a Firestore
      const [catsData, workersData] = await Promise.all([
        categoryService.getAll(),
        workerService.getAvailable(20),
      ]);
      setCategories(catsData);
      setProfessionals(workersData);
    } catch (error: any) {
      console.error('Error al cargar información de Firestore:', error);
      showModal(
        'danger',
        'Ocurrió un error al cargar la información. Por favor, reintenta.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/search',
      params: { category: categoryName },
    });
  };

  const handleSettings = () => {
    router.push('/(app)/profile');
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
    }
  };

  // Asigna un ícono según el nombre de la categoría si no hay un iconName guardado
  const renderCategoryIcon = (category: Category) => {
    const color = COLORS.primary;
    const size = 26;
    const nameLower = category.name.toLowerCase();

    if (nameLower.includes('fontan') || nameLower.includes('plumb')) {
      return <MaterialIcons name="plumbing" size={size} color={color} />;
    }
    if (nameLower.includes('limp') || nameLower.includes('clean')) {
      return <MaterialIcons name="cleaning-services" size={size} color={color} />;
    }
    if (nameLower.includes('jard') || nameLower.includes('grass')) {
      return <MaterialIcons name="grass" size={size} color={color} />;
    }
    if (nameLower.includes('electr')) {
      return <MaterialIcons name="electrical-services" size={size} color={color} />;
    }

    return <Ionicons name="build-outline" size={size} color={color} />;
  };

  // Loader centrado mientras descarga de Firestore
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* --- Top App Bar --- */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="work" size={28} color={COLORS.primary} />
          <Text style={styles.logoText}>GoodJobs</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Location Banner --- */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={22} color={COLORS.primary} style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Tu ubicación</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              Av. de la Castellana 95, Madrid, España
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
            <Ionicons name="pencil" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* --- Soluciones Rápidas (Categorías Reales) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluciones rápidas</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No hay categorías disponibles</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(cat.name)}
                  >
                    <View style={styles.categoryIconContainer}>
                      {renderCategoryIcon(cat)}
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* --- Profesionales Recomendados (Datos Reales de Firestore) --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleHeader}>
              Profesionales recomendados para ti
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {professionals.length === 0 ? (
            <Text style={styles.emptyText}>No se encontraron trabajadores en este momento</Text>
          ) : (
            professionals.map((pro) => {
              const isFav = favorites.includes(pro.id);
              const name = pro.userNameSnapshot || 'Trabajador';
              const photo = pro.userPhotoSnapshot || DEFAULT_AVATAR;
              const rating = pro.avgRating ? pro.avgRating.toFixed(1) : '5.0';
              const experience = pro.yearsExperience ? `${pro.yearsExperience} años` : 'N/A';
              const bio = pro.bio || 'Profesional de servicios';

              return (
                <View key={pro.id} style={styles.proCard}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: photo }} style={styles.proImage} />
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      activeOpacity={0.8}
                      onPress={() => toggleFavorite(pro.id)}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFav ? COLORS.error : COLORS.primary}
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
                        <Text style={styles.detailValue}>{pro.totalReviews || 0}</Text>
                      </View>
                      <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>EXPERIENCIA</Text>
                        <Text style={styles.detailValue}>{experience}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.profileButton}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/worker/${pro.id}`)}
                    >
                      <Text style={styles.profileButtonText}>Ver Perfil</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal Reutilizable de Alertas */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={handleModalClose}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitleHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    maxWidth: '70%',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
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