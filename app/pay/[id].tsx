import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRole } from '../../hooks/useRole';

export default function PaymentLinkHandler() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const { role, setRole } = useRole();

  useEffect(() => {
    console.log("Parâmetros recebidos:", params);
    console.log("ID recebido:", id);
    
    const processPaymentLink = async () => {
      // Se não tiver papel definido, definir como devedor
      if (!role) {
        await setRole('receiver');
      }

      // Obter o ID da cobrança do parâmetro
      const paymentId = id || Date.now().toString();

      // Simular dados para uma cobrança recebida por link
      const chargeData = {
        id: paymentId,
        amount: 150.50,
        description: 'Pagamento via link direto',
        customer: 'Cliente',
        merchant: 'Loja do João',
        merchantId: 'M123456',
        date: new Date().toLocaleDateString('pt-BR'),
      };

      // Aguardar um momento para mostrar a tela de carregamento
      setTimeout(() => {
        // Navegar para a tela de detalhes de pagamento
        router.replace({
          pathname: '/(receiver)/payment-details',
          params: { chargeData: JSON.stringify(chargeData) }
        });
      }, 1500);
    };

    processPaymentLink();
  }, [id, role, router, setRole, params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00CC66" style={styles.loading} />
      <Text style={styles.text}>Carregando detalhes do pagamento...</Text>
      <Text style={styles.subText}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loading: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
}); 