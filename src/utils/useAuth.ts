import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';
import { userStorage } from '../utils/storage';
import { sendPasswordResetEmail } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            await userStorage.save(userData);
          } else {
            setUser(null);
            await userStorage.clear();
          }
        } else {
          setUser(null);
          await userStorage.clear();
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
        setError(err instanceof Error ? err.message : 'Error loading user');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null);
      setLoading(true);

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        secondLastName: userData.secondLastName || '',
        phone: userData.phone || '',
        role: userData.role || 'employer',
        emailVerified: false,
        isActive: true,
        createdBy: firebaseUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      await userStorage.save(newUser);
      router.replace('/(app)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------
  // signIn: YA NO redirige internamente, y SÍ regresa el userCredential
  // --------------------------------------------------------------
  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
      }

      return userCredential;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      setUser(null);
      await userStorage.clear();
      router.replace('/(auth)/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Email de reset enviado a:', email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No hay una cuenta asociada');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email invalido');
      } else {
        throw new Error(error.message || 'Error al enviar el correo');
      }
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    clearError,
    resetPassword,
  } as AuthContextType;
};