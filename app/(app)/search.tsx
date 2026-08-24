// Pantalla de Búsqueda y Filtros
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

const CATEGORIES = ['Todos', 'Fontanería', 'Limpieza', 'Jardinería', 'Electricidad'];

const ALL_PROFESSIONALS = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    category: 'Fontanería',
    roleTitle: 'Fontanero Profesional',
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
    category: 'Limpieza',
    roleTitle: 'Servicio de Limpieza',
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
    category: 'Jardinería',
    roleTitle: 'Jardinero y Paisajista',
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
    category: 'Electricidad',
    roleTitle: 'Electricista Certificada',
    rating: 5.0,
    distance: '1.8 km',
    price: 'Desde $35/h',
    experience: '10 años',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (params.category && CATEGORIES.includes(params.category)) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const filteredProfessionals = ALL_PROFESSIONALS.filter((pro) => {
    const matchesCategory =
      selectedCategory === 'Todos' || pro.category === selectedCategory;
    const matchesSearch =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header con Buscador */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o servicio..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips de Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.activeChip]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Resultados */}
      <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {filteredProfessionals.length}{' '}
          {filteredProfessionals.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </Text>

        {filteredProfessionals.map((pro) => (
          <View key={pro.id} style={styles.proCard}>
            <Image source={{ uri: pro.imageUrl }} style={styles.proImage} />
            <View style={styles.proContent}>
              <Text style={styles.proName}>{pro.name}</Text>
              <Text style={styles.proRole}>{pro.roleTitle}</Text>

              <View style={styles.row}>
                <Ionicons name="star" size={14} color={COLORS.primary} />
                <Text style={styles.ratingText}>{pro.rating}</Text>
                <Text style={styles.dot}>•</Text>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{pro.distance}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.infoText}>{pro.price}</Text>
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
        ))}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 12,
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
    paddingVertical: 8,
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
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  proCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    gap: 12,
  },
  proImage: {
    width: 90,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
  },
  proContent: {
    flex: 1,
    justifyContent: 'center',
  },
  proName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dot: {
    color: COLORS.surfaceVariant,
    marginHorizontal: 2,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  profileButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});