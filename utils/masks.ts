/**
 * Aplica máscara de CPF (xxx.xxx.xxx-xx)
 * @param value String ou número para aplicar a máscara
 * @returns String formatada com a máscara de CPF
 */
export const maskCPF = (value: string | number): string => {
  // Converte para string e remove caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');
  
  // Aplica a máscara
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14); // Limita ao tamanho máximo de um CPF formatado
};

/**
 * Aplica máscara de CNPJ (xx.xxx.xxx/xxxx-xx)
 * @param value String ou número para aplicar a máscara
 * @returns String formatada com a máscara de CNPJ
 */
export const maskCNPJ = (value: string | number): string => {
  // Converte para string e remove caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');
  
  // Aplica a máscara
  return numericValue
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18); // Limita ao tamanho máximo de um CNPJ formatado
};

/**
 * Aplica máscara de telefone brasileiro ((xx) xxxxx-xxxx ou (xx) xxxx-xxxx)
 * @param value String ou número para aplicar a máscara
 * @returns String formatada com a máscara de telefone
 */
export const maskPhone = (value: string | number): string => {
  // Converte para string e remove caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');
  
  // Verifica o tamanho e aplica a máscara adequada
  if (numericValue.length <= 10) {
    // Formato (xx) xxxx-xxxx
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14); // Limita ao tamanho máximo
  } else {
    // Formato (xx) xxxxx-xxxx (celular)
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15); // Limita ao tamanho máximo
  }
};

/**
 * Aplica máscara de CEP (xxxxx-xxx)
 * @param value String ou número para aplicar a máscara
 * @returns String formatada com a máscara de CEP
 */
export const maskCEP = (value: string | number): string => {
  // Converte para string e remove caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');
  
  // Aplica a máscara
  return numericValue
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9); // Limita ao tamanho máximo de um CEP formatado
};

/**
 * Aplica máscara de cartão de crédito (xxxx xxxx xxxx xxxx)
 * @param value String ou número para aplicar a máscara
 * @returns String formatada com a máscara de cartão de crédito
 */
export const maskCreditCard = (value: string | number): string => {
  // Converte para string e remove caracteres não numéricos
  const numericValue = String(value).replace(/\D/g, '');
  
  // Aplica a máscara
  return numericValue
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .slice(0, 19); // Limita ao tamanho máximo de um cartão formatado
}; 