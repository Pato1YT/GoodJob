import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// En web, usa getAuth normal con persistencia de navegador.
// En nativo (Android/iOS), usa AsyncStorage.
function crearAuth() {
  if (Platform.OS === 'web') {
    const authInstance = getAuth(app);
    authInstance.setPersistence(browserLocalPersistence);
    return authInstance;
  }
  const { getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = crearAuth();

// En React Native / Expo, los WebSockets nativos de gRPC de Firestore se desconectan
// o tardan más de 10s en responder ("Could not reach Cloud Firestore backend").
// Forzar Long Polling garantiza que las peticiones HTTP directas funcionen sin timeouts.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);

export default app;