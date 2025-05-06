import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useRole } from '../../hooks/useRole';

export default function SenderLayout() {
  const { role, isLoading } = useRole();

  // Verificar se o usuário tem o papel correto, redirecionar se não for cobrador
  if (!isLoading && role !== 'sender') {
    return <Redirect href="/role-selection" />;
  }

  return (
    <Stack>
      {/* Navegação principal com tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Tela de detalhes da cobrança */}
      <Stack.Screen 
        name="charge-details/[id]" 
        options={{ 
          headerTitle: "Detalhes da Cobrança",
          headerBackTitle: "Voltar"
        }} 
      />
      
      {/* Modal para criar nova cobrança */}
      <Stack.Screen 
        name="create-charge" 
        options={{ 
          headerTitle: "Nova Cobrança",
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
} 