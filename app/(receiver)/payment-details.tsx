import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, ChevronRight, Building, User } from 'lucide-react-native';
import theme from '../../config/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import Section from '../../components/Section';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChargeData = {
  id: string;
  accessToken?: string;
  amount: number;
  description: string;
  customer?: string;
  merchantName: string;
  merchantId: string;
  date: string;
  status?: string;
};

export default function PaymentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [charge, setCharge] = useState<ChargeData | null>(null);

  useEffect(() => {
    if (params.chargeData) {
      try {
        const parsedData = JSON.parse(params.chargeData as string) as ChargeData;
        setCharge(parsedData);
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao processar os dados da cobrança');
        router.back();
      }
    } else {
      Alert.alert('Erro', 'Dados da cobrança não fornecidos');
      router.back();
    }
  }, [params.chargeData, router]);

  const handlePayWithNFC = () => {
    if (charge) {
      router.push({
        pathname: '/payment/nfc',
        params: { chargeData: JSON.stringify(charge) }
      });
    }
  };

  if (!charge) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pagamento</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Card variant="elevated" style={styles.merchantCard}>
            <View style={styles.merchantHeader}>
              <Building size={24} color={theme.colors.primary} />
              <Text style={styles.merchantName}>{charge.merchantName}</Text>
            </View>
            <Text style={styles.merchantId}>ID: {charge.merchantId}</Text>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Valor a Pagar</Text>
              <MoneyText value={charge.amount} size="xl" />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descrição</Text>
              <Text style={styles.detailValue}>{charge.description}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data</Text>
              <Text style={styles.detailValue}>{charge.date}</Text>
            </View>
            
            {charge.customer && (
              <View style={styles.detailRow}>
                <View style={styles.customerRow}>
                  <User size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.detailLabel, {marginLeft: 6}]}>Cliente</Text>
                </View>
                <Text style={styles.detailValue}>{charge.customer}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID da Transação</Text>
              <Text style={styles.detailValue}>{charge.id}</Text>
            </View>
            
            {charge.status && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[
                  styles.detailValue, 
                  charge.status === 'paid' ? styles.paidStatus : 
                  charge.status === 'pending' ? styles.pendingStatus : 
                  null
                ]}>
                  {charge.status === 'paid' ? 'Pago' : 
                   charge.status === 'pending' ? 'Pendente' : 
                   charge.status}
                </Text>
              </View>
            )}
          </Card>

          <View style={styles.securityNotice}>
            <CheckCircle size={20} color={theme.colors.success} />
            <Text style={styles.securityText}>
              Pagamento seguro e criptografado
            </Text>
          </View>

          <Section title="Informações do Beneficiário">
            <Card variant="outlined" style={styles.beneficiaryCard}>
              <View style={styles.beneficiaryRow}>
                <Text style={styles.beneficiaryLabel}>Empresa</Text>
                <Text style={styles.beneficiaryValue}>{charge.merchantName}</Text>
              </View>
              <View style={styles.beneficiaryRow}>
                <Text style={styles.beneficiaryLabel}>ID do Beneficiário</Text>
                <Text style={styles.beneficiaryValue}>{charge.merchantId}</Text>
              </View>
            </Card>
          </Section>

          <Section title="Métodos de Pagamento">
            <Card 
              variant="outlined" 
              style={styles.paymentMethodCard}
              onPress={handlePayWithNFC}
            >
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color={theme.colors.white} />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodTitle}>
                    Pagar com Cartão via NFC
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Aproxime seu cartão de débito ou crédito
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.textTertiary} />
            </Card>
          </Section>

          <Card variant="outlined" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <AlertCircle size={20} color={theme.colors.warning} />
              <Text style={styles.infoTitle}>Importante</Text>
            </View>
            <Text style={styles.infoText}>
              Ao prosseguir, seu dispositivo funcionará como um terminal de pagamento. 
              O valor será processado para a conta do comerciante {charge.merchantName}.
            </Text>
          </Card>
          
          {/* Espaço adicional no final do ScrollView para garantir que todo o conteúdo seja visível */}
          <View style={{ height: 80 }} />
        </ScrollView>
        
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            title="Pagar com NFC"
            onPress={handlePayWithNFC}
            variant="primary"
            size="lg"
            fullWidth
            icon={<CreditCard size={20} color={theme.colors.white} />}
            iconPosition="left"
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    paddingBottom: 100, // Espaço extra para garantir que o conteúdo não fique escondido pelo botão
  },
  merchantCard: {
    marginBottom: 24,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  merchantName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginLeft: 10,
  },
  merchantId: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  pendingStatus: {
    color: theme.colors.warning,
  },
  paidStatus: {
    color: theme.colors.success,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  securityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  beneficiaryCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  beneficiaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  beneficiaryValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  paymentMethodSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
}); 