import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScanTab() {
  const router = useRouter();

  // Redirecionar automaticamente para a tela de escanear QR
  useEffect(() => {
    router.replace('/scan-qr');
  }, [router]);

  return (
    <View style={styles.container}>
      <Text>Redirecionando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 