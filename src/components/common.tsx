/**
 * GoodJob - Common UI Components (CON LUCIDE ICONS)
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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  CheckCircle,
  Phone,
  User,
  Settings,
  LogOut,
  Search,
  MapPin,
  Star,
  Wrench,
  Zap,
  Wind,
  Leaf,
  Hammer,
  Paintbrush,
  Snowflake,
} from 'lucide-react-native';

// ============================================================================
// COLORES Y ESTILOS GLOBALES
// ============================================================================

export const colors = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#0066FF',
  danger: '#FF3B30',
  success: '#34C759',
  gray: '#F2F2F7',
  darkGray: '#8E8E93',
  border: '#E5E5EA',
  text: '#000000',
  textLight: '#8E8E93',
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
// ICON MAP - Mapear nombres a componentes
// ============================================================================

const iconMap: { [key: string]: React.ComponentType<any> } = {
  email: Mail,
  lock: Lock,
  'lock-check': Lock,
  eye: Eye,
  'eye-off': EyeOff,
  check: Check,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  phone: Phone,
  account: User,
  settings: Settings,
  cog: Settings,
  logout: LogOut,
  search: Search,
  magnify: Search,
  'map-marker': MapPin,
  star: Star,
  'pipe': Wrench,
  'lightning-bolt': Zap,
  'broom': Wind,
  leaf: Leaf,
  hammer: Hammer,
  'paint-brush': Paintbrush,
  snowflake: Snowflake,
  'account-plus': User,
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  return iconMap[iconName] || User;
};

// ============================================================================
// CUSTOM INPUT CON ICONOS
// ============================================================================

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  icon?: string;
}

export const CustomInput = React.forwardRef<TextInput, CustomInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      secureTextEntry,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      editable = true,
      error,
      icon,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
    const IconComponent = getIconComponent(icon);

    return (
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, error ? styles.inputError : undefined]}>
          {IconComponent && (
            <View style={styles.inputIcon}>
              <IconComponent size={20} color={colors.textLight} strokeWidth={2} />
            </View>
          )}
          <TextInput
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            editable={editable}
            autoCapitalize={autoCapitalize}
            placeholderTextColor={colors.textLight}
            style={[styles.input, icon ? styles.inputWithIcon : undefined]}
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              {showPassword ? (
                <Eye size={20} color={colors.textLight} strokeWidth={2} />
              ) : (
                <EyeOff size={20} color={colors.textLight} strokeWidth={2} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

CustomInput.displayName = 'CustomInput';

// ============================================================================
// CUSTOM BUTTON CON ÍCONO OPCIONAL
// ============================================================================

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
}) => {
  const isDisabled = disabled || loading;
  const IconComponent = getIconComponent(icon);
  const iconColor = variant === 'secondary' ? colors.primary : colors.secondary;

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
        <View style={styles.buttonContent}>
          {IconComponent && (
            <IconComponent
              size={18}
              color={iconColor}
              strokeWidth={2}
              style={styles.buttonIcon}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              styles[`buttonText_${variant}`],
              styles[`buttonText_${size}`],
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// CUSTOM LINK BUTTON CON ÍCONO
// ============================================================================

interface LinkButtonProps {
  text: string;
  onPress: () => void;
  icon?: string;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ text, onPress, icon }) => {
  const IconComponent = getIconComponent(icon);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.linkContainer}>
      {IconComponent && (
        <IconComponent
          size={14}
          color={colors.accent}
          strokeWidth={2}
          style={styles.linkIcon}
        />
      )}
      <Text style={styles.linkText}>{text}</Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// ERROR MESSAGE CON ÍCONO
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
      <AlertCircle
        size={20}
        color={colors.danger}
        strokeWidth={2}
        style={styles.errorIcon}
      />
      <Text style={styles.errorMessage}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={styles.errorDismiss}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// SUCCESS MESSAGE CON ÍCONO
// ============================================================================

interface SuccessMessageProps {
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.successContainer}>
      <CheckCircle
        size={20}
        color={colors.success}
        strokeWidth={2}
        style={styles.successIcon}
      />
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
// RATING STARS CON ICONOS
// ============================================================================

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 16,
  color = '#FFB800',
}) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={color}
          fill={star <= Math.round(rating) ? color : 'none'}
          strokeWidth={2}
        />
      ))}
    </View>
  );
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: spacing.sm,
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
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: spacing.xs,
  },
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  errorIcon: {
    marginRight: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#E5F5E5',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successIcon: {
    marginRight: spacing.md,
  },
  successMessage: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  RatingStars,
  Divider,
};
