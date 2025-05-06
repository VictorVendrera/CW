/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada como moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Converte uma string de moeda em valor numérico
 * @param currencyString String no formato de moeda (ex: "R$ 10,50")
 * @returns Valor numérico
 */
export const parseCurrencyString = (currencyString: string): number => {
  // Remove o símbolo da moeda e espaços
  const numericString = currencyString
    .replace(/[R$\s]/g, '')
    .replace('.', '')
    .replace(',', '.');
  
  return parseFloat(numericString);
};

/**
 * Formata uma data para o formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada como data brasileira (dd/mm/yyyy)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

/**
 * Formata uma data com hora para o formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada como data e hora brasileira (dd/mm/yyyy HH:MM)
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}; 