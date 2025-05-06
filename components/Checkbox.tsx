import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../config/theme';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  style?: any;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checked,
        disabled && styles.disabled
      ]}>
        {checked && (
          <MaterialIcons 
            name="check" 
            size={16} 
            color={disabled ? theme.colors.textSecondary : theme.colors.white} 
          />
        )}
      </View>
      {label && (
        <Text style={[
          styles.label,
          disabled && styles.disabledText
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checked: {
    backgroundColor: theme.colors.primary,
  },
  disabled: {
    borderColor: theme.colors.textSecondary,
    backgroundColor: theme.colors.backgroundDark,
  },
  label: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Checkbox; 