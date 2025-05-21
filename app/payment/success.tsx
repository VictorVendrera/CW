import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Share, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { Share2, ArrowLeft, Check, AlertCircle } from 'lucide-react-native';
import theme from '../../config/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MoneyText from '../../components/MoneyText';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

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
    merchantName: string;
    merchantId: string;
    maxInstallments?: number;
    installmentsWithoutFee?: number;
    installmentFeeRate?: number;
  };
  amount: number;
  originalAmount?: number;
  installments: number;
  paymentType: 'credit' | 'debit';
  installmentsWithoutFee?: number;
  installmentFeeRate?: number;
};

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<any>(null);
  
  // Log para depuração
  console.log('PaymentSuccess: Parâmetros recebidos:', params);
  
  // Carregar dados do pagamento
  useEffect(() => {
    if (params.paymentData) {
      try {
        console.log('PaymentSuccess: Tentando processar dados de pagamento...');
        const parsedData = JSON.parse(params.paymentData as string) as PaymentData;
        console.log('PaymentSuccess: Dados processados com sucesso:', parsedData);
        setPaymentData(parsedData);
      } catch (error) {
        console.error('PaymentSuccess: Erro ao processar dados de pagamento:', error);
        setError('Erro ao processar dados do pagamento');
        Alert.alert('Erro', 'Ocorreu um erro ao processar os dados do pagamento');
      }
    } else {
      console.error('PaymentSuccess: Nenhum dado de pagamento recebido');
      setError('Nenhum dado de pagamento recebido');
      Alert.alert('Erro', 'Nenhum dado de pagamento recebido');
    }
  }, [params.paymentData]);
  
  // Impedir voltar com o botão de hardware
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleFinish();
        return true;
      }
    );
    
    return () => backHandler.remove();
  }, []);
  
  // Função para compartilhar captura da tela de recibo
  const shareScreenshot = async () => {
    if (!paymentData || !receiptRef.current) return;
    
    try {
      Alert.alert('Capturando comprovante...', 'Aguarde enquanto preparamos seu comprovante para compartilhamento.');
      
      // Capturar a tela
      const uri = await receiptRef.current.capture();
      
      // Compartilhar a imagem
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Compartilhar comprovante de pagamento',
            UTI: 'public.jpeg'
          });
        } else {
          await Share.share({
            url: uri,
            title: 'Comprovante de Pagamento',
            message: 'Pagamento de ' + formatCurrency(paymentData.amount) + ' realizado com sucesso!',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar captura:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o comprovante');
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
  
  // Finalizar transação e voltar para a tela inicial
  const handleFinish = () => {
      router.replace('/');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erro</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Voltar"
            onPress={handleFinish}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
    }
  
  if (!paymentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando dados do pagamento...</Text>
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
    
  // Verificar se tem juros aplicados
  const hasInterest = paymentData.paymentType === 'credit' && 
    paymentData.installments > 1 && 
    paymentData.installments > (paymentData.installmentsWithoutFee || 3);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento Concluído</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <ViewShot 
          ref={receiptRef} 
          options={{ format: 'jpg', quality: 0.9 }}
          style={styles.receiptContainer}
        >
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Check size={48} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={styles.title}>Pagamento Concluído!</Text>
          <Text style={styles.amount}>
            {formatCurrency(paymentData.amount)}
          </Text>
          
          {hasInterest && paymentData.originalAmount && (
            <View style={styles.interestInfo}>
              <AlertCircle size={14} color={theme.colors.textSecondary} />
              <Text style={styles.interestText}>
                Valor original: {formatCurrency(paymentData.originalAmount)}
              </Text>
            </View>
          )}
          
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
                {paymentData.chargeData?.merchantName || 'Sua Empresa'}
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
                  {paymentData.installments + 'x de ' + formatCurrency(paymentData.amount / paymentData.installments)}
                  {hasInterest && (
                    <Text style={styles.interestNoteSmall}> (com juros)</Text>
                  )}
                </Text>
              </View>
            )}
            
            <View style={styles.receiptItem}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={[styles.receiptValue, styles.statusSuccess]}>
                Aprovado
              </Text>
            </View>
          </View>
        </ViewShot>
        
        {/* Espaço extra para garantir que o conteúdo não fique atrás do botão fixo */}
        <View style={styles.spacer} />
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="COMPARTILHAR COMPROVANTE"
          onPress={shareScreenshot}
          variant="primary"
          size="lg"
          icon={<Share2 size={20} color="#FFFFFF" />}
          iconPosition="left"
          fullWidth
          style={styles.shareButton}
          textStyle={styles.shareButtonText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 200, // Aumentar ainda mais o espaço para garantir que o conteúdo não fique escondido
  },
  receiptContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8F9FA',
  },
  successIconContainer: {
    paddingVertical: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00CC66',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00CC66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  interestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  interestText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  interestNoteSmall: {
    fontSize: 12,
    color: '#FF9500',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    zIndex: 1000,
    paddingBottom: Platform.OS === 'android' ? 80 : 90, // Aumentar ainda mais
    elevation: 20, // Aumentar elevação
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  shareButton: {
    marginBottom: 0,
    backgroundColor: '#006AFF', // Azul mais vibrante
    borderColor: '#006AFF',
    paddingVertical: 18, // Aumentar o padding vertical
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  shareButtonText: {
    fontSize: 18, // Aumentar o tamanho da fonte
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    width: '100%',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 24,
  },
  statusSuccess: {
    color: '#00CC66',
  },
  spacer: {
    height: 180, // Aumentar o espaço extra no final do ScrollView
  },
}); 