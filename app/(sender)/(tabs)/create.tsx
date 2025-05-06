import { Redirect } from 'expo-router';

// Este arquivo existe apenas para completar a estrutura de tabs
// A navegação real é feita pelo listener no _layout.tsx
export default function CreateRedirect() {
  return <Redirect href="/(sender)/create-charge" />;
} 