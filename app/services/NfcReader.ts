import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Interface para o módulo nativo
interface NativeNfcReader {
  isSupported(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  startCardReading(): Promise<any>;
  stopCardReading(): void;
}

// Interface para eventos do cartão
interface CardDetectedEvent {
  status: string;
}

interface CardReadEvent {
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  isReady: boolean;
  isTagId: boolean;
}

interface ErrorEvent {
  status: string;
  error: string;
}

// Obtenha a referência ao módulo nativo
const NativeNfcReader = NativeModules.NfcReader as NativeNfcReader;
const eventEmitter = new NativeEventEmitter(NativeModules.NfcReader);

// Classe do serviço NFC
class NfcReaderService {
  /**
   * Verifica se o dispositivo possui suporte a NFC
   */
  async isSupported(): Promise<boolean> {
    try {
      return await NativeNfcReader.isSupported();
    } catch (error) {
      console.error('[NfcReader] Erro ao verificar suporte NFC:', error);
      return false;
    }
  }

  /**
   * Verifica se o NFC está habilitado no dispositivo
   */
  async isEnabled(): Promise<boolean> {
    try {
      return await NativeNfcReader.isEnabled();
    } catch (error) {
      console.error('[NfcReader] Erro ao verificar se NFC está habilitado:', error);
      return false;
    }
  }

  /**
   * Inicia o processo de leitura do cartão NFC
   */
  async startScan(): Promise<any> {
    try {
      console.log('[NfcReader] Iniciando startScan() - versão depuração');
      console.log('[NfcReader] Configurando listeners de eventos');
      console.log('[NfcReader] Chamando método nativo startCardReading()');
      
      return await NativeNfcReader.startCardReading();
    } catch (error) {
      console.error('[NfcReader] Erro ao iniciar leitura do cartão:', error);
      throw error;
    }
  }

  /**
   * Para o processo de leitura do cartão NFC
   */
  stopScan(): void {
    try {
      console.log('[NfcReader] Parando leitura do cartão');
      NativeNfcReader.stopCardReading();
    } catch (error) {
      console.error('[NfcReader] Erro ao parar leitura do cartão:', error);
    }
  }

  /**
   * Adiciona listener para evento de detecção de cartão
   */
  addCardDetectedListener(callback: (event: CardDetectedEvent) => void) {
    console.log('[NfcReader] Adicionando listener para nfcCardDetected');
    const subscription = eventEmitter.addListener('nfcCardDetected', (event) => {
      console.log('[NfcReader] Cartão NFC detectado:', event);
      callback(event);
    });
    return subscription;
  }

  /**
   * Adiciona listener para evento de leitura bem-sucedida do cartão
   */
  addCardReadListener(callback: (event: CardReadEvent) => void) {
    console.log('[NfcReader] Adicionando listener para onCardRead');
    const subscription = eventEmitter.addListener('onCardRead', (event) => {
      console.log('[NfcReader] Dados do cartão recebidos:', event);
      callback(event);
    });
    return subscription;
  }

  /**
   * Adiciona listener para erros na leitura do cartão
   */
  addErrorListener(callback: (event: ErrorEvent) => void) {
    console.log('[NfcReader] Adicionando listener para nfcReadingError');
    const subscription = eventEmitter.addListener('nfcReadingError', (event) => {
      console.log('[NfcReader] Erro na leitura NFC:', event);
      callback(event);
    });
    return subscription;
  }

  /**
   * Adiciona listener para evento de início da leitura NFC
   */
  addReadingStartedListener(callback: (event: any) => void) {
    console.log('[NfcReader] Adicionando listener para nfcReadingStarted');
    const subscription = eventEmitter.addListener('nfcReadingStarted', (event) => {
      console.log('[NfcReader] Leitura NFC iniciada:', event);
      callback(event);
    });
    return subscription;
  }

  /**
   * Adiciona listener para evento de interrupção da leitura NFC
   */
  addReadingStoppedListener(callback: (event: any) => void) {
    console.log('[NfcReader] Adicionando listener para nfcReadingStopped');
    const subscription = eventEmitter.addListener('nfcReadingStopped', (event) => {
      console.log('[NfcReader] Evento nfcReadingStopped recebido:', event);
      console.log('[NfcReader] Limpando listeners');
      callback(event);
    });
    return subscription;
  }
  
  /**
   * Remove todos os listeners de eventos
   */
  removeAllListeners() {
    console.log('[NfcReader] Removendo todos os listeners');
    
    eventEmitter.removeAllListeners('nfcCardDetected');
    eventEmitter.removeAllListeners('onCardRead');
    eventEmitter.removeAllListeners('nfcReadingError');
    eventEmitter.removeAllListeners('nfcReadingStarted');
    eventEmitter.removeAllListeners('nfcReadingStopped');
  }
}

// Exporta uma instância da classe
export const NfcReader = new NfcReaderService();

// Adiciona export default para compatibilidade
export default NfcReader;