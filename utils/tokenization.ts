// Criar arquivo utils/tokenization.ts
import * as Crypto from 'expo-crypto';

/**
 * Interface para os dados do cobrador
 */
interface MerchantData {
  id: string;
  name: string;
  document: string;
  accountId: string;
  merchantKey: string;
  certificateId?: string;
}

/**
 * Interface para os dados da transação
 */
interface TransactionData {
  id: string;
  amount: number;
  description: string;
  timestamp: number;
  currency: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interface para o token de pagamento completo
 */
export interface PaymentToken {
  // Identificador único do token
  tokenId: string;
  
  // Dados de segurança e expiração
  signature: string;
  timestamp: number;
  expiresAt: number;
  
  // Dados do cobrador (serão criptografados)
  merchantData: MerchantData;
  
  // Dados da transação
  transactionData: TransactionData;
}

// Chave secreta (em produção seria armazenada em ambiente seguro)
const SECRET_KEY = 'nfc_payflow_secret_key_2023';

/**
 * Criptografa dados sensíveis para transmissão
 */
async function encryptSensitiveData(data: any): Promise<string> {
  // Em produção, usaríamos criptografia assimétrica ou AES
  // Para o teste de conceito, usamos uma simulação de criptografia
  const dataString = JSON.stringify(data);
  const hashedData = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    dataString
  );
  
  // Concatenar um "salt" com os dados originais e codificar em base64
  // (simulação simplificada de "criptografia" para o teste de conceito)
  const encryptedData = Buffer.from(`${hashedData}:${dataString}`).toString('base64');
  return encryptedData;
}

/**
 * Descriptografa dados sensíveis após recebimento
 */
async function decryptSensitiveData(encryptedData: string): Promise<any> {
  // Em produção, usaríamos a chave privada correspondente
  // Para o teste de conceito, decodificamos o base64 e extraímos os dados
  try {
    const decodedData = Buffer.from(encryptedData, 'base64').toString();
    const dataParts = decodedData.split(':');
    // Remover o hash e obter os dados originais
    const jsonData = dataParts.slice(1).join(':');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    throw new Error('Dados inválidos ou corrompidos');
  }
}

/**
 * Gera um token de pagamento completo e seguro
 */
export async function generatePaymentToken(
  merchantData: MerchantData,
  transactionData: Omit<TransactionData, 'timestamp'>
): Promise<string> {
  try {
    // Gerar ID único para o token
    const tokenId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${merchantData.id}:${transactionData.id}:${Date.now()}`
    );
    
    // Definir timestamp e expiração (15 minutos)
    const timestamp = Date.now();
    const expiresAt = timestamp + (15 * 60 * 1000);
    
    // Criptografar dados do cobrador
    const encryptedMerchantData = await encryptSensitiveData(merchantData);
    
    // Completar dados da transação
    const fullTransactionData: TransactionData = {
      ...transactionData,
      timestamp
    };
    
    // Criar payload para assinatura (sem incluir a própria assinatura)
    const signaturePayload = {
      tokenId,
      timestamp,
      expiresAt,
      merchantData: encryptedMerchantData,
      transactionData: fullTransactionData
    };
    
    // Gerar assinatura para verificação
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${JSON.stringify(signaturePayload)}:${SECRET_KEY}`
    );
    
    // Criar token completo
    const tokenData: PaymentToken = {
      tokenId,
      signature,
      timestamp,
      expiresAt,
      merchantData: JSON.parse(encryptedMerchantData),
      transactionData: fullTransactionData
    };
    
    // Codificar o token completo para transmissão
    return encodeURIComponent(JSON.stringify(tokenData));
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    throw new Error('Falha na geração do token de pagamento');
  }
}

/**
 * Decodifica um token de pagamento
 */
export async function decodePaymentToken(encodedToken: string): Promise<PaymentToken> {
  try {
    const decodedToken = decodeURIComponent(encodedToken);
    const tokenData = JSON.parse(decodedToken) as PaymentToken;
    
    // Descriptografar dados do cobrador
    const merchantData = await decryptSensitiveData(JSON.stringify(tokenData.merchantData));
    tokenData.merchantData = merchantData;
    
    return tokenData;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    throw new Error('Token inválido ou malformado');
  }
}

/**
 * Verifica a assinatura e validade do token
 */
export async function verifyPaymentToken(token: PaymentToken): Promise<boolean> {
  try {
    // Verificar expiração
    if (Date.now() > token.expiresAt) {
      console.error('Token expirado');
      return false;
    }
    
    // Recriar a assinatura para verificação
    const signaturePayload = {
      tokenId: token.tokenId,
      timestamp: token.timestamp,
      expiresAt: token.expiresAt,
      merchantData: JSON.stringify(token.merchantData),
      transactionData: token.transactionData
    };
    
    const expectedSignature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${JSON.stringify(signaturePayload)}:${SECRET_KEY}`
    );
    
    // Comparar assinaturas
    const isValid = expectedSignature === token.signature;
    if (!isValid) {
      console.error('Assinatura do token inválida');
    }
    
    return isValid;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}