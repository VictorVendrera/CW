import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import theme from '../config/theme';

type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  padding?: keyof typeof theme.spacing | number;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  disabled = false,
  fullWidth = false,
  padding = 'md',
}) => {
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      padding: typeof padding === 'string' ? theme.spacing[padding] : padding,
      width: fullWidth ? '100%' : undefined,
    };

    switch (variant) {
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        break;
      case 'elevated':
        baseStyle.borderWidth = 0;
        baseStyle.shadowColor = theme.colors.black;
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3;
        break;
      default:
        baseStyle.backgroundColor = theme.colors.background;
    }

    return baseStyle;
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.8 : undefined}
    >
      {children}
    </CardComponent>
  );
};

export default Card; 