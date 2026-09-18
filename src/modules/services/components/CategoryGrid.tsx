import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Category } from '../../../types';
import { COLORS } from '../../shared/theme/colors';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
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

  if (categories.length === 0) {
    return <Text style={styles.emptyText}>No hay categorías disponibles</Text>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
    >
      <View style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.8}
            onPress={() => onSelectCategory(cat.name)}
          >
            <View style={styles.categoryIconContainer}>{renderCategoryIcon(cat)}</View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
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
});