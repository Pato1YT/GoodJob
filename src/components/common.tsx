/**
 * GoodJob - Common UI Components
 * Componentes reutilizables para toda la app
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// ============================================================================
// COLORES Y ESTILOS GLOBALES
// ============================================================================

export const colors = {
  primary: '#000000',      // Negro (del logo)
  secondary: '#FFFFFF',    // Blanco
  accent: '#0066FF',       // Azul (acentos)
  danger: '#FF3B30',       // Rojo
  success: '#34C759',      // Verde
  gray: '#F2F2F7',         // Gris claro
  darkGray: '#8E8E93',     // Gris oscuro
  border: '#E5E5EA',       // Borde gris
  text: '#000000',         // Texto negro
  textLight: '#8E8E93',    // Texto gris
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// ============================================================================
// CUSTOM INPUT
// ============================================================================

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  error?: string;
  icon?: React.ReactNode;
}

export const CustomInput = React.forwardRef<TextInput, CustomInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      secureTextEntry,
      keyboardType = 'default',
      editable = true,
      error,
      icon,
    },
    ref
  ) => {
    return (
      <View style={styles.inputContainer}>
        <View style={[
            styles.inputWrapper,
            error ? styles.inputError : undefined,
        ]}>
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            editable={editable}
            placeholderTextColor={colors.textLight}
            style={[
                styles.input,
                icon ? styles.inputWithIcon : undefined,
            ]}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

CustomInput.displayName = 'CustomInput';

// ============================================================================
// CUSTOM BUTTON
// ============================================================================

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : colors.secondary}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`buttonText_${variant}`],
            styles[`buttonText_${size}`],
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// CUSTOM LINK BUTTON
// ============================================================================

interface LinkButtonProps {
  text: string;
  onPress: () => void;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.linkText}>{text}</Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// ERROR MESSAGE
// ============================================================================

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorMessage}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, right: 10 }}>
          <Text style={styles.errorDismiss}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// SUCCESS MESSAGE
// ============================================================================

interface SuccessMessageProps {
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.successContainer}>
      <Text style={styles.successMessage}>{message}</Text>
    </View>
  );
};

// ============================================================================
// DIVIDER
// ============================================================================

export const Divider: React.FC = () => {
  return <View style={styles.divider} />;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Input styles
  inputContainer: {
    marginVertical: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },

  // Button styles
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  button_danger: {
    backgroundColor: colors.danger,
  },
  button_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonText_primary: {
    color: colors.secondary,
  },
  buttonText_secondary: {
    color: colors.primary,
  },
  buttonText_danger: {
    color: colors.secondary,
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },

  // Link button
  linkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Error message
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorMessage: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorDismiss: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: 'bold',
  },

  // Success message
  successContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#E5F5E5',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successMessage: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});

export default {
  colors,
  spacing,
  borderRadius,
  CustomInput,
  CustomButton,
  LinkButton,
  ErrorMessage,
  SuccessMessage,
  Divider,
};
