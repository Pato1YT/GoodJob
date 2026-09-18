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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  // Estados para el Modal Reutilizable
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    message: string;
    onCloseAction?: () => void;
  }>({
    type: 'danger',
    message: '',
  });

  const showModal = (type: ModalType, message: string, onCloseAction?: () => void) => {
    setModalConfig({
      type,
      message,
      onCloseAction,
    });
    setModalVisible(true);
  };

  const handleResetPassword = async () => {
    try {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        showModal('danger', 'Por favor ingresa tu correo electrónico');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        showModal('danger', 'Por favor ingresa un correo electrónico válido');
        return;
      }

      setLoading(true);

      await resetPassword(trimmedEmail);

      showModal(
        'success',
        'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        () => router.push('/(auth)/login')
      );
    } catch (err: any) {
      const rawCode = err?.code || (err instanceof Error ? err.message : '');
      const friendlyMessage = getSpanishAuthErrorMessage(rawCode);

      showModal('danger', friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalConfig.onCloseAction) {
      modalConfig.onCloseAction();
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
          {/* Header Superior con Botón Atrás */}
          <AuthHeader title="Recuperar Contraseña" onBackPress={() => router.back()} />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitle}>
                Ingresa tu email y te enviaremos un enlace para restablecerla.
              </Text>
            </View>

            <View style={styles.form}>
              {/* Input de email */}
              <AuthInput
                iconName="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              {/* Botón principal */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (loading || !email.trim()) && styles.submitButtonDisabled,
                ]}
                onPress={handleResetPassword}
                activeOpacity={0.8}
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color={COLORS.surface} />
                    <Text style={styles.submitButtonText}>Enviar correo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Volver a Login */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Volver al inicio de sesión</Text>
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
        onClose={handleModalClose}
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
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
});