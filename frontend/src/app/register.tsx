import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '@presentation/components/MainLayout';
import { TextInputPill } from '@presentation/components/TextInputPill';
import { PillButton } from '@presentation/components/PillButton';
import { Theme } from '@/constants/theme';
import { AuthApiService } from '@infrastructure/api/AuthApiService';
import { AuthUseCases } from '@domain/useCases/AuthUseCases';

const authApi = new AuthApiService();
const authUseCases = new AuthUseCases(authApi);

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    phone: '',
    email: '',
    age: '',
    address: '',
    baseFare: '',
    passwordPlainText: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authUseCases.executeRegister({
        ...formData,
        age: parseInt(formData.age, 10) || 0
      });
      Alert.alert('Éxito', 'Registro completado. Ahora puedes iniciar sesión.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crea tu Cuenta</Text>
        
        <TextInputPill placeholder="DNI" keyboardType="numeric" maxLength={8} value={formData.dni} onChangeText={(t) => handleChange('dni', t)} />
        <TextInputPill placeholder="Nombre Completo" value={formData.name} onChangeText={(t) => handleChange('name', t)} />
        <TextInputPill placeholder="Teléfono" keyboardType="phone-pad" value={formData.phone} onChangeText={(t) => handleChange('phone', t)} />
        <TextInputPill placeholder="Correo Electrónico" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(t) => handleChange('email', t)} />
        <TextInputPill placeholder="Edad" keyboardType="numeric" maxLength={2} value={formData.age} onChangeText={(t) => handleChange('age', t)} />
        <TextInputPill placeholder="Dirección" value={formData.address} onChangeText={(t) => handleChange('address', t)} />
        <TextInputPill placeholder="Tarifa Base (ej. Universitaria)" value={formData.baseFare} onChangeText={(t) => handleChange('baseFare', t)} />
        <TextInputPill placeholder="Contraseña" secureTextEntry value={formData.passwordPlainText} onChangeText={(t) => handleChange('passwordPlainText', t)} />

        <View style={styles.buttonContainer}>
          <PillButton title="Completar Registro" onPress={handleRegister} loading={loading} />
          <PillButton title="Volver al Login" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  title: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.s,
  },
  buttonContainer: {
    marginTop: Theme.spacing.l,
    gap: Theme.spacing.m,
  }
});
