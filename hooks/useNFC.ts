import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { NfcReader } from '../app/services/NfcReader';

type CardData = {
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  isReady: boolean;
  isTagId: boolean;
};

export type NFCStatus = 'idle' | 'waiting' | 'reading' | 'detected' | 'error' | 'success' | 'cancelled';

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [status, setStatus] = useState<NFCStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  
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
  
  // Função para iniciar a leitura do cartão
  const startCardReading = useCallback(async () => {
    if (!isSupported) {
      setError('NFC não é suportado neste dispositivo');
      return;
    }
    
    try {
      setStatus('reading');
      setError(null);
      setCardData(null);
      
      console.log('Iniciando leitura do cartão...');
      console.log('useNFC: Iniciando leitura NFC');
      console.log('useNFC: Chamando NfcReader.startScan()');
      
      const result = await NfcReader.startScan();
      console.log('useNFC: Resultado da inicialização da leitura:', result);
      
      // O resultado real será processado pelos listeners de eventos
    } catch (error: any) {
      console.error('useNFC: Erro ao iniciar leitura do cartão:', error);
      setStatus('error');
      setError(error?.message || 'Erro ao iniciar leitura do cartão');
    }
  }, [isSupported]);
  
  // Função para parar a leitura do cartão
  const stopCardReading = useCallback(() => {
    try {
      console.log('useNFC: Parando leitura NFC');
      NfcReader.stopScan();
      
      // Atualizamos o status para idle (ou cancelled)
      setStatus('cancelled');
    } catch (error: any) {
      console.error('useNFC: Erro ao parar leitura do cartão:', error);
      setError(error?.message || 'Erro ao parar leitura do cartão');
    }
  }, []);
  
  // Função para resetar o estado
  const resetNfcState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setCardData(null);
  }, []);

  // Configuração dos listeners de eventos
  useEffect(() => {
    if (!isSupported) return;
    
    console.log('useNFC: Configurando listeners de eventos globais');
    
    // Listener para detecção de cartão
    const cardDetectedSubscription = NfcReader.addCardDetectedListener((event) => {
      console.log('useNFC [Global]: Cartão NFC detectado:', event);
      if (isMounted.current) {
        setStatus('detected');
      }
    });
    
    // Listener para a leitura bem-sucedida do cartão
    const cardReadSubscription = NfcReader.addCardReadListener((data) => {
      console.log('useNFC [Global]: Cartão lido com sucesso:', data);
      if (isMounted.current) {
        setCardData({
          cardNumber: data.cardNumber || '',
          cardType: data.cardType || '',
          expiryDate: data.expiryDate || '',
          isReady: !!data.isReady,
          isTagId: !!data.isTagId
        });
        setStatus('success');
        setError(null);
      }
    });
    
    // Listener para erros de leitura
    const errorSubscription = NfcReader.addErrorListener((error) => {
      console.log('useNFC [Global]: Erro na leitura NFC:', error);
      if (isMounted.current) {
        setStatus('error');
        setError(error.error || 'Erro desconhecido na leitura NFC');
      }
    });
    
    // Listener para início da leitura
    const readingStartedSubscription = NfcReader.addReadingStartedListener((event) => {
      console.log('useNFC [Global]: Leitura NFC iniciada:', event);
      if (isMounted.current) {
        setStatus('reading');
      }
    });
    
    // Listener para fim da leitura
    const readingStoppedSubscription = NfcReader.addReadingStoppedListener((event) => {
      console.log('useNFC [Global]: Leitura NFC interrompida:', event);
      // Não voltar para idle se tivermos sucesso ou erro
      if (isMounted.current && status !== 'success' && status !== 'error') {
        setStatus('cancelled');
      }
    });
    
    // Limpeza dos listeners
    return () => {
      console.log('useNFC: Removendo listeners de eventos');
      cardDetectedSubscription.remove();
      cardReadSubscription.remove();
      errorSubscription.remove();
      readingStartedSubscription.remove();
      readingStoppedSubscription.remove();
    };
  }, [isSupported, status]);
  
  return {
    isSupported,
    status,
    error,
    cardData,
    startCardReading,
    stopCardReading,
    resetNfcState,
  };
};