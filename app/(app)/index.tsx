/**
 * GoodJob - Improved Home Screen
 * Basado en referencia GoodJobs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '../../src/utils/useAuth';
import { CustomButton, colors, spacing } from '../../src/components/common';
import { workerService, categoryService } from '../../src/data/firestore';
import { Worker, Category } from '../../src/types';
import CategoryCard from '../../src/components/Categorycard';
import WorkerCard from '../../src/components/Workercard';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, categoriesData] = await Promise.all([
        workerService.getAvailable(10),
        categoryService.getAll(),
      ]);
      setWorkers(workersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>JOB</Text>
          <Text style={styles.companyName}>GoodJob</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={handleLogout}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>Tu ubicación</Text>
        <View style={styles.locationContent}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>Madrid, España</Text>
          <TouchableOpacity style={styles.editLocationBtn}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>✨</Text>
        <TextInput
          placeholder="Describe your problem..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.cameraBtn}>
          <Text>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.micBtn}>
          <Text>🎤</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Tags */}
      <View style={styles.quickTagsContainer}>
        <TouchableOpacity style={styles.quickTag}>
          <Text style={styles.quickTagText}>No hay agua 💧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickTag}>
          <Text style={styles.quickTagText}>Problema eléctrico ⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickTag}>
          <Text style={styles.quickTagText}>Nec...</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Section */}
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
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      {/* Recommended Workers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profesionales recomendados para ti</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
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
              distance={1.2}
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      {/* Logout Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
          size="large"
        />
      </View>
    </ScrollView>
  );
}

// Helper function to get category icons
const getCategoryIcon = (categoryName: string): string => {
  const icons: { [key: string]: string } = {
    'Fontanería': '🔧',
    'Limpieza': '🧹',
    'Jardinería': '🌿',
    'Electricidad': '⚡',
    'Carpintería': '🪵',
    'Plomería': '🚰',
    'Pintura': '🎨',
  };
  return icons[categoryName] || '🛠️';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
