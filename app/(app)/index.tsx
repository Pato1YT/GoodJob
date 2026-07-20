/**
 * GoodJob - Home Screen
 * Pantalla principal de la app (autenticada)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/utils/useAuth';

import { CustomButton, colors, spacing } from '../../src/components/common';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation happens automatically via useAuth hook
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.firstName}!</Text>
          <Text style={styles.subgreeting}>
            Bienvenido a GoodJob
          </Text>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de Perfil</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>
            {user?.firstName} {user?.lastName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{user?.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Rol:</Text>
          <Text style={styles.value}>
            {user?.role === 'employer'
              ? 'Empleador'
              : user?.role === 'worker'
              ? 'Trabajador'
              : 'Ambos'}
          </Text>
        </View>
      </View>

      {/* Features Coming Soon */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximas Características</Text>
        <FeatureItem text="🔍 Buscar trabajadores" />
        <FeatureItem text="💼 Mis reservas" />
        <FeatureItem text="💬 Mensajes" />
        <FeatureItem text="⭐ Reseñas" />
      </View>

      {/* Logout Button */}
      <View style={styles.footer}>
        <CustomButton
          title={loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          onPress={handleLogout}
          loading={loading}
          disabled={loading}
          variant="danger"
          size="large"
        />
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Feature Item Component
// ============================================================================

interface FeatureItemProps {
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingTop: spacing.xl + 20, // Safe area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  subgreeting: {
    fontSize: 14,
    color: colors.secondary,
    opacity: 0.8,
  },

  // Cards
  card: {
    backgroundColor: colors.secondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },

  // Feature Item
  featureItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
