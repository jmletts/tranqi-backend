import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '@presentation/components/MainLayout';
import { TextInputPill } from '@presentation/components/TextInputPill';
import { PillButton } from '@presentation/components/PillButton';
import { Theme } from '@/constants/theme';
import { AuthApiService } from '@infrastructure/api/AuthApiService';
import { AuthUseCases } from '@domain/useCases/AuthUseCases';
import { useAuthStore } from '@presentation/state/useAuthStore';

// Initialize Use Case
const authApi = new AuthApiService();
const authUseCases = new AuthUseCases(authApi);

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const session = await authUseCases.executeLogin(dni, password);
      setSession(session);
      Alert.alert('Éxito', 'Sesión iniciada correctamente');
      // router.replace('/home'); // Navegar a la pantalla principal después
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const LogoPlaceholder = () => (
    <View style={styles.logoPlaceholder}>
      <Text style={styles.logoText}>LOGO</Text>
    </View>
  );

  return (
    <MainLayout headerContent={<LogoPlaceholder />}>
      <View style={styles.headerDecorations}>
        <View style={[styles.decorationBand, { backgroundColor: Theme.colors.primary.pink }]} />
        <View style={[styles.decorationBand, { backgroundColor: Theme.colors.primary.blue }]} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Te damos la Bienvenida</Text>
        
        <TextInputPill 
          placeholder="DNI" 
          keyboardType="numeric"
          value={dni}
          onChangeText={setDni}
          maxLength={8}
        />
        
        <TextInputPill 
          placeholder="Contraseña" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <PillButton 
            title="Iniciar Sesión" 
            onPress={handleLogin} 
            loading={loading}
          />
          
          <PillButton 
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
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  logoText: {
    fontFamily: Theme.typography.family.black,
    color: Theme.colors.background.dark,
    fontSize: 12,
  },
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
  }
});
