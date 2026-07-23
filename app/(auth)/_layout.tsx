/**
 * GoodJob - Auth Layout
 * Layout para pantallas de autenticación
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        //animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar Sesión',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Registrarse',
        }}
      />
    </Stack>
  );
}
