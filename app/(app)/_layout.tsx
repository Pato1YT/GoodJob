/**
 * GoodJob - App Layout
 * Layout para pantallas autenticadas
 */

import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        //animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
    </Stack>
  );
}
