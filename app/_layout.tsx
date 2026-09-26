import React, { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../src/utils/useAuth';
import { appNotificationService } from '../src/services/notificationManager';

import { useThemeStore } from '../src/utils/themeStore';

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
  const initTheme = useThemeStore((s) => s.initTheme);
  const colors = useThemeStore((s) => s.colors);

  useEffect(() => {
    // 0. Inicializar preferencia de tema guardada
    initTheme();

    // 1. Solicitar permisos de notificación de forma segura
    appNotificationService.requestPermissions();

    // 2. Escuchar cuando el usuario toca una notificación para llevarlo a la pantalla correcta
    const removeSub = appNotificationService.addResponseListener((data) => {
      if (data?.relatedCollection === 'chats' && data?.relatedId) {
        router.push(`/(chat)/${data.relatedId}`);
      } else if (data?.relatedCollection === 'bookings') {
        router.push('/(tabs)/activity');
      }
    });

    return () => {
      if (removeSub) removeSub();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(workers)" />
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="(security)" />
    </Stack>
  );
}