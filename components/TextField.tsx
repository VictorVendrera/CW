import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import theme from '../config/theme';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPressRightIcon?: () => void;
  autoFocus?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry = false,
  disabled = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = true,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyles = () => {
    const customStyles: StyleProp<TextStyle> = [styles.input];
    
    if (leftIcon) {
      customStyles.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon) {
      customStyles.push(styles.inputWithRightIcon);
    }
    
    if (multiline) {
      customStyles.push(styles.multilineInput);
    }
    
    if (inputStyle) {
      customStyles.push(inputStyle);
    }
    
    return customStyles;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={getInputStyles()}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          placeholderTextColor={theme.colors.textTertiary}
          autoFocus={autoFocus}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onPressRightIcon}
            disabled={!onPressRightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  focused: {
    borderColor: theme.colors.primary,
  },
  error: {
    borderColor: theme.colors.error,
  },
  disabled: {
    backgroundColor: theme.colors.backgroundDark,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  leftIcon: {
    paddingLeft: theme.spacing.md,
  },
  rightIcon: {
    paddingRight: theme.spacing.md,
  },
  helperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
  },
});

export default TextField; 