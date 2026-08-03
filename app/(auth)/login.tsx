/**
 * GoodJob - Login Screen (Mejorado)
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

// ============================================================================
// HELPERS - Mover a utils/validators.ts después
// ============================================================================

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    try {
      setError('');

      // Validaciones
      if (!email.trim()) {
        setError('Por favor ingresa tu correo');
        return;
      }

      // NUEVO: Validar formato de email
      if (!validateEmail(email)) {
        setError('Por favor ingresa un correo válido');
        return;
      }

      if (!password) {
        setError('Por favor ingresa tu contraseña');
        return;
      }

      // Intentar iniciar sesión
      await signIn(email, password);

      // NUEVO: Si rememberMe está activo, guardar credenciales (opcional)
      // if (rememberMe) {
      //   await AsyncStorage.setItem('lastEmail', email);
      // }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      
      // Mensajes más específicos
      if (errorMessage.includes('user-not-found')) {
        setError('Usuario no encontrado');
      } else if (errorMessage.includes('wrong-password')) {
        setError('Contraseña incorrecta');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleNavigateToSignup = () => {
    router.push('/signup');
  };

  // NUEVO: Password reset handler
  const handleForgotPassword = () => {
    // TODO: Implementar en futuro
    // router.push('/forgot-password');
    setError('Función de recuperación en desarrollo');
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
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {/* Error message */}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Form */}
        <View style={styles.form}>
          <CustomInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            icon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            icon="lock"
            secureTextEntry
            editable={!loading}
          />

          {/* Remember me & Forgot password */}
          <View style={styles.footerOptions}>
            {/* NUEVO: Remember me checkbox */}
            {/* <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Recuerda esta sesión</Text>
            </TouchableOpacity> */}

            {/* Forgot password */}
            <LinkButton
              text="¿Olvidaste tu contraseña?"
              onPress={handleForgotPassword}
            />
          </View>
        </View>

        {/* Login Button */}
        <CustomButton
          title={loading ? 'Cargando...' : 'Iniciar Sesión'}
          icon="check"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !email || !password}
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
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  // Remember me (opcional)
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: colors.textLight,
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