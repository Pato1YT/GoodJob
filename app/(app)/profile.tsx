//Codigo temporal para que no marque error en menu
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const [fullName, setFullName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2837');

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleSaveChanges = () => {
    Alert.alert('Éxito', 'Tus datos se han guardado correctamente.');
  };

  const handleSignOut = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive' },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Eliminar Cuenta', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado del Perfil / Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
              }}
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.editAvatarOverlay} activeOpacity={0.8}>
              <Text style={styles.editAvatarText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
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

          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveChanges} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
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
});