import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '@presentation/components/MainLayout';
import { TextInputPill } from '@presentation/components/TextInputPill';
import { PillButton } from '@presentation/components/PillButton';
import { Theme } from '@/constants/theme';
import { AuthApiService } from '@infrastructure/api/AuthApiService';
import { AuthUseCases } from '@domain/useCases/AuthUseCases';
import { useAuthStore } from '@presentation/state/useAuthStore';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

import { LogoTranqiCuad } from '@presentation/components/icons';

const authApi = new AuthApiService();
const authUseCases = new AuthUseCases(authApi);

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession);
  const setSession = useAuthStore((state) => state.setSession);
  const refreshAll = useTravelerStore((state) => state.refreshAll);

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isCheckingSession) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isCheckingSession, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const session = await authUseCases.executeLogin(dni.trim(), password);
      await setSession(session);
      refreshAll().catch(() => {});
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <MainLayout headerContent={<LogoTranqiCuad width={120} height={70} />}>
        <View style={styles.checkingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
          <Text style={styles.checkingText}>Verificando sesión...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerContent={<LogoTranqiCuad width={120} height={70} />}>
      <View style={styles.headerDecorations}>
        <View style={[styles.decorationBand, { backgroundColor: Theme.colors.primary.pink }]} />
        <View style={[styles.decorationBand, { backgroundColor: Theme.colors.primary.blue }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Te damos la Bienvenida</Text>

        <TextInputPill
          testID="login-dni-input"
          placeholder="DNI"
          keyboardType="numeric"
          value={dni}
          onChangeText={setDni}
          maxLength={8}
        />

        <TextInputPill
          testID="login-password-input"
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <PillButton
            testID="login-submit-button"
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
          />

          <PillButton
            testID="login-register-button"
            title="Regístrate"
            variant="outline"
            onPress={() => router.push('/register')}
          />
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  decorationBand: {
    height: 10,
    width: '100%',
  },
  content: {
    flex: 1,
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.xl,
  },
  checkingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  checkingText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.ui.textSecondary,
  },
  title: {
    fontFamily: Theme.typography.family.black,
    fontSize: 28,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  buttonContainer: {
    marginTop: Theme.spacing.l,
    gap: Theme.spacing.m,
  },
});
