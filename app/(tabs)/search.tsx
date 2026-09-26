// Pantalla de Búsqueda y Filtros - Conectada a Firestore con diseño armónico
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { workerService, categoryService, favoriteService } from '../../src/data/firestore';
import { Worker, Category } from '../../src/types';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { auth } from '../../src/config/firebase';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { useThemeStore } from '../../src/utils/themeStore';

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

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400';

export default function SearchScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = useThemeStore((s) => s.colors);

  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de datos
  const [professionals, setProfessionals] = useState<Worker[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado para CustomModal
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
    setModalConfig({ type, message, onCloseAction });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
    }
  };

  // 1. Cargar categorías dinámicas y trabajadores al montar
  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Sincronizar parámetro de categoría inicial si viene en la navegación
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar categorías reales de Firestore
      try {
        const catDocs = await categoryService.getAll();
        if (catDocs && catDocs.length > 0) {
          const catNames = ['Todos', ...catDocs.map((c) => c.name)];
          setCategories(catNames);
        } else {
          setCategories(['Todos', 'Fontanería', 'Limpieza', 'Jardinería', 'Electricidad', 'Pintura']);
        }
      } catch (err) {
        console.warn('Error loading categories:', err);
        setCategories(['Todos', 'Fontanería', 'Limpieza', 'Jardinería', 'Electricidad', 'Pintura']);
      }

      // Cargar trabajadores disponibles
      const workersData = await workerService.getAvailable(50);
      setProfessionals(workersData || []);

      // Cargar favoritos del usuario actual
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userFavs = await favoriteService.getByUserId(currentUser.uid);
          setFavorites(userFavs.map((f) => f.workerId));
        } catch (favErr) {
          console.warn('Error loading favorites in search:', favErr);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos en búsqueda:', error);
      showModal(
        'danger',
        'No se pudieron cargar los profesionales. Por favor verifica tu conexión.',
        () => loadInitialData()
      );
    } finally {
      setLoading(false);
    }
  };

  // Alternar favorito
  const toggleFavorite = async (pro: Worker) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showModal('info', 'Debes iniciar sesión para guardar favoritos.');
      return;
    }

    const isFav = favorites.includes(pro.id);
    // Optimista
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== pro.id) : [...prev, pro.id]
    );

    try {
      await favoriteService.toggle(currentUser.uid, pro);
    } catch (error) {
      console.error('Error al cambiar favorito en búsqueda:', error);
      // Revertir
      setFavorites((prev) =>
        isFav ? [...prev, pro.id] : prev.filter((id) => id !== pro.id)
      );
    }
  };

  // 3. Filtrado dinámico por categoría y por texto (nombre, bio, categoría, habilidades)
  const filteredProfessionals = professionals.filter((pro) => {
    const w = pro as any;
    const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.userNameSnapshot || '';
    const category = w.category || w.roleTitle || w.title || '';
    const bio = w.bio || '';
    const skills = Array.isArray(w.skills) ? w.skills.join(' ') : '';

    const matchesCategory =
      selectedCategory === 'Todos' ||
      category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      bio.toLowerCase().includes(selectedCategory.toLowerCase());

    const queryLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !queryLower ||
      name.toLowerCase().includes(queryLower) ||
      category.toLowerCase().includes(queryLower) ||
      bio.toLowerCase().includes(queryLower) ||
      skills.toLowerCase().includes(queryLower);

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeColors.statusBar} backgroundColor={themeColors.background} />

      {/* Header con Buscador */}
      <View style={[styles.header, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, isDark && { backgroundColor: themeColors.surfaceLow }]}
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
        </TouchableOpacity>

        <View style={[styles.searchBar, isDark && { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={18} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, isDark && { color: themeColors.text }]}
            placeholder="Buscar por nombre, servicio u oficio..."
            placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips Horizontales de Categorías */}
      <View style={[styles.categoriesContainer, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border },
                  isActive && (isDark ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : styles.activeChip),
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isDark && { color: themeColors.textSecondary },
                    isActive && (isDark ? { color: themeColors.onPrimary, fontWeight: '700' } : styles.activeChipText),
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Contenido / Lista de Resultados */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, isDark && { color: themeColors.textSecondary }]}>Buscando profesionales...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.resultsCount, isDark && { color: themeColors.textSecondary }]}>
            {filteredProfessionals.length}{' '}
            {filteredProfessionals.length === 1 ? 'profesional disponible' : 'profesionales disponibles'}
          </Text>

          {filteredProfessionals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                <Ionicons name="search-outline" size={44} color={themeColors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, isDark && { color: themeColors.text }]}>Sin resultados encontrados</Text>
              <Text style={[styles.emptyText, isDark && { color: themeColors.textSecondary }]}>
                No hallamos profesionales para tu criterio. Intenta buscando otra especialidad o categoría.
              </Text>
              <TouchableOpacity
                style={[styles.resetFilterButton, isDark && { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  setSelectedCategory('Todos');
                  setSearchQuery('');
                }}
              >
                <Text style={[styles.resetFilterText, isDark && { color: themeColors.onPrimary }]}>Ver todos los profesionales</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredProfessionals.map((pro) => {
              const w = pro as any;
              const name = `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.userNameSnapshot || 'Profesional GoodJob';
              const photo = getWorkerPhoto(w);
              const rating = w.avgRating ? Number(w.avgRating).toFixed(1) : '5.0';
              const experience = w.yearsExperience ? `${w.yearsExperience} años exp.` : 'Verificado';
              const bio = w.bio || w.roleTitle || w.category || 'Especialista en servicios';
              const isFav = favorites.includes(pro.id);

              return (
                <View key={pro.id} style={[styles.proCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: photo }} style={styles.proImage} />
                    <TouchableOpacity
                      style={[styles.favoriteButton, isDark && { backgroundColor: 'rgba(24, 24, 27, 0.8)' }]}
                      activeOpacity={0.8}
                      onPress={() => toggleFavorite(pro)}
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFav ? COLORS.error : themeColors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.proContent}>
                    <Text style={[styles.proName, isDark && { color: themeColors.text }]}>{name}</Text>
                    <Text style={[styles.proCategory, isDark && { color: themeColors.textSecondary }]} numberOfLines={2}>{bio}</Text>

                    <View style={styles.proRatingRow}>
                      <View style={[styles.ratingBadge, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                        <Text style={[styles.ratingText, isDark && { color: themeColors.text }]}>{rating}</Text>
                      </View>
                      <Text style={[styles.dotSeparator, isDark && { color: themeColors.textSecondary }]}>•</Text>
                      <View style={[styles.distanceBadge, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Ionicons name="shield-checkmark-outline" size={14} color={themeColors.textSecondary} />
                        <Text style={[styles.distanceText, isDark && { color: themeColors.textSecondary }]}>{experience}</Text>
                      </View>
                    </View>

                    <View style={styles.proDetailsRow}>
                      <View style={[styles.detailBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Text style={[styles.detailLabel, isDark && { color: themeColors.textSecondary }]}>TARIFA / HORA</Text>
                        <Text style={[styles.detailValue, isDark && { color: themeColors.text }]}>
                          {w.hourlyRate ? `$${w.hourlyRate}/h` : 'A convenir'}
                        </Text>
                      </View>
                      <View style={[styles.detailBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Text style={[styles.detailLabel, isDark && { color: themeColors.textSecondary }]}>RESEÑAS</Text>
                        <Text style={[styles.detailValue, isDark && { color: themeColors.text }]}>{w.totalReviews || 0} recibidas</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.profileButton, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/(workers)/${pro.id}`)}
                    >
                      <Text style={[styles.profileButtonText, isDark && { color: themeColors.text }]}>Ver Perfil y Reservar</Text>
                      <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal Reutilizable de Mensajes */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.onPrimary,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFilterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLow,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Tarjeta de Profesional Vertical - Consistente con Home Screen
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    padding: 18,
  },
  proName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 19,
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
    marginTop: 14,
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
    marginTop: 14,
    height: 46,
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