/** @jsxImportSource react */
import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../src/utils/useAuth';

// Manejador de errores para web únicamente
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  const resizeObserveErrorHandler = (e: ErrorEvent) => {
    if (
      e.message?.includes('ResizeObserver loop') ||
      e.message?.includes('timeout exceeded')
    ) {
      e.stopImmediatePropagation();
    }
  };
  window.addEventListener('error', resizeObserveErrorHandler);
}

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
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