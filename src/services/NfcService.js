import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NfcReader } = NativeModules;

class NfcService {
    constructor() {
        this.eventEmitter = new NativeEventEmitter(NfcReader);
        this.listeners = [];
        this.isReading = false;
    }

    isSupported() {
        if (Platform.OS !== 'android') {
            return Promise.resolve(false);
        }
        return NfcReader.isSupported();
    }

    isEnabled() {
        if (Platform.OS !== 'android') {
            return Promise.resolve(false);
        }
        return NfcReader.isEnabled();
    }

    startCardReading() {
        if (Platform.OS !== 'android') {
            return Promise.reject(new Error('NFC não suportado nesta plataforma'));
        }

        if (this.isReading) {
            return Promise.reject(new Error('Já existe uma leitura em andamento'));
        }

        this.isReading = true;
        return NfcReader.startCardReading()
            .then(result => {
                this.isReading = false;
                return result;
            })
            .catch(error => {
                this.isReading = false;
                throw error;
            });
    }

    stopCardReading() {
        if (Platform.OS !== 'android') {
            return;
        }
        this.isReading = false;
        NfcReader.stopCardReading();
    }

    addListener(eventName, callback) {
        const subscription = this.eventEmitter.addListener(eventName, callback);
        this.listeners.push(subscription);
        return subscription;
    }

    removeAllListeners() {
        this.listeners.forEach(subscription => subscription.remove());
        this.listeners = [];
        this.isReading = false;
    }

    // Método auxiliar para formatar dados do cartão
    formatCardData(data) {
        if (!data) return null;

        // Formatar PAN (número do cartão)
        const pan = this.formatPan(data.pan);
        
        // Formatar data de validade
        const expiryDate = this.formatExpiryDate(data.expiryDate);

        return {
            cardNumber: pan,
            expiryDate: expiryDate,
            cardType: this.detectCardType(data.pan),
            cardholderName: data.cardholderName || '',
            issuerCountryCode: data.issuerCountryCode || '',
            isTagId: true,
            status: 'success'
        };
    }

    // Método para formatar o PAN (número do cartão)
    formatPan(pan) {
        if (!pan) return '';
        
        // Remover espaços e caracteres não numéricos
        const cleanPan = pan.replace(/\D/g, '');
        
        // Formatar como XXXX XXXX XXXX XXXX
        return cleanPan.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }

    // Método para formatar a data de validade
    formatExpiryDate(expiryDate) {
        if (!expiryDate) return '';
        
        // Remover caracteres não numéricos
        const cleanDate = expiryDate.replace(/\D/g, '');
        
        if (cleanDate.length !== 4) return expiryDate;
        
        // Formatar como MM/AA
        return `${cleanDate.substring(0, 2)}/${cleanDate.substring(2, 4)}`;
    }

    // Método para detectar o tipo de cartão baseado no BIN
    detectCardType(pan) {
        if (!pan) return 'Desconhecido';

        const bin = pan.substring(0, 6);
        
        // BINs comuns de cartões brasileiros
        const cardTypes = {
            '4': 'Visa',
            '5': 'Mastercard',
            '3': 'American Express',
            '6': 'Elo',
            '35': 'Elo',
            '36': 'Elo',
            '37': 'Elo',
            '38': 'Elo',
            '39': 'Elo',
            '60': 'Hipercard',
            '65': 'Hipercard'
        };

        for (const [prefix, type] of Object.entries(cardTypes)) {
            if (bin.startsWith(prefix)) {
                return type;
            }
        }

        return 'Desconhecido';
    }
}

export default new NfcService(); 