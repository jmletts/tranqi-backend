import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  BusFrontIcon,
  CpuIcon,
  KeyIcon,
} from '@presentation/components/icons';
import { useAuthStore } from '@presentation/state/useAuthStore';

interface TransporterRegistrationContentProps {
  onClose: () => void;
  onComplete: () => void;
}

const generateTestEcdsaPublicKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 24; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE${suffix}`;
};

export const TransporterRegistrationContent = ({
  onClose,
  onComplete,
}: TransporterRegistrationContentProps) => {
  const user = useAuthStore((state) => state.user);
  const registerAsTransporter = useAuthStore((state) => state.registerAsTransporter);

  // Fields strictly mapped to backend User (US-12)
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const dni = user?.dni || '';

  // Fields strictly mapped to backend RegisterBusRequestDTO (US-13)
  const [licensePlate, setLicensePlate] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCompleteRegistration = async () => {
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage('Ingresa tu nombre completo.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      setErrorMessage('Ingresa un teléfono válido (mínimo 9 dígitos).');
      return;
    }

    if (!licensePlate.trim()) {
      setErrorMessage('La placa del bus es obligatoria.');
      return;
    }

    if (!hardwareId.trim()) {
      setErrorMessage('El identificador de hardware (ESP32) es obligatorio.');
      return;
    }

    if (!publicKey.trim()) {
      setErrorMessage('La clave pública ECDSA del validador es obligatoria.');
      return;
    }

    try {
      setSubmitting(true);
      await registerAsTransporter({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        hardwareId: hardwareId.trim().toUpperCase(),
        publicKey: publicKey.trim(),
      });
      onComplete();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'No se pudo completar el registro de transportista.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introBlock}>
          <View style={styles.blueBadge}>
            <Text style={styles.blueBadgeText}>ROL GESTOR DE FLOTA</Text>
          </View>
          <Text style={styles.introTitle}>Activa tu Perfil de Transportista</Text>
          <Text style={styles.introSubtitle}>
            Confirma tus datos de usuario y vincula tu primer bus con su validador ESP32 para activar el rol GESTOR_FLOTA en tu cuenta sin perder tu perfil de viajero.
          </Text>
        </View>

        {/* Section 1: User Identity (IAM) */}
        <Text style={styles.sectionTitle}>1. Datos del Titular</Text>

        <PillInputField
          testID="transporter-reg-dni"
          label="DNI (Identidad Verificada)"
          value={dni}
          editable={false}
          icon={<LockIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
          rightElement={
            <View style={styles.verifiedChip}>
              <Text style={styles.verifiedChipText}>VERIFICADO</Text>
            </View>
          }
        />

        <PillInputField
          testID="transporter-reg-name"
          label="Nombre Completo"
          value={name}
          onChangeText={(val) => {
            setName(val);
            setErrorMessage(null);
          }}
          placeholder="Tus nombres y apellidos"
          icon={<UserIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="transporter-reg-email"
          label="Correo Electrónico"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            setErrorMessage(null);
          }}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          icon={<MailIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="transporter-reg-phone"
          label="Teléfono"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            setErrorMessage(null);
          }}
          placeholder="+51 900 000 000"
          keyboardType="phone-pad"
          icon={<PhoneIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        {/* Section 2: First Bus & Validator (US-13) */}
        <Text style={styles.sectionTitle}>2. Registro de Tu Primer Bus</Text>

        <PillInputField
          testID="transporter-reg-plate"
          label="Placa del Bus"
          value={licensePlate}
          onChangeText={(val) => {
            setLicensePlate(val.toUpperCase());
            setErrorMessage(null);
          }}
          placeholder="Ej. TRK-204"
          autoCapitalize="characters"
          icon={<BusFrontIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="transporter-reg-hardware"
          label="ID de Hardware (ESP32)"
          value={hardwareId}
          onChangeText={(val) => {
            setHardwareId(val.toUpperCase());
            setErrorMessage(null);
          }}
          placeholder="Ej. MAC-03:D2:11:90"
          autoCapitalize="characters"
          icon={<CpuIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="transporter-reg-pubkey"
          label="Clave Pública del Validador (ECDSA)"
          value={publicKey}
          onChangeText={(val) => {
            setPublicKey(val);
            setErrorMessage(null);
          }}
          placeholder="Clave pública ATECC608A"
          autoCapitalize="none"
          icon={<KeyIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <TouchableOpacity
          testID="transporter-reg-generate-key"
          style={styles.helperPillButton}
          onPress={() => {
            setPublicKey(generateTestEcdsaPublicKey());
            setErrorMessage(null);
          }}
          activeOpacity={0.8}
        >
          <KeyIcon size={15} color={Theme.colors.primary.blue} />
          <Text style={styles.helperPillText}>Generar clave pública ECDSA de prueba</Text>
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingBottomActions
        primaryTitle={submitting ? 'Completando...' : 'Completar Registro'}
        onPrimaryPress={handleCompleteRegistration}
        onClosePress={onClose}
        disabled={submitting}
        primaryButtonColor={Theme.colors.primary.blue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.l,
    paddingBottom: 120,
  },
  introBlock: {
    marginBottom: Theme.spacing.l,
  },
  blueBadge: {
    backgroundColor: Theme.colors.primary.blue,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: Theme.spacing.s,
  },
  blueBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 0.7,
  },
  introTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
    marginBottom: 6,
  },
  introSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.blue,
    marginTop: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  verifiedChip: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  verifiedChipText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },
  helperPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: Theme.spacing.m,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.m,
  },
  helperPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
  },
  errorBox: {
    backgroundColor: '#fdecec',
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.status.expense,
    marginTop: Theme.spacing.xs,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.expense,
  },
  bottomSpacer: {
    height: 30,
  },
});
