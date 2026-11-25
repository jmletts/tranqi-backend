import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Theme } from '@/constants/theme';
import { FloatingBottomTab } from '@presentation/components/FloatingBottomTab';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { useAuthStore } from '@presentation/state/useAuthStore';

export default function AgentTabLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  if (!hasRole('AGENTE_KIOSKO')) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingBottomTab {...props} variant="agent" />}
      screenOptions={{
        headerShown: true,
        header: () => (
          <ScreenHeader modeBadge="AGENTE" badgeColor={Theme.colors.primary.pink} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="recargar"
        options={{
          title: 'Recargar',
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{
          title: 'Movimientos',
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
