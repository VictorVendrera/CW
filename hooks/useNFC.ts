import { useEffect, useState } from 'react';
import { Platform, EmitterSubscription } from 'react-native';
import NfcService from '../src/services/NfcService';

export type PaymentDetailsType = {
  id: string;
  amount: number;
  description: string;
  payerName: string;
  payerDocument: string;
  merchantName: string;
  merchantDocument: string;
};

export type NFCStatusType = 'idle' | 'waiting' | 'reading' | 'processing' | 'success' | 'error' | 'cancelled';

export type CardDataType = {
  cardNumber: string;
  expiryDate: string;
  cardType?: string;
  cardholderName?: string;
  issuerCountryCode?: string;
  isTagId: boolean;
  status: 'success' | 'error';
  error?: string;
};

type NFCEventType = {
  status?: string;
  message?: string;
  pan?: string;
  expiryDate?: string;
  cardholderName?: string;
  issuerCountryCode?: string;
};

const useNFC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [status, setStatus] = useState<NFCStatusType>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardDataType | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setIsAvailable(false);
      return;
    }

    const checkAvailability = async () => {
      try {
        const available = await NfcService.isSupported();
        setIsAvailable(available);
        
        if (available) {
          const enabled = await NfcService.isEnabled();
          setIsEnabled(enabled);
        }
      } catch (err) {
        console.error('Erro ao verificar disponibilidade NFC:', err);
        setIsAvailable(false);
        setError('NFC não disponível');
      }
    };

    checkAvailability();

    // Configurar listeners para eventos NFC
    const nfcDetectionSubscription = NfcService.addListener('nfcTagDiscovered', (event: NFCEventType) => {
      console.log('Cartão detectado:', event);
      setStatus('processing');
    });
    
    const nfcSuccessSubscription = NfcService.addListener('nfcCardData', (event: NFCEventType) => {
      console.log('Leitura bem-sucedida:', event);
      const formattedData = NfcService.formatCardData(event);
      if (formattedData) {
        setCardData(formattedData as CardDataType);
        setStatus('success');
      }
    });
    
    const nfcErrorSubscription = NfcService.addListener('nfcError', (event: NFCEventType) => {
      console.log('Erro na leitura:', event);
      setStatus('error');
      setError(event.message || 'Erro ao ler o cartão');
    });
    
    const nfcStartedSubscription = NfcService.addListener('nfcReadingStarted', (event: NFCEventType) => {
      console.log('Leitura iniciada:', event);
      setStatus('waiting');
    });
    
    const nfcStoppedSubscription = NfcService.addListener('nfcReadingStopped', (event: NFCEventType) => {
      console.log('Leitura interrompida:', event);
      if (status !== 'success' && status !== 'error') {
        setStatus('cancelled');
      }
    });

    return () => {
      // Limpar todos os listeners
      nfcDetectionSubscription.remove();
      nfcSuccessSubscription.remove();
      nfcErrorSubscription.remove();
      nfcStartedSubscription.remove();
      nfcStoppedSubscription.remove();
      
      // Certificar-se de parar a leitura ao desmontar
      if (status === 'reading' || status === 'processing' || status === 'waiting') {
        NfcService.stopCardReading();
      }
    };
  }, [status]);

  const startNfcPayment = async (paymentDetails: PaymentDetailsType) => {
    if (!isAvailable) {
      setError('NFC não está disponível neste dispositivo');
      return false;
    }

    if (!isEnabled) {
      setError('NFC está desativado nas configurações');
      return false;
    }

    try {
      setStatus('reading');
      setError(null);
      setCardData(null);
      
      // Iniciar leitura do cartão NFC
      const result = await NfcService.startCardReading();
      
      if (result) {
        const formattedData = NfcService.formatCardData(result);
        if (formattedData) {
          setCardData(formattedData as CardDataType);
          setStatus('success');
          return {
            success: true,
            cardData: formattedData as CardDataType,
            paymentDetails
          };
        }
      }
      throw new Error('Erro na leitura do cartão');
    } catch (err: any) {
      console.error('Erro ao iniciar pagamento NFC:', err);
      setError(err.message || 'Erro ao iniciar pagamento NFC');
      setStatus('error');
      return {
        success: false,
        error: err.message || 'Erro ao iniciar pagamento NFC'
      };
    }
  };

  const cancelNfcPayment = async () => {
    try {
      await NfcService.stopCardReading();
      setStatus('cancelled');
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar pagamento NFC');
      return false;
    }
  };

  return {
    isAvailable,
    isEnabled,
    status,
    error,
    cardData,
    startNfcPayment,
    cancelNfcPayment
  };
};

export default useNFC; 