import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { RoleProvider } from '../hooks/useRole';

export default function AppLayout() {
  // Inicializar imediatamente, sem esperar carregamento de fontes
  useEffect(() => {
    // Esconder a splash screen na inicialização
    SplashScreen.hideAsync();
  }, []);

  return (
    <RoleProvider>
      <Stack>
        {/* Tela inicial - decide para onde redirecionar com base no papel do usuário */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Tela de seleção de papel (Cobrador ou Devedor) */}
        <Stack.Screen name="role-selection" options={{ headerShown: false }} />
        
        {/* App do Cobrador (Sender) */}
        <Stack.Screen name="(sender)" options={{ headerShown: false }} />
        
        {/* App do Devedor (Receiver) */}
        <Stack.Screen name="(receiver)" options={{ headerShown: false }} />
        
        {/* Rotas de pagamento compartilhadas */}
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="pay" options={{ headerShown: false }} />
      </Stack>
    </RoleProvider>
  );
}
