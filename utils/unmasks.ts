/**
 * Remove todos os caracteres não numéricos de uma string
 * @param value String com máscara para ser limpa
 * @returns String contendo apenas os números
 */
export const unmask = (value: string | number): string => {
  return String(value).replace(/\D/g, '');
};

/**
 * Remove a máscara de CPF (xxx.xxx.xxx-xx)
 * @param cpf String com máscara de CPF
 * @returns String contendo apenas os números do CPF
 */
export const unmaskCPF = (cpf: string): string => {
  return unmask(cpf);
};

/**
 * Remove a máscara de CNPJ (xx.xxx.xxx/xxxx-xx)
 * @param cnpj String com máscara de CNPJ
 * @returns String contendo apenas os números do CNPJ
 */
export const unmaskCNPJ = (cnpj: string): string => {
  return unmask(cnpj);
};

/**
 * Remove a máscara de telefone brasileiro ((xx) xxxxx-xxxx ou (xx) xxxx-xxxx)
 * @param phone String com máscara de telefone
 * @returns String contendo apenas os números do telefone
 */
export const unmaskPhone = (phone: string): string => {
  return unmask(phone);
};

/**
 * Remove a máscara de CEP (xxxxx-xxx)
 * @param cep String com máscara de CEP
 * @returns String contendo apenas os números do CEP
 */
export const unmaskCEP = (cep: string): string => {
  return unmask(cep);
};

/**
 * Remove a máscara de cartão de crédito (xxxx xxxx xxxx xxxx)
 * @param creditCard String com máscara de cartão de crédito
 * @returns String contendo apenas os números do cartão
 */
export const unmaskCreditCard = (creditCard: string): string => {
  return unmask(creditCard);
};