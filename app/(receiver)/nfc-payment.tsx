import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useNFC, { NFCStatusType, PaymentDetailsType } from '../../hooks/useNFC';

export default function NFCPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState<number>(60);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Extrair parâmetros de pagamento da URL
  const paymentId = params.id as string;
  const amount = parseFloat(params.amount as string) || 0;
  const description = params.description as string || 'Pagamento';
  const payerName = params.payerName as string || 'Cliente';
  const payerDocument = params.payerDocument as string || '';
  const merchantName = params.merchantName as string || 'Lojista';
  const merchantDocument = params.merchantDocument as string || '';
  
  // Usar nosso hook NFC
  const { 
    isAvailable, 
    status, 
    error, 
    transactionResult, 
    startNfcPayment, 
    cancelNfcPayment 
  } = useNFC();
  
  // Preparar o objeto de pagamento
  const paymentDetails: PaymentDetailsType = {
    id: paymentId,
    amount,
    description,
    payerName,
    payerDocument,
    merchantName,
    merchantDocument
  };
  
  // Iniciar o temporizador
  useEffect(() => {
    if (status === 'idle' && isAvailable) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [status, isAvailable]);
  
  // Verificar disponibilidade do NFC e iniciar pagamento
  useEffect(() => {
    const preparePayment = async () => {
      if (!isAvailable) {
        Alert.alert(
          'NFC Indisponível',
          'Este dispositivo não possui NFC ou o NFC está desativado. Por favor, ative o NFC nas configurações.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
      
      setIsReady(true);
      
      try {
        await startNfcPayment(paymentDetails);
      } catch (err) {
        Alert.alert('Erro', 'Erro ao iniciar pagamento NFC');
        router.back();
      }
    };
    
    preparePayment();
    
    return () => {
      // Limpar ao desmontar
      cancelNfcPayment();
    };
  }, [isAvailable]);
  
  // Monitorar mudanças de status
  useEffect(() => {
    if (status === 'success' && transactionResult) {
      router.push({
        pathname: '/(receiver)/payment-details',
        params: {
          id: transactionResult.transactionId,
          amount: amount.toString(),
          description,
          authCode: transactionResult.authCode
        }
      });
    } else if (status === 'error') {
      Alert.alert(
        'Erro no Pagamento',
        error || 'Ocorreu um erro ao processar o pagamento',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [status, transactionResult, error]);
  
  // Função para cancelar o pagamento
  const handleCancel = async () => {
    await cancelNfcPayment();
    router.back();
  };
  
  // Renderizar mensagem de acordo com o status
  const renderStatusMessage = () => {
    switch(status) {
      case 'idle':
        return 'Aproxime o cartão do dispositivo';
      case 'processing':
        return 'Processando pagamento, mantenha o cartão próximo...';
      case 'cancelled':
        return 'Pagamento cancelado';
      default:
        return 'Aguardando cartão...';
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento NFC</Text>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.amountLabel}>Valor a pagar</Text>
        <Text style={styles.amountValue}>R$ {amount.toFixed(2)}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      <View style={styles.nfcContainer}>
        {isReady ? (
          <>
            <View style={[styles.nfcIndicator, status === 'processing' && styles.nfcActive]}>
              <FontAwesome name="wifi" size={80} color="#555" />
              {status === 'processing' && (
                <ActivityIndicator 
                  size="large" 
                  color="#007AFF" 
                  style={styles.processingIndicator} 
                />
              )}
            </View>
            <Text style={styles.statusMessage}>{renderStatusMessage()}</Text>
            <Text style={styles.countdown}>Expira em: {countdown} segundos</Text>
          </>
        ) : (
          <ActivityIndicator size="large" color="#007AFF" />
        )}
      </View>
      
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
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
  paymentInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#222',
  },
  description: {
    fontSize: 16,
    color: '#444',
  },
  nfcContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  nfcIndicator: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e9e9e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nfcActive: {
    backgroundColor: '#e0f0ff',
  },
  processingIndicator: {
    position: 'absolute',
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  countdown: {
    fontSize: 16,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
}); 