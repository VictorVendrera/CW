import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CreditCard, QrCode, ChevronRight } from 'lucide-react-native';

export default function ReceiverHomeScreen() {
  const router = useRouter();

  const handleScanQR = () => {
    router.push('/scan-qr');
  };

  const handlePayments = () => {
    router.push('/manual-payment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Olá, Usuário</Text>
          <Text style={styles.subtitleText}>Bem-vindo ao NFC PayFlow</Text>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleScanQR}>
              <View style={styles.actionIcon}>
                <QrCode size={24} color="#0066CC" />
              </View>
              <Text style={styles.actionText}>Escanear QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handlePayments}>
              <View style={styles.actionIcon}>
                <CreditCard size={24} color="#0066CC" />
              </View>
              <Text style={styles.actionText}>Pagamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentPaymentsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Pagamentos Recentes</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Você ainda não tem pagamentos</Text>
            <TouchableOpacity onPress={handleScanQR} style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>Escanear um QR Code</Text>
              <ChevronRight size={16} color="#0066CC" />
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
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  recentPaymentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
    marginRight: 4,
  },
}); 