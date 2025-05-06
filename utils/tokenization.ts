// Criar arquivo utils/tokenization.ts
import * as Crypto from 'expo-crypto';

// Interface para o token de pagamento
interface PaymentToken {
  tokenId: string;
  signature: string;
  timestamp: number;
  expiresAt: number;
  paymentData: {
    id: string;
    amount: number;
    description: string;
    merchant: string;
    merchantId: string;
    merchantDocument?: string;
    merchantCertificateId?: string; // Para validação de certificado
  };
}

// Chave secreta (em produção seria armazenada de forma segura)
const SECRET_KEY = 'nfc_payflow_secret_key_2023';

// Gerar token de pagamento seguro
export async function generatePaymentToken(paymentData: any): Promise<string> {
  try {
    // Gerar ID único para o token
    const tokenId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${paymentData.id}:${Date.now()}`
    );
    
    // Definir timestamp e expiração (30 minutos)
    const timestamp = Date.now();
    const expiresAt = timestamp + (30 * 60 * 1000);
    
    // Criar dados do token
    const tokenData: PaymentToken = {
      tokenId,
      timestamp,
      expiresAt,
      paymentData,
      signature: ''  // Será preenchida abaixo
    };
    
    // Gerar assinatura para verificação
    const payloadString = JSON.stringify({
      tokenId,
      timestamp,
      expiresAt,
      paymentData
    });
    
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${payloadString}:${SECRET_KEY}`
    );
    
    tokenData.signature = signature;
    
    // Codificar o token completo para transmissão
    const tokenString = JSON.stringify(tokenData);
    return encodeURIComponent(tokenString);
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    throw error;
  }
}

// Decodificar token de pagamento
export async function decodePaymentToken(encodedToken: string): Promise<PaymentToken> {
  try {
    const decodedToken = decodeURIComponent(encodedToken);
    const tokenData = JSON.parse(decodedToken) as PaymentToken;
    return tokenData;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    throw new Error('Token inválido ou malformado');
  }
}

// Verificar assinatura e validade do token
export async function verifyTokenSignature(token: PaymentToken): Promise<boolean> {
  try {
    // Verificar expiração
    if (Date.now() > token.expiresAt) {
      return false; // Token expirado
    }
    
    // Recriar a assinatura para verificação
    const payloadString = JSON.stringify({
      tokenId: token.tokenId,
      timestamp: token.timestamp,
      expiresAt: token.expiresAt,
      paymentData: token.paymentData
    });
    
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${payloadString}:${SECRET_KEY}`
    );
    
    // Comparar assinaturas
    return signature === token.signature;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}