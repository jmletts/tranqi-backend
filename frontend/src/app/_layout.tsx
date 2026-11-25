import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { 
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black 
} from '@expo-google-fonts/montserrat';
import { useAuthStore } from '@presentation/state/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const checkSession = useAuthStore((state) => state.checkSession);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(agent)" />
      <Stack.Screen name="(transportista)" />
      <Stack.Screen
        name="transportista-bus-detail"
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="transportista-trip-detail"
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="agent-register"
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="agent-cash-close"
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="agent-issue-card"
        options={{
          presentation: 'card',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="add-card" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="transfer" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="movement-detail" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="card-detail" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="admin-card" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="detalle-tarjeta" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="recharge" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="recharge-card" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="recargar-tarjeta" 
        options={{ 
          presentation: 'card', 
          gestureEnabled: true 
        }} 
      />
    </Stack>
  );
}
