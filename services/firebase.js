import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, query, orderByChild, equalTo } from 'firebase/database';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgml_Jk-gNw8KdaxzHFegzFQJKP8SstC4",
  authDomain: "testenfc-16c32.firebaseapp.com",
  databaseURL: "https://testenfc-16c32-default-rtdb.firebaseio.com",
  projectId: "testenfc-16c32",
  storageBucket: "testenfc-16c32.appspot.com",
  messagingSenderId: "608512580374",
  appId: "1:608512580374:android:1d1ed34801dbb0a2f88e37"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Criar uma nova cobrança no Firebase
 * @param {Object} chargeData - Dados da cobrança
 * @returns {Promise<string>} ID da cobrança criada
 */
export const createCharge = async (chargeData) => {
  try {
    const transactionsRef = ref(database, 'transactions');
    const newChargeRef = push(transactionsRef);
    
    // Gerar um token de acesso mais fácil para compartilhar
    const accessToken = generateAccessToken();
    
    // Adicionar propriedades extras
    const charge = {
      ...chargeData,
      id: newChargeRef.key,
      accessToken,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira em 24 horas
      // Valores padrão para parcelamento se não forem fornecidos
      maxInstallments: chargeData.maxInstallments || 12, // Máximo de parcelas
      installmentsWithoutFee: chargeData.installmentsWithoutFee || 3, // Parcelas sem juros
      installmentFeeRate: chargeData.installmentFeeRate || 1.99 // Taxa de juros em % para parcelas com juros
    };
    
    await set(newChargeRef, charge);
    
    // Também criar uma entrada na coleção de tokens para facilitar lookup por token
    const tokensRef = ref(database, 'transactions_tokens/' + accessToken);
    await set(tokensRef, {
      chargeId: newChargeRef.key,
      createdAt: charge.createdAt,
      expiresAt: charge.expiresAt
    });
    
    return charge;
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    throw error;
  }
};

/**
 * Buscar uma cobrança pelo ID
 * @param {string} chargeId - ID da cobrança
 * @returns {Promise<Object>} Dados da cobrança
 */
export const getChargeById = async (chargeId) => {
  try {
    const chargeRef = ref(database, 'transactions/' + chargeId);
    const snapshot = await get(chargeRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('Cobrança não encontrada');
    }
  } catch (error) {
    console.error('Erro ao buscar cobrança:', error);
    throw error;
  }
};

/**
 * Buscar uma cobrança pelo token de acesso
 * @param {string} token - Token de acesso da cobrança
 * @returns {Promise<Object>} Dados da cobrança
 */
export const getChargeByToken = async (token) => {
  try {
    // Primeiro, buscar o ID da cobrança pelo token
    const tokenRef = ref(database, 'transactions_tokens/' + token);
    const tokenSnapshot = await get(tokenRef);
    
    if (!tokenSnapshot.exists()) {
      throw new Error('Token inválido');
    }
    
    const { chargeId, expiresAt } = tokenSnapshot.val();
    
    // Verificar se o token expirou
    if (new Date(expiresAt) < new Date()) {
      throw new Error('Token expirado');
    }
    
    // Buscar os dados da cobrança
    return await getChargeById(chargeId);
  } catch (error) {
    console.error('Erro ao buscar cobrança por token:', error);
    throw error;
  }
};

/**
 * Atualizar o status de uma cobrança
 * @param {string} chargeId - ID da cobrança
 * @param {string} status - Novo status da cobrança (pending, paid, canceled)
 * @returns {Promise<void>}
 */
export const updateChargeStatus = async (chargeId, status) => {
  try {
    const chargeRef = ref(database, 'transactions/' + chargeId + '/status');
    await set(chargeRef, status);
  } catch (error) {
    console.error('Erro ao atualizar status da cobrança:', error);
    throw error;
  }
};

/**
 * Registrar um pagamento para uma cobrança
 * @param {string} chargeId - ID da cobrança
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} Dados do pagamento registrado
 */
export const registerPayment = async (chargeId, paymentData) => {
  try {
    // Buscar a cobrança
    const charge = await getChargeById(chargeId);
    
    // Verificar se a cobrança já foi paga
    if (charge.status === 'paid') {
      throw new Error('Esta cobrança já foi paga');
    }
    
    // Criar um registro de pagamento
    const paymentsRef = ref(database, 'transactions_payments');
    const newPaymentRef = push(paymentsRef);
    
    const payment = {
      id: newPaymentRef.key,
      chargeId,
      ...paymentData,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    await set(newPaymentRef, payment);
    
    // Atualizar o status da cobrança para paga
    await updateChargeStatus(chargeId, 'paid');
    
    // Atualizar a cobrança com referência ao pagamento
    const chargePaymentRef = ref(database, 'transactions/' + chargeId + '/paymentId');
    await set(chargePaymentRef, newPaymentRef.key);
    
    return payment;
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    throw error;
  }
};

/**
 * Gerar um token de acesso aleatório para a cobrança
 * @returns {string} Token de acesso
 */
const generateAccessToken = () => {
  // Gerar um token alfanumérico de 8 caracteres
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Calcular o valor com juros para parcelas
 * @param {number} amount - Valor original
 * @param {number} installments - Número de parcelas
 * @param {number} installmentsWithoutFee - Número de parcelas sem juros
 * @param {number} feeRate - Taxa de juros em percentual
 * @returns {number} Valor total com juros aplicados
 */
export const calculateInstallmentAmount = (amount, installments, installmentsWithoutFee, feeRate) => {
  if (installments <= installmentsWithoutFee) {
    return amount;
  }
  
  // Aplicar juros compostos para parcelas com juros
  const monthlyRate = feeRate / 100;
  return amount * (1 + monthlyRate) ** (installments - installmentsWithoutFee);
};

export default {
  createCharge,
  getChargeById,
  getChargeByToken,
  updateChargeStatus,
  registerPayment,
  calculateInstallmentAmount
};