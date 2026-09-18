import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { categoryService, workerService } from '../../src/data/firestore';
import { Category, Worker } from '../../src/types';
import { COLORS } from '../../src/modules/shared/theme/colors';
import { CustomModal, ModalType } from '../../src/modules/shared/components/CustomModal';

// Componentes del Módulo Services
import { LocationBanner } from '../../src/modules/services/components/LocationBanner';
import { CategoryGrid } from '../../src/modules/services/components/CategoryGrid';
import { WorkerCard } from '../../src/modules/services/components/WorkerCard';

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsData, workersData] = await Promise.all([
        categoryService.getAll(),
        workerService.getAvailable(20),
      ]);
      setCategories(catsData);
      setProfessionals(workersData);
    } catch (error: any) {
      console.error('Error al cargar información de Firestore:', error);
      showModal('danger', 'Ocurrió un error al cargar la información. Por favor, reintenta.');
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

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
    }
  };

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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="work" size={28} color={COLORS.primary} />
          <Text style={styles.logoText}>GoodJobs</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/profile')}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LocationBanner />

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluciones rápidas</Text>
          <CategoryGrid categories={categories} onSelectCategory={handleCategoryPress} />
        </View>

        {/* Lista de Profesionales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleHeader}>Profesionales recomendados para ti</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {professionals.length === 0 ? (
            <Text style={styles.emptyText}>No se encontraron trabajadores en este momento</Text>
          ) : (
            professionals.map((pro) => (
              <WorkerCard
                key={pro.id}
                worker={pro}
                isFavorite={favorites.includes(pro.id)}
                onToggleFavorite={toggleFavorite}
                onPressProfile={(id) => router.push(`/worker/${id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

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
});