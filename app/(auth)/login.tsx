/**
 * GoodJob - Login Screen (Expo Router)
 * Pantalla de inicio de sesión
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/utils/useAuth';
import {
  CustomInput,
  CustomButton,
  LinkButton,
  ErrorMessage,
  colors,
  spacing,
} from '../../src/components/common';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    try {
      setError('');

      // Validaciones básicas
      if (!email.trim()) {
        setError('Por favor ingresa tu correo');
        return;
      }
      if (!password) {
        setError('Por favor ingresa tu contraseña');
        return;
      }

      // Intentar iniciar sesión
      await signIn(email, password);
      // Navigation happens automatically via useAuth hook
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  const handleNavigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBg}>
            <Text style={styles.logoText}>GOOD JOB</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para continuar
        </Text>

        {/* Error message */}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Form */}
        <View style={styles.form}>
          <CustomInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {/* Remember me & Forgot password */}
          <View style={styles.footerOptions}>
            <LinkButton
              text="¿Olvidaste tu contraseña?"
              onPress={() => {
                // TODO: Implementar recuperación de contraseña
              }}
            />
          </View>
        </View>

        {/* Login Button */}
        <CustomButton
          title={loading ? 'Cargando...' : 'Iniciar Sesión'}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          size="large"
        />

        {/* Signup link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>¿No tienes cuenta? </Text>
          <LinkButton text="Regístrate aquí" onPress={handleNavigateToSignup} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBg: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
    letterSpacing: 2,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Form
  form: {
    marginVertical: spacing.lg,
  },

  // Footer options
  footerOptions: {
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },

  // Signup container
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    color: colors.text,
    fontSize: 14,
  },
});
