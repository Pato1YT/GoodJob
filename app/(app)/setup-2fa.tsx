import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { CustomInput, CustomButton, colors, spacing } from '../../src/components/common';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { enviarCodigoOTP, verificarCodigoOTP, activar2FA } from '../../src/utils/emailOtp';
import { auth } from '../../src/config/firebase';
import {useAuth} from '../../src/utils/useAuth';

type Step = 'inicio' | 'confirmar' | 'listo';

export default function Setup2FAScreen() {
  const {logout} = useAuth();
  const [step, setStep] = useState<Step>('inicio');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; message: string }>({
    type: 'danger',
    message: '',
  });

  const showModal = (type: ModalType, message: string) => {
    setModalConfig({ type, message });
    setModalVisible(true);
  };

  const iniciarActivacion = async () =>{
    const user =auth.currentUser;
    if(!user?.email) return;

    try{
      setLoading(true);
      await enviarCodigoOTP(user.uid, user.email);
      setStep('confirmar');

    }catch(err){
      console.error('ERROR REAL:', err);
      showModal('danger','no se pudo enviar el codigo');

    }finally{
      setLoading(false);
    }
  };

  const confirmarActivacion = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (code.length < 6) {
      showModal('danger', 'Ingresa el código de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      const esValido = await verificarCodigoOTP(user.uid, code);
      if (esValido) {
        await activar2FA(user.uid);
        setStep('listo');
      } else {
        showModal('danger', 'El código no es válido o ya expiró');
      }
    } catch (err) {
      showModal('danger', 'Ocurrió un error al confirmar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {step === 'inicio' && (
          <>
            <Text style={styles.title}>Activar verificación en dos pasos</Text>
            <Text style={styles.subtitle}>
              Te enviaremos un código a tu correo para confirmar la activación
            </Text>
            <CustomButton
              title={loading ? 'Enviando...' : 'Enviar código'}
              onPress={iniciarActivacion}
              loading={loading}
              size="large"
            />
          </>
        )}

        {step === 'confirmar' && (
          <>
            <Text style={styles.title}>Revisa tu correo</Text>
            <Text style={styles.subtitle}>Ingresa el código de 6 dígitos que te enviamos</Text>

            <CustomInput
              placeholder="Código de 6 dígitos"
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              editable={!loading}
            />

            <CustomButton
              title={loading ? 'Confirmando...' : 'Confirmar'}
              onPress={confirmarActivacion}
              loading={loading}
              disabled={loading || code.length < 6}
              size="large"
            />
          </>
        )}

        {step === 'listo' && (
          <>
            <Text style={styles.title}>¡Listo!</Text>
            <Text style={styles.subtitle}>
              La verificación en dos pasos por correo quedó activada en tu cuenta correctamente.
              
            </Text>
            <CustomButton
            title = "Ir al inicio de sesíon"
            onPress={logout}
            size="large"
            />
          </>
        )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center' },
});