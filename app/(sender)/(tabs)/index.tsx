import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ChevronRight, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Dados Mock
const recentCharges = [
  { id: '1', customer: 'João Silva', amount: 150.00, date: '10/05/2023', status: 'paid' },
  { id: '2', customer: 'Maria Oliveira', amount: 89.90, date: '09/05/2023', status: 'pending' },
  { id: '3', customer: 'Pedro Santos', amount: 235.50, date: '08/05/2023', status: 'paid' },
];

export default function SenderDashboardScreen() {
  const router = useRouter();

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Renderizar card de status de uma cobrança
  const renderStatusBadge = (status: string) => {
    const badgeStyle = status === 'paid' 
      ? [styles.statusBadge, styles.paidBadge]
      : [styles.statusBadge, styles.pendingBadge];
    
    const textStyle = status === 'paid'
      ? [styles.statusText, styles.paidText]
      : [styles.statusText, styles.pendingText];

    const label = status === 'paid' ? 'Pago' : 'Pendente';

    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Saudação */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Cobrador</Text>
          <Text style={styles.subGreeting}>Bem-vindo ao seu painel de cobranças</Text>
        </View>
        
        {/* Cards de Resumo */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardIcon}>
              <DollarSign size={20} color="#0066CC" />
            </View>
            <Text style={styles.summaryCardTitle}>Recebido</Text>
            <Text style={styles.summaryCardValue}>{formatCurrency(3850.40)}</Text>
            <Text style={styles.summaryCardSubtitle}>Este mês</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardIcon}>
              <TrendingUp size={20} color="#00CC66" />
            </View>
            <Text style={styles.summaryCardTitle}>Pendente</Text>
            <Text style={styles.summaryCardValue}>{formatCurrency(1240.90)}</Text>
            <Text style={styles.summaryCardSubtitle}>5 cobranças</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardIcon}>
              <Users size={20} color="#F59E0B" />
            </View>
            <Text style={styles.summaryCardTitle}>Clientes</Text>
            <Text style={styles.summaryCardValue}>12</Text>
            <Text style={styles.summaryCardSubtitle}>Ativos</Text>
          </View>
        </View>

        {/* Cobranças Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cobranças Recentes</Text>
            <TouchableOpacity onPress={() => router.push('/(sender)/(tabs)/charges')}>
              <Text style={styles.sectionLink}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {recentCharges.map((charge) => (
            <TouchableOpacity 
              key={charge.id} 
              style={styles.chargeCard}
              onPress={() => router.push(`/(sender)/charge-details/${charge.id}`)}
            >
              <View style={styles.chargeInfo}>
                <Text style={styles.chargeName}>{charge.customer}</Text>
                <Text style={styles.chargeDate}>{charge.date}</Text>
              </View>
              <View style={styles.chargeDetails}>
                <Text style={styles.chargeAmount}>{formatCurrency(charge.amount)}</Text>
                {renderStatusBadge(charge.status)}
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(sender)/create-charge')}
            >
              <View style={styles.actionIcon}>
                <DollarSign size={20} color="#FFFFFF" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Nova Cobrança</Text>
                <View style={styles.actionArrow}>
                  <ArrowUpRight size={16} color="#0066CC" />
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#00CC66' }]}>
                <Users size={20} color="#FFFFFF" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Clientes</Text>
                <View style={styles.actionArrow}>
                  <ArrowUpRight size={16} color="#00CC66" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666666',
  },
  summaryCards: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  summaryCardSubtitle: {
    fontSize: 12,
    color: '#999999',
  },
  section: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionLink: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
  },
  chargeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chargeInfo: {
    flex: 1,
  },
  chargeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  chargeDate: {
    fontSize: 14,
    color: '#666666',
  },
  chargeDetails: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidBadge: {
    backgroundColor: '#E6F9EE',
  },
  pendingBadge: {
    backgroundColor: '#FFF4E5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#00CC66',
  },
  pendingText: {
    color: '#F59E0B',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  actionArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 