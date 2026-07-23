/**
 * GoodJob - Root Layout
 * Configuración principal de navegación
 */

import { Stack } from 'expo-router';
import { useAuth } from '../src/utils/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../src/components/common';

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
