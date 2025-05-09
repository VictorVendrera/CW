import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import theme from '../../config/theme';

export default function ReceiptShareScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const viewRef = useRef(null); // Para a view oculta

  const paymentData = params.paymentData ? JSON.parse(params.paymentData as string) : null;

  // Simulação de dados de origem/destino
  const origem = {
    nome: paymentData?.chargeData?.customer || 'Cliente',
    instituicao: 'NFC PayFlow',
    agencia: '0001',
    conta: '1234567-8',
    cpf: '***.123.456-**',
  };
  const destino = {
    nome: paymentData?.chargeData?.merchant || 'Comerciante',
    instituicao: 'NFC PayFlow',
    agencia: '0001',
    conta: '8765432-1',
    cnpj: '12.345.678/0001-99',
  };
  const idTransacao = paymentData?.chargeData?.id || 'ID123456789';

  const handleShare = async () => {
    try {
      // Captura a view oculta (comprovante completo)
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      alert('Erro ao compartilhar imagem');
    }
  };

  if (!paymentData) return null;

  // Componente do recibo (usado tanto na tela quanto na view oculta)
  const ReceiptContent = () => (
    <View style={styles.receiptContent}>
      <Text style={styles.title}>Comprovante de Pagamento</Text>
      <Text style={styles.date}>{new Date().toLocaleString('pt-BR')}</Text>
      <Text style={styles.valorLabel}>Valor</Text>
      <Text style={styles.valorValue}>R$ {Number(paymentData.amount).toFixed(2)}</Text>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>Tipo de pagamento</Text>
        <Text style={styles.value}>{paymentData.paymentType === 'credit' ? 'Crédito' : 'Débito'}</Text>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>ID da transação</Text>
        <Text style={styles.value}>{idTransacao}</Text>
      </View>
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Destino</Text>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valueBold}>{destino.nome}</Text>
        <Text style={styles.label}>Instituição</Text>
        <Text style={styles.value}>{destino.instituicao}</Text>
        <Text style={styles.label}>Agência</Text>
        <Text style={styles.value}>{destino.agencia}</Text>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.valueBold}>{destino.conta}</Text>
        {destino.cnpj && <><Text style={styles.label}>CNPJ</Text><Text style={styles.valueBold}>{destino.cnpj}</Text></>}
      </View>
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Origem</Text>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valueBold}>{origem.nome}</Text>
        <Text style={styles.label}>Instituição</Text>
        <Text style={styles.value}>{origem.instituicao}</Text>
        <Text style={styles.label}>Agência</Text>
        <Text style={styles.value}>{origem.agencia}</Text>
        <Text style={styles.label}>Conta</Text>
        <Text style={styles.valueBold}>{origem.conta}</Text>
        {origem.cpf && <><Text style={styles.label}>CPF</Text><Text style={styles.valueBold}>{origem.cpf}</Text></>}
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>Cartão</Text>
        <Text style={styles.valueBold}>{paymentData.cardNumber}</Text>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>Validade</Text>
        <Text style={styles.valueBold}>{paymentData.expiryDate}</Text>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>Descrição</Text>
        <Text style={styles.value}>{paymentData.chargeData?.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* View oculta para captura da imagem completa */}
      <View style={styles.hiddenReceipt} ref={viewRef} collapsable={false}>
        <ReceiptContent />
      </View>
      {/* Visualização normal com scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ReceiptContent />
      </ScrollView>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Compartilhar imagem</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  hiddenReceipt: {
    position: 'absolute',
    left: -9999,
    top: 0,
    width: 340, // largura padrão para o recibo
    backgroundColor: '#fff',
    zIndex: -1,
    opacity: 0,
  },
  receiptContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  valorLabel: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  valorValue: {
    fontSize: 28,
    color: theme.colors.success,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    marginBottom: 2,
  },
  sectionBlock: {
    marginTop: 14,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
    color: '#222',
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 2,
  },
  valueBold: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  shareButton: {
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 0,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 