// pantalla de busqueda de Good Job
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// --- Paleta Monochrome Premium ---
const COLORS = {
  background: '#F9F9FB',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceVariant: '#E2E2E4',
  textPrimary: '#1A1C1D',
  textSecondary: '#4C4546',
  primary: '#000000',
  onPrimary: '#FFFFFF',
};

const CATEGORY_FILTERS = ['Todos', 'Fontanería', 'Limpieza', 'Electricidad', 'Jardinería'];

const ALL_PROFESSIONALS = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    category: 'Fontanería',
    title: 'Fontanero Profesional',
    rating: 4.8,
    distance: '1.2 km',
    price: 'Desde $30/h',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    name: 'María González',
    category: 'Limpieza',
    title: 'Servicio de Limpieza',
    rating: 4.9,
    distance: '0.8 km',
    price: 'Desde $25/h',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'Andrés López',
    category: 'Electricidad',
    title: 'Electricista Certificado',
    rating: 4.7,
    distance: '2.5 km',
    price: 'Desde $35/h',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredProfessionals = ALL_PROFESSIONALS.filter((pro) => {
    const matchesCategory =
      selectedCategory === 'Todos' || pro.category === selectedCategory;
    const matchesQuery =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* --- Buscador y Botón de Filtro --- */}
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profesionales o servicios..."
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
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* --- Chips de Filtros --- */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORY_FILTERS.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedCategory(chip)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* --- Lista de Resultados --- */}
      <ScrollView
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCountText}>
          {filteredProfessionals.length} resultado{filteredProfessionals.length === 1 ? '' : 's'} encontrado{filteredProfessionals.length === 1 ? '' : 's'}
        </Text>

        {filteredProfessionals.map((pro) => (
          <View key={pro.id} style={styles.proCard}>
            <Image source={{ uri: pro.imageUrl }} style={styles.proImage} />
            <View style={styles.proContent}>
              <Text style={styles.proName}>{pro.name}</Text>
              <Text style={styles.proTitle}>{pro.title}</Text>

              <View style={styles.proMetaRow}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>{pro.rating}</Text>
                </View>
                <Text style={styles.dot}>•</Text>
                <View style={styles.badge}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{pro.distance}</Text>
                </View>
              </View>

              <Text style={styles.priceText}>{pro.price}</Text>

              <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
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

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chips
  chipsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.onPrimary,
  },

  // Results
  resultsContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  resultsCountText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  proCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
    marginBottom: 16,
  },
  proImage: {
    width: '100%',
    height: 150,
  },
  proContent: {
    padding: 16,
  },
  proName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  proMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.surfaceVariant,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  profileButton: {
    marginTop: 12,
    height: 42,
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  profileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});