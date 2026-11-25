import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Theme } from '@/constants/theme';
import { FloatingBottomTab } from '@presentation/components/FloatingBottomTab';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { useAuthStore } from '@presentation/state/useAuthStore';

export default function TransporterTabLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  if (!hasRole('GESTOR_FLOTA')) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingBottomTab {...props} variant="transporter" />}
      screenOptions={{
        headerShown: true,
        header: () => (
          <ScreenHeader
            modeBadge="TRANSPORTISTA"
            badgeColor={Theme.colors.primary.blue}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="flota"
        options={{
          title: 'Flota',
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
