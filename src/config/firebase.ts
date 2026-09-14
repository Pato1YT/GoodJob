import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
console.log('firebase config:', firebaseConfig);
export const app = initializeApp(firebaseConfig);

// En web, usa getAuth normal con persistencia de navegador.
// En nativo (Android/iOS), usa AsyncStorage.

function crearAuth(){
  if(Platform.OS == 'web'){
    const authInstance = getAuth(app);
  authInstance.setPersistence(browserLocalPersistence);
  return authInstance;
  }
  const {getReactNativePersistence}= require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
return initializeAuth(app,{
  persistence: getReactNativePersistence(AsyncStorage),
});

}

export const auth = crearAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;