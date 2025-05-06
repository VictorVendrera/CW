import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import theme from '../../../config/theme';

export default function PaymentDetailsTab() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Redirecionar automaticamente para a tela de detalhes de pagamento
  useEffect(() => {
    if (params.chargeData) {
      router.replace({
        pathname: '/(receiver)/payment-details',
        params: { chargeData: params.chargeData }
      });
    } else {
      // Se não houver dados de cobrança, voltar para a tela inicial
      router.replace('/(receiver)/(tabs)');
    }
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>Carregando detalhes do pagamento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: 20,
  },
}); 