import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { XCircle, ArrowRight } from 'lucide-react-native';
import ChargeForm, { type ChargeFormValues } from '../../components/ChargeForm';

export default function CreateChargeScreen() {
  const router = useRouter();

  const handleSubmit = (values: ChargeFormValues) => {
    const chargeData = {
      id: Date.now().toString(),
      ...values,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pending',
    };
    router.push({
      pathname: '/payment/share',
      params: { chargeData: JSON.stringify(chargeData) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nova Cobrança</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <XCircle size={24} color="#999999" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Detalhes da Cobrança</Text>
        <ChargeForm onSubmit={handleSubmit} submitLabel="Criar Cobrança" />
        <Text style={styles.infoText}>
          Ao criar uma cobrança, você poderá enviá-la para seu cliente por meio de um link ou QR code.
        </Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  infoText: {
    marginTop: 24,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
}); 