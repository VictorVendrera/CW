import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Share2 } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import firestore from '@react-native-firebase/firestore';
import theme from '../../config/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

type PaymentData = {
  cardNumber: string;
  expiryDate: string;
  cardType: string;
  chargeData: {
    id: string;
    amount: number;
    description: string;
    customer: string;
    date: string;
    merchant: string;
  };
  amount: number;
  installments: number;
  paymentType: 'credit' | 'debit';
};

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  
  // Carregar dados do pagamento
  useEffect(() => {
    if (params.paymentData) {
      try {
        const parsedData = JSON.parse(params.paymentData as string) as PaymentData;
        setPaymentData(parsedData);
        savePaymentToDatabase();
      } catch (error) {
        console.error('Erro ao processar dados do pagamento:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao processar os dados do pagamento');
        router.back();
      }
    } else {
      Alert.alert('Erro', 'Dados do pagamento não fornecidos');
      router.back();
    }
  }, [params.paymentData, router]);
  
  // Impedir voltar com o botão de hardware
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    
    return () => backHandler.remove();
  }, []);
  
  // Função para compartilhar recibo
  const shareReceipt = async () => {
    if (!paymentData) return;
    
    try {
      const lastFourDigits = paymentData.cardNumber 
        ? paymentData.cardNumber.slice(-4)
        : '****';

      const receiptText = `
Pagamento Confirmado!

Valor: ${formatCurrency(paymentData.amount)}
${paymentData.installments > 1 ? `Parcelamento: ${paymentData.installments}x de ${formatCurrency(paymentData.amount / paymentData.installments)}` : ''}
Descrição: ${paymentData.chargeData?.description || 'N/A'}
Comerciante: ${paymentData.chargeData?.merchant || 'N/A'}
Data: ${new Date().toLocaleDateString('pt-BR')}
Cartão: **** **** **** ${lastFourDigits}
Tipo: ${paymentData.cardType}
Validade: ${paymentData.expiryDate}

NFC PayFlow - Pagamento seguro e sem contato
      `;
      
      await Share.share({
        message: receiptText,
      });
    } catch (error) {
      console.error('Erro ao compartilhar recibo:', error);
    }
  };
  
  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  // Formatação de data e hora
  const formatDateTime = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleFinish = async () => {
    try {
      // Registrar o pagamento no Firestore
      // await firestore().collection('payments').add({
      //   status: 'completed',
      //   timestamp: firestore.FieldValue.serverTimestamp(),
      //   amount: paymentData?.amount,
      //   cardLastFour: paymentData?.cardNumber ? paymentData.cardNumber.slice(-4) : '****',
      //   cardType: paymentData?.cardType || 'Desconhecido',
      //   installments: paymentData?.installments || 1,
      //   paymentType: paymentData?.paymentType || 'credit',
      //   merchant: paymentData?.chargeData?.merchant || 'N/A',
      //   description: paymentData?.chargeData?.description || 'N/A'
      // });
      
      router.replace('/');
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      // Mesmo com erro, redireciona para a tela inicial
      router.replace('/');
    }
  };
  
  const handleShare = async () => {
    if (!paymentData) return;
    
    try {
      const message = `Pagamento de ${formatCurrency(paymentData.amount)} realizado com sucesso!\n\nDetalhes:\n- Cliente: ${paymentData.chargeData.customer}\n- Descrição: ${paymentData.chargeData.description}\n- Data: ${paymentData.chargeData.date}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const savePaymentToDatabase = async () => {
    if (!paymentData) return;

    try {
      // await firestore().collection('payments').add({
      //   ...paymentData,
      //   timestamp: firestore.FieldValue.serverTimestamp(),
      // });
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };
  
  if (!paymentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Erro ao carregar detalhes do pagamento</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Formatar número do cartão para exibição
  const displayCardNumber = paymentData.cardNumber 
    ? paymentData.cardNumber
    : '**** **** **** ****';
  
  // Formatar data de validade para exibição
  const displayExpiryDate = paymentData.expiryDate
    ? paymentData.expiryDate
    : 'MM/AA';
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <CheckCircle size={80} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Pagamento Concluído!</Text>
        
        <Text style={styles.amount}>
          {formatCurrency(paymentData.amount)}
        </Text>
        
        <View style={styles.receiptCard}>
          <Text style={styles.receiptTitle}>Recibo de Pagamento</Text>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Descrição</Text>
            <Text style={styles.receiptValue}>
              {paymentData.chargeData?.description || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Comerciante</Text>
            <Text style={styles.receiptValue}>
              {paymentData.chargeData?.merchant || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Data e Hora</Text>
            <Text style={styles.receiptValue}>
              {formatDateTime()}
            </Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Cartão</Text>
            <Text style={styles.receiptValue}>
              {displayCardNumber}
            </Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Tipo</Text>
            <Text style={styles.receiptValue}>
              {paymentData.cardType || 'Desconhecido'}
            </Text>
          </View>
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Validade</Text>
            <Text style={styles.receiptValue}>
              {displayExpiryDate}
            </Text>
          </View>
          
          {paymentData.paymentType === 'credit' && paymentData.installments > 1 && (
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>Parcelamento</Text>
              <Text style={styles.receiptValue}>
                {paymentData.installments}x de {formatCurrency(paymentData.amount / paymentData.installments)}
              </Text>
            </View>
          )}
          
          <View style={styles.receiptItem}>
            <Text style={styles.receiptLabel}>Autorização</Text>
            <Text style={styles.receiptValue}>
              {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.message}>
          Pagamento processado com sucesso!
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareReceipt}
          >
            <Share2 size={20} color="#00CC66" />
            <Text style={styles.shareButtonText}>Compartilhar Recibo</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleFinish}
        >
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Concluir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00CC66',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#00CC66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  message: {
    fontSize: 16,
    color: '#00CC66',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00CC66',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  shareButtonText: {
    marginLeft: 8,
    color: '#00CC66',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  homeButton: {
    backgroundColor: '#00CC66',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 