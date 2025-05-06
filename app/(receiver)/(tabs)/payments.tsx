import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Payment = {
  id: string;
  amount: number;
  description: string;
  date: string;
  merchant: string;
};

export default function PaymentsScreen() {
  // Lista vazia para demonstração
  const payments: Payment[] = [];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sem pagamentos</Text>
      <Text style={styles.emptyText}>
        Você ainda não realizou nenhum pagamento através do NFC PayFlow.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Payment }) => (
    <View>
      <Text>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 