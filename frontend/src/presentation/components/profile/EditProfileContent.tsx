import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import { PhosphorBadge } from '@presentation/components/PhosphorBadge';
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
} from '@presentation/components/icons';
import { useAuthStore } from '@presentation/state/useAuthStore';

interface EditProfileContentProps {
  onClose: () => void;
}

export const EditProfileContent = ({ onClose }: EditProfileContentProps) => {
  const user = useAuthStore((state) => state.user);
  const saveUserProfile = useAuthStore((state) => state.saveUserProfile);

  const [fullName, setFullName] = useState(user?.name || '');
  const [dni] = useState(user?.dni || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const initials =
    (fullName || dni || 'TR')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'TR';

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveUserProfile({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 500);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
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
        <View style={styles.topBadgeRow}>
          <PhosphorBadge label="PERFIL ACTIVO" size="medium" />
          <Text style={styles.topSubtitle}>Datos Personales</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarImagePlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <PillInputField
            label="Nombre Completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre completo"
            icon={<UserIcon size={18} color={Theme.colors.background.dark} />}
          />

          <PillInputField
            label="Documento de Identidad (DNI)"
            value={dni}
            editable={false}
            icon={<LockIcon size={18} color={Theme.colors.background.dark} />}
            rightElement={<PhosphorBadge label="VERIFICADO" size="small" />}
          />

          <PillInputField
            label="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<MailIcon size={18} color={Theme.colors.background.dark} />}
          />

          <PillInputField
            label="Teléfono Celular"
            value={phone}
            onChangeText={setPhone}
            placeholder="+51 900 000 000"
            keyboardType="phone-pad"
            icon={<PhoneIcon size={18} color={Theme.colors.background.dark} />}
          />

          <PillInputField
            label="Dirección de Residencia"
            value={address}
            onChangeText={setAddress}
            placeholder="Avenida, Calle, Distrito"
            icon={<MapPinIcon size={18} color={Theme.colors.background.dark} />}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingBottomActions
        primaryTitle={
          saving ? 'Guardando...' : savedSuccess ? 'Guardado con éxito' : 'Guardar Cambios'
        }
        onPrimaryPress={handleSave}
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
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.l,
  },
  topSubtitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 38,
    backgroundColor: Theme.colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: Theme.colors.background.dark,
    borderLeftColor: Theme.colors.primary.pink,
    borderBottomColor: Theme.colors.primary.yellow,
    marginBottom: Theme.spacing.m,
  },
  avatarImagePlaceholder: {
    width: 98,
    height: 98,
    borderRadius: 32,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: Theme.typography.family.black,
    fontSize: 32,
    color: Theme.colors.primary.yellow,
  },
  formSection: {
    marginBottom: Theme.spacing.l,
  },
  bottomSpacer: {
    height: 30,
  },
});
