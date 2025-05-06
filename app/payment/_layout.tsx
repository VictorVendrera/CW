import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}>
      <Stack.Screen name="nfc" />
      <Stack.Screen name="share" />
      <Stack.Screen name="success" />
    </Stack>
  );
}