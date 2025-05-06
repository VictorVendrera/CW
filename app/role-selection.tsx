import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRole } from '../hooks/useRole';
import { ArrowRight } from 'lucide-react-native';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setRole } = useRole();

  const handleSelectRole = async (role: 'sender' | 'receiver') => {
    await setRole(role);
    
    if (role === 'sender') {
      router.replace('/(sender)/(tabs)');
    } else {
      router.replace('/(receiver)/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>NFC PayFlow</Text>
        <Text style={styles.subtitle}>Escolha seu papel no sistema</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={[styles.roleCard, styles.senderCard]}
          onPress={() => handleSelectRole('sender')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.roleIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Cobrador</Text>
            <Text style={styles.roleDescription}>
              Crie cobranças e envie para seus clientes
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Selecionar</Text>
              <ArrowRight size={16} color="#0066CC" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.roleCard, styles.receiverCard]}
          onPress={() => handleSelectRole('receiver')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.roleIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Devedor</Text>
            <Text style={styles.roleDescription}>
              Receba cobranças e pague usando seu cartão
            </Text>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Selecionar</Text>
              <ArrowRight size={16} color="#00CC66" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Você poderá alterar seu papel posteriormente nas configurações
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  cardsContainer: {
    marginBottom: 48,
    gap: 20,
  },
  roleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  senderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  receiverCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00CC66',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleIcon: {
    width: 32,
    height: 32,
  },
  roleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    marginRight: 8,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
  },
}); 