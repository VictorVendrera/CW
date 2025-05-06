import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.emptyContainer}>
        <View style={styles.iconContainer}>
          <Bell size={32} color="#999999" />
        </View>
        <Text style={styles.title}>Sem notificações</Text>
        <Text style={styles.subtitle}>
          Novas notificações sobre pagamentos aparecerão aqui.
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
}); 