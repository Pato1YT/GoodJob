/**
 * GoodJob - Signup Screen (LIMPIO - SIN ERRORES)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { userService } from '../../src/data/firestore';
import { CustomModal, ModalType } from '../../src/modules/shared/components/CustomModal';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import { COLORS } from '../../src/modules/shared/theme/colors';

// Componentes modulares de Auth
import { AuthInput } from '../../src/modules/auth/components/AuthInput';
import { AuthHeader } from '../../src/modules/auth/components/AuthHeader';
import { PasswordStrengthBar } from '../../src/modules/auth/components/PasswordStrengthBar';

// ============================================================================
// HELPERS
// ============================================================================

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

const validatePhoneMX = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
};

const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  return strength;
};

const getPasswordStrengthLabel = (strength: number): string => {
  switch (strength) {
    case 1:
      return 'Muy débil';
    case 2:
      return 'Débil';
    case 3:
      return 'Fuerte';
    case 4:
      return 'Muy fuerte';
    default:
      return '';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'employer' as 'employer' | 'worker' | 'both',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleSignup = async () => {
    try {
      if (!formData.firstName.trim()) {
        showErrorModal('Por favor ingresa tu nombre');
        return;
      }
      if (!formData.lastName.trim()) {
        showErrorModal('Por favor ingresa tu apellido');
        return;
      }
      if (!formData.email.trim()) {
        showErrorModal('Por favor ingresa tu correo');
        return;
      }
      if (!validateEmail(formData.email)) {
        showErrorModal('Por favor ingresa un correo válido');
        return;
      }
      if (!formData.phone.trim()) {
        showErrorModal('Por favor ingresa tu teléfono');
        return;
      }
      if (!validatePhoneMX(formData.phone)) {
        showErrorModal('El teléfono debe tener 10 dígitos');
        return;
      }
      if (formData.password.length < 6) {
        showErrorModal('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showErrorModal('Las contraseñas no coinciden');
        return;
      }
      if (!agreeToTerms) {
        showErrorModal('Debes aceptar los Términos y Condiciones');
        return;
      }

      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      await userService.create(userCredential.user.uid, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      });

      router.replace('/(app)');
    } catch (err: any) {
      // Traducir código de error o mensaje devuelto
      const rawCode = err?.code || (err instanceof Error ? err.message : '');
      const friendlyMessage = getSpanishAuthErrorMessage(rawCode);

      showErrorModal(friendlyMessage);
    } finally {
      setLoading(false);
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
          <AuthHeader title="Crear Cuenta" onBackPress={() => router.back()} />

          <View style={styles.content}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.brandTitle}>Good Job</Text>
              <Text style={styles.subtitle}>Únete a la plataforma</Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                iconName="person-outline"
                placeholder="Nombre"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                editable={!loading}
              />

              <AuthInput
                iconName="person-outline"
                placeholder="Apellido"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                editable={!loading}
              />

              <AuthInput
                iconName="mail-outline"
                placeholder="Correo electrónico"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <AuthInput
                iconName="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />

              <AuthInput
                iconName="lock-outline"
                placeholder="Contraseña"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                editable={!loading}
              />

              {formData.password ? (
                <PasswordStrengthBar
                  strength={passwordStrength}
                  label={getPasswordStrengthLabel(passwordStrength)}
                />
              ) : null}

              <AuthInput
                iconName="lock-outline"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                isPassword
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                editable={!loading}
              />

              <Text style={styles.roleLabel}>¿Qué eres?</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'employer' && styles.roleButtonActive,
                  ]}
                  onPress={() => handleInputChange('role', 'employer')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'employer' && styles.roleButtonTextActive,
                    ]}
                  >
                    Empleador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'worker' && styles.roleButtonActive,
                  ]}
                  onPress={() => handleInputChange('role', 'worker')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'worker' && styles.roleButtonTextActive,
                    ]}
                  >
                    Trabajador
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.checkbox, agreeToTerms && styles.checkboxActive]}
                >
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text style={styles.termsLink}>Términos y Condiciones</Text>
                </Text>
              </TouchableOpacity>

              {/* Botón Registrarse */}
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.signupButtonText}>Registrarse</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
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
    paddingBottom: 32,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 14,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  roleButtonTextActive: {
    color: COLORS.surface,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
});