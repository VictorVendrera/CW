import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, Filter, CheckCircle2, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Dados Mock
const CHARGES = [
  { 
    id: '1', 
    customer: 'João Silva', 
    amount: 150.00, 
    date: '10/05/2023', 
    status: 'paid', 
    description: 'Serviço de manutenção'
  },
  { 
    id: '2', 
    customer: 'Maria Oliveira', 
    amount: 89.90, 
    date: '09/05/2023', 
    status: 'pending',
    description: 'Consultoria mensal'
  },
  { 
    id: '3', 
    customer: 'Pedro Santos', 
    amount: 235.50, 
    date: '08/05/2023', 
    status: 'paid',
    description: 'Produto vendido'
  },
  { 
    id: '4', 
    customer: 'Ana Sousa', 
    amount: 500.00, 
    date: '07/05/2023', 
    status: 'pending',
    description: 'Desenvolvimento de website'
  },
  { 
    id: '5', 
    customer: 'Carlos Ferreira', 
    amount: 75.25, 
    date: '06/05/2023', 
    status: 'paid',
    description: 'Assinatura mensal'
  },
  { 
    id: '6', 
    customer: 'Patrícia Lopes', 
    amount: 320.00, 
    date: '05/05/2023', 
    status: 'pending',
    description: 'Consultoria de marketing'
  },
  { 
    id: '7', 
    customer: 'Roberto Alves', 
    amount: 180.75, 
    date: '04/05/2023', 
    status: 'paid',
    description: 'Serviço técnico'
  },
  { 
    id: '8', 
    customer: 'Juliana Martins', 
    amount: 95.30, 
    date: '03/05/2023', 
    status: 'pending',
    description: 'Material de escritório'
  },
];

export default function ChargesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'paid', 'pending'

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Filtragem de cobranças
  const filteredCharges = CHARGES.filter(charge => {
    const matchesSearch = charge.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          charge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || charge.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Renderizar status badge
  const renderStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <View style={styles.statusContainer}>
          <CheckCircle2 size={16} color="#00CC66" />
          <Text style={styles.paidText}>Pago</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusContainer}>
          <Clock size={16} color="#F59E0B" />
          <Text style={styles.pendingText}>Pendente</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* Cabeçalho e Busca */}
      <View style={styles.header}>
        <Text style={styles.title}>Cobranças</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cobranças..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'paid' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('paid')}
        >
          <Text style={[styles.filterText, filterStatus === 'paid' && styles.filterTextActive]}>
            Pagas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
            Pendentes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Cobranças */}
      <FlatList
        data={filteredCharges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chargeCard}
            onPress={() => router.push(`/charge-details/${item.id}`)}
          >
            <View style={styles.chargeContent}>
              <View style={styles.chargeHeader}>
                <Text style={styles.customerName}>{item.customer}</Text>
                {renderStatusBadge(item.status)}
              </View>
              
              <Text style={styles.chargeDescription} numberOfLines={1}>
                {item.description}
              </Text>
              
              <View style={styles.chargeFooter}>
                <Text style={styles.chargeDate}>{item.date}</Text>
                <Text style={styles.chargeAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            </View>
            
            <ChevronRight size={20} color="#CCCCCC" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma cobrança encontrada.
            </Text>
          </View>
        }
      />

      {/* Botão Flutuante de Nova Cobrança */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => router.push('/create-charge')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
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
  chargeContent: {
    flex: 1,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#00CC66',
    fontWeight: '500',
  },
  pendingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  chargeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  chargeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chargeDate: {
    fontSize: 14,
    color: '#999999',
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 