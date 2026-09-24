import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ModalType = 'primary' | 'success' | 'info' | 'warning' | 'danger';

interface CustomModalProps {
  visible: boolean;
  type?: ModalType;
  title?: string;
  message: string;
  buttonText?: string;
  secondaryButtonText?: string;
  onClose: () => void;
  onSecondaryPress?: () => void;
}

const TYPE_CONFIG = {
  primary: {
    color: '#007AFF',
    icon: 'information-circle' as const,
    defaultTitle: 'Información',
  },
  success: {
    color: '#34C759',
    icon: 'checkmark-circle' as const,
    defaultTitle: '¡Éxito!',
  },
  info: {
    color: '#5AC8FA',
    icon: 'information-circle-outline' as const,
    defaultTitle: 'Aviso',
  },
  warning: {
    color: '#FF9500',
    icon: 'warning' as const,
    defaultTitle: 'Advertencia',
  },
  danger: {
    color: '#FF3B30',
    icon: 'alert-circle' as const,
    defaultTitle: 'Error',
  },
};

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  type = 'primary',
  title,
  message,
  buttonText = 'Entendido',
  secondaryButtonText,
  onClose,
  onSecondaryPress,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.primary;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Icono de Tipo */}
              <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.icon} size={36} color={config.color} />
              </View>

              {/* Título y Mensaje */}
              <Text style={styles.title}>{title || config.defaultTitle}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Botones */}
              <View style={styles.buttonGroup}>
                {secondaryButtonText && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    activeOpacity={0.8}
                    onPress={onSecondaryPress || onClose}
                  >
                    <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.button,
                    secondaryButtonText ? styles.flexButton : { width: '100%' },
                    { backgroundColor: config.color },
                  ]}
                  activeOpacity={0.8}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1D',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#4C4546',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});