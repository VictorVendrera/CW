import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Image, 
  ScrollView,
  BackHandler,
  Alert,
  AppState,
  AppStateStatus
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, CreditCard, X, AlertCircle } from 'lucide-react-native';
import theme from '../../config/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';
import Section from '../../components/Section';
import OptionSelector from '../../components/OptionSelector';
import Checkbox from '../../components/Checkbox';
import { useNFC } from '../../hooks/useNFC';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChargeData = {
  id: string;
  amount: number;
  description: string;
  customer: string;
  merchant: string;
  merchantId: string;
  date: string;
};

const NFCPaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Estados locais da tela
  const [charge, setCharge] = useState<ChargeData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [installments, setInstallments] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<'credit' | 'debit'>('credit');
  const [chargeCardFee, setChargeCardFee] = useState<boolean>(false);
  
  // Utilizar o hook useNFC para gerenciar a leitura NFC
  const { 
    status, 
    error: nfcError, 
    cardData,
    startCardReading,
    stopCardReading,
    resetNfcState
  } = useNFC();

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      // Cancelar leitura NFC quando o componente for desmontado
      stopCardReading();
    };
  }, [stopCardReading]);

  // Processar dados da cobrança dos parâmetros
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

  // Sincronizar erro do NFC para a tela
  useEffect(() => {
    if (nfcError) {
      setErrorMessage(nfcError);
    }
  }, [nfcError]);

  // Impedir voltar com hardware back quando estiver processando
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (status === 'reading' || status === 'detected') {
          return true; // Impedir navegação para trás
        }
        return false; // Permitir comportamento padrão
      }
    );

    return () => backHandler.remove();
  }, [status]);

  // Efeito para navegar para a tela de sucesso quando o status for 'success'
  useEffect(() => {
    if (status === 'success' && cardData) {
      console.log('NFC: Navegando para tela de sucesso com dados:', cardData);
        
        try {
          // Preparar dados para navegação
          const navigationData = {
            cardNumber: cardData.cardNumber,
            expiryDate: cardData.expiryDate,
            cardType: cardData.cardType || 'Desconhecido',
            chargeData: charge,
            amount: calculateTotal(),
            installments,
            paymentType,
          timestamp: Date.now()
          };
          
          console.log('NFC: Dados preparados para navegação:', navigationData);
          
        // Forçar navegação imediata para a tela de sucesso com múltiplas tentativas
        const navigateToSuccess = () => {
          console.log('NFC: Tentando navegar para tela de sucesso...');
          
          try {
            router.replace({
              pathname: '/payment/success',
              params: { 
                paymentData: JSON.stringify(navigationData),
                refreshKey: Date.now().toString()
              }
            });
          } catch (navError) {
            console.error('NFC: Erro ao navegar:', navError);
          }
        };
        
        // Primeira tentativa imediata
        navigateToSuccess();
        
        // Segunda tentativa após um pequeno atraso (caso a primeira falhe)
        setTimeout(navigateToSuccess, 500);
        
        // Terceira tentativa após um atraso maior (caso as anteriores falhem)
        setTimeout(navigateToSuccess, 1500);
        
        } catch (error) {
          console.error('NFC: Erro ao navegar para tela de sucesso:', error);
          setErrorMessage('Erro ao processar pagamento');
        }
      }
  }, [status, cardData, charge, installments, paymentType, router]);

  // Adicionar listener para mudanças no estado do app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && status === 'success' && cardData) {
        console.log('NFC: App voltou ao primeiro plano com leitura bem-sucedida');
        // Forçar recálculo do efeito de navegação
        router.setParams({ 
          refresh: Date.now().toString(),
          forceNavigation: 'true'
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [status, cardData, router]);

  const startPayment = async () => {
    setErrorMessage(null);
    try {
      console.log('Iniciando leitura do cartão...');
      await startCardReading();
    } catch (error: any) {
      console.error('Erro ao iniciar leitura do cartão:', error);
      setErrorMessage(error.message || 'Erro ao iniciar leitura do cartão');
    }
  };

  const cancelTransaction = () => {
    if (status === 'reading' || status === 'detected') {
      Alert.alert(
        'Cancelar Transação',
        'Tem certeza que deseja cancelar esta transação?',
        [
          { text: 'Não', style: 'cancel' },
          { 
            text: 'Sim', 
            style: 'destructive', 
            onPress: () => {
              stopCardReading();
              setErrorMessage(null);
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleNewPayment = () => {
    router.back();
  };

  const calculateTotal = () => {
    if (!charge) return 0;
    
    if (chargeCardFee) {
      // Simular taxa de 2.5% para crédito e 1.5% para débito
      const feeRate = paymentType === 'credit' ? 0.025 : 0.015;
      return charge.amount * (1 + feeRate);
    }
    
    return charge.amount;
  };

  // Opções de parcelamento - apenas se for crédito
  const installmentOptions = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    label: `${i + 1}${i === 0 ? 'x' : 'x'}`,
    value: i + 1,
    disabled: paymentType === 'debit' && i > 0,
  }));

  // Opções de tipo de pagamento
  const paymentTypeOptions = [
    { id: 'credit', label: 'Crédito', value: 'credit' },
    { id: 'debit', label: 'Débito', value: 'debit' },
  ];

  if (!charge) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'waiting':
      case 'cancelled':
        return (
          <ScrollView style={styles.scrollContent}>
            <Card variant="elevated" style={styles.chargeCard}>
              <Text style={styles.merchantName}>{charge.merchant}</Text>
              <Text style={styles.merchantId}>ID: {charge.merchantId}</Text>
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Valor a Pagar</Text>
                <MoneyText 
                  value={calculateTotal()} 
                  size="xl"
                  color={theme.colors.text}
                />
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
            </Card>

            <Section title="Forma de Pagamento">
              <OptionSelector
                options={paymentTypeOptions}
                selectedOption={paymentType}
                onSelect={(option) => {
                  setPaymentType(option.value);
                  if (option.value === 'debit') {
                    setInstallments(1);
                  }
                }}
                style={styles.paymentOptions}
              />
            </Section>

            {paymentType === 'credit' && (
              <Section title="Parcelas">
                <OptionSelector
                  options={installmentOptions.slice(0, 6)}
                  selectedOption={installments}
                  onSelect={(option) => setInstallments(option.value)}
                  style={styles.installmentOptions}
                />
                
                {installments > 1 && (
                  <View style={styles.cardFeeContainer}>
                    <Text style={styles.installmentsText}>
                      {installments}x de <MoneyText value={calculateTotal() / installments} size="sm" />
                    </Text>
                  </View>
                )}
              </Section>
            )}

            {/*
            <Card variant="outlined" style={styles.cardFeeContainer}>
              <Checkbox
                checked={chargeCardFee}
                onPress={() => setChargeCardFee(!chargeCardFee)}
                label="Repassar taxas para o cliente"
                style={styles.checkbox}
              />
              {chargeCardFee && (
                <View style={styles.feeInfo}>
                  <Text style={styles.feeInfoText}>
                    Taxa de {paymentType === 'credit' ? '2,5%' : '1,5%'} será adicionada ao valor
                  </Text>
                </View>
              )}
            </Card>
            */}

            <View style={styles.securityNotice}>
              <Check size={20} color={theme.colors.success} />
              <Text style={styles.securityText}>
                Pagamento seguro e criptografado
              </Text>
            </View>
          </ScrollView>
        );
      
      case 'reading':
      case 'detected':
        return (
          <View style={styles.processingContainer}>
            <View style={styles.nfcContainer}>
              <CreditCard size={60} color={theme.colors.primary} />
              <Text style={styles.nfcText}>
                {status === 'reading' ? 'Aproxime o cartão' : 'Processando pagamento'}
              </Text>
              <Text style={styles.nfcSubtext}>
                {status === 'reading' 
                  ? 'Mantenha o cartão próximo ao dispositivo' 
                  : 'Aguarde enquanto processamos seu pagamento'}
              </Text>
            </View>
            
            <View style={styles.cardReadingValue}>
              <MoneyText value={calculateTotal()} size="lg" />
            </View>
            
            {paymentType === 'credit' && installments > 1 && (
              <Text style={styles.installmentsText}>
                {installments}x de <MoneyText value={calculateTotal() / installments} size="sm" />
              </Text>
            )}
          </View>
        );
      
      case 'success':
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Check size={50} color={theme.colors.white} />
            </View>
            
            <Text style={styles.successText}>Pagamento aprovado</Text>
            
            <View style={styles.paymentDetails}>
              <Card variant="outlined" style={styles.paymentDetailsCard}>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Valor</Text>
                  <MoneyText value={calculateTotal()} size="md" />
                </View>
                
                {paymentType === 'credit' && installments > 1 && (
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Parcelas</Text>
                    <Text style={styles.paymentDetailValue}>
                      {installments}x de <MoneyText value={calculateTotal() / installments} size="sm" />
                    </Text>
                  </View>
                )}
                
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Forma de Pagamento</Text>
                  <Text style={styles.paymentDetailValue}>{paymentType === 'credit' ? 'Crédito' : 'Débito'}</Text>
                </View>
                
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Cartão</Text>
                  <Text style={styles.paymentDetailValue}>
                    {cardData?.cardNumber ? `**** **** **** ${cardData.cardNumber.slice(-4)}` : '****'}
                  </Text>
                </View>
                
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Validade</Text>
                  <Text style={styles.paymentDetailValue}>{cardData?.expiryDate || 'MM/AA'}</Text>
                </View>
                
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Autorização</Text>
                  <Text style={styles.paymentDetailValue}>{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</Text>
                </View>
              </Card>
            </View>
            
            <Text style={styles.successSubtext}>
              O comprovante será enviado para o email do cliente
            </Text>
          </View>
        );
      
      case 'error':
        return (
          <View style={styles.errorContainer}>
            <View style={[styles.successIcon, styles.errorIcon]}>
              <X size={50} color={theme.colors.white} />
            </View>
            
            <Text style={[styles.successText, styles.errorText]}>Pagamento recusado</Text>
            
            <Card variant="outlined" style={styles.errorCard}>
              <View style={styles.errorMessageContainer}>
                <AlertCircle size={24} color={theme.colors.error} />
                <Text style={styles.errorMessageText}>{errorMessage || 'Houve um erro ao processar o pagamento'}</Text>
              </View>
            </Card>
            
            <Text style={styles.errorSubtext}>
              {errorMessage || 'Houve um erro ao processar o pagamento'}
            </Text>
          </View>
        );
    }
  };

  const renderFooter = () => {
    switch (status) {
      case 'idle':
      case 'waiting':
      case 'cancelled':
        return (
          <Button
            title="Realizar pagamento"
            onPress={startPayment}
            variant="primary"
            size="md"
            fullWidth
            icon={<CreditCard size={18} color={theme.colors.white} />}
            iconPosition="left"
          />
        );
      
      case 'reading':
      case 'detected':
        return (
          <Button
            title="Cancelar"
            onPress={cancelTransaction}
            variant="outline"
            size="lg"
            fullWidth
          />
        );
      
      case 'success':
        return (
          <Button
            title="Continuar"
            onPress={() => {
              const successData = {
                cardNumber: cardData?.cardNumber || '',
                expiryDate: cardData?.expiryDate || '',
                cardType: cardData?.cardType || 'Desconhecido',
                chargeData: charge,
                amount: calculateTotal(),
                installments: installments,
                paymentType: paymentType
              };
              
              router.push({
                pathname: '/payment/success',
                params: { paymentData: JSON.stringify(successData) }
              });
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
        );
      
      case 'error':
        return (
          <View style={styles.footerButtonsContainer}>
            <Button
              title="Tentar novamente"
              onPress={startPayment}
              variant="primary"
              size="lg"
              style={styles.footerButton}
            />
            <Button
              title="Cancelar"
              onPress={handleNewPayment}
              variant="outline"
              size="lg"
              style={styles.footerButton}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={cancelTransaction} 
          style={styles.backButton}
          disabled={status === 'reading' || status === 'detected'}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { marginTop: 20 }]}>
          {status === 'waiting' || status === 'idle' || status === 'cancelled'
            ? 'Pagamento com Cartão' 
            : status === 'success'
            ? 'Pagamento Concluído'
            : status === 'error'
            ? 'Pagamento Recusado'
            : 'Processando Pagamento'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {renderContent()}
      
      <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
        {renderFooter()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  chargeCard: {
    marginBottom: 24,
  },
  merchantName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginBottom: 4,
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
  paymentOptions: {
    marginBottom: 24,
  },
  installmentOptions: {
    marginBottom: 24,
  },
  cardFeeContainer: {
    marginBottom: 24,
  },
  feeCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  checkbox: {
    marginBottom: theme.spacing.xs,
  },
  feeInfo: {
    backgroundColor: theme.colors.backgroundDark,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  feeInfoText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  securityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  cardReadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  cardAnimation: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cardAnimationIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardReadingTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cardReadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  cardReadingValue: {
    marginBottom: theme.spacing.sm,
  },
  installmentsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorIcon: {
    backgroundColor: theme.colors.error,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  errorTitle: {
    color: theme.colors.error,
  },
  paymentDetails: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  paymentDetailsCard: {
    padding: theme.spacing.md,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  paymentDetailLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  paymentDetailValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  successMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorMessageText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  footer: {
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  nfcContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  nfcIcon: {
    marginBottom: 24,
  },
  nfcText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  nfcSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  nfcButton: {
    marginBottom: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: 16,
  },
  successSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default NFCPaymentScreen;