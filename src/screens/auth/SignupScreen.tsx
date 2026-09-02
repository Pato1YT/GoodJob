/**
 * GoodJob - Signup Screen
 * Pantalla de registro
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
import { useAuth } from '../../utils/useAuth';
import {
  CustomInput,
  CustomButton,
  LinkButton,
  ErrorMessage,
  colors,
  spacing,
} from '../../components/common';
import { User } from '../../types';

export const SignupScreen: React.FC<{ onNavigateToLogin: () => void }> = ({
  onNavigateToLogin,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'employer' as 'employer' | 'worker' | 'both',
  });
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignup = async () => {
    try {
      setError('');

      // Validaciones
      if (!formData.firstName.trim()) {
        setError('Por favor ingresa tu nombre');
        return;
      }
      if (!formData.lastName.trim()) {
        setError('Por favor ingresa tu apellido');
        return;
      }
      if (!formData.email.trim()) {
        setError('Por favor ingresa tu correo');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Por favor ingresa tu teléfono');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      // Registrar usuario
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        secondLastName: formData.secondLastName,
        phone: formData.phone,
        role: formData.role,
      } as Partial<User>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a GoodJob y comienza ahora
          </Text>
        </View>

        {/* Error message */}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Form */}
        <View style={styles.form}>
          <CustomInput
            placeholder="Nombre"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            editable={!loading}
          />

          <CustomInput
            placeholder="Apellido paterno"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            editable={!loading}
          />

          <CustomInput
            placeholder="Apellido materno (opcional)"
            value={formData.secondLastName}
            onChangeText={(value) => handleInputChange('secondLastName', value)}
            editable={!loading}
          />

          <CustomInput
            placeholder="Correo electrónico"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            editable={!loading}
          />

          <CustomInput
            placeholder="Teléfono"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <CustomInput
            placeholder="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            editable={!loading}
          />

          <CustomInput
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            editable={!loading}
          />

          {/* Role Selection */}
          <Text style={styles.roleLabel}>¿Qué eres?</Text>
          <View style={styles.roleContainer}>
            <RoleButton
              label="Empleador"
              isSelected={formData.role === 'employer'}
              onPress={() => handleInputChange('role', 'employer')}
              disabled={loading}
            />
            <RoleButton
              label="Trabajador"
              isSelected={formData.role === 'worker'}
              onPress={() => handleInputChange('role', 'worker')}
              disabled={loading}
            />
            <RoleButton
              label="Ambos"
              isSelected={formData.role === 'both'}
              onPress={() => handleInputChange('role', 'both')}
              disabled={loading}
            />
          </View>
        </View>

        {/* Signup Button */}
        <CustomButton
          title={loading ? 'Registrando...' : 'Registrarse'}
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          size="large"
        />

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <LinkButton text="Inicia sesión" onPress={onNavigateToLogin} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// Role Button Component
// ============================================================================

interface RoleButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const RoleButton: React.FC<RoleButtonProps> = ({
  label,
  isSelected,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.roleButton,
        isSelected && styles.roleButtonSelected,
        disabled && styles.roleButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.roleButtonText,
          isSelected && styles.roleButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
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
  },

  // Form
  form: {
    marginVertical: spacing.lg,
  },

  // Role Selection
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  // Role Button
  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonDisabled: {
    opacity: 0.5,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  roleButtonTextSelected: {
    color: colors.secondary,
  },

  // Login container
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

export default SignupScreen;
