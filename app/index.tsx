import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useRole } from '../hooks/useRole';

export default function HomePage() {
  const router = useRouter();
  const { role, isLoading } = useRole();

  useEffect(() => {
    const navigateBasedOnRole = async () => {
      if (!isLoading) {
        if (role === 'sender') {
          router.replace('/(sender)/(tabs)');
        } else if (role === 'receiver') {
          router.replace('/(receiver)/(tabs)');
        } else {
          router.replace('/role-selection');
        }
      }
    };

    navigateBasedOnRole();
  }, [isLoading, role, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>NFC PayFlow</Text>
        <ActivityIndicator size="large" color="#0066CC" style={styles.loading} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30,
  },
  loading: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
}); 