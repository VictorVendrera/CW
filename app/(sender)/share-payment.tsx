import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Share, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { usePaymentToken } from '../../hooks/usePaymentToken';
import { TouchableOpacity } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

// Definir tipo para os dados de pagamento
interface PaymentData {
  id: string;
  amount: number;
  description: string;
  merchantName: string;
  merchantId: string;
  date: string;
}

// Definir tipo para o token
interface Token {
  id: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

export default function SharePayment() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const { generateToken, tokenError, isGeneratingToken } = usePaymentToken();
  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    // Em um cenário real, buscaríamos os dados do pagamento do banco de dados
    // Aqui estamos simulando com dados fixos baseados no ID
    setTimeout(() => {
      setPaymentData({
        id: id?.toString() || 'unknown',
        amount: 150.75,
        description: 'Pagamento de serviço',
        merchantName: 'Empresa XPTO',
        merchantId: 'MRC12345',
        date: new Date().toISOString(),
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  useEffect(() => {
    if (paymentData && !token) {
      generatePaymentToken();
    }
  }, [paymentData]);

  const generatePaymentToken = async () => {
    if (!paymentData) return;
    
    try {
      const newToken = await generateToken({
        paymentId: paymentData.id,
        amount: paymentData.amount,
        description: paymentData.description,
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
      });
      
      setToken(newToken);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o token de pagamento');
      console.error(error);
    }
  };

  const handleShare = async () => {
    if (!token || !paymentData) return;
    
    try {
      const result = await Share.share({
        message: `Você recebeu uma cobrança de ${paymentData.merchantName}. Use o código: ${token.id} para pagar R$ ${paymentData.amount.toFixed(2)}`,
        url: `nfcpayflow://payment/${token.id}`,
        title: 'Compartilhar pagamento'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o token');
    }
  };

  const copyTokenToClipboard = async () => {
    if (!token) return;
    
    await Clipboard.setStringAsync(token.id);
    Alert.alert('Sucesso', 'Token copiado para a área de transferência');
  };

  if (loading || !paymentData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Carregando dados do pagamento...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compartilhar Pagamento</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalhes do Pagamento</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor:</Text>
          <Text style={styles.infoValue}>R$ {paymentData.amount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Descrição:</Text>
          <Text style={styles.infoValue}>{paymentData.description}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Beneficiário:</Text>
          <Text style={styles.infoValue}>{paymentData.merchantName}</Text>
        </View>
      </View>

      <View style={styles.tokenSection}>
        <Text style={styles.tokenTitle}>Token de Pagamento</Text>
        
        {isGeneratingToken ? (
          <ActivityIndicator size="large" color="#0066CC" />
        ) : tokenError ? (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={24} color="red" />
            <Text style={styles.errorText}>Erro ao gerar token</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={generatePaymentToken}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : token ? (
          <View style={styles.tokenContainer}>
            <QRCode
              value={`nfcpayflow://payment/${token.id}`}
              size={180}
              color="#000"
              backgroundColor="#FFF"
            />
            <Text style={styles.tokenText}>{token.id}</Text>
            
            <View style={styles.tokenActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={copyTokenToClipboard}
              >
                <FontAwesome5 name="copy" size={18} color="#0066CC" />
                <Text style={styles.actionButtonText}>Copiar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <FontAwesome5 name="share-alt" size={18} color="#0066CC" />
                <Text style={styles.actionButtonText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ActivityIndicator size="large" color="#0066CC" />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Este token expira em 30 minutos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tokenSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    alignSelf: 'flex-start',
  },
  tokenContainer: {
    alignItems: 'center',
  },
  tokenText: {
    marginTop: 15,
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 1,
    color: '#333',
  },
  tokenActions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#0066CC',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  retryButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#0066CC',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
}); 