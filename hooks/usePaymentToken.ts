import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomString } from '../utils/random';

type PaymentTokenData = {
  paymentId: string;
  amount: number;
  description: string;
  merchantId: string;
  merchantName: string;
  metadata?: Record<string, any>;
};

type PaymentToken = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  paymentData: PaymentTokenData;
};

const TOKENS_STORAGE_KEY = '@payment_tokens';

export function usePaymentToken() {
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentToken, setCurrentToken] = useState<PaymentToken | null>(null);

  // Gera um novo token de pagamento
  const generateToken = async (paymentData: PaymentTokenData): Promise<PaymentToken> => {
    setIsGeneratingToken(true);
    setTokenError(null);
    
    try {
      // Gera um token único de 8 caracteres
      const tokenId = generateRandomString(8);
      
      // Define a data de expiração (30 minutos a partir de agora)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
      
      const token: PaymentToken = {
        id: tokenId,
        status: 'pending',
        createdAt: now,
        expiresAt,
        paymentData: {
          ...paymentData,
          amount: Number(paymentData.amount)
        }
      };
      
      // Salva o token no AsyncStorage
      const existingTokens = await AsyncStorage.getItem(TOKENS_STORAGE_KEY);
      const tokens = existingTokens ? JSON.parse(existingTokens) : [];
      tokens.push(token);
      await AsyncStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
      
      setCurrentToken(token);
      return token;
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      setTokenError(error instanceof Error ? error : new Error('Erro desconhecido ao gerar token'));
      throw error;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Busca um token pelo ID
  const getTokenById = async (tokenId: string): Promise<PaymentToken | null> => {
    try {
      const tokensJson = await AsyncStorage.getItem(TOKENS_STORAGE_KEY);
      if (!tokensJson) return null;
      
      const tokens: PaymentToken[] = JSON.parse(tokensJson);
      const token = tokens.find(t => t.id === tokenId);
      
      if (!token) return null;
      
      // Converte as strings de data de volta para objetos Date
      return {
        ...token,
        createdAt: new Date(token.createdAt),
        expiresAt: new Date(token.expiresAt)
      };
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  };

  return {
    generateToken,
    getTokenById,
    isGeneratingToken,
    tokenError,
    currentToken
  };
} 