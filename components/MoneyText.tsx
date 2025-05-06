import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import theme from '../config/theme';

type MoneyTextSize = 'sm' | 'md' | 'lg' | 'xl';

interface MoneyTextProps {
  value: number;
  size?: MoneyTextSize;
  color?: string;
  style?: StyleProp<TextStyle>;
  fontWeight?: 'normal' | 'bold' | 'medium';
  showCurrency?: boolean;
  currencySymbol?: string;
}

const MoneyText: React.FC<MoneyTextProps> = ({
  value,
  size = 'md',
  color,
  style,
  fontWeight = 'bold',
  showCurrency = true,
  currencySymbol = 'R$',
}) => {
  // Calcula o tamanho da fonte com base no tamanho selecionado
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.md;
      case 'lg':
        return theme.typography.fontSize.xxl;
      case 'xl':
        return theme.typography.fontSize.xxxl;
      default: // md
        return theme.typography.fontSize.lg;
    }
  };

  // Define o peso da fonte
  const getFontWeight = () => {
    switch (fontWeight) {
      case 'medium':
        return '500' as const;
      case 'bold':
        return 'bold' as const;
      default:
        return 'normal' as const;
    }
  };

  // Formata o valor para o padrão de moeda brasileiro
  const formatValue = () => {
    const formattedValue = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    const [intPart, decimalPart] = formattedValue.split(',');
    
    const fontSize = getFontSize();
    const textColor = color || theme.colors.text;
    const textWeight = getFontWeight();
    
    const textStyle: TextStyle = {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize,
      fontWeight: textWeight,
      color: textColor,
    };

    const decimalStyle: TextStyle = {
      ...textStyle,
      fontSize: typeof fontSize === 'number' ? Math.max(fontSize * 0.8, 12) : fontSize,
    };
    
    if (showCurrency) {
      return (
        <Text style={[textStyle, style]}>
          <Text style={textStyle}>{currencySymbol} </Text>
          <Text style={textStyle}>{intPart}</Text>
          <Text style={decimalStyle}>,{decimalPart}</Text>
        </Text>
      );
    }
    
    return (
      <Text style={[textStyle, style]}>
        <Text style={textStyle}>{intPart}</Text>
        <Text style={decimalStyle}>,{decimalPart}</Text>
      </Text>
    );
  };

  return formatValue();
};

const styles = StyleSheet.create({
  text: {
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
});

export default MoneyText; 