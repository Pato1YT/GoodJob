/**
 * GoodJob - Login Screen
 * Pantalla de inicio de sesión con el nuevo diseño UI y lógica integrada
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../src/utils/useAuth';
import { CustomModal, ModalType } from '../../src/modules/shared/components/CustomModal';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import { COLORS } from '../../src/modules/shared/theme/colors';

// Componentes modulares de Auth
import { AuthInput } from '../../src/modules/auth/components/AuthInput';
import { AuthHeader } from '../../src/modules/auth/components/AuthHeader';

// Helper para validar formato de correo
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados para el Modal Reutilizable
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; message: string }>({
    type: 'danger',
    message: '',
  });

  const showErrorModal = (message: string) => {
    setModalConfig({
      type: 'danger',
      message,
    });
    setModalVisible(true);
  };

  const handleLogin = async () => {
    try {
      const trimmedEmail = email.trim();

      // Validaciones de formulario
      if (!trimmedEmail) {
        showErrorModal('Por favor ingresa tu correo');
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        showErrorModal('Por favor ingresa un correo válido');
        return;
      }

      if (!password) {
        showErrorModal('Por favor ingresa tu contraseña');
        return;
      }

      // Llamada al método de autenticación original
      await signIn(trimmedEmail, password);
    } catch (err: any) {
      // Traducir código de error o mensaje devuelto
      const rawCode = err?.code || (err instanceof Error ? err.message : '');
      const friendlyMessage = getSpanishAuthErrorMessage(rawCode);

      showErrorModal(friendlyMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Superior con Botón Atrás y Título Centrado */}
          <AuthHeader title="Inicio de Sesión" onBackPress={() => router.back()} />

          <View style={styles.content}>
            {/* Título Principal y Subtítulo */}
            <View style={styles.titleContainer}>
              <Text style={styles.brandTitle}>Good Job</Text>
              <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
            </View>

            {/* Formulario de Entrada */}
            <View style={styles.form}>
              {/* Input de Correo Electrónico */}
              <AuthInput
                iconName="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              {/* Input de Contraseña con Toggle de Visibilidad */}
              <AuthInput
                iconName="lock-outline"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                editable={!loading}
              />

              {/* Enlace Olvidaste tu Contraseña */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Botón Iniciar Sesión */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (loading || !email.trim() || !password) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading || !email.trim() || !password}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color={COLORS.surface} />
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Enlace para ir al Registro */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Reutilizable de Alertas */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  signupText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
});