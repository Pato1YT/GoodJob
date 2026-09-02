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
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { userService } from '../../src/data/firestore';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import {
  CustomInput,
  CustomButton,
  LinkButton,
  colors,
  spacing,
} from '../../src/components/common';

// ============================================================================
// HELPERS
// ============================================================================

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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
        formData.email,
        formData.password
      );

      await userService.create(userCredential.user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a GoodJob</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            placeholder="Nombre"
            icon="account"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={!loading}
          />

          <CustomInput
            placeholder="Apellido"
            icon="account"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={!loading}
          />

          <CustomInput
            placeholder="Correo electrónico"
            icon="email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            editable={!loading}
          />

          <CustomInput
            placeholder="Teléfono"
            icon="phone"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <CustomInput
            placeholder="Contraseña"
            icon="lock"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            editable={!loading}
          />

          {formData.password ? (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      i < passwordStrength && styles.strengthSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.strengthLabel,
                  {
                    color:
                      passwordStrength <= 1
                        ? '#e74c3c'
                        : passwordStrength === 2
                        ? '#f39c12'
                        : '#27ae60',
                  },
                ]}
              >
                Fortaleza: {getPasswordStrengthLabel(passwordStrength)}
              </Text>
            </View>
          ) : null}

          <CustomInput
            placeholder="Confirmar contraseña"
            icon="lock-check"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
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
        </View>

        <CustomButton
          title={loading ? 'Registrando...' : 'Registrarse'}
          icon="account-plus"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          size="large"
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <LinkButton text="Inicia sesión" onPress={() => router.push('/login')} />
        </View>
      </ScrollView>

      {/* Modal Reutilizable de Alertas */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  form: {
    marginVertical: spacing.lg,
  },
  passwordStrengthContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  strengthSegmentActive: {
    backgroundColor: '#27ae60',
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.secondary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
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
  termsText: {
    fontSize: 13,
    color: colors.textLight,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    color: colors.text,
    fontSize: 14,
  },
});