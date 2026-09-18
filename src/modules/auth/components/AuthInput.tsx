import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../shared/theme/colors';

interface AuthInputProps extends TextInputProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  iconName,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  ...rest
}) => {
  return (
    <View style={styles.inputContainer}>
      <MaterialIcons
        name={iconName}
        size={20}
        color={COLORS.textSecondary}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={isPassword && !showPassword}
        {...rest}
      />
      {isPassword && onTogglePassword && (
        <TouchableOpacity
          onPress={onTogglePassword}
          style={styles.eyeIcon}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
});