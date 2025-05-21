import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useNFC, MerchantData, TransactionData, NFCStatus } from '../../hooks/useNFC';

export default function NFCPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState<number>(60);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  
  // Extrair parâmetros de pagamento da URL
  const paymentId = params.id as string || `payment-${Date.now()}`;
  const amount = parseFloat(params.amount as string) || 0;
  const description = params.description as string || 'Pagamento';
  
  // Dados do pagador e cobrador
  const payerName = params.payerName as string || 'Cliente';
  const payerDocument = params.payerDocument as string || '';
  const merchantName = params.merchantName as string || 'Lojista';
  const merchantDocument = params.merchantDocument as string || '';
  const merchantId = params.merchantId as string || 'merch-default';
  const merchantKey = params.merchantKey as string || 'key-default';
  
  // Usar nosso hook NFC aprimorado
  const { 
    isSupported, 
    status, 
    error, 
    cardData,
    transactionResult,
    createPaymentToken,
    startCardReading,
    stopCardReading,
    processPaymentWithToken,
    resetNfcState
  } = useNFC();
  
  // Iniciar o temporizador
  useEffect(() => {
    if (status === 'idle' && isSupported) {
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
  }, [status, isSupported]);
  
  // Verificar disponibilidade do NFC e iniciar o processo de pagamento
  useEffect(() => {
    const preparePayment = async () => {
      if (!isSupported) {
        Alert.alert(
          'NFC Indisponível',
          'Este dispositivo não possui NFC ou o NFC está desativado. Por favor, ative o NFC nas configurações.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
      
      try {
        // Preparar dados do cobrador
        const merchantData: MerchantData = {
          id: merchantId,
          name: merchantName,
          document: merchantDocument,
          accountId: `acc-${merchantId}`,
          merchantKey: merchantKey
        };
        
        // Preparar dados da transação
        const transactionData: Omit<TransactionData, 'currency'> & { currency?: string } = {
          id: paymentId,
          amount,
          description,
          // Dados adicionais opcionais
          referenceId: `ref-${Date.now()}`,
          metadata: {
            payerName,
            payerDocument,
            createdAt: new Date().toISOString()
          }
        };
        
        console.log('Gerando token para pagamento...');
        
        // Gerar token com os dados do cobrador
        const token = await createPaymentToken(merchantData, transactionData);
        
        if (token) {
          console.log('Token gerado com sucesso');
          setPaymentToken(token);
          setIsReady(true);
          
          // Iniciar a leitura NFC com o token
          await processPaymentWithToken(token);
        } else {
          throw new Error('Falha ao gerar token de pagamento');
        }
      } catch (err: any) {
        console.error('Erro ao preparar pagamento:', err);
        Alert.alert('Erro', err.message || 'Erro ao iniciar pagamento NFC');
        router.back();
      }
    };
    
    preparePayment();
    
    return () => {
      // Limpar ao desmontar
      stopCardReading();
    };
  }, [isSupported, createPaymentToken, processPaymentWithToken]);
  
  // Monitorar mudanças de status
  useEffect(() => {
    if (status === 'success' && transactionResult) {
      // Redirecionar para a tela de detalhes do pagamento
      router.push({
        pathname: '/(receiver)/payment-details',
        params: {
          id: transactionResult.transactionId,
          amount: amount.toString(),
          description,
          authCode: transactionResult.authCode,
          status: transactionResult.status,
          timestamp: transactionResult.timestamp.toString()
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
    await stopCardReading();
    router.back();
  };
  
  // Verifica se o cartão está em processamento
  const isCardProcessing = status === 'detected' || status === 'reading';
  
  // Renderizar mensagem de acordo com o status
  const renderStatusMessage = () => {
    switch(status) {
      case 'idle':
        return 'Preparando pagamento...';
      case 'waiting':
        return 'Aproxime o cartão do dispositivo';
      case 'reading':
        return 'Aproxime o cartão do dispositivo';
      case 'detected':
        return 'Cartão detectado, processando...';
      case 'cancelled':
        return 'Pagamento cancelado';
      case 'success':
        return 'Pagamento aprovado! Redirecionando...';
      case 'error':
        return `Erro: ${error || 'Falha no pagamento'}`;
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
        
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantLabel}>Pagamento para</Text>
          <Text style={styles.merchantName}>{merchantName}</Text>
          {merchantDocument && <Text style={styles.merchantDocument}>{merchantDocument}</Text>}
        </View>
      </View>
      
      <View style={styles.nfcContainer}>
        {isReady ? (
          <>
            <View style={[
              styles.nfcIndicator, 
              isCardProcessing && styles.nfcActive
            ]}>
              <FontAwesome name="wifi" size={80} color="#555" />
              {isCardProcessing && (
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
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusMessage}>Preparando pagamento...</Text>
          </>
        )}
      </View>
      
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      
      {/* Informações adicionais */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Este dispositivo funcionará como um terminal de pagamento temporário.
          O valor será transferido para a conta do comerciante.
        </Text>
      </View>
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
    marginBottom: 16,
  },
  merchantInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  merchantLabel: {
    fontSize: 14,
    color: '#666',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 4,
  },
  merchantDocument: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    paddingHorizontal: 20,
  },
  countdown: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 