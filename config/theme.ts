export const colors = {
  // Cores primárias
  primary: '#0066FF',
  primaryDark: '#CC2952',
  primaryLight: '#FFE6ED',
  
  // Cores secundárias
  secondary: '#FFCC00',
  secondaryDark: '#CCA300',
  secondaryLight: '#FFF9E6',
  
  // Cores neutras
  background: '#F0F8FF',
  backgroundLight: '#E6F0FF',
  backgroundDark: '#D1E5FF',
  
  // Textos
  text: '#1A1A1A',
  textSecondary: '#4D4D4D',
  textTertiary: '#808080',
  
  // Elementos UI
  border: '#B3D1FF',
  borderDark: '#99C2FF',
  divider: '#B3D1FF',
  
  // Estados
  success: '#00CC99',
  error: '#FF3333',
  warning: '#FF9933',
  info: '#3399FF',
  
  // Outros
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme; 