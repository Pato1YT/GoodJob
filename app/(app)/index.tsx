// pantalla principal de Good Job - Con todas las categorías cubiertas
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

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

// --- Tipos de Datos ---
interface Category {
  id: string;
  name: string;
  iconName: string;
  iconFamily: 'MaterialIcons' | 'MaterialCommunityIcons' | 'Ionicons';
  isNew?: boolean;
}

interface Professional {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  price: string;
  experience: string;
  imageUrl: string;
}

// --- Datos de Ejemplo (Mock Data Completo) ---
const CATEGORIES: Category[] = [
  { id: '1', name: 'Fontanería', iconName: 'plumbing', iconFamily: 'MaterialIcons' },
  { id: '2', name: 'Limpieza', iconName: 'cleaning-services', iconFamily: 'MaterialIcons', isNew: true },
  { id: '3', name: 'Jardinería', iconName: 'grass', iconFamily: 'MaterialIcons' },
  { id: '4', name: 'Electricidad', iconName: 'electrical-services', iconFamily: 'MaterialIcons' },
];

const PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    category: 'Fontanero Profesional',
    rating: 4.8,
    distance: '1.2 km',
    price: 'Desde $30/h',
    experience: '8 años',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    name: 'María González',
    category: 'Servicio de Limpieza',
    rating: 4.9,
    distance: '0.8 km',
    price: 'Desde $25/h',
    experience: '12 años',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'Javier López',
    category: 'Jardinero y Paisajista',
    rating: 4.7,
    distance: '2.5 km',
    price: 'Desde $28/h',
    experience: '6 años',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '4',
    name: 'Sofía Martínez',
    category: 'Electricista Certificada',
    rating: 5.0,
    distance: '1.8 km',
    price: 'Desde $35/h',
    experience: '10 años',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  },
];

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const renderCategoryIcon = (category: Category) => {
    const color = COLORS.primary;
    const size = 26;
    if (category.iconFamily === 'MaterialIcons') {
      return <MaterialIcons name={category.iconName as any} size={size} color={color} />;
    }
    if (category.iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={category.iconName as any} size={size} color={color} />;
    }
    return <Ionicons name={category.iconName as any} size={size} color={color} />;
  };

  const handleSettings = () => {
    router.push('/(app)/profile');
  };

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

        {/* --- Soluciones Rápidas (Categories) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluciones rápidas</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(cat.name)}
              >
                <View style={styles.categoryIconContainer}>
                  {cat.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NUEVO</Text>
                    </View>
                  )}
                  {renderCategoryIcon(cat)}
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- Profesionales Recomendados --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleHeader}>
              Profesionales recomendados para ti
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {PROFESSIONALS.map((pro) => {
            const isFav = favorites.includes(pro.id);
            return (
              <View key={pro.id} style={styles.proCard}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: pro.imageUrl }} style={styles.proImage} />
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
                  <Text style={styles.proName}>{pro.name}</Text>
                  <Text style={styles.proCategory}>{pro.category}</Text>

                  <View style={styles.proRatingRow}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color={COLORS.primary} />
                      <Text style={styles.ratingText}>{pro.rating}</Text>
                    </View>
                    <Text style={styles.dotSeparator}>•</Text>
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.distanceText}>{pro.distance}</Text>
                    </View>
                  </View>

                  <View style={styles.proDetailsRow}>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>PRECIO</Text>
                      <Text style={styles.detailValue}>{pro.price}</Text>
                    </View>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>EXPERIENCIA</Text>
                      <Text style={styles.detailValue}>{pro.experience}</Text>
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
          })}
        </View>
      </ScrollView>
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
  categoriesGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: COLORS.onPrimary,
    fontSize: 9,
    fontWeight: '700',
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