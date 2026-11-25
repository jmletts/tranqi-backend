import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import {
  BusFrontIcon,
  CpuIcon,
  KeyIcon,
  CheckCircleIcon,
} from '@presentation/components/icons';
import { useFleetStore } from '@presentation/state/useFleetStore';

interface RegisterBusContentProps {
  onClose: () => void;
  onSuccess?: (licensePlate: string) => void;
}

const generateTestEcdsaPublicKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 24; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE${suffix}`;
};

export const RegisterBusContent = ({ onClose, onSuccess }: RegisterBusContentProps) => {
  const registerBus = useFleetStore((state) => state.registerBus);

  const [licensePlate, setLicensePlate] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPlate, setSavedPlate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const result = await registerBus({
        licensePlate,
        hardwareId,
        publicKey,
      });

      if (!result.ok) {
        setErrorMessage(result.error || 'No se pudo registrar el bus.');
        return;
      }

      const plate = result.bus?.licensePlate || licensePlate.trim().toUpperCase();
      setSavedPlate(plate);
      setTimeout(() => {
        onSuccess?.(plate);
        onClose();
      }, 550);
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
        <View style={styles.headerBlock}>
          <View style={styles.blueBadge}>
            <Text style={styles.blueBadgeText}>VINCULACIÓN ESP32</Text>
          </View>
          <Text style={styles.description}>
            Registra la placa del bus junto al identificador de hardware y la clave pública ECDSA del validador instalado (ATECC608A).
          </Text>
        </View>

        <PillInputField
          testID="register-bus-plate-input"
          label="Placa del Bus (licensePlate)"
          value={licensePlate}
          onChangeText={(text) => {
            setLicensePlate(text.toUpperCase());
            setErrorMessage(null);
          }}
          placeholder="Ej. DEF-456"
          autoCapitalize="characters"
          icon={<BusFrontIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="register-bus-hardware-input"
          label="ID de Hardware ESP32 (hardwareId)"
          value={hardwareId}
          onChangeText={(text) => {
            setHardwareId(text.toUpperCase());
            setErrorMessage(null);
          }}
          placeholder="Ej. MAC-03:C1:88:4A"
          autoCapitalize="characters"
          icon={<CpuIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <PillInputField
          testID="register-bus-pubkey-input"
          label="Clave Pública ECDSA (publicKey)"
          value={publicKey}
          onChangeText={(text) => {
            setPublicKey(text);
            setErrorMessage(null);
          }}
          placeholder="Clave pública del validador ATECC608A"
          autoCapitalize="none"
          icon={<KeyIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        <TouchableOpacity
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
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {savedPlate ? (
          <View style={styles.successBanner}>
            <CheckCircleIcon size={18} color={Theme.colors.status.income} />
            <Text style={styles.successBannerText}>
              Bus {savedPlate} registrado correctamente.
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingBottomActions
        primaryTitle={
          savedPlate ? 'Bus Registrado' : submitting ? 'Registrando...' : 'Registrar Bus'
        }
        onPrimaryPress={handleSubmit}
        onClosePress={onClose}
        primaryButtonColor={Theme.colors.primary.blue}
        disabled={Boolean(savedPlate) || submitting}
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
  headerBlock: {
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
  description: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 19,
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
  errorBanner: {
    backgroundColor: '#fdecec',
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.status.expense,
    marginTop: Theme.spacing.xs,
  },
  errorBannerText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.expense,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginTop: Theme.spacing.xs,
  },
  successBannerText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.status.income,
  },
  bottomSpacer: {
    height: 30,
  },
});
