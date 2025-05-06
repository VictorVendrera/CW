import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import theme from '../config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  uppercase?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  uppercase = true,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    // Tamanho
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = theme.spacing.xs;
        baseStyle.paddingHorizontal = theme.spacing.md;
        break;
      case 'lg':
        baseStyle.paddingVertical = theme.spacing.md;
        baseStyle.paddingHorizontal = theme.spacing.lg;
        break;
      default: // md
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.paddingHorizontal = theme.spacing.md;
    }

    // Largura
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variante
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = theme.colors.transparent;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = theme.colors.transparent;
        break;
      default: // primary
        baseStyle.backgroundColor = theme.colors.primary;
    }

    // Estado
    if (disabled) {
      if (variant === 'outline' || variant === 'ghost') {
        baseStyle.borderColor = theme.colors.textTertiary;
      } else {
        baseStyle.backgroundColor = theme.colors.backgroundDark;
      }
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      fontWeight: 'bold',
      textAlign: 'center',
    };

    // Tamanho
    switch (size) {
      case 'sm':
        baseStyle.fontSize = theme.typography.fontSize.sm;
        break;
      case 'lg':
        baseStyle.fontSize = theme.typography.fontSize.lg;
        break;
      default: // md
        baseStyle.fontSize = theme.typography.fontSize.md;
    }

    // Variante
    switch (variant) {
      case 'outline':
        baseStyle.color = theme.colors.primary;
        break;
      case 'ghost':
        baseStyle.color = theme.colors.primary;
        break;
      default: // primary, secondary
        baseStyle.color = theme.colors.white;
    }

    // Estado
    if (disabled) {
      if (variant === 'outline' || variant === 'ghost') {
        baseStyle.color = theme.colors.textTertiary;
      }
    }

    // Caixa alta
    if (uppercase) {
      baseStyle.textTransform = 'uppercase';
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && iconPosition === 'left' && <View style={styles.leftIcon}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {uppercase ? title.toUpperCase() : title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.rightIcon}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...theme.shadows.sm,
  },
  text: {
    fontWeight: 'bold',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button; 