/**
 * GoodJob - Login Screen
 * Pantalla de inicio de sesión con el nuevo diseño UI y lógica integrada
 * 
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { getSpanishAuthErrorMessage } from '../../src/utils/firebaseErrors';
import { tiene2FAActivado, enviarCodigoOTP } from '../../src/utils/emailOtp';
import { setPendingUid } from '../../src/utils/pendingAuthStore';

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; message: string }>({
    type: 'danger',
    message: '',
  });

  const showErrorModal = (message: string) => {
    setModalConfig({ type: 'danger', message });
    setModalVisible(true);
  };

  const handleLogin = async () => {
    try {
      if (!email.trim()) {
        showErrorModal('Por favor ingresa tu correo');
        return;
      }
      if (!validateEmail(email)) {
        showErrorModal('Por favor ingresa un correo válido');
        return;
      }
      if (!password) {
        showErrorModal('Por favor ingresa tu contraseña');
        return;
      }

      const userCredential = await signIn(email, password);
      const tiene2FA = await tiene2FAActivado(userCredential.user.uid);

      if (tiene2FA) {
        await enviarCodigoOTP(userCredential.user.uid, email);
        setPendingUid(userCredential.user.uid);
        router.push('/(auth)/two_step_verification');
      } else {
        router.replace('/(app)');
      }
    } catch (err: any) {
      const rawCode = err?.code || (err instanceof Error ? err.message : '');
      const friendlyMessage = getSpanishAuthErrorMessage(rawCode);
      showErrorModal(friendlyMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inicio de Sesión</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.brandTitle}>Good Job</Text>
              <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#757575"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#757575"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (loading || !email || !password) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flexOne: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000000' },
  headerPlaceholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 40 },
  titleContainer: { alignItems: 'center', marginBottom: 28 },
  brandTitle: { fontSize: 38, fontWeight: '800', color: '#000000', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#666666' },
  form: { gap: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#000000' },
  eyeIcon: { padding: 4 },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 8 },
  forgotPasswordText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  signupText: { fontSize: 15, color: '#666666' },
  signupLink: { fontSize: 15, color: '#000000', fontWeight: '700' },
});