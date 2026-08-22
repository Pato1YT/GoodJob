/**
 * GoodJob - Root Layout
 * Configuración principal de navegación
 */

import { useAuth } from '../src/utils/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../src/components/common';
import { Stack } from 'expo-router';
import { seedDatabase } from '../src/utils/seedData';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    seedDatabase();
  }, []);
  
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}