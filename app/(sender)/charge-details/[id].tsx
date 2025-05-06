import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Clock, CheckCircle2, Smartphone, Send, Share2, Trash2, ArrowLeft } from 'lucide-react-native';
// import firestore from '@react-native-firebase/firestore';
import theme from '../../../config/theme';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

interface Charge {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  description: string;
  paymentDate?: string;
  method?: string;
  phone?: string;
  address?: string;
  merchant?: string;
  createdAt?: string;
}

export default function ChargeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chargeId = typeof id === 'string' ? id : '';
  const [charge, setCharge] = useState<Charge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChargeDetails = async () => {
      try {
        // const chargeDoc = await firestore()
        //   .collection('charges')
        //   .doc(id)
        //   .get();

        // if (!chargeDoc.exists()) {
        //   Alert.alert('Erro', 'Cobrança não encontrada');
        //   router.back();
        //   return;
        // }

        // const chargeData = chargeDoc.data();
        // setCharge(chargeData);
        // setLoading(false);

        // Simulando dados para teste
        setCharge({
          id: 'test-123',
          customer: 'Cliente Teste',
          amount: 100.00,
          description: 'Teste de cobrança',
          merchant: 'Loja Teste',
          status: 'pending',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar detalhes da cobrança:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes da cobrança');
        router.back();
      }
    };

    fetchChargeDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Cobrança</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !charge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Cobrança</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.contentContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: '#999' }}>{error || 'Cobrança não encontrada'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Renderizar status badge
  const renderStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <View style={styles.statusBadge}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>Pago</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Clock size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>Pendente</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Cobrança</Text>
        <TouchableOpacity style={styles.deleteButton}>
          <Trash2 size={24} color="#F43F5E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Card Principal */}
        <View style={styles.mainCard}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Valor</Text>
            <Text style={styles.amount}>{formatCurrency(charge.amount)}</Text>
            {renderStatusBadge(charge.status)}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>{charge.customer}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.infoValue}>{charge.description}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de criação</Text>
            <Text style={styles.infoValue}>{charge.date}</Text>
          </View>

          {charge.status === 'paid' && charge.paymentDate && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data de pagamento</Text>
                <Text style={styles.infoValue}>{charge.paymentDate}</Text>
              </View>
              {charge.method && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Método</Text>
                  <Text style={styles.infoValue}>{charge.method}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Card de Contato */}
        {charge.phone && (
          <View style={styles.contactCard}>
            <Text style={styles.sectionTitle}>Informações de Contato</Text>
            
            <View style={styles.contactRow}>
              <Smartphone size={20} color="#666" />
              <Text style={styles.contactText}>{charge.phone}</Text>
            </View>
            
            <TouchableOpacity style={styles.actionButton}>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Enviar Lembrete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ações para Cobrança Pendente */}
        {charge.status === 'pending' && (
          <View style={styles.actionCard}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => router.push(`/collect/${charge.id}` as any)}
            >
              <Smartphone size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Cobrar via NFC</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Compartilhar Link</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  deleteButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00CC66',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'right',
    flex: 2,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryActionButton: {
    backgroundColor: '#00CC66',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
}); 