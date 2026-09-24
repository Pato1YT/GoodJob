//Codigo temporal para que no marque error en menu
import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/utils/useAuth';
import { tiene2FAActivado, desactivar2FA } from '../../src/utils/emailOtp';
import { userService } from '../../src/data/firestore';
import { auth } from '../../src/config/firebase';
import { CustomModal, ModalType } from '../../src/components/CustomModal';

const COLORS = {
  primary: '#000000',
  primaryLight: '#F3F4F6',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  error: '#DC2626',
  errorBg: '#FEE2E2',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);

  // Estados para CustomModal reutilizable
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title?: string;
    message: string;
    buttonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
  }>({
    type: 'info',
    message: '',
  });

  // Modal para editar foto de perfil (100% compatible con Móvil y Web)
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [inputPhotoUrl, setInputPhotoUrl] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  const showFeedbackModal = (
    type: ModalType,
    message: string,
    title?: string,
    buttonText: string = 'Entendido',
    secondaryButtonText?: string,
    onPrimaryPress?: () => void,
    onSecondaryPress?: () => void
  ) => {
    setModalConfig({
      type,
      title,
      message,
      buttonText,
      secondaryButtonText,
      onPrimaryPress,
      onSecondaryPress,
    });
    setModalVisible(true);
  };

  // Cargar datos reales del usuario
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadUserData = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            setLoading2FA(true);
            const [userDoc, enabled] = await Promise.all([
              userService.getById(currentUser.uid),
              tiene2FAActivado(currentUser.uid),
            ]);

            if (isMounted) {
              if (userDoc) {
                const combinedName = `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim();
                setFullName(combinedName || currentUser.displayName || '');
                setEmail(userDoc.email || currentUser.email || '');
                setPhone(userDoc.phone || '');
                setPhotoUrl(userDoc.photoUrl || currentUser.photoURL || null);
              } else {
                setFullName(currentUser.displayName || '');
                setEmail(currentUser.email || '');
                setPhotoUrl(currentUser.photoURL || null);
              }
              setIs2FAEnabled(enabled);
            }
          } catch (e) {
            console.error('Error al cargar datos del usuario:', e);
          } finally {
            if (isMounted) setLoading2FA(false);
          }
        } else {
          if (isMounted) setLoading2FA(false);
        }
      };
      loadUserData();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      showFeedbackModal(
        'warning',
        '¿Estás seguro de que deseas desactivar la verificación en dos pasos?',
        'Desactivar 2FA',
        'Desactivar',
        'Cancelar',
        async () => {
          setModalVisible(false);
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              await desactivar2FA(currentUser.uid);
              setIs2FAEnabled(false);
              showFeedbackModal('success', 'La verificación en dos pasos ha sido desactivada.');
            } catch (error) {
              showFeedbackModal('danger', 'No se pudo desactivar el 2FA.');
            }
          }
        },
        () => setModalVisible(false)
      );
    } else {
      router.push('/(security)/setup-2fa');
    }
  };

  const handleOpenPhotoModal = () => {
    setInputPhotoUrl(photoUrl || '');
    setPhotoModalVisible(true);
  };

  const handleSavePhotoUrl = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const cleanUrl = inputPhotoUrl.trim();

    try {
      setSavingPhoto(true);
      await userService.update(currentUser.uid, { photoUrl: cleanUrl });
      setPhotoUrl(cleanUrl || null);
      setPhotoModalVisible(false);
      showFeedbackModal('success', 'Foto de perfil actualizada correctamente.');
    } catch (e) {
      showFeedbackModal('danger', 'No se pudo actualizar la foto de perfil.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleSaveChanges = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setSavingUser(true);
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await userService.update(currentUser.uid, {
        firstName,
        lastName,
        phone: phone.trim(),
        photoUrl: photoUrl || undefined,
      });
      showFeedbackModal('success', 'Tus datos se han guardado correctamente.');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      showFeedbackModal('danger', 'No se pudieron guardar tus datos.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleSignOut = () => {
    showFeedbackModal(
      'warning',
      '¿Estás seguro de que deseas salir?',
      'Cerrar Sesión',
      'Cerrar sesión',
      'Cancelar',
      async () => {
        setModalVisible(false);
        try {
          await logout();
        } catch (error) {
          showFeedbackModal('danger', 'No se pudo cerrar la sesión.');
        }
      },
      () => setModalVisible(false)
    );
  };

  const handleDeleteAccount = () => {
    showFeedbackModal(
      'danger',
      'Esta acción eliminará tu cuenta permanentemente y no se puede deshacer.',
      'Eliminar Cuenta',
      'Eliminar',
      'Cancelar',
      () => {
        setModalVisible(false);
        showFeedbackModal('info', 'Por seguridad, contacta a soporte para completar la eliminación.');
      },
      () => setModalVisible(false)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado del Perfil / Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarOverlay}
              activeOpacity={0.8}
              onPress={handleOpenPhotoModal}
            >
              <Text style={styles.editAvatarText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName || 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{email || 'Sin correo'}</Text>
        </View>

        {/* Información Personal */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, savingUser && { opacity: 0.7 }]}
            onPress={handleSaveChanges}
            activeOpacity={0.8}
            disabled={savingUser}
          >
            {savingUser ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Dirección */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="home-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.cardTitle}>Address</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.actionLinkText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressText}>123 Innovation Drive</Text>
            <Text style={styles.addressText}>Suite 400</Text>
            <Text style={styles.addressText}>San Francisco, CA 94105</Text>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.cardTitle}>Payment Methods</Text>
            </View>
            <TouchableOpacity style={styles.iconBadgeButton}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.paymentCardRow}>
            <View style={styles.paymentLeft}>
              <View style={styles.visaBadge}>
                <Text style={styles.visaBadgeText}>VISA</Text>
              </View>
              <View>
                <Text style={styles.paymentNumber}>•••• 4242</Text>
                <Text style={styles.paymentSubtext}>Expires 12/25</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferencias de Notificación */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Notification Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Email Updates</Text>
              <Text style={styles.settingSubtitle}>News and special offers</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>SMS Alerts</Text>
              <Text style={styles.settingSubtitle}>Important account notifications</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Seguridad */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Seguridad</Text>
            </View>
            {loading2FA ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  is2FAEnabled ? styles.statusBadgeActive : styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    is2FAEnabled ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive,
                  ]}
                >
                  {is2FAEnabled ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.securityDescription}>
            Protege tu cuenta solicitando un código temporal de seguridad cada vez que inicies sesión.
          </Text>

          <TouchableOpacity
            style={[styles.secondaryButton, is2FAEnabled && styles.dangerSecondaryButton]}
            onPress={handleToggle2FA}
            activeOpacity={0.7}
            disabled={loading2FA}
          >
            <Ionicons
              name={is2FAEnabled ? 'shield-outline' : 'shield-checkmark-outline'}
              size={18}
              color={is2FAEnabled ? COLORS.error : COLORS.text}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                is2FAEnabled && { color: COLORS.error },
              ]}
            >
              {is2FAEnabled ? 'Desactivar verificación en dos pasos' : 'Activar verificación en dos pasos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Acciones de Cuenta */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.cardTitle}>Account Actions</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.text} />
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para editar foto de perfil (Compatible 100% con Android, iOS y Web) */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPhotoModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.photoModalCard}>
                <View style={styles.photoModalIcon}>
                  <Ionicons name="camera-outline" size={32} color="#000000" />
                </View>
                <Text style={styles.photoModalTitle}>Foto de Perfil</Text>
                <Text style={styles.photoModalSubtitle}>
                  Ingresa el enlace (URL) directo de tu nueva imagen de perfil:
                </Text>

                <TextInput
                  style={styles.photoModalInput}
                  placeholder="https://ejemplo.com/mifoto.jpg"
                  placeholderTextColor={COLORS.textSecondary}
                  value={inputPhotoUrl}
                  onChangeText={setInputPhotoUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!savingPhoto}
                />

                <View style={styles.photoModalButtonGroup}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    activeOpacity={0.8}
                    onPress={() => setPhotoModalVisible(false)}
                    disabled={savingPhoto}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmModalButton]}
                    activeOpacity={0.8}
                    onPress={handleSavePhotoUrl}
                    disabled={savingPhoto}
                  >
                    {savingPhoto ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmModalButtonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Feedback (Éxito, Error, Confirmación) */}
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onClose={() => {
          if (modalConfig.onPrimaryPress) {
            modalConfig.onPrimaryPress();
          } else {
            setModalVisible(false);
          }
        }}
        onSecondaryPress={modalConfig.onSecondaryPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 8,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  editAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addressContent: {
    gap: 2,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  iconBadgeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visaBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  visaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  paymentNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.inputBg,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.errorBg,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: '#15803D',
  },
  statusBadgeTextInactive: {
    color: '#6B7280',
  },
  securityDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  dangerSecondaryButton: {
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backgroundColor: '#FEF2F2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  photoModalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  photoModalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  photoModalInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    marginBottom: 18,
  },
  photoModalButtonGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelModalButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: '#000000',
  },
  confirmModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});