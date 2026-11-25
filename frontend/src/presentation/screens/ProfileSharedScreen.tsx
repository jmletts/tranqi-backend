import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  ChevronRightIcon,
  BusFrontIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  PercentIcon,
  CreditCardIcon,
  BellIcon,
  RepeatIcon,
  LogOutIcon,
} from '@presentation/components/icons';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import { PhosphorBadge } from '@presentation/components/PhosphorBadge';
import { EditProfileContent } from '@presentation/components/profile/EditProfileContent';
import { SecurityContent } from '@presentation/components/profile/SecurityContent';
import { TariffContent } from '@presentation/components/profile/TariffContent';
import { PaymentMethodsContent } from '@presentation/components/profile/PaymentMethodsContent';
import { NotificationsContent } from '@presentation/components/profile/NotificationsContent';
import { TransporterRegistrationContent } from '@presentation/components/profile/TransporterRegistrationContent';
import { useAuthStore } from '@presentation/state/useAuthStore';
import { formatFareCategoryLabel } from '@domain/models/Traveler';

type ProfileModalType =
  | 'edit_profile'
  | 'security'
  | 'tariff'
  | 'payment_methods'
  | 'notifications'
  | 'transporter_register'
  | null;

interface ProfileSharedScreenProps {
  domain?: 'traveler' | 'transporter';
}

export const ProfileSharedScreen = ({ domain = 'traveler' }: ProfileSharedScreenProps) => {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null);

  const user = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);
  const switchMode = useAuthStore((state) => state.switchMode);
  const logout = useAuthStore((state) => state.logout);

  const isTransporterDomain = domain === 'transporter';
  const isAgent = hasRole('AGENTE_KIOSKO');
  const isTransporter = hasRole('GESTOR_FLOTA');

  const displayName = user?.name || user?.dni || 'Usuario Tranqi';
  const fareLabel = formatFareCategoryLabel(user?.baseFare);
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'TR';

  const handleTransporterAction = () => {
    if (isTransporter) {
      switchMode('transporter');
      router.replace('/(transportista)/inicio');
    } else {
      setActiveModal('transporter_register');
    }
  };

  const handleSwitchToTraveler = () => {
    switchMode('traveler');
    router.replace('/(tabs)/home');
  };

  const handleAgentButtonPress = () => {
    if (isAgent) {
      switchMode('agent');
      router.replace('/(agent)/home');
    } else {
      router.push('/agent-register');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getModalTitle = (type: ProfileModalType): string => {
    switch (type) {
      case 'edit_profile':
        return 'Editar Mis Datos';
      case 'security':
        return 'Seguridad de la Cuenta';
      case 'tariff':
        return 'Actualizar Tarifa';
      case 'payment_methods':
        return 'Métodos de Pago';
      case 'notifications':
        return 'Mis Notificaciones';
      case 'transporter_register':
        return 'Registro de Transportista';
      default:
        return '';
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'edit_profile':
        return <EditProfileContent onClose={() => setActiveModal(null)} />;
      case 'security':
        return <SecurityContent onClose={() => setActiveModal(null)} />;
      case 'tariff':
        return <TariffContent onClose={() => setActiveModal(null)} />;
      case 'payment_methods':
        return <PaymentMethodsContent onClose={() => setActiveModal(null)} />;
      case 'notifications':
        return <NotificationsContent onClose={() => setActiveModal(null)} />;
      case 'transporter_register':
        return (
          <TransporterRegistrationContent
            onClose={() => setActiveModal(null)}
            onComplete={() => {
              setActiveModal(null);
              router.replace('/(transportista)/inicio');
            }}
          />
        );
      default:
        return null;
    }
  };

  interface ConfigItemProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
    badgeText?: string;
    badgeVariant?: 'phosphor' | 'blue';
  }

  const ConfigItem = ({
    title,
    subtitle,
    icon,
    onPress,
    badgeText,
    badgeVariant = 'phosphor',
  }: ConfigItemProps) => {
    const useBlueBadge = isTransporterDomain || badgeVariant === 'blue';
    return (
      <TouchableOpacity
        style={styles.configItemRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconWrapper,
            isTransporterDomain && styles.iconWrapperBlue,
          ]}
        >
          {icon}
        </View>
        <View style={styles.configTextWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.configItemTitle}>{title}</Text>
            {badgeText ? (
              useBlueBadge ? (
                <View style={styles.blueBadgeSmall}>
                  <Text style={styles.blueBadgeSmallText}>{badgeText}</Text>
                </View>
              ) : (
                <PhosphorBadge label={badgeText} size="small" />
              )
            ) : null}
          </View>
          <Text style={styles.configItemSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
      </TouchableOpacity>
    );
  };

  const configIconColor = isTransporterDomain
    ? Theme.colors.background.white
    : Theme.colors.background.dark;

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeaderSection}>
            <Text style={styles.screenTitle}>Tu Perfil</Text>

            {isTransporterDomain ? (
              <View style={styles.badgesHeaderRow}>
                <View style={styles.blueBadgePill}>
                  <Text style={styles.badgeText}>MODO TRANSPORTISTA</Text>
                </View>
                <View style={styles.darkBadgePill}>
                  <Text style={styles.badgeText}>GESTOR FLOTA</Text>
                </View>
              </View>
            ) : (
              <View style={styles.badgesHeaderRow}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>DNI {user?.dni || '---'}</Text>
                </View>
                <PhosphorBadge label={`TARIFA ${fareLabel.toUpperCase()}`} size="small" />
              </View>
            )}

            <View
              style={[
                styles.avatarBorder,
                isTransporterDomain && styles.avatarBorderBlue,
              ]}
            >
              <View style={styles.avatarImagePlaceholder}>
                <Text
                  style={[
                    styles.avatarInitials,
                    isTransporterDomain && styles.avatarInitialsBlue,
                  ]}
                >
                  {initials}
                </Text>
              </View>
            </View>

            <Text style={styles.userNameText}>{displayName}</Text>
            <Text
              style={[
                styles.userRoleText,
                isTransporterDomain && styles.userRoleTextBlue,
              ]}
            >
              {isTransporterDomain ? 'Gestor de Flota' : `Viajero • Tarifa ${fareLabel}`}
            </Text>
          </View>

          {/* Domain / Role Switcher Action Cards */}
          <View style={styles.actionCardsRow}>
            {isTransporterDomain ? (
              <TouchableOpacity
                testID="profile-switch-traveler-button"
                style={[styles.actionCard, styles.actionCardBlue]}
                activeOpacity={0.85}
                onPress={handleSwitchToTraveler}
              >
                <RepeatIcon size={24} color={Theme.colors.background.white} />
                <Text style={styles.actionCardText}>Cambiar a{'\n'}Modo Viajero</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="profile-transporter-button"
                style={[
                  styles.actionCard,
                  isTransporter && styles.actionCardBlue,
                ]}
                activeOpacity={0.85}
                onPress={handleTransporterAction}
              >
                {isTransporter ? (
                  <RepeatIcon size={24} color={Theme.colors.background.white} />
                ) : (
                  <BusFrontIcon size={24} color={Theme.colors.background.white} />
                )}
                <Text style={styles.actionCardText}>
                  {isTransporter ? 'Cambiar a\nTransportista' : 'Soy un\nTransportista'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              testID="profile-agent-button"
              style={[
                styles.actionCard,
                !isTransporterDomain && isAgent && styles.actionCardAgentActive,
              ]}
              activeOpacity={0.85}
              onPress={handleAgentButtonPress}
            >
              {isAgent ? (
                <RepeatIcon size={24} color={Theme.colors.background.white} />
              ) : (
                <MapPinIcon size={24} color={Theme.colors.background.white} />
              )}
              <Text style={styles.actionCardText}>
                {isAgent ? 'Cambiar a\nModo Agente' : 'Soy un\nAgente'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Settings Lists */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>
            <ConfigItem
              title="Editar mis datos"
              subtitle="Nombres, correo, teléfono y dirección."
              icon={<UserIcon size={20} color={configIconColor} />}
              onPress={() => setActiveModal('edit_profile')}
            />
            <ConfigItem
              title="Seguridad de la cuenta"
              subtitle="Contraseña, autenticación 2FA y biometría."
              icon={<ShieldCheckIcon size={20} color={configIconColor} />}
              onPress={() => setActiveModal('security')}
              badgeText="ALTA"
            />
            <ConfigItem
              title="Actualizar o cambiar tarifa"
              subtitle="Subir carnet universitario y validar medio pasaje."
              icon={<PercentIcon size={20} color={configIconColor} />}
              onPress={() => setActiveModal('tariff')}
              badgeText="50% DCTO"
            />
            <ConfigItem
              title="Métodos de pago"
              subtitle="Tarjetas vinculadas y recarga automática."
              icon={<CreditCardIcon size={20} color={configIconColor} />}
              onPress={() => setActiveModal('payment_methods')}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferencias del Sistema</Text>
            <ConfigItem
              title="Mis Notificaciones"
              subtitle="Interruptores para aceptar o no aceptar alertas."
              icon={<BellIcon size={20} color={configIconColor} />}
              onPress={() => setActiveModal('notifications')}
              badgeText="ACTIVAS"
              badgeVariant="blue"
            />
          </View>

          <TouchableOpacity
            testID="profile-logout-button"
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOutIcon size={18} color={Theme.colors.background.dark} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Floating Slide Modal (Over Bottom Tab & Header) */}
      <FloatingSlideModal
        visible={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle(activeModal)}
      >
        {renderModalContent()}
      </FloatingSlideModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    alignItems: 'center',
  },
  profileHeaderSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    width: '100%',
  },
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
  },
  badgesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.l,
  },
  badgeContainer: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
  },
  blueBadgePill: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
  },
  darkBadgePill: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
  },
  badgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.white,
    letterSpacing: 0.4,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
    borderWidth: 4,
    borderColor: Theme.colors.background.dark,
    borderLeftColor: Theme.colors.primary.pink,
    borderBottomColor: Theme.colors.primary.yellow,
  },
  avatarBorderBlue: {
    backgroundColor: Theme.colors.primary.blue,
    borderColor: Theme.colors.primary.blue,
    borderLeftColor: Theme.colors.primary.blue,
    borderBottomColor: Theme.colors.background.dark,
  },
  avatarImagePlaceholder: {
    width: 108,
    height: 108,
    borderRadius: 34,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: Theme.typography.family.black,
    fontSize: 34,
    color: Theme.colors.primary.yellow,
  },
  avatarInitialsBlue: {
    color: Theme.colors.background.white,
  },
  userNameText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  userRoleText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.ui.textSecondary,
  },
  userRoleTextBlue: {
    color: Theme.colors.primary.blue,
  },
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.m,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    justifyContent: 'center',
  },
  actionCardBlue: {
    backgroundColor: Theme.colors.primary.blue,
  },
  actionCardAgentActive: {
    backgroundColor: Theme.colors.primary.pink,
  },
  actionCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.white,
    marginTop: Theme.spacing.s,
    lineHeight: 20,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.m,
  },
  configItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  iconWrapperBlue: {
    backgroundColor: Theme.colors.primary.blue,
  },
  configTextWrapper: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  configItemTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  configItemSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    marginTop: Theme.spacing.s,
  },
  logoutButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  bottomSpacer: {
    height: 100,
  },
  blueBadgeSmall: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueBadgeSmallText: {
    color: Theme.colors.background.white,
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
