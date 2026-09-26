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
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../src/utils/useAuth';
import { tiene2FAActivado, desactivar2FA } from '../../src/utils/emailOtp';
import { userService, addressService, paymentMethodService, UserPaymentMethod } from '../../src/data/firestore';
import { Address } from '../../src/types';
import { auth, db } from '../../src/config/firebase';
import { CustomModal, ModalType } from '../../src/components/CustomModal';
import { useThemeStore } from '../../src/utils/themeStore';

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
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const themeColors = useThemeStore((s) => s.colors);

  const [userRole, setUserRole] = useState<'employer' | 'worker' | 'both'>('employer');
  const [workerData, setWorkerData] = useState<any | null>(null);
  const [isWorkerAvailable, setIsWorkerAvailable] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);

  // Estados para Edición de Perfil Profesional (Trabajador)
  const [workerCategory, setWorkerCategory] = useState('Fontanería');
  const [workerHourlyRate, setWorkerHourlyRate] = useState('250');
  const [workerExperience, setWorkerExperience] = useState('3');
  const [workerBio, setWorkerBio] = useState('');
  const [workerSkills, setWorkerSkills] = useState('');
  const [savingWorkerProfile, setSavingWorkerProfile] = useState(false);

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

  // Estados para Dirección física
  const [address, setAddress] = useState<Address | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Estados para Métodos de Pago reales en Firestore
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{
    type: 'card' | 'cash' | 'transfer';
    title: string;
    cardBrand: 'VISA' | 'MasterCard' | 'AMEX' | 'Otro';
    last4: string;
    expiryDate: string;
  }>({
    type: 'card',
    title: 'Tarjeta Personal',
    cardBrand: 'VISA',
    last4: '',
    expiryDate: '',
  });

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

  // Cargar datos reales del usuario y dirección
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadUserData = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            setLoading2FA(true);
            const [userDoc, enabled, userAddress, userPayments] = await Promise.all([
              userService.getById(currentUser.uid),
              tiene2FAActivado(currentUser.uid),
              addressService.getDefaultByUserId(currentUser.uid),
              paymentMethodService.getByUserId(currentUser.uid),
            ]);

            if (isMounted) {
              setPaymentMethods(userPayments || []);
              if (userDoc) {
                const combinedName = `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim();
                setFullName(combinedName || currentUser.displayName || '');
                setEmail(userDoc.email || currentUser.email || '');
                setPhone(userDoc.phone || '');
                setPhotoUrl(userDoc.photoUrl || currentUser.photoURL || null);
                setUserRole(userDoc.role || 'employer');
              } else {
                setFullName(currentUser.displayName || '');
                setEmail(currentUser.email || '');
                setPhotoUrl(currentUser.photoURL || null);
              }

              // Si el usuario es trabajador, cargar o auto-crear su ficha en 'workers'
              if (userDoc?.role === 'worker' || userDoc?.role === 'both') {
                try {
                  const workerSnap = await getDoc(doc(db, 'workers', currentUser.uid));
                  if (workerSnap.exists()) {
                    const wData = workerSnap.data();
                    setWorkerData(wData);
                    setIsWorkerAvailable(wData.available !== false);
                    setWorkerCategory(wData.category || wData.title || 'Fontanería');
                    setWorkerHourlyRate(wData.hourlyRate ? String(wData.hourlyRate) : '250');
                    setWorkerExperience(wData.yearsExperience ? String(wData.yearsExperience) : '3');
                    setWorkerBio(wData.bio || '');
                    setWorkerSkills(Array.isArray(wData.skills) ? wData.skills.join(', ') : '');
                  } else {
                    // Auto-sincronizar trabajador si no existía el documento (ej. cuenta de tu amigo)
                    const combinedName = `${userDoc?.firstName || ''} ${userDoc?.lastName || ''}`.trim() || 'Profesional GoodJob';
                    const newWorkerDoc = {
                      id: currentUser.uid,
                      userId: currentUser.uid,
                      firstName: userDoc?.firstName || '',
                      lastName: userDoc?.lastName || '',
                      userNameSnapshot: combinedName,
                      userPhotoSnapshot: userDoc?.photoUrl || '',
                      category: 'Fontanería',
                      title: 'Fontanería',
                      roleTitle: 'Fontanería',
                      hourlyRate: 250,
                      yearsExperience: 3,
                      bio: 'Profesional de servicios en GoodJob. Puntual y confiable.',
                      avgRating: 5.0,
                      totalReviews: 1,
                      completedJobs: 0,
                      verified: true,
                      available: true,
                      status: 'active',
                      skills: ['Servicios a domicilio', 'Garantía de trabajo'],
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    await setDoc(doc(db, 'workers', currentUser.uid), newWorkerDoc);
                    setWorkerData(newWorkerDoc);
                    setIsWorkerAvailable(true);
                    setWorkerCategory(newWorkerDoc.category);
                    setWorkerHourlyRate(String(newWorkerDoc.hourlyRate));
                    setWorkerExperience(String(newWorkerDoc.yearsExperience));
                    setWorkerBio(newWorkerDoc.bio);
                    setWorkerSkills(newWorkerDoc.skills.join(', '));
                  }
                } catch (wErr) {
                  console.warn('Error loading worker info in profile:', wErr);
                }
              }

              setIs2FAEnabled(enabled);
              setAddress(userAddress);
              if (userAddress) {
                setAddressForm({
                  street: userAddress.street || '',
                  number: userAddress.number || '',
                  neighborhood: userAddress.neighborhood || '',
                  city: userAddress.city || '',
                  state: userAddress.state || '',
                  zipCode: userAddress.zipCode || '',
                });
              }
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

  const handleToggleWorkerAvailability = async (newVal: boolean) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setIsWorkerAvailable(newVal);
    try {
      setUpdatingAvailability(true);
      await updateDoc(doc(db, 'workers', currentUser.uid), {
        available: newVal,
        updatedAt: new Date(),
      });
      showFeedbackModal(
        'success',
        newVal
          ? 'Ahora apareces como Disponible. Los clientes podrán ver tu perfil y agendarte servicios.'
          : 'Ahora apareces como No disponible. Tu perfil no aceptará nuevas reservas por el momento.'
      );
    } catch (e) {
      console.error('Error updating worker availability:', e);
      setIsWorkerAvailable(!newVal);
      showFeedbackModal('danger', 'No se pudo actualizar tu estado de disponibilidad.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

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

  const handleOpenPaymentModal = () => {
    setPaymentForm({
      type: 'card',
      title: 'Tarjeta Personal',
      cardBrand: 'VISA',
      last4: '',
      expiryDate: '',
    });
    setPaymentModalVisible(true);
  };

  const handleSavePaymentMethod = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (paymentForm.type === 'card' && (!paymentForm.last4.trim() || paymentForm.last4.length < 4)) {
      showFeedbackModal('warning', 'Por favor ingresa los 4 dígitos de la tarjeta.');
      return;
    }

    try {
      setSavingPayment(true);
      await paymentMethodService.add(currentUser.uid, {
        type: paymentForm.type,
        title: paymentForm.title.trim() || (paymentForm.type === 'card' ? 'Tarjeta Personal' : 'Efectivo'),
        cardBrand: paymentForm.cardBrand,
        last4: paymentForm.last4.trim().slice(-4),
        expiryDate: paymentForm.expiryDate.trim() || '12/28',
        isDefault: paymentMethods.length === 0,
      });

      const updated = await paymentMethodService.getByUserId(currentUser.uid);
      setPaymentMethods(updated);
      setPaymentModalVisible(false);
      showFeedbackModal('success', 'Método de pago guardado correctamente.');
    } catch (e) {
      console.error('Error saving payment method:', e);
      showFeedbackModal('danger', 'No se pudo guardar el método de pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await paymentMethodService.remove(id);
      setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
      showFeedbackModal('success', 'Método de pago eliminado.');
    } catch (e) {
      console.error('Error removing payment method:', e);
      showFeedbackModal('danger', 'No se pudo eliminar el método de pago.');
    }
  };

  const handleOpenAddressModal = () => {
    if (address) {
      setAddressForm({
        street: address.street || '',
        number: address.number || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
      });
    }
    setAddressModalVisible(true);
  };

  const handleSaveAddress = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!addressForm.street.trim() || !addressForm.city.trim()) {
      showFeedbackModal('warning', 'Por favor ingresa al menos la calle y la ciudad.');
      return;
    }

    try {
      setSavingAddress(true);
      await addressService.saveOrUpdate(currentUser.uid, {
        street: addressForm.street.trim(),
        number: addressForm.number.trim(),
        neighborhood: addressForm.neighborhood.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
      });

      const updated = await addressService.getDefaultByUserId(currentUser.uid);
      setAddress(updated);
      setAddressModalVisible(false);
      showFeedbackModal('success', 'Dirección actualizada correctamente.');
    } catch (e) {
      showFeedbackModal('danger', 'No se pudo guardar la dirección.');
    } finally {
      setSavingAddress(false);
    }
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

      // Si también es trabajador, sincronizar el nombre en workers
      if (userRole === 'worker' || userRole === 'both') {
        await updateDoc(doc(db, 'workers', currentUser.uid), {
          firstName,
          lastName,
          userNameSnapshot: fullName.trim(),
          updatedAt: new Date(),
        }).catch(() => {});
      }

      showFeedbackModal('success', 'Tus datos personales se han guardado correctamente.');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      showFeedbackModal('danger', 'No se pudieron guardar tus datos.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveWorkerProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const rateNum = parseFloat(workerHourlyRate);
    if (isNaN(rateNum) || rateNum < 0) {
      showFeedbackModal('warning', 'Por favor ingresa una tarifa válida por hora.');
      return;
    }

    const expNum = parseInt(workerExperience, 10);
    if (isNaN(expNum) || expNum < 0) {
      showFeedbackModal('warning', 'Por favor ingresa años de experiencia válidos.');
      return;
    }

    if (!workerBio.trim()) {
      showFeedbackModal('warning', 'Por favor escribe una breve descripción sobre tus servicios.');
      return;
    }

    try {
      setSavingWorkerProfile(true);
      const skillsArray = workerSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updatePayload: Record<string, any> = {
        category: workerCategory.trim(),
        title: workerCategory.trim(),
        roleTitle: workerCategory.trim(),
        hourlyRate: rateNum,
        yearsExperience: expNum,
        bio: workerBio.trim(),
        skills: skillsArray.length > 0 ? skillsArray : [workerCategory.trim(), 'Servicios a domicilio'],
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'workers', currentUser.uid), updatePayload);

      setWorkerData((prev: any) => ({
        ...prev,
        ...updatePayload,
      }));

      showFeedbackModal('success', 'Tu perfil profesional se ha actualizado con éxito. Ahora tus clientes verán tu oficio, tarifa y experiencia actualizados.');
    } catch (error) {
      console.error('Error al actualizar perfil profesional:', error);
      showFeedbackModal('danger', 'No se pudo actualizar tu perfil profesional.');
    } finally {
      setSavingWorkerProfile(false);
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
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado del Perfil / Avatar */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, isDark && { borderColor: themeColors.card }]}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarFallback, isDark && { backgroundColor: '#27272A' }]}>
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
          <Text style={[styles.profileName, isDark && { color: themeColors.text }]}>{fullName || 'Usuario'}</Text>
          <Text style={[styles.profileEmail, isDark && { color: themeColors.textSecondary }]}>{email || 'Sin correo'}</Text>

          {/* Badge y Control de Cuenta Profesional si es Trabajador */}
          {(userRole === 'worker' || userRole === 'both') && (
            <View style={[styles.workerProfileBadgeCard, isDark && { backgroundColor: '#064E3B', borderColor: '#047857' }]}>
              <View style={styles.workerBadgeHeader}>
                <View style={styles.workerRoleBadge}>
                  <Ionicons name="construct" size={14} color="#FFFFFF" />
                  <Text style={styles.workerRoleBadgeText}>
                    Cuenta Profesional • {workerData?.category || 'Especialista'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.viewPublicProfileBtn, isDark && { backgroundColor: '#1E1E22', borderColor: '#3F3F46' }]}
                  onPress={() => {
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      router.push(`/(workers)/${currentUser.uid}`);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewPublicProfileText, isDark && { color: '#34D399' }]}>Ver mi perfil público</Text>
                  <Ionicons name="chevron-forward" size={14} color={isDark ? '#34D399' : COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.workerAvailabilityRow, isDark && { backgroundColor: '#1E1E22', borderColor: '#2E2E35' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.workerAvailabilityTitle, isDark && { color: themeColors.text }]}>
                    {isWorkerAvailable ? '🟢 Disponible para trabajar' : '🔴 No disponible'}
                  </Text>
                  <Text style={[styles.workerAvailabilitySubtitle, isDark && { color: themeColors.textSecondary }]}>
                    {isWorkerAvailable
                      ? 'Tu perfil aparece en las búsquedas y puedes recibir solicitudes de clientes.'
                      : 'Tu perfil está en pausa y no recibirás solicitudes.'}
                  </Text>
                </View>
                <Switch
                  value={isWorkerAvailable}
                  onValueChange={handleToggleWorkerAvailability}
                  disabled={updatingAvailability}
                  trackColor={{ false: '#3F3F46', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          )}

          {/* Atajos Rápidos de Actividad */}
          <View style={styles.quickShortcutsRow}>
            <TouchableOpacity
              style={[styles.quickShortcutItem, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <View style={[styles.quickShortcutIcon, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                <Ionicons name="calendar-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
              </View>
              <Text style={[styles.quickShortcutLabel, isDark && { color: themeColors.text }]}>Mis Reservas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickShortcutItem, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <View style={[styles.quickShortcutIcon, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
              </View>
              <Text style={[styles.quickShortcutLabel, isDark && { color: themeColors.text }]}>Mensajes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickShortcutItem, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/activity')}
            >
              <View style={[styles.quickShortcutIcon, isDark && { backgroundColor: themeColors.surfaceLow }]}>
                <Ionicons name="heart-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
              </View>
              <Text style={[styles.quickShortcutLabel, isDark && { color: themeColors.text }]}>Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información Personal */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeader, isDark && { borderBottomColor: themeColors.border }]}>
            <Ionicons name="person-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
            <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Personal Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                isDark && {
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                isDark && {
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Phone</Text>
            <TextInput
              style={[
                styles.input,
                isDark && {
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.border,
                  color: themeColors.text,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isDark && { backgroundColor: themeColors.primary },
              savingUser && { opacity: 0.7 },
            ]}
            onPress={handleSaveChanges}
            activeOpacity={0.8}
            disabled={savingUser}
          >
            {savingUser ? (
              <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <Text style={[styles.primaryButtonText, isDark && { color: themeColors.onPrimary }]}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Edición de Perfil Profesional (Solo para Trabajadores) */}
        {(userRole === 'worker' || userRole === 'both') && (
          <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={[styles.cardHeaderBetween, isDark && { borderBottomColor: themeColors.border }]}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="construct-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
                <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Datos Profesionales (Trabajador)</Text>
              </View>
              <View style={[styles.workerActiveIndicator, isDark && { backgroundColor: '#064E3B' }]}>
                <Text style={[styles.workerActiveIndicatorText, isDark && { color: '#34D399' }]}>En vivo</Text>
              </View>
            </View>

            <Text style={[styles.sectionHelpText, isDark && { color: themeColors.textSecondary }]}>
              Esta información es visible para los clientes en tu perfil público y en los resultados de búsqueda.
            </Text>

            {/* Oficio / Especialidad */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Oficio / Especialidad Principal</Text>
              <TextInput
                style={[
                  styles.input,
                  isDark && {
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={workerCategory}
                onChangeText={setWorkerCategory}
                placeholder="Ej. Fontanero, Electricista, Carpintero..."
                placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
              />
            </View>

            {/* Tarifa por Hora y Años de Experiencia en fila */}
            <View style={styles.addressRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Tarifa por Hora (MXN)</Text>
                <TextInput
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    },
                  ]}
                  value={workerHourlyRate}
                  onChangeText={setWorkerHourlyRate}
                  keyboardType="numeric"
                  placeholder="250"
                  placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Años de Experiencia</Text>
                <TextInput
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    },
                  ]}
                  value={workerExperience}
                  onChangeText={setWorkerExperience}
                  keyboardType="numeric"
                  placeholder="3"
                  placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
                />
              </View>
            </View>

            {/* Biografía / Sobre mí */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Descripción / Sobre mí</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textAreaInput,
                  isDark && {
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={workerBio}
                onChangeText={setWorkerBio}
                placeholder="Describe tus servicios, experiencia, puntualidad y garantías..."
                placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Habilidades y Servicios (separados por coma) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && { color: themeColors.textSecondary }]}>Habilidades o Servicios (separados por coma)</Text>
              <TextInput
                style={[
                  styles.input,
                  isDark && {
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={workerSkills}
                onChangeText={setWorkerSkills}
                placeholder="Ej. Instalaciones, Emergencias 24/7, Garantía por escrito"
                placeholderTextColor={isDark ? '#71717A' : COLORS.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isDark && { backgroundColor: themeColors.primary },
                savingWorkerProfile && { opacity: 0.7 },
              ]}
              onPress={handleSaveWorkerProfile}
              activeOpacity={0.8}
              disabled={savingWorkerProfile}
            >
              {savingWorkerProfile ? (
                <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.primaryButtonText, isDark && { color: themeColors.onPrimary }]}>
                  Guardar Datos Profesionales
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Dirección */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeaderBetween, isDark && { borderBottomColor: themeColors.border }]}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="home-outline" size={20} color={isDark ? themeColors.primary : COLORS.textSecondary} />
              <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Dirección Principal</Text>
            </View>
            <TouchableOpacity onPress={handleOpenAddressModal}>
              <Text style={[styles.actionLinkText, isDark && { color: themeColors.primary }]}>{address ? 'Editar' : 'Agregar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressContent}>
            {address ? (
              <>
                <Text style={[styles.addressText, isDark && { color: themeColors.text }]}>
                  {address.street} {address.number}
                </Text>
                {!!address.neighborhood && (
                  <Text style={[styles.addressText, isDark && { color: themeColors.textSecondary }]}>Col. {address.neighborhood}</Text>
                )}
                <Text style={[styles.addressText, isDark && { color: themeColors.textSecondary }]}>
                  {address.city}{address.state ? `, ${address.state}` : ''}{address.zipCode ? ` C.P. ${address.zipCode}` : ''}
                </Text>
              </>
            ) : (
              <Text style={[styles.emptyAddressText, isDark && { color: themeColors.textSecondary }]}>
                No tienes una dirección registrada todavía. Toca "Agregar" para configurarla.
              </Text>
            )}
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeaderBetween, isDark && { borderBottomColor: themeColors.border }]}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="card-outline" size={20} color={isDark ? themeColors.primary : COLORS.textSecondary} />
              <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Métodos de Pago</Text>
            </View>
            <TouchableOpacity
              style={[styles.iconBadgeButton, isDark && { backgroundColor: themeColors.surfaceLow }]}
              activeOpacity={0.7}
              onPress={handleOpenPaymentModal}
            >
              <Ionicons name="add" size={18} color={isDark ? themeColors.primary : COLORS.primary} />
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyPaymentContainer}>
              <Text style={[styles.emptyAddressText, isDark && { color: themeColors.textSecondary }]}>
                No tienes métodos de pago guardados. Toca el botón "+" para agregar uno.
              </Text>
            </View>
          ) : (
            paymentMethods.map((pm) => (
              <View
                key={pm.id}
                style={[
                  styles.paymentCardRow,
                  isDark && {
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.paymentLeft}>
                  <View style={[styles.visaBadge, pm.type === 'cash' && { backgroundColor: '#E8F5E9' }, isDark && pm.type !== 'cash' && { backgroundColor: '#3F3F46' }]}>
                    <Text style={[styles.visaBadgeText, pm.type === 'cash' ? { color: '#2E7D32' } : isDark ? { color: '#F3F4F6' } : {}]}>
                      {pm.type === 'cash' ? 'EFECTIVO' : pm.cardBrand || 'VISA'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.paymentNumber, isDark && { color: themeColors.text }]}>
                      {pm.type === 'cash' ? pm.title : `•••• ${pm.last4}`}
                    </Text>
                    <Text style={[styles.paymentSubtext, isDark && { color: themeColors.textSecondary }]}>
                      {pm.type === 'cash' ? 'Pago en sitio' : `Vence ${pm.expiryDate}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePaymentMethod(pm.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Preferencias de Notificación */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeader, isDark && { borderBottomColor: themeColors.border }]}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
            <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Notification Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && { color: themeColors.text }]}>Email Updates</Text>
              <Text style={[styles.settingSubtitle, isDark && { color: themeColors.textSecondary }]}>News and special offers</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: isDark ? '#3F3F46' : COLORS.border, true: isDark ? '#FFFFFF' : COLORS.primary }}
              thumbColor={isDark ? (emailUpdates ? '#000000' : '#A1A1AA') : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && { color: themeColors.text }]}>SMS Alerts</Text>
              <Text style={[styles.settingSubtitle, isDark && { color: themeColors.textSecondary }]}>Important account notifications</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: isDark ? '#3F3F46' : COLORS.border, true: isDark ? '#FFFFFF' : COLORS.primary }}
              thumbColor={isDark ? (smsAlerts ? '#000000' : '#A1A1AA') : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Apariencia / Modo Oscuro */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeader, isDark && { borderBottomColor: themeColors.border }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={isDark ? '#FBBF24' : COLORS.primary} />
            <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Apariencia</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && { color: themeColors.text }]}>Modo Oscuro</Text>
              <Text style={[styles.settingSubtitle, isDark && { color: themeColors.textSecondary }]}>
                {isDark ? 'Tema nocturno activado' : 'Tema claro por defecto'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => toggleTheme()}
              trackColor={{ false: isDark ? '#3F3F46' : COLORS.border, true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Seguridad */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeaderBetween, isDark && { borderBottomColor: themeColors.border }]}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? themeColors.primary : COLORS.primary} />
              <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Seguridad</Text>
            </View>
            {loading2FA ? (
              <ActivityIndicator size="small" color={isDark ? themeColors.primary : COLORS.primary} />
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  is2FAEnabled ? styles.statusBadgeActive : (isDark ? { backgroundColor: '#2E2E35' } : styles.statusBadgeInactive),
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    is2FAEnabled ? styles.statusBadgeTextActive : (isDark ? { color: '#9CA3AF' } : styles.statusBadgeTextInactive),
                  ]}
                >
                  {is2FAEnabled ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.securityDescription, isDark && { color: themeColors.textSecondary }]}>
            Protege tu cuenta solicitando un código temporal de seguridad cada vez que inicies sesión.
          </Text>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              is2FAEnabled && styles.dangerSecondaryButton,
              isDark && !is2FAEnabled && { backgroundColor: themeColors.inputBg, borderColor: themeColors.border },
            ]}
            onPress={handleToggle2FA}
            activeOpacity={0.7}
            disabled={loading2FA}
          >
            <Ionicons
              name={is2FAEnabled ? 'shield-outline' : 'shield-checkmark-outline'}
              size={18}
              color={is2FAEnabled ? COLORS.error : (isDark ? themeColors.text : COLORS.text)}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                is2FAEnabled && { color: COLORS.error },
                isDark && !is2FAEnabled && { color: themeColors.text },
              ]}
            >
              {is2FAEnabled ? 'Desactivar verificación en dos pasos' : 'Activar verificación en dos pasos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Acciones de Cuenta */}
        <View style={[styles.card, isDark && { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={[styles.cardHeader, isDark && { borderBottomColor: themeColors.border }]}>
            <Ionicons name="settings-outline" size={20} color={isDark ? themeColors.primary : COLORS.textSecondary} />
            <Text style={[styles.cardTitle, isDark && { color: themeColors.text }]}>Account Actions</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                isDark && { backgroundColor: themeColors.inputBg, borderColor: themeColors.border },
              ]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={isDark ? themeColors.text : COLORS.text} />
              <Text style={[styles.secondaryButtonText, isDark && { color: themeColors.text }]}>Sign Out</Text>
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

      {/* Modal para editar Dirección física */}
      <Modal
        visible={addressModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddressModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.addressModalCard}>
                <View style={styles.photoModalIcon}>
                  <Ionicons name="home-outline" size={28} color="#000000" />
                </View>
                <Text style={styles.photoModalTitle}>Dirección Principal</Text>
                <Text style={styles.photoModalSubtitle}>
                  Ingresa tu domicilio para calcular la proximidad de los profesionales.
                </Text>

                <View style={styles.addressFormContainer}>
                  <View style={styles.addressRow}>
                    <TextInput
                      style={[styles.addressInput, { flex: 2 }]}
                      placeholder="Calle"
                      placeholderTextColor={COLORS.textSecondary}
                      value={addressForm.street}
                      onChangeText={(val) => setAddressForm((prev) => ({ ...prev, street: val }))}
                      editable={!savingAddress}
                    />
                    <TextInput
                      style={[styles.addressInput, { flex: 1 }]}
                      placeholder="Número"
                      placeholderTextColor={COLORS.textSecondary}
                      value={addressForm.number}
                      onChangeText={(val) => setAddressForm((prev) => ({ ...prev, number: val }))}
                      editable={!savingAddress}
                    />
                  </View>

                  <TextInput
                    style={styles.addressInput}
                    placeholder="Colonia / Barrio"
                    placeholderTextColor={COLORS.textSecondary}
                    value={addressForm.neighborhood}
                    onChangeText={(val) => setAddressForm((prev) => ({ ...prev, neighborhood: val }))}
                    editable={!savingAddress}
                  />

                  <View style={styles.addressRow}>
                    <TextInput
                      style={[styles.addressInput, { flex: 2 }]}
                      placeholder="Ciudad"
                      placeholderTextColor={COLORS.textSecondary}
                      value={addressForm.city}
                      onChangeText={(val) => setAddressForm((prev) => ({ ...prev, city: val }))}
                      editable={!savingAddress}
                    />
                    <TextInput
                      style={[styles.addressInput, { flex: 1 }]}
                      placeholder="C.P."
                      placeholderTextColor={COLORS.textSecondary}
                      value={addressForm.zipCode}
                      onChangeText={(val) => setAddressForm((prev) => ({ ...prev, zipCode: val }))}
                      keyboardType="number-pad"
                      editable={!savingAddress}
                    />
                  </View>

                  <TextInput
                    style={styles.addressInput}
                    placeholder="Estado / Provincia"
                    placeholderTextColor={COLORS.textSecondary}
                    value={addressForm.state}
                    onChangeText={(val) => setAddressForm((prev) => ({ ...prev, state: val }))}
                    editable={!savingAddress}
                  />
                </View>

                <View style={styles.photoModalButtonGroup}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    activeOpacity={0.8}
                    onPress={() => setAddressModalVisible(false)}
                    disabled={savingAddress}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmModalButton]}
                    activeOpacity={0.8}
                    onPress={handleSaveAddress}
                    disabled={savingAddress}
                  >
                    {savingAddress ? (
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

      {/* Modal para agregar Método de Pago */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPaymentModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.addressModalCard}>
                <View style={styles.photoModalIcon}>
                  <Ionicons name="card" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.photoModalTitle}>Agregar Método de Pago</Text>
                <Text style={styles.photoModalSubtitle}>
                  Registra tu tarjeta o preferencia de pago para tus servicios.
                </Text>

                {/* Selector de Tipo (Tarjeta vs Efectivo) */}
                <View style={styles.paymentTypeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeBtn,
                      paymentForm.type === 'card' && styles.paymentTypeBtnActive,
                    ]}
                    onPress={() => setPaymentForm((prev) => ({ ...prev, type: 'card' }))}
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={paymentForm.type === 'card' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.paymentTypeBtnText,
                        paymentForm.type === 'card' && styles.paymentTypeBtnTextActive,
                      ]}
                    >
                      Tarjeta
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentTypeBtn,
                      paymentForm.type === 'cash' && styles.paymentTypeBtnActive,
                    ]}
                    onPress={() => setPaymentForm((prev) => ({ ...prev, type: 'cash' }))}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color={paymentForm.type === 'cash' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.paymentTypeBtnText,
                        paymentForm.type === 'cash' && styles.paymentTypeBtnTextActive,
                      ]}
                    >
                      Efectivo en mano
                    </Text>
                  </TouchableOpacity>
                </View>

                {paymentForm.type === 'card' ? (
                  <View style={styles.addressFormContainer}>
                    <TextInput
                      style={styles.addressInput}
                      placeholder="Nombre o alias (ej. Débito BBVA)"
                      placeholderTextColor={COLORS.textSecondary}
                      value={paymentForm.title}
                      onChangeText={(val) => setPaymentForm((prev) => ({ ...prev, title: val }))}
                      editable={!savingPayment}
                    />

                    <View style={styles.addressRow}>
                      <TextInput
                        style={[styles.addressInput, { flex: 2 }]}
                        placeholder="Últimos 4 dígitos"
                        placeholderTextColor={COLORS.textSecondary}
                        value={paymentForm.last4}
                        onChangeText={(val) =>
                          setPaymentForm((prev) => ({ ...prev, last4: val.replace(/\D/g, '').slice(0, 4) }))
                        }
                        keyboardType="number-pad"
                        maxLength={4}
                        editable={!savingPayment}
                      />

                      <TextInput
                        style={[styles.addressInput, { flex: 1.5 }]}
                        placeholder="MM/AA"
                        placeholderTextColor={COLORS.textSecondary}
                        value={paymentForm.expiryDate}
                        onChangeText={(val) => setPaymentForm((prev) => ({ ...prev, expiryDate: val }))}
                        maxLength={5}
                        editable={!savingPayment}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.cashNoticeBox}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.cashNoticeText}>
                      Pagarás directamente al profesional al finalizar y quedar satisfecho con el trabajo.
                    </Text>
                  </View>
                )}

                <View style={styles.photoModalButtonGroup}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    activeOpacity={0.8}
                    onPress={() => setPaymentModalVisible(false)}
                    disabled={savingPayment}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmModalButton]}
                    activeOpacity={0.8}
                    onPress={handleSavePaymentMethod}
                    disabled={savingPayment}
                  >
                    {savingPayment ? (
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
  workerProfileBadgeCard: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  workerBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  workerRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  workerRoleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewPublicProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  viewPublicProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  workerAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  workerAvailabilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  workerAvailabilitySubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  quickShortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    gap: 10,
  },
  quickShortcutItem: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickShortcutIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickShortcutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
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
  emptyAddressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  addressModalCard: {
    width: '100%',
    maxWidth: 360,
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
  addressFormContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addressInput: {
    height: 46,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  emptyPaymentContainer: {
    paddingVertical: 12,
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 6,
    marginBottom: 16,
  },
  paymentTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  paymentTypeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentTypeBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  paymentTypeBtnTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  cashNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  cashNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  workerActiveIndicator: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  workerActiveIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  sectionHelpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  textAreaInput: {
    minHeight: 72,
    paddingTop: 10,
    lineHeight: 20,
  },
});