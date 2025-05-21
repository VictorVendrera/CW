import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { NfcReader } from '../app/services/NfcReader';
import { PaymentToken, generatePaymentToken, verifyPaymentToken, decodePaymentToken } from '../utils/tokenization';

// Tipos de dados
type CardData = {
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  isReady: boolean;
  isTagId: boolean;
};

export type NFCStatus = 'idle' | 'waiting' | 'reading' | 'detected' | 'error' | 'success' | 'cancelled';

// Interface para dados do cobrador
export interface MerchantData {
  id: string;
  name: string;
  document: string;
  accountId: string;
  merchantKey: string;
  certificateId?: string;
}

// Interface para dados da transação
export interface TransactionData {
  id: string;
  amount: number;
  description: string;
  currency: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

// Interface para resultado de transação
export interface TransactionResult {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  authCode?: string;
  paymentMethod?: string;
  timestamp: number;
}

// Interface para debug do token
export interface TokenDebugInfo {
  tokenCreated: boolean;
  tokenId?: string;
  merchantName?: string;
  merchantId?: string;
  amount?: number;
  expiresAt?: number;
  isValid?: boolean;
}

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [paymentToken, setPaymentToken] = useState<PaymentToken | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [tokenDebugInfo, setTokenDebugInfo] = useState<TokenDebugInfo>({ tokenCreated: false });
  
  // Ref para rastrear se o componente está montado
  const isMounted = useRef(true);
  
  // Verificar suporte a NFC
  useEffect(() => {
    const checkNfcSupport = async () => {
      try {
        const supported = await NfcReader.isSupported();
        if (isMounted.current) {
          setIsSupported(supported);
          
          if (!supported && Platform.OS !== 'ios') {
            setError('NFC não é suportado neste dispositivo');
          }
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Erro ao verificar suporte NFC:', error);
          setError('Erro ao verificar suporte NFC');
          setIsSupported(false);
        }
      }
    };
    
    checkNfcSupport();
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Gerar token de pagamento com dados do cobrador
  const createPaymentToken = useCallback(async (
    merchantData: MerchantData, 
    transactionData: Omit<TransactionData, 'currency'> & { currency?: string }
  ): Promise<string | null> => {
    try {
      console.log('[TokenDebug] Iniciando geração de token de pagamento');
      console.log('[TokenDebug] Dados do cobrador:', JSON.stringify(merchantData, null, 2));
      console.log('[TokenDebug] Dados da transação:', JSON.stringify(transactionData, null, 2));
      
      // Verificar dados obrigatórios
      if (!merchantData.id || !transactionData.id) {
        throw new Error('Dados insuficientes para gerar token');
      }
      
      // Adicionar moeda padrão se não fornecida
      const completeTransactionData = {
        ...transactionData,
        currency: transactionData.currency || 'BRL'
      };
      
      // Gerar token com os dados fornecidos
      console.log('[TokenDebug] Gerando token...');
      const token = await generatePaymentToken(merchantData, completeTransactionData);
      console.log('[TokenDebug] Token gerado com sucesso');
      
      // Decodificar token para verificação
      try {
        const decodedToken = await decodePaymentToken(token);
        console.log('[TokenDebug] Token decodificado:', JSON.stringify({
          tokenId: decodedToken.tokenId,
          expiresAt: new Date(decodedToken.expiresAt).toLocaleString(),
          merchantName: decodedToken.merchantData.name,
          amount: decodedToken.transactionData.amount
        }, null, 2));
        
        // Verificar token
        const isValid = await verifyPaymentToken(decodedToken);
        console.log('[TokenDebug] Token é válido?', isValid);
        
        // Armazenar informações de debug
        setTokenDebugInfo({
          tokenCreated: true,
          tokenId: decodedToken.tokenId,
          merchantName: decodedToken.merchantData.name,
          merchantId: decodedToken.merchantData.id,
          amount: decodedToken.transactionData.amount,
          expiresAt: decodedToken.expiresAt,
          isValid
        });
        
        // Armazenar token decodificado
        setPaymentToken(decodedToken);
        
      } catch (decodeError) {
        console.error('[TokenDebug] Erro ao decodificar token:', decodeError);
      }
      
      return token;
    } catch (error: any) {
      console.error('Erro ao gerar token de pagamento:', error);
      setError(error?.message || 'Erro ao gerar token');
      setTokenDebugInfo({
        tokenCreated: false
      });
      return null;
    }
  }, []);
  
  // Função para iniciar a leitura do cartão com token
  const startCardReading = useCallback(async (tokenizedData?: string) => {
    if (!isSupported) {
      setError('NFC não é suportado neste dispositivo');
      return;
    }
    
    try {
      setStatus('reading');
      setError(null);
      setCardData(null);
      
      console.log('[NFCDebug] Iniciando leitura do cartão...');
      
      // Se temos dados tokenizados, armazenar para uso no processamento
      if (tokenizedData) {
        console.log('[NFCDebug] Dados tokenizados recebidos para leitura');
        console.log('[NFCDebug] Token hash:', tokenizedData.substring(0, 20) + '...');
        
        // Em uma implementação real, validaríamos o token aqui
        // e prepararíamos os dados do terminal usando as informações
        // do cobrador contidas no token
        console.log('[NFCDebug] Preparando terminal com dados do token');
      }
      
      console.log('[NFCDebug] Chamando NfcReader.startScan()');
      const result = await NfcReader.startScan();
      console.log('[NFCDebug] Resultado da inicialização da leitura:', result);
      
      // O resultado real será processado pelos listeners de eventos
    } catch (error: any) {
      console.error('[NFCDebug] Erro ao iniciar leitura do cartão:', error);
      setStatus('error');
      setError(error?.message || 'Erro ao iniciar leitura do cartão');
    }
  }, [isSupported]);
  
  // Função para parar a leitura do cartão
  const stopCardReading = useCallback(() => {
    try {
      console.log('[NFCDebug] Parando leitura NFC');
      NfcReader.stopScan();
      
      // Atualizamos o status para cancelled
      setStatus('cancelled');
    } catch (error: any) {
      console.error('[NFCDebug] Erro ao parar leitura do cartão:', error);
      setError(error?.message || 'Erro ao parar leitura do cartão');
    }
  }, []);
  
  // Função para processar pagamento com dados tokenizados
  const processPaymentWithToken = useCallback(async (tokenData: string) => {
    try {
      setStatus('waiting');
      console.log('[NFCDebug] Processando pagamento com token');
      
      // Iniciar a leitura do cartão com o token
      await startCardReading(tokenData);
      
      // A partir daqui, os listeners de NFC assumem o controle
      // e atualizarão o status conforme o andamento
      
      return true;
    } catch (error: any) {
      console.error('[NFCDebug] Erro ao processar pagamento:', error);
      setStatus('error');
      setError(error?.message || 'Erro ao processar pagamento');
      return false;
    }
  }, [startCardReading]);
  
  // Função para resetar o estado
  const resetNfcState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setCardData(null);
    setPaymentToken(null);
    setTransactionResult(null);
    setTokenDebugInfo({ tokenCreated: false });
  }, []);

  // Configuração dos listeners de eventos
  useEffect(() => {
    if (!isSupported) return;
    
    console.log('[NFCDebug] Configurando listeners de eventos globais');
    
    // Listener para detecção de cartão
    const cardDetectedSubscription = NfcReader.addCardDetectedListener((event) => {
      console.log('[NFCDebug] Cartão NFC detectado:', event);
      if (isMounted.current) {
        setStatus('detected');
      }
    });
    
    // Listener para a leitura bem-sucedida do cartão
    const cardReadSubscription = NfcReader.addCardReadListener((data) => {
      console.log('[NFCDebug] Cartão lido com sucesso:', data);
      if (isMounted.current) {
        setCardData({
          cardNumber: data.cardNumber || '',
          cardType: data.cardType || '',
          expiryDate: data.expiryDate || '',
          isReady: !!data.isReady,
          isTagId: !!data.isTagId
        });
        
        // Simular um resultado de transação bem-sucedida após leitura do cartão
        // Em uma implementação real, processar o pagamento com os dados do token
        console.log('[NFCDebug] Processando pagamento com token e dados do cartão');
        console.log('[NFCDebug] Dados do cartão:', data);
        console.log('[NFCDebug] Usando dados do token para cobrador:', tokenDebugInfo.merchantName);
        
        const txId = `tx-${Date.now()}`;
        console.log('[NFCDebug] Transação gerada:', txId);
        
        setTransactionResult({
          transactionId: txId,
          status: 'success',
          authCode: `AUTH${Math.floor(Math.random() * 1000000)}`,
          paymentMethod: data.cardType,
          timestamp: Date.now()
        });
        
        setStatus('success');
        setError(null);
      }
    });
    
    // Listener para erros de leitura
    const errorSubscription = NfcReader.addErrorListener((error) => {
      console.log('[NFCDebug] Erro na leitura NFC:', error);
      if (isMounted.current) {
        setStatus('error');
        setError(error.error || 'Erro desconhecido na leitura NFC');
      }
    });
    
    // Listener para início da leitura
    const readingStartedSubscription = NfcReader.addReadingStartedListener((event) => {
      console.log('[NFCDebug] Leitura NFC iniciada:', event);
      if (isMounted.current) {
        setStatus('reading');
      }
    });
    
    // Listener para fim da leitura
    const readingStoppedSubscription = NfcReader.addReadingStoppedListener((event) => {
      console.log('[NFCDebug] Leitura NFC interrompida:', event);
      // Não voltar para idle se tivermos sucesso ou erro
      if (isMounted.current && status !== 'success' && status !== 'error') {
        setStatus('cancelled');
      }
    });
    
    // Limpeza dos listeners
    return () => {
      console.log('[NFCDebug] Removendo listeners de eventos');
      cardDetectedSubscription.remove();
      cardReadSubscription.remove();
      errorSubscription.remove();
      readingStartedSubscription.remove();
      readingStoppedSubscription.remove();
    };
  }, [isSupported, status, tokenDebugInfo]);
  
  return {
    isSupported,
    status,
    error,
    cardData,
    transactionResult,
    tokenDebugInfo,
    createPaymentToken,
    startCardReading,
    stopCardReading,
    processPaymentWithToken,
    resetNfcState,
  };
};