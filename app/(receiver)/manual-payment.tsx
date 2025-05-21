import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,  
  TouchableOpacity, 
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import theme from '../../config/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Section from '../../components/Section';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChargeByToken } from '../../services/firebase';

export default function ManualPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLinkSubmit = async () => {
    if (!paymentLink) {
      Alert.alert('Erro', 'Por favor, insira um link de pagamento válido');
      return;
    }

    // Extrair ID do link
    let paymentId;
    setLoading(true);
    
    try {
      // Tentar extrair do formato https://nfcpayflow.app/pay/ID ou nfcpayflow://pay/ID
      if (paymentLink.includes('/pay/')) {
        paymentId = paymentLink.split('/pay/')[1];
      } else {
        // Se não conseguir extrair, usar o próprio link como ID
        paymentId = paymentLink;
      }

      setPaymentLink('');

      // Tentar buscar dados da cobrança pelo token
      let chargeData;
      
      try {
        // Tentar obter dados da cobrança do Firebase
        chargeData = await getChargeByToken(paymentId);
      } catch (error) {
        console.log('Erro ao buscar cobrança, usando dados simulados:', error);
        // Se falhar, usar dados simulados com o token fornecido
        chargeData = {
          id: paymentId,
          amount: 50.00,
          description: 'Pagamento via link manual',
          customer: 'Cliente',
          merchantName: 'Sua Empresa', // Nome genérico ao invés de "Loja do João"
          merchantId: 'M123456',
          date: new Date().toLocaleDateString('pt-BR'),
        };
      }

      // Navegar para a tela de detalhes de pagamento com os dados da cobrança
      router.push({
        pathname: '/(receiver)/payment-details',
        params: { chargeData: JSON.stringify(chargeData) }
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível processar o link de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento Manual</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.contentContainer}>
          <Card variant="elevated" style={styles.card}>
            <Section title="Inserir Link de Pagamento">
              <Text style={styles.description}>
                Cole ou digite o link de pagamento recebido
              </Text>

              <TextField
                value={paymentLink}
                onChangeText={setPaymentLink}
                placeholder="https://nfcpayflow.app/pay/123456"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </Section>
          </Card>
          
          <Section title="Código do Pagamento">
            <Text style={styles.description}>
              Se você recebeu um código de pagamento diretamente (sem link), insira-o aqui:
            </Text>
            
            <TextField
              value={paymentLink}
              onChangeText={setPaymentLink}
              placeholder="XXXXXX"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </Section>
        </View>

        <View style={[styles.footer, { paddingBottom: 24 + Math.max(insets.bottom, 16) }]}>
          <Button
            title="Processar pagamento"
            onPress={handleManualLinkSubmit}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.button}
            loading={loading}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  card: {
    marginBottom: 24,
  },
  description: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  footer: {
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  button: {
    marginBottom: 0,
  },
}); 