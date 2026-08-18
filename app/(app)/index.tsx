/**
 * GoodJob - Improved Home Screen (Mejorado)
 * Pantalla principal con geolocalización y búsqueda funcional
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../src/utils/useAuth';
import { useRouter } from 'expo-router';
import { CustomButton, colors, spacing } from '../../src/components/common';
import { workerService, categoryService } from '../../src/data/firestore';
import { Worker, Category } from '../../src/types';
import CategoryCard from '../../src/components/Categorycard';
import WorkerCard from '../../src/components/Workercard';
import { Settings, LogOut, MapPin, Search, Edit2, Mic, Camera } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NUEVO: Geolocalización
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    cityName: string;
  } | null>(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      // NUEVO: Pedir ubicación
      // await requestLocationPermission();
      await loadData();
    } catch (error) {
      console.error('Error initializing screen:', error);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Función de geolocalización
  // const requestLocationPermission = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status === 'granted') {
  //       const currentLocation = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.High,
  //       });
  //       setLocation({
  //         latitude: currentLocation.coords.latitude,
  //         longitude: currentLocation.coords.longitude,
  //         cityName: 'Tu ubicación', // TODO: reverse geocode
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error requesting location:', error);
  //     // Fallback a ubicación por defecto
  //     setLocation({
  //       latitude: 25.6867, // Iguala
  //       longitude: -99.7530,
  //       cityName: 'Iguala, Guerrero',
  //     });
  //   }
  // };

  const loadData = async () => {
    try {
      setError(null);
      const [workersData, categoriesData] = await Promise.all([
        workerService.getAvailable(10),
        categoryService.getAll(),
      ]);
      setWorkers(workersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('No se pudieron cargar los datos');
    }
  };

  // NUEVO: Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // NUEVO: Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navegar a SearchScreen con query
      router.push({
        pathname: '/search',
        params: { query: searchQuery },
      });
    }
  };

  // NUEVO: Handle quick tags
  const handleQuickTag = (tagName: string) => {
    setSearchQuery(tagName);
    // Podría filtrar localmente o navegar a search
  };

  // NUEVO: Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // NUEVO: Navigate to settings
  const handleSettings = () => {
    router.push('/(app)/profile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>JOB</Text>
          <Text style={styles.companyName}>GoodJob</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={handleSettings}
        >
          <Settings size={24} color={colors.secondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Location - MEJORADO */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>Tu ubicación</Text>
        <View style={styles.locationContent}>
          <MapPin size={20} color={colors.secondary} strokeWidth={2} />
          <Text style={styles.locationText}>
            {location?.cityName || 'Cargando ubicación...'}
          </Text>
          <TouchableOpacity style={styles.editLocationBtn}>
            <Edit2 size={16} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input - MEJORADO */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text} strokeWidth={2} />
        <TextInput
          placeholder="Describe your problem..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
        
        <TouchableOpacity style={styles.cameraBtn}>
            <Camera size={20} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.micBtn}
          onPress={handleSearch}
        >
          <Mic size={20} color={colors.secondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Quick Tags - MEJORADO */}
      <View style={styles.quickTagsContainer}>
        <TouchableOpacity
          style={styles.quickTag}
          onPress={() => handleQuickTag('No hay agua 💧')}
        >
          <Text style={styles.quickTagText}>No hay agua 💧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickTag}
          onPress={() => handleQuickTag('Problema eléctrico ⚡')}
        >
          <Text style={styles.quickTagText}>Problema eléctrico ⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickTag}>
          <Text style={styles.quickTagText}>Más...</Text>
        </TouchableOpacity>
      </View>

      {/* Error State - NUEVO */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <CustomButton
            title="Reintentar"
            onPress={handleRefresh}
            size="small"
          />
        </View>
      )}

      {/* Categories Section */}
      {categories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluciones rápidas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.slice(0, 5).map((category, index) => (
            <CategoryCard
                key={category.id}
                icon={getCategoryIcon(category.name)}
                label={category.name}
                isNew={index === 1}
                onPress={() => {
                  router.push({
                    pathname: '/search',
                    params: { categoryId: category.id },
                  });
                }}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Recommended Workers Section - MEJORADO */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profesionales recomendados</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.seeAllLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {workers.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.workersScroll}
          >
            {workers.map((worker) => (
              <WorkerCard
                key={worker.id}
                name={worker.userNameSnapshot}
                title={`${worker.yearsExperience} años experiencia`}
                rating={worker.avgRating}
                distance={1.2} // TODO: Calcular distancia real
                onPress={() => {
                  router.push({
                    pathname: '/worker-detail/[id]',
                    params: { id: worker.id },
                  });
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              No hay trabajadores disponibles
            </Text>
            <Text style={styles.emptySubtitle}>
              Intenta más tarde o ajusta tus filtros
            </Text>
          </View>
        )}
      </View>

      {/* Footer - MEJORADO */}
      <View style={styles.footer}>
        <CustomButton
          title="Cerrar Sesión"
          icon="logout"
          onPress={handleLogout}
          //variant="outline"
          size="large"
        />
      </View>
    </ScrollView>
  );
}

// Helper function
const getCategoryIcon = (categoryName: string): string => {
  const icons: { [key: string]: string } = {
    'Plomería': 'pipe',
    'Electricidad': 'lightning-bolt',
    'Limpieza': 'broom',
    'Jardinería': 'leaf',
    'Carpintería': 'hammer',
    'Pintura': 'paint-brush',
    'Refrigeración': 'snowflake',
  };
  return icons[categoryName] || 'tools';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    letterSpacing: 2,
  },

  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },

  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsIcon: {
    fontSize: 20,
  },

  // Location
  locationContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  locationLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },

  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  locationIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },

  locationText: {
    flex: 1,
    color: colors.secondary,
    fontWeight: '500',
  },

  editLocationBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1abc9c',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editIcon: {
    fontSize: 14,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: spacing.sm,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: spacing.md,
  },

  cameraBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },

  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1abc9c',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Tags
  quickTagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  quickTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },

  quickTagText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },

  // Error
  errorContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },

  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: spacing.md,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },

  seeAllLink: {
    color: '#1abc9c',
    fontSize: 12,
    fontWeight: '600',
  },

  categoriesScroll: {
    paddingLeft: spacing.lg,
  },

  workersScroll: {
    paddingLeft: spacing.lg,
  },

  // Empty State
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});