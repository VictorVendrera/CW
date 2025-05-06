/**
 * Valida um CPF
 * @param cpf CPF para validar (com ou sem máscara)
 * @returns Verdadeiro se o CPF for válido
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se é uma sequência de números iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }
  
  return true;
};

/**
 * Valida um CNPJ
 * @param cnpj CNPJ para validar (com ou sem máscara)
 * @returns Verdadeiro se o CNPJ for válido
 */
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }
  
  // Verifica se é uma sequência de números iguais (ex: 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  
  if (remainder !== parseInt(cleanCNPJ.charAt(12))) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  if (remainder < 2) {
    remainder = 0;
  } else {
    remainder = 11 - remainder;
  }
  
  if (remainder !== parseInt(cleanCNPJ.charAt(13))) {
    return false;
  }
  
  return true;
};

/**
 * Valida um número de telefone brasileiro
 * @param phone Número de telefone para validar (com ou sem máscara)
 * @returns Verdadeiro se o telefone for válido
 */
export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Valida um CEP brasileiro
 * @param cep CEP para validar (com ou sem máscara)
 * @returns Verdadeiro se o CEP tiver o formato correto
 */
export const validateCEP = (cep: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // CEP deve ter 8 dígitos
  return cleanCEP.length === 8;
};

/**
 * Valida um cartão de crédito usando o algoritmo de Luhn
 * @param cardNumber Número do cartão para validar (com ou sem máscara)
 * @returns Verdadeiro se o número do cartão for válido
 */
export const validateCreditCard = (cardNumber: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCardNumber = cardNumber.replace(/\D/g, '');
  
  // Verifica se tem entre 13 e 19 dígitos (padrões de cartões conhecidos)
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return false;
  }
  
  // Implementação do algoritmo de Luhn (Mod 10)
  let sum = 0;
  let shouldDouble = false;
  
  // Percorre o número do cartão da direita para a esquerda
  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCardNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  // O número do cartão é válido se a soma for divisível por 10
  return sum % 10 === 0;
};

/**
 * Valida um endereço de e-mail
 * @param email E-mail para validar
 * @returns Verdadeiro se o e-mail tiver um formato válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}; 