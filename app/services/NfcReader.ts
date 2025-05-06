import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Acesso ao módulo nativo Java (NfcReaderModule.java)
const { NfcReader } = NativeModules;

// Verificação de carregamento do módulo nativo para ajudar no debug
if (!NfcReader) {
  console.error('Módulo NfcReader não encontrado! Verifique se NfcReaderModule.java está configurado corretamente.');
}

// Cria um emissor de eventos nativo para receber eventos do NfcReaderModule.java
const nfcEventEmitter = new NativeEventEmitter(NfcReader);

// Definição de tipos de retorno - deve corresponder exatamente à estrutura retornada pelo Java
interface CardData {
  status: 'success' | 'error';
  cardNumber: string;
  expiryDate: string;
  cardType?: string;
  isTagId: boolean;  // Indica se estamos usando o ID da tag em vez do PAN real
  error?: string;
}

// Códigos de erro que podem ser retornados pelo módulo Java
enum NfcErrorCode {
  NO_ACTIVITY = 'NO_ACTIVITY',
  NO_NFC = 'NO_NFC',
  NFC_DISABLED = 'NFC_DISABLED',
  ALREADY_READING = 'ALREADY_READING',
  NFC_CARD_ERROR = 'NFC_CARD_ERROR',
  CARD_DATA_ERROR = 'CARD_DATA_ERROR',
  COMMUNICATION_ERROR = 'COMMUNICATION_ERROR',
  START_FAILED = 'START_FAILED',
  SDK_TOO_OLD = 'SDK_TOO_OLD'
}

// Serviço para interagir com o leitor NFC
const NfcReaderService = {
  /**
   * Verifica se o dispositivo suporta NFC
   * Chama o método isSupported() do NfcReaderModule.java
   */
  isSupported: async (): Promise<boolean> => {
    try {
      console.log('[NfcReaderService] Verificando suporte a NFC...');
      return await NfcReader.isSupported();
    } catch (error) {
      console.error('[NfcReaderService] Erro ao verificar suporte NFC:', error);
      return false;
    }
  },

  /**
   * Verifica se o NFC está ativado no dispositivo
   * Chama o método isEnabled() do NfcReaderModule.java
   */
  isEnabled: async (): Promise<boolean> => {
    try {
      console.log('[NfcReaderService] Verificando se NFC está ativado...');
      return await NfcReader.isEnabled();
    } catch (error) {
      console.error('[NfcReaderService] Erro ao verificar se NFC está ativado:', error);
      return false;
    }
  },

  /**
   * Inicia a leitura do cartão NFC
   * Chama o método startCardReading() do NfcReaderModule.java
   */
  startCardReading: async (): Promise<CardData> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('[NfcReaderService] Iniciando leitura do cartão NFC');
        
        // Remover ouvintes anteriores para evitar duplicação
        nfcEventEmitter.removeAllListeners('nfcCardDetected');
        nfcEventEmitter.removeAllListeners('nfcReadingSuccess');
        nfcEventEmitter.removeAllListeners('nfcReadingError');
        nfcEventEmitter.removeAllListeners('nfcCardProcessing');
        nfcEventEmitter.removeAllListeners('nfcReadingStarted');
        nfcEventEmitter.removeAllListeners('nfcReadingStopped');
        
        // Ouvir evento de detecção do cartão
        nfcEventEmitter.addListener('nfcCardDetected', (event) => {
          console.log('[NfcReaderService] Cartão NFC detectado:', event);
        });
        
        // Ouvir evento de processamento
        nfcEventEmitter.addListener('nfcCardProcessing', (event) => {
          console.log('[NfcReaderService] Processando cartão NFC:', event);
        });
        
        // Ouvir evento de início de leitura
        nfcEventEmitter.addListener('nfcReadingStarted', (event) => {
          console.log('[NfcReaderService] Leitura NFC iniciada:', event);
        });
        
        // Ouvir evento de fim de leitura
        nfcEventEmitter.addListener('nfcReadingStopped', (event) => {
          console.log('[NfcReaderService] Leitura NFC interrompida:', event);
        });
        
        // Ouvir evento de sucesso
        nfcEventEmitter.addListener('nfcReadingSuccess', (event) => {
          console.log('[NfcReaderService] Leitura do cartão com sucesso:', event);
          // Não resolver aqui, deixar a promise nativa resolver
        });
        
        // Ouvir evento de erro
        nfcEventEmitter.addListener('nfcReadingError', (event) => {
          console.log('[NfcReaderService] Erro na leitura do cartão:', event);
          // Não rejeitar aqui, deixar a promise nativa rejeitar
        });
        
        // Iniciar a leitura NFC e esperar o resultado
        NfcReader.startCardReading()
          .then((result: CardData) => {
            console.log('[NfcReaderService] Resultado da leitura:', result);
            
            // Remover todos os listeners após o resultado
            nfcEventEmitter.removeAllListeners('nfcCardDetected');
            nfcEventEmitter.removeAllListeners('nfcReadingSuccess');
            nfcEventEmitter.removeAllListeners('nfcReadingError');
            nfcEventEmitter.removeAllListeners('nfcCardProcessing');
            nfcEventEmitter.removeAllListeners('nfcReadingStarted');
            nfcEventEmitter.removeAllListeners('nfcReadingStopped');
            
            resolve(result);
          })
          .catch((error: any) => {
            console.error('[NfcReaderService] Erro na promise de leitura do cartão:', error);
            
            // Formatar o erro em um formato consistente
            const errorData: CardData = {
              status: 'error',
              cardNumber: '',
              expiryDate: '',
              isTagId: false,
              error: error.message || 'Erro desconhecido na leitura NFC'
            };
            
            // Remover todos os listeners após o erro
            nfcEventEmitter.removeAllListeners('nfcCardDetected');
            nfcEventEmitter.removeAllListeners('nfcReadingSuccess');
            nfcEventEmitter.removeAllListeners('nfcReadingError');
            nfcEventEmitter.removeAllListeners('nfcCardProcessing');
            nfcEventEmitter.removeAllListeners('nfcReadingStarted');
            nfcEventEmitter.removeAllListeners('nfcReadingStopped');
            
            // Mapear códigos de erro conhecidos para mensagens amigáveis
            if (error.code) {
              switch (error.code) {
                case NfcErrorCode.NO_NFC:
                  errorData.error = 'Este dispositivo não suporta NFC';
                  break;
                case NfcErrorCode.NFC_DISABLED:
                  errorData.error = 'NFC está desativado nas configurações';
                  break;
                case NfcErrorCode.NFC_CARD_ERROR:
                  errorData.error = 'Erro ao ler o cartão. Tente novamente';
                  break;
                case NfcErrorCode.CARD_DATA_ERROR:
                  errorData.error = 'Não foi possível extrair dados do cartão';
                  break;
                case NfcErrorCode.COMMUNICATION_ERROR:
                  errorData.error = 'Erro de comunicação com o cartão';
                  break;
              }
            }
            
            reject(errorData);
          });
      } catch (error) {
        console.error('[NfcReaderService] Erro ao iniciar leitura do cartão:', error);
        reject({
          status: 'error',
          cardNumber: '',
          expiryDate: '',
          isTagId: false,
          error: 'Falha ao iniciar leitura do cartão'
        });
      }
    });
  },

  /**
   * Interrompe a leitura do cartão NFC
   * Chama o método stopCardReading() do NfcReaderModule.java
   */
  stopCardReading: (): void => {
    try {
      console.log('[NfcReaderService] Interrompendo leitura NFC');
      NfcReader.stopCardReading();
      
      // Remover todos os listeners quando parar a leitura
      nfcEventEmitter.removeAllListeners('nfcCardDetected');
      nfcEventEmitter.removeAllListeners('nfcReadingSuccess');
      nfcEventEmitter.removeAllListeners('nfcReadingError');
      nfcEventEmitter.removeAllListeners('nfcCardProcessing');
      nfcEventEmitter.removeAllListeners('nfcReadingStarted');
      nfcEventEmitter.removeAllListeners('nfcReadingStopped');
    } catch (error) {
      console.error('[NfcReaderService] Erro ao interromper leitura:', error);
    }
  },
  
  /**
   * Assina eventos NFC. Útil para mostrar informações do processo na UI.
   * Conecta-se aos eventos emitidos pelo NfcReaderModule.java
   * @param event Nome do evento (nfcCardDetected, nfcReadingSuccess, etc.)
   * @param callback Função de callback para tratar o evento
   * @returns Função para remover o listener
   */
  addListener: (event: string, callback: (data: any) => void) => {
    const subscription = nfcEventEmitter.addListener(event, callback);
    return () => subscription.remove();
  },
  
  // Expõe códigos de erro para uso externo
  errorCodes: NfcErrorCode
};

export default NfcReaderService; 