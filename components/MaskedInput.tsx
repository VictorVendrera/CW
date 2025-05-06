import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { maskCPF, maskCNPJ, maskPhone, maskCEP, maskCreditCard } from '../utils/masks';
import FormErrorMessage from './FormErrorMessage';

type MaskType = 'cpf' | 'cnpj' | 'phone' | 'cep' | 'creditCard' | 'custom';

interface MaskedInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  /**
   * Tipo de máscara a ser aplicada
   */
  mask: MaskType;
  
  /**
   * Valor atual do campo
   */
  value: string;
  
  /**
   * Função chamada quando o valor muda
   */
  onChangeText: (text: string) => void;
  
  /**
   * Função de máscara personalizada (usada apenas quando mask é 'custom')
   */
  customMask?: (value: string) => string;
  
  /**
   * Rótulo do campo
   */
  label?: string;
  
  /**
   * Mensagem de erro (se houver)
   */
  error?: string;
  
  /**
   * Se verdadeiro, retorna o valor sem máscara ao chamar onChangeText
   */
  returnUnmasked?: boolean;
}

/**
 * Componente de campo de entrada que aplica máscaras automaticamente
 */
export default function MaskedInput({
  mask,
  value,
  onChangeText,
  customMask,
  label,
  error,
  returnUnmasked = false,
  ...rest
}: MaskedInputProps) {
  const [maskedValue, setMaskedValue] = useState('');
  
  // Aplicar máscara quando o valor muda
  useEffect(() => {
    if (value !== undefined) {
      setMaskedValue(applyMask(value));
    }
  }, [value, mask, customMask]);
  
  // Função para aplicar a máscara conforme o tipo
  const applyMask = (text: string): string => {
    switch (mask) {
      case 'cpf':
        return maskCPF(text);
      case 'cnpj':
        return maskCNPJ(text);
      case 'phone':
        return maskPhone(text);
      case 'cep':
        return maskCEP(text);
      case 'creditCard':
        return maskCreditCard(text);
      case 'custom':
        return customMask ? customMask(text) : text;
      default:
        return text;
    }
  };
  
  // Função para remover todos os caracteres não numéricos
  const unmask = (text: string): string => {
    return text.replace(/\D/g, '');
  };
  
  // Manipulador de alteração de texto
  const handleChangeText = (text: string) => {
    const masked = applyMask(text);
    setMaskedValue(masked);
    
    // Retorna o valor com ou sem máscara conforme configuração
    if (returnUnmasked) {
      onChangeText(unmask(text));
    } else {
      onChangeText(masked);
    }
  };
  
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, error ? styles.labelError : null]}>{label}</Text>}
      
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={maskedValue}
        onChangeText={handleChangeText}
        keyboardType={
          mask === 'cpf' || mask === 'cnpj' || mask === 'phone' || mask === 'cep' || mask === 'creditCard'
            ? 'numeric'
            : rest.keyboardType
        }
        {...rest}
      />
      
      {error && <FormErrorMessage message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  labelError: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
}); 