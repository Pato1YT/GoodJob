import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing } from './common';
import {
  Wrench,
  Zap,
  Wind,
  Leaf,
  Hammer,
  Paintbrush,
  Snowflake,
} from 'lucide-react-native';

interface CategoryCardProps {
  icon: string;
  label: string;
  isNew?: boolean;
  onPress: () => void;
}

// Mapear nombres de iconos a componentes de Lucide
const iconMap: { [key: string]: React.ReactNode } = {
  pipe: <Wrench size={32} color={colors.text} strokeWidth={2} />,
  'lightning-bolt': <Zap size={32} color={colors.text} strokeWidth={2} />,
  broom: <Wind size={32} color={colors.text} strokeWidth={2} />,
  leaf: <Leaf size={32} color={colors.text} strokeWidth={2} />,
  hammer: <Hammer size={32} color={colors.text} strokeWidth={2} />,
  'paint-brush': <Paintbrush size={32} color={colors.text} strokeWidth={2} />,
  snowflake: <Snowflake size={32} color={colors.text} strokeWidth={2} />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  label,
  isNew = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isNew && <Text style={styles.badge}>NUEVO</Text>}
      <View style={styles.iconContainer}>
        {iconMap[icon] || iconMap.pipe}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    color: colors.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

export default CategoryCard;