import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import { PhosphorBadge } from '@presentation/components/PhosphorBadge';
import { ShieldCheckIcon, LockIcon } from '@presentation/components/icons';

interface SecurityContentProps {
  onClose: () => void;
}

export const SecurityContent = ({ onClose }: SecurityContentProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleUpdate = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Password Change Form Container */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircleHeader}>
              <LockIcon size={18} color={Theme.colors.background.dark} />
            </View>
            <Text style={styles.sectionHeaderTitle}>Cambiar Contraseña</Text>
          </View>

          <PillInputField
            label="Contraseña Actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Ingresa tu contraseña actual"
            secureTextEntry
            icon={<LockIcon size={18} color={Theme.colors.background.dark} />}
          />

          <PillInputField
            label="Nueva Contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            icon={<LockIcon size={18} color={Theme.colors.background.dark} />}
          />

          <PillInputField
            label="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la nueva contraseña"
            secureTextEntry
            icon={<LockIcon size={18} color={Theme.colors.background.dark} />}
          />
        </View>

        {/* Advanced Security Toggles Container */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircleHeader}>
              <ShieldCheckIcon size={18} color={Theme.colors.background.dark} />
            </View>
            <Text style={styles.sectionHeaderTitle}>Métodos de Verificación</Text>
          </View>

          {/* 2FA Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <View style={styles.toggleTitleBadgeRow}>
                <Text style={styles.toggleTitle}>Autenticación en 2 Pasos (2FA)</Text>
                {twoFactorEnabled && <PhosphorBadge label="PROTEGIDO" size="small" />}
              </View>
              <Text style={styles.toggleSubtitle}>
                Solicita un código de verificación al ingresar desde un nuevo dispositivo.
              </Text>
              <Text style={styles.statusLabel}>
                {twoFactorEnabled ? 'Estado: Aceptado y Activo' : 'Estado: No aceptado'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#e5e5e5', true: '#00FF66' }}
              thumbColor={twoFactorEnabled ? '#010100' : '#ffffff'}
            />
          </View>

          <View style={styles.divider} />

          {/* Biometrics Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <View style={styles.toggleTitleBadgeRow}>
                <Text style={styles.toggleTitle}>Desbloqueo Biométrico</Text>
                {biometricsEnabled && <PhosphorBadge label="ACTIVO" size="small" />}
              </View>
              <Text style={styles.toggleSubtitle}>
                Inicia sesión y confirma transferencias con huella digital o FaceID.
              </Text>
              <Text style={styles.statusLabel}>
                {biometricsEnabled ? 'Estado: Aceptado y Activo' : 'Estado: No aceptado'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#e5e5e5', true: '#00FF66' }}
              thumbColor={biometricsEnabled ? '#010100' : '#ffffff'}
            />
          </View>
        </View>

        {/* Spacer for Floating Bottom Actions */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Floating Bottom Actions */}
      <FloatingBottomActions
        primaryTitle={success ? "Contraseña Actualizada" : "Actualizar Contraseña"}
        onPrimaryPress={handleUpdate}
        onClosePress={onClose}
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
    paddingBottom: 110,
  },
  sectionCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.l,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Theme.spacing.m,
  },
  iconCircleHeader: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.s,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  toggleTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  toggleSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  statusLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.primary.blue,
  },
  divider: {
    height: 1.5,
    backgroundColor: Theme.colors.background.dark,
    marginVertical: Theme.spacing.s,
  },
  bottomSpacer: {
    height: 30,
  },
});
