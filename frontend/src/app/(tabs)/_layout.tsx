import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { FloatingBottomTab } from '@presentation/components/FloatingBottomTab';
import { useAuthStore } from '@presentation/state/useAuthStore';

export default function TabLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Auth Guard: Si no hay sesión, expulsa al usuario al login automáticamente
  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="pass"
        options={{
          title: 'Pass',
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{
          title: 'Movimientos',
        }}
      />
      <Tabs.Screen
        name="beneficios"
        options={{
          title: 'Beneficios',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
