import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../config/theme';

export interface Option {
  id: string | number;
  label: string;
  value: any;
  disabled?: boolean;
}

interface OptionSelectorProps {
  options: Option[];
  selectedOption?: string | number | null;
  onSelect: (option: Option) => void;
  style?: StyleProp<ViewStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  selectedOptionStyle?: StyleProp<ViewStyle>;
  optionTextStyle?: StyleProp<TextStyle>;
  selectedOptionTextStyle?: StyleProp<TextStyle>;
  disabledOptionStyle?: StyleProp<ViewStyle>;
  disabledOptionTextStyle?: StyleProp<TextStyle>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  divider?: boolean;
  testID?: string;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedOption,
  onSelect,
  style,
  optionStyle,
  selectedOptionStyle,
  optionTextStyle,
  selectedOptionTextStyle,
  disabledOptionStyle,
  disabledOptionTextStyle,
  layout = 'horizontal',
  columns = 2,
  divider = false,
  testID,
}) => {
  const handleSelect = (option: Option) => {
    if (!option.disabled) {
      onSelect(option);
    }
  };

  const renderOption = (option: Option, index: number) => {
    const isSelected = selectedOption === option.id;
    const isDisabled = option.disabled;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.option,
          layout === 'grid' && styles.gridOption,
          layout === 'grid' && { width: `${100 / columns}%` },
          divider && styles.optionWithDivider,
          isSelected && styles.selectedOption,
          isDisabled && styles.disabledOption,
          optionStyle,
          isSelected && selectedOptionStyle,
          isDisabled && disabledOptionStyle,
        ]}
        onPress={() => handleSelect(option)}
        disabled={isDisabled}
        testID={`${testID}-option-${option.id}`}
      >
        <Text
          style={[
            styles.optionText,
            isSelected && styles.selectedOptionText,
            isDisabled && styles.disabledOptionText,
            optionTextStyle,
            isSelected && selectedOptionTextStyle,
            isDisabled && disabledOptionTextStyle,
          ]}
          numberOfLines={1}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        layout === 'horizontal' && styles.horizontalContainer,
        layout === 'vertical' && styles.verticalContainer,
        layout === 'grid' && styles.gridContainer,
        style,
      ]}
      testID={testID}
    >
      {options.map(renderOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    backgroundColor: theme.colors.background,
  },
  gridOption: {
    flexGrow: 1,
    flexShrink: 0,
  },
  optionWithDivider: {
    borderRightWidth: 0,
    borderRadius: 0,
    marginRight: 0,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  disabledOption: {
    backgroundColor: theme.colors.backgroundDark,
    borderColor: theme.colors.borderDark,
  },
  optionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  disabledOptionText: {
    color: theme.colors.textTertiary,
  },
});

export default OptionSelector; 