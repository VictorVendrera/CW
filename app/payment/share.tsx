import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Copy, Share2, ArrowLeft } from 'lucide-react-native';

type ChargeData = {
  id: string;
  amount: number;
  description: string;
  customer: string;
  phone?: string;
  date: string;
  status: string;
};

export default function ShareChargeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [charge, setCharge] = useState<ChargeData | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.chargeData) {
      try {
        const parsedData = JSON.parse(params.chargeData as string) as ChargeData;
        setCharge(parsedData);
        
        // Simular geração de link com ID da cobrança
        const baseUrl = 'https://nfcpayflow.app/pay';
        setPaymentLink(`${baseUrl}/${parsedData.id}`);
        
        // Simular tempo de geração do QR code
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        Alert.alert('Erro', 'Ocorreu um erro ao processar os dados da cobrança');
        router.back();
      }
    } else {
      Alert.alert('Erro', 'Dados da cobrança não fornecidos');
      router.back();
    }
  }, [params.chargeData, router]);

  const handleCopyLink = () => {
    // No ambiente real, implementaríamos a cópia para o clipboard
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    if (!charge) return;
    
    try {
      // Para desenvolvimento com Expo Go, geramos um link especial para expo-development-client
      // que funciona quando o aplicativo é executado através do Expo Go
      const expoDevLink = `exp://192.168.0.248:8081/--/pay/${charge.id}`;
      
      // Também fornecemos os links normais para quando o app for compilado
      const appLink = `nfcpayflow://pay/${charge.id}`;
      const webLink = `https://nfcpayflow.app/pay/${charge.id}`;
      
      // No desenvolvimento, usamos o link específico do Expo
      // Em produção, seria usado o webLink
      const shareLink = expoDevLink;
      
      const result = await Share.share({
        message: `${charge.customer}, você recebeu uma cobrança de R$ ${charge.amount.toFixed(2)} por "${charge.description}". Acesse o link para pagar: ${shareLink}\n\nID: ${charge.id}`,
        url: shareLink // iOS prefere este campo para links
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o link');
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (!charge) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0066CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compartilhar Cobrança</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.checkIcon}>
            <Check size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Cobrança Criada!</Text>
          <Text style={styles.successMessage}>
            Compartilhe o link ou QR code com seu cliente para que ele possa realizar o pagamento.
          </Text>
        </View>

        <View style={styles.chargeDetailsCard}>
          <Text style={styles.detailsTitle}>Detalhes da Cobrança</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cliente</Text>
            <Text style={styles.detailValue}>{charge.customer}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Valor</Text>
            <Text style={styles.detailValue}>{formatCurrency(charge.amount)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Descrição</Text>
            <Text style={styles.detailValue}>{charge.description}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data</Text>
            <Text style={styles.detailValue}>{charge.date}</Text>
          </View>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>QR Code de Pagamento</Text>
          
          {loading ? (
            <View style={styles.qrPlaceholder}>
              <ActivityIndicator size="large" color="#0066CC" />
            </View>
          ) : (
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.qrImage}
              resizeMode="contain"
            />
          )}
          
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>
              {paymentLink}
            </Text>
            <TouchableOpacity 
              onPress={handleCopyLink} 
              style={styles.copyButton}
            >
              {copied ? (
                <Check size={20} color="#00CC66" />
              ) : (
                <Copy size={20} color="#0066CC" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareLink}
        >
          <Share2 size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Compartilhar Link</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.doneButtonText}>Concluído</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00CC66',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  chargeDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#0066CC',
  },
  copyButton: {
    padding: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 