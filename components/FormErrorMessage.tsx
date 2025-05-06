import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface FormErrorMessageProps {
  /**
   * Mensagem de erro a ser exibida
   */
  message: string;
  
  /**
   * Se verdadeiro, o componente será renderizado, caso contrário não
   */
  visible?: boolean;
}

/**
 * Componente para exibir mensagens de erro em formulários
 */
export default function FormErrorMessage({ 
  message, 
  visible = true 
}: FormErrorMessageProps) {
  if (!visible || !message) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <AlertCircle size={16} color="#FF3B30" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF3B30',
    flex: 1,
  },
});