import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, ChevronRight, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Dados Mock
const PAYMENTS = [
  { 
    id: '1', 
    customer: 'João Silva', 
    amount: 150.00, 
    date: '10/05/2023', 
    method: 'Cartão de crédito',
    cardBrand: 'Visa'
  },
  { 
    id: '2', 
    customer: 'Maria Oliveira', 
    amount: 89.90, 
    date: '09/05/2023', 
    method: 'Cartão de débito',
    cardBrand: 'Mastercard'
  },
  { 
    id: '3', 
    customer: 'Pedro Santos', 
    amount: 235.50, 
    date: '08/05/2023', 
    method: 'Cartão de crédito',
    cardBrand: 'Visa'
  },
  { 
    id: '4', 
    customer: 'Ana Sousa', 
    amount: 500.00, 
    date: '07/05/2023', 
    method: 'Cartão de crédito',
    cardBrand: 'Mastercard'
  },
];

// Tipo de pagamento
interface Payment {
  id: string;
  customer: string;
  amount: number;
  date: string;
  method: string;
  cardBrand: string;
}

export default function PaymentsScreen() {
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity 
      style={styles.paymentItem}
      onPress={() => console.log(`Ver detalhes do pagamento ${item.id}`)}
    >
      <View style={styles.paymentIcon}>
        <CreditCard size={24} color="#0066CC" />
      </View>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentCustomer}>{item.customer}</Text>
        <View style={styles.paymentDetails}>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>{item.method}</Text>
          </View>
          <View style={styles.paymentDate}>
            <Calendar size={14} color="#999999" />
            <Text style={styles.paymentDateText}>{item.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.paymentAmount}>
        <Text style={styles.paymentAmountText}>{formatCurrency(item.amount)}</Text>
        <ChevronRight size={16} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos Recebidos</Text>
      </View>

      <FlatList
        data={PAYMENTS}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum pagamento recebido</Text>
          </View>
        }
      />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  paymentItem: {
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
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    backgroundColor: '#F0F7FF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#0066CC',
  },
  paymentDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDateText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
}); 