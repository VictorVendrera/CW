import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '../../utils/masks';

export default function StartNFCPaymentScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantDocument, setMerchantDocument] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerDocument, setPayerDocument] = useState('');
  
  // Função para validar os dados antes de prosseguir
  const validateForm = () => {
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido para o pagamento');
      return false;
    }
    
    if (!description) {
      Alert.alert('Erro', 'Informe uma descrição para o pagamento');
      return false;
    }
    
    if (!merchantName || !merchantDocument) {
      Alert.alert('Erro', 'Informe os dados do cobrador');
      return false;
    }
    
    if (!payerName) {
      Alert.alert('Erro', 'Informe o nome do pagador');
      return false;
    }
    
    return true;
  };
  
  // Processar o documento do comerciante (CNPJ ou CPF)
  const handleMerchantDocumentChange = (text: string) => {
    const numericText = text.replace(/\D/g, '');
    
    if (numericText.length <= 11) {
      setMerchantDocument(maskCPF(numericText));
    } else {
      setMerchantDocument(maskCNPJ(numericText));
    }
  };
  
  // Processar o documento do pagador (CPF)
  const handlePayerDocumentChange = (text: string) => {
    setPayerDocument(maskCPF(text));
  };
  
  // Processar o valor digitado
  const handleAmountChange = (text: string) => {
    // Remove tudo que não for número ou vírgula
    const sanitized = text.replace(/[^\d,]/g, '');
    
    // Garante apenas uma vírgula
    const parts = sanitized.split(',');
    let result = parts[0];
    
    if (parts.length > 1) {
      // Limita a 2 casas decimais
      result += ',' + parts[1].substring(0, 2);
    }
    
    setAmount(result);
  };
  
  // Enviar para a tela de compartilhamento de pagamento
  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }
    
    // Criar ID único para o pagamento
    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Formatar valor para passar como parâmetro (substituir vírgula por ponto)
    const amountParam = amount.replace(',', '.');
    
    // Navegar para a tela de compartilhamento
    router.push({
      pathname: '/(sender)/share-payment',
      params: {
        id: paymentId,
        amount: amountParam,
        description,
        merchantName,
        merchantDocument,
        payerName,
        payerDocument
      }
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Pagamento NFC</Text>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Dados do Pagamento</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmountChange}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Pagamento de serviço"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />
        </View>
        
        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Dados do Cobrador</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do Cobrador</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da empresa ou pessoa"
            placeholderTextColor="#999"
            value={merchantName}
            onChangeText={setMerchantName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>CNPJ/CPF do Cobrador</Text>
          <TextInput
            style={styles.input}
            placeholder="00.000.000/0000-00 ou 000.000.000-00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={merchantDocument}
            onChangeText={handleMerchantDocumentChange}
          />
        </View>
        
        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Dados do Pagador</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do Pagador</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#999"
            value={payerName}
            onChangeText={setPayerName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>CPF do Pagador (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={payerDocument}
            onChangeText={handlePayerDocumentChange}
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 