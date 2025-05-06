import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useRole } from '../../hooks/useRole';

export default function ReceiverLayout() {
  const { role, isLoading } = useRole();

  // Verificar se o usuário tem o papel correto, redirecionar se não for devedor
  if (!isLoading && role !== 'receiver') {
    return <Redirect href="/role-selection" />;
  }

  return (
    <Stack>
      {/* Navegação principal com tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Tela de detalhes do pagamento */}
      <Stack.Screen 
        name="payment-details" 
        options={{ 
          headerTitle: "Detalhes do Pagamento",
          headerBackTitle: "Voltar"
        }} 
      />
      
      {/* Modal para escanear QR code */}
      <Stack.Screen 
        name="scan-qr" 
        options={{ 
          headerTitle: "Escanear QR Code",
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
} 