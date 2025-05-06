import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NfcReaderService from '../app/services/NfcReader';

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
  isTagId: boolean;
  status: 'success' | 'error';
  error?: string;
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
        const available = await NfcReaderService.isSupported();
        setIsAvailable(available);
        
        if (available) {
          const enabled = await NfcReaderService.isEnabled();
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
    const nfcDetectionSubscription = NfcReaderService.addListener('nfcCardDetected', (event) => {
      console.log('Cartão detectado:', event);
      setStatus('processing');
    });
    
    const nfcSuccessSubscription = NfcReaderService.addListener('nfcReadingSuccess', (event) => {
      console.log('Leitura bem-sucedida:', event);
    });
    
    const nfcErrorSubscription = NfcReaderService.addListener('nfcReadingError', (event) => {
      console.log('Erro na leitura:', event);
      setStatus('error');
      setError(event.error || 'Erro ao ler o cartão');
    });
    
    const nfcStartedSubscription = NfcReaderService.addListener('nfcReadingStarted', (event) => {
      console.log('Leitura iniciada:', event);
      setStatus('waiting');
    });
    
    const nfcStoppedSubscription = NfcReaderService.addListener('nfcReadingStopped', (event) => {
      console.log('Leitura interrompida:', event);
      if (status !== 'success' && status !== 'error') {
        setStatus('cancelled');
      }
    });

    return () => {
      // Limpar todos os listeners
      nfcDetectionSubscription();
      nfcSuccessSubscription();
      nfcErrorSubscription();
      nfcStartedSubscription();
      nfcStoppedSubscription();
      
      // Certificar-se de parar a leitura ao desmontar
      if (status === 'reading' || status === 'processing' || status === 'waiting') {
        NfcReaderService.stopCardReading();
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
      const result = await NfcReaderService.startCardReading();
      
      if (result && result.status === 'success' && result.cardNumber) {
        setCardData(result);
        setStatus('success');
        return {
          success: true,
          cardData: result,
          paymentDetails
        };
      } else {
        throw new Error(result?.error || 'Erro na leitura do cartão');
      }
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
      await NfcReaderService.stopCardReading();
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