/**
 * Creacion de metodo de verificacion en dos pasos en este caso usaremmos 
 * la verificacion mediante SMS como lo vamos hacer pues quien sabe jajaj
 * 
 */
import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { CustomButton, CustomInput, LinkButton, colors, spacing } from '../../src/components/common';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import { verificarCodigoOTP, enviarCodigoOTP } from '../../src/utils/emailOtp';
import { getPendingUid, clearPendingUid } from '../../src/utils/pendingAuthStore';
import { auth } from '../../src/config/firebase';

export default function TwoFactorAuthScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; message: string }>({
    type: 'danger',
    message: '',
  });

  const uid = getPendingUid();

  useEffect(() => {
    if (!uid) {
      router.replace('/login');
    }
  }, []);

  const showErrorModal = (message: string) => {
    setModalConfig({ type: 'danger', message });
    setModalVisible(true);
  };

  const handleVerify = async () => {
    if (!uid) return;

    if (code.length < 6) {
      showErrorModal('Ingresa el código de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      const esValido = await verificarCodigoOTP(uid, code);

      if (esValido) {
        clearPendingUid();
        router.replace('/(app)');
      } else {
        showErrorModal('El código es inválido o ya expiró');
      }
    } catch (err: any) {
      const rawCode = err?.code || (err instanceof Error ? err.message : '');
      showErrorModal(getSpanishAuthErrorMessage(rawCode));
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (!uid || !auth.currentUser?.email) return;
    try {
      setReenviando(true);
      await enviarCodigoOTP(uid, auth.currentUser.email);
      showErrorModal('Te enviamos un nuevo código a tu correo');
    } catch (err) {
      showErrorModal('No se pudo reenviar el código');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verificación en dos pasos</Text>
        <Text style={styles.subtitle}>Te enviamos un código de 6 dígitos a tu correo electrónico</Text>

        <CustomInput
          placeholder="Código de 6 dígitos"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          editable={!loading}
        />

        <CustomButton
          title={loading ? 'Verificando...' : 'Confirmar código'}
          onPress={handleVerify}
          loading={loading}
          disabled={loading || code.length < 6}
          size="large"
        />

        <LinkButton
          text={reenviando ? 'Enviando...' : '¿No te llegó? Reenviar código'}
          onPress={handleReenviar}
        />
      </View>

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
  container: { flex: 1, backgroundColor: colors.secondary },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.lg },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
});