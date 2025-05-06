/**
 * Gera uma string aleatória com o tamanho especificado
 * @param length Tamanho da string a ser gerada
 * @returns String aleatória
 */
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Gera um ID único baseado no timestamp e caracteres aleatórios
 * @returns ID único
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = generateRandomString(8);
  return `${timestamp}-${randomStr}`;
}; 