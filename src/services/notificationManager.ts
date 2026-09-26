// Servicio de Notificaciones para GoodJob
// Diseñado para funcionar de manera segura tanto en Expo Go como en builds nativas (EAS Build / APK)
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { notificationService } from '../data/firestore';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Import dinámico seguro o cargador de expo-notifications solo cuando sea seguro
let Notifications: typeof import('expo-notifications') | null = null;

// En Expo Go en Android, expo-notifications siempre arroja el error de que remote notifications fueron removidas en SDK 53.
// Solo lo inicializamos en desarrollo nativo (development builds/APK) o iOS.
if (!(isExpoGo && Platform.OS === 'android')) {
  try {
    Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications?.AndroidNotificationPriority?.HIGH,
        }),
      });
    }
  } catch (e) {
    // Silenciado de forma segura
  }
}

export const appNotificationService = {
  /**
   * Solicita permisos al usuario y configura el canal de Android
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Notifications) return false;

      if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'GoodJob Alertas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#000000',
          sound: 'default',
        });
      }

      if (Notifications.getPermissionsAsync) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted' && Notifications.requestPermissionsAsync) {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        return finalStatus === 'granted';
      }

      return false;
    } catch (e) {
      console.warn('Permisos de notificación no disponibles en Expo Go:', e);
      return false;
    }
  },

  /**
   * Dispara una notificación instantánea en el dispositivo
   */
  async triggerLocalNotification({
    title,
    body,
    data,
  }: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    try {
      if (Notifications && Notifications.scheduleNotificationAsync) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
            sound: 'default',
          },
          trigger: null,
        });
      }
    } catch (e) {
      console.warn('Notificación local no soportada en este entorno:', e);
    }
  },

  /**
   * Escuchar clics en notificaciones
   */
  addResponseListener(callback: (data: Record<string, any> | undefined) => void) {
    try {
      if (Notifications && Notifications.addNotificationResponseReceivedListener) {
        const sub = Notifications.addNotificationResponseReceivedListener((response) => {
          callback(response?.notification?.request?.content?.data);
        });
        return () => sub.remove();
      }
    } catch (e) {
      console.warn('Listener de notificaciones no disponible:', e);
    }
    return () => {};
  },

  /**
   * Registra una notificación en Firestore Y dispara la alerta en el dispositivo
   */
  async notifyUser({
    userId,
    title,
    body,
    type = 'system',
    relatedId,
    relatedCollection,
  }: {
    userId: string;
    title: string;
    body: string;
    type?: 'booking' | 'payment' | 'message' | 'review' | 'system';
    relatedId?: string;
    relatedCollection?: string;
  }) {
    try {
      // 1. Guardar en Firestore para historial persistente y contador en la campana
      await notificationService.create({
        userId,
        title,
        body,
        type,
        relatedId,
        relatedCollection,
        createdBy: 'system',
      });

      // 2. Disparar banner en pantalla si el hardware lo soporta
      await this.triggerLocalNotification({
        title,
        body,
        data: { type, relatedId, relatedCollection },
      });
    } catch (err) {
      console.warn('Error en notifyUser:', err);
    }
  },
};
