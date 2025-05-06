/**
 * Verifica se uma string é um CPF válido
 * @param cpf String contendo o CPF a ser validado
 * @returns Verdadeiro se o CPF for válido
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos e não é uma sequência de números iguais
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

/**
 * Verifica se uma string é um CNPJ válido
 * @param cnpj String contendo o CNPJ a ser validado
 * @returns Verdadeiro se o CNPJ for válido
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos e não é uma sequência de números iguais
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }
  
  // Algoritmo de validação do CNPJ
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  // Validação do primeiro dígito verificador
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  size += 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Verifica se uma string é um email válido
 * @param email String contendo o email a ser validado
 * @returns Verdadeiro se o email for válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verifica se uma string é um número de telefone brasileiro válido
 * @param phone String contendo o telefone a ser validado
 * @returns Verdadeiro se o telefone for válido
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return false;
  }
  
  // Se tiver 11 dígitos, o primeiro deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') {
    return false;
  }
  
  return true;
}; 