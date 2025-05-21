import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getChargeByToken } from '../../services/firebase';
import theme from '../../config/theme';

export default function PaymentTokenScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extrair o token dos parâmetros (pode ser direto ou como parte da URL)
    let tokenValue: string;
    if (typeof params.token === 'string') {
      tokenValue = params.token;
    } else if (Array.isArray(params.token) && params.token.length > 0) {
      tokenValue = params.token[0];
    } else {
      setError('Token de pagamento não fornecido');
      setLoading(false);
      return;
    }

    const loadCharge = async () => {
      try {
        // Buscar a cobrança pelo token
        const charge = await getChargeByToken(tokenValue);
        
        // Redirecionar para a tela de detalhes de pagamento com os dados da cobrança
        router.replace({
          pathname: '/(receiver)/payment-details',
          params: { chargeData: JSON.stringify(charge) }
        });
      } catch (err: any) {
        console.error('Erro ao carregar cobrança:', err);
        setError(err.message || 'Não foi possível carregar a cobrança');
        setLoading(false);
      }
    };

    loadCharge();
  }, [params.token, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando detalhes do pagamento...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ 
          title: "Erro de Pagamento",
          headerStyle: { backgroundColor: theme.colors.error },
          headerTintColor: theme.colors.white
        }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Algo deu errado</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Redirecionando...</Text>
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
  loadingText: {
    marginTop: 20,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
}); 