// pantalla principal de Good Job - Conectada a Firestore con datos reales
import React, { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
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
import { categoryService, workerService, addressService, favoriteService, notificationService, userService } from '../../src/data/firestore';
import { Category, Worker, Address } from '../../src/types';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { auth } from '../../src/config/firebase';
import { getWorkerPhoto } from '../../src/utils/avatarUtils';
import { useThemeStore } from '../../src/utils/themeStore';

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
  const isDark = useThemeStore((s) => s.isDark);
  const themeColors = useThemeStore((s) => s.colors);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Worker[]>([]);
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const unsubscribe = notificationService.subscribeToUnread(currentUser.uid, (count) => {
      setUnreadCount(count);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadUserData = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const [addr, uDoc] = await Promise.all([
              addressService.getDefaultByUserId(currentUser.uid),
              userService.getById(currentUser.uid),
            ]);
            if (isMounted) {
              if (addr) setUserAddress(addr);
              const displayName = uDoc?.firstName
                ? `${uDoc.firstName} ${uDoc.lastName || ''}`.trim()
                : currentUser.displayName || '';
              if (displayName) setUserName(displayName);
            }
          } catch (e) {
            console.error('Error al cargar datos del usuario:', e);
          }
        }
      };
      loadUserData();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      // Peticiones en paralelo a Firestore
      const [catsData, workersData, addrData, favsData, uDoc] = await Promise.all([
        categoryService.getAll(),
        workerService.getAvailable(20),
        currentUser ? addressService.getDefaultByUserId(currentUser.uid) : Promise.resolve(null),
        currentUser ? favoriteService.getByUserId(currentUser.uid) : Promise.resolve([]),
        currentUser ? userService.getById(currentUser.uid) : Promise.resolve(null),
      ]);
      setCategories(catsData);
      setProfessionals(workersData);
      setUserAddress(addrData);
      setFavorites(favsData.map((f) => f.workerId));
      if (uDoc) {
        const displayName = uDoc.firstName
          ? `${uDoc.firstName} ${uDoc.lastName || ''}`.trim()
          : currentUser?.displayName || '';
        if (displayName) setUserName(displayName);
      } else if (currentUser?.displayName) {
        setUserName(currentUser.displayName);
      }
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

  const toggleFavorite = async (pro: Worker) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showModal('info', 'Debes iniciar sesión para guardar favoritos.');
      return;
    }

    const isFav = favorites.includes(pro.id);
    // Actualización optimista inmediata en la UI
    setFavorites((prev) =>
      isFav ? prev.filter((favId) => favId !== pro.id) : [...prev, pro.id]
    );

    try {
      await favoriteService.toggle(currentUser.uid, pro);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      // Revertir si hubo error
      setFavorites((prev) =>
        isFav ? [...prev, pro.id] : prev.filter((favId) => favId !== pro.id)
      );
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/search',
      params: { category: categoryName },
    });
  };

  const handleSettings = () => {
    router.push('/(tabs)/profile');
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
    }
  };

  // Asigna un ícono según el nombre de la categoría si no hay un iconName guardado
  const renderCategoryIcon = (category: Category) => {
    const color = isDark ? themeColors.primary : COLORS.primary;
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
      <SafeAreaView style={[styles.loadingContainer, isDark && { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, isDark && { color: themeColors.textSecondary }]}>Cargando servicios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeColors.statusBar} backgroundColor={themeColors.background} />

      {/* --- Top App Bar --- */}
      <View style={[styles.header, isDark && { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="work" size={28} color={themeColors.primary} />
          <Text style={[styles.logoText, isDark && { color: themeColors.text }]}>GoodJobs</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.iconButton, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/activity')}
          >
            <Ionicons name="notifications-outline" size={22} color={themeColors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}
            activeOpacity={0.7}
            onPress={handleSettings}
          >
            <Ionicons name="settings-outline" size={22} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Saludo de Bienvenida Personalizado --- */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.greetingText, isDark && { color: themeColors.textSecondary }]}>
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return '¡Buenos días! ☀️';
              if (hour < 19) return '¡Buenas tardes! 🌤️';
              return '¡Buenas noches! 🌙';
            })()}
          </Text>
          <Text style={[styles.userNameGreeting, isDark && { color: themeColors.text }]}>
            {userName ? `Bienvenido, ${userName.split(' ')[0]}` : 'Bienvenido a GoodJobs'}
          </Text>
        </View>

        {/* --- Location Banner --- */}
        <TouchableOpacity
          style={[styles.locationCard, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          activeOpacity={0.8}
          onPress={handleSettings}
        >
          <Ionicons name="location" size={22} color={themeColors.primary} style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationLabel, isDark && { color: themeColors.textSecondary }]}>Tu ubicación</Text>
            <Text style={[styles.locationValue, isDark && { color: themeColors.text }]} numberOfLines={1}>
              {userAddress
                ? `${userAddress.street} ${userAddress.number}${userAddress.city ? `, ${userAddress.city}` : ''}`
                : 'Sin dirección registrada • Toca para agregar'}
            </Text>
          </View>
          <View style={[styles.editButton, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}>
            <Ionicons name="pencil" size={14} color={themeColors.primary} />
          </View>
        </TouchableOpacity>

        {/* --- Banner Destacado: GoodJob AI --- */}
        <TouchableOpacity
          style={[styles.aiBanner, isDark && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/ai')}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiBadgeRow}>
              <Ionicons name="sparkles" size={14} color="#FFB800" />
              <Text style={styles.aiBadgeText}>GOODJOB AI</Text>
            </View>
            <Text style={[styles.aiBannerTitle, isDark && { color: '#F8FAFC' }]}>¿No sabes qué necesitas?</Text>
            <Text style={[styles.aiBannerSubtitle, isDark && { color: '#94A3B8' }]}>
              Tómale una foto a tu avería y nuestra IA te dirá el costo estimado y al mejor técnico.
            </Text>
          </View>
          <View style={styles.aiBannerRight}>
            <View style={[styles.aiBannerIconCircle, isDark && { backgroundColor: '#334155' }]}>
              <Ionicons name="camera-outline" size={24} color={isDark ? '#F8FAFC' : COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* --- Soluciones Rápidas (Categorías Reales) --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && { color: themeColors.text }]}>Soluciones rápidas</Text>
          {categories.length === 0 ? (
            <Text style={[styles.emptyText, isDark && { color: themeColors.textSecondary }]}>No hay categorías disponibles</Text>
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
                    <View style={[styles.categoryIconContainer, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      {renderCategoryIcon(cat)}
                    </View>
                    <Text style={[styles.categoryName, isDark && { color: themeColors.text }]} numberOfLines={1}>
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
            <Text style={[styles.sectionTitleHeader, isDark && { color: themeColors.text }]}>
              Profesionales recomendados para ti
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')}>
              <Text style={[styles.seeAllText, isDark && { color: themeColors.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {professionals.length === 0 ? (
            <Text style={[styles.emptyText, isDark && { color: themeColors.textSecondary }]}>No se encontraron trabajadores en este momento</Text>
          ) : (
            professionals.map((pro) => {
              const isFav = favorites.includes(pro.id);
              const name = pro.userNameSnapshot || 'Trabajador';
              const photo = getWorkerPhoto(pro);
              const rating = pro.avgRating ? pro.avgRating.toFixed(1) : '5.0';
              const experience = pro.yearsExperience ? `${pro.yearsExperience} años` : 'N/A';
              const bio = pro.bio || 'Profesional de servicios';

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
                        <Ionicons name="location-outline" size={14} color={themeColors.textSecondary} />
                        <Text style={[styles.distanceText, isDark && { color: themeColors.textSecondary }]}>Disponible</Text>
                      </View>
                    </View>

                    <View style={styles.proDetailsRow}>
                      <View style={[styles.detailBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Text style={[styles.detailLabel, isDark && { color: themeColors.textSecondary }]}>RESEÑAS</Text>
                        <Text style={[styles.detailValue, isDark && { color: themeColors.text }]}>{pro.totalReviews || 0}</Text>
                      </View>
                      <View style={[styles.detailBox, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                        <Text style={[styles.detailLabel, isDark && { color: themeColors.textSecondary }]}>EXPERIENCIA</Text>
                        <Text style={[styles.detailValue, isDark && { color: themeColors.text }]}>{experience}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.profileButton, isDark && { backgroundColor: themeColors.surfaceLow, borderColor: themeColors.border }]}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(workers)/${pro.id}`)}
                    >
                      <Text style={[styles.profileButtonText, isDark && { color: themeColors.text }]}>Ver Perfil</Text>
                      <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 16,
    marginTop: 4,
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  userNameGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
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
  // Banner GoodJob AI
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  aiBannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFB800',
    letterSpacing: 1,
  },
  aiBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onPrimary,
    letterSpacing: -0.3,
  },
  aiBannerSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
    lineHeight: 16,
  },
  aiBannerRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
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