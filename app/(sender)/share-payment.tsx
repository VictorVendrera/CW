import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Share, Alert, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Copy, Share2, QrCode, CheckCircle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { getChargeById } from '../../services/firebase';
import theme from '../../config/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MoneyText from '../../components/MoneyText';

interface PaymentData {
  id: string;
  accessToken: string;
  amount: number;
  description: string;
  customer: string;
  merchantName: string;
  merchantId: string;
  date: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function SharePaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const chargeId = typeof params.chargeId === 'string' ? params.chargeId : '';
  const token = typeof params.token === 'string' ? params.token : '';
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState(false);

  useEffect(() => {
    const fetchChargeData = async () => {
      if (!chargeId) {
        setError('ID de cobrança não fornecido');
        setLoading(false);
        return;
      }

      try {
        const charge = await getChargeById(chargeId);
        setPaymentData(charge as PaymentData);
        setCreationSuccess(true);
        console.log('Cobrança criada com sucesso:', charge);
      } catch (error) {
        console.error('Erro ao buscar dados da cobrança:', error);
        setError('Não foi possível carregar os dados da cobrança');
      } finally {
        setLoading(false);
      }
    };

    fetchChargeData();
  }, [chargeId]);

  const handleShare = async () => {
    if (!paymentData) return;
    
    try {
      const accessToken = paymentData.accessToken || token;
      // Link web (HTTPS) que será reconhecido como clicável
      const webLink = 'https://nfcpayflow.app/pay/' + accessToken;
      
      // Cria uma mensagem para compartilhar
      const shareMessage = 
        'Você recebeu uma cobrança de ' + 
        paymentData.merchantName + 
        '.\n\nValor: R$ ' + 
        paymentData.amount.toFixed(2) + 
        '\nDescrição: ' + 
        paymentData.description + 
        '\n\nUse o código: ' + 
        accessToken + 
        '\n\nOu acesse: ' + 
        webLink;
      
      await Share.share({
        message: shareMessage,
        title: 'Compartilhar cobrança'
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a cobrança');
    }
  };

  const copyLinkToClipboard = async () => {
    if (!paymentData) return;
    
    const accessToken = paymentData.accessToken || token;
    // Usar o link web para máxima compatibilidade
    const webLink = 'https://nfcpayflow.app/pay/' + accessToken;
    
    try {
      await Clipboard.setStringAsync(webLink);
      Alert.alert('Copiado!', 'Link de pagamento copiado para a área de transferência');
    } catch (error) {
      console.error('Erro ao copiar para o clipboard:', error);
      Alert.alert('Erro', 'Não foi possível copiar o link');
    }
  };
  
  const openPaymentLink = async (accessToken: string) => {
    try {
      const webLink = 'https://nfcpayflow.app/pay/' + accessToken;
      const canOpen = await Linking.canOpenURL(webLink);
      
      if (canOpen) {
        await Linking.openURL(webLink);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao abrir link:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao tentar abrir o link');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dados do pagamento...</Text>
      </View>
    );
  }

  if (error || !paymentData) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorTitle}>Erro</Text>
        <Text style={styles.errorMessage}>{error || 'Não foi possível carregar os dados da cobrança'}</Text>
        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="outline"
          size="md"
        />
      </View>
    );
  }

  const accessToken = paymentData.accessToken || token;
  const qrValue = 'https://nfcpayflow.app/pay/' + accessToken;
  const webLink = 'https://nfcpayflow.app/pay/' + accessToken;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
        headerTitle: () => <Text style={styles.headerTitle}>Compartilhar Cobrança</Text>
      }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compartilhar Cobrança</Text>
        <View style={{ width: 24 }} />
      </View>

      {creationSuccess && (
        <View style={styles.successBanner}>
          <CheckCircle size={20} color={theme.colors.white} />
          <Text style={styles.successText}>Cobrança criada com sucesso!</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.chargeCard}>
          <Text style={styles.cardTitle}>Detalhes da Cobrança</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor:</Text>
            <MoneyText value={paymentData.amount} size="md" />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição:</Text>
            <Text style={styles.infoValue}>{paymentData.description}</Text>
          </View>
          
          {paymentData.customer && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{paymentData.customer}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{paymentData.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Empresa:</Text>
            <Text style={styles.infoValue}>{paymentData.merchantName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, paymentData.status === 'paid' ? styles.paidStatus : styles.pendingStatus]}>
              {paymentData.status === 'paid' ? <Text>Pago</Text> : <Text>Pendente</Text>}
            </Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Compartilhe esta cobrança</Text>
          
          <View style={styles.qrCodeBox}>
            <QRCode
              value={qrValue}
              size={180}
              color={theme.colors.text}
              backgroundColor="white"
              logoBackgroundColor="white"
              ecl="M"
            />
          </View>
          
          <Text style={styles.tokenText}>
            Código: <Text style={styles.tokenValue}>{accessToken}</Text>
          </Text>
          
          <TouchableOpacity onPress={() => openPaymentLink(accessToken)}>
            <Text style={styles.linkText}>
              {webLink}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <Button
              title="Copiar Link"
              onPress={copyLinkToClipboard}
              variant="outline"
              size="md"
              style={styles.actionButton}
              icon={<Copy size={16} color={theme.colors.primary} />}
              iconPosition="left"
            />
            
            <Button
              title="Compartilhar"
              onPress={handleShare}
              variant="primary"
              size="md"
              style={styles.actionButton}
              icon={<Share2 size={16} color={theme.colors.white} />}
              iconPosition="left"
            />
          </View>
        </Card>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Esta cobrança expira em 24 horas
          </Text>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
  successBanner: {
    backgroundColor: theme.colors.success,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.error,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  chargeCard: {
    marginBottom: 16,
    padding: 16,
    width: '100%',
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  pendingStatus: {
    color: theme.colors.warning,
  },
  paidStatus: {
    color: theme.colors.success,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  qrTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: 16,
  },
  qrCodeBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  tokenValue: {
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: 2,
  },
  linkText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  footerContainer: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  spacer: {
    height: 70,
  },
}); 