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
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import {
  CustomButton,
  CustomInput,
  LinkButton,
  colors,
  spacing,
} from '../../src/components/common';

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
      if (!email.trim()) {
        showModal('danger', 'Por favor ingresa tu correo electrónico');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showModal('danger', 'Por favor ingresa un correo electrónico válido');
        return;
      }

      setLoading(true);

      await resetPassword(email);

      showModal(
        'success',
        'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        () => router.push('/login')
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu email y te enviaremos un enlace para resetear tu contraseña
          </Text>
        </View>

        <View style={styles.form}>
          {/* Input de email */}
          <CustomInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="email"
            editable={!loading}
          />
        </View>

        {/* Botón principal */}
        <CustomButton
          title={loading ? 'Enviando...' : 'Enviar Email'}
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading || !email}
          size="large"
          icon="mail"
        />

        {/* Volver a Login */}
        <View style={styles.footer}>
          <LinkButton
            text="Volver al Login"
            onPress={() => router.push('/login')}
          />
        </View>
      </ScrollView>

      {/* Modal Reutilizable de Alertas */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={handleModalClose}
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
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  form: {
    marginVertical: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});