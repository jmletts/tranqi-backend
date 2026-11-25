import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthStore } from '@presentation/state/useAuthStore';
import { useAgentStore } from '@presentation/state/useAgentStore';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import { PillInputField } from '@presentation/components/PillInputField';
import {
  RepeatIcon,
  ChevronRightIcon,
  StoreIcon,
  WalletInIcon,
  ShieldCheckIcon,
  BellIcon,
  LogOutIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ReceiptIcon,
  CardSmallIcon,
} from '@presentation/components/icons';

type AgentModalType = 'edit_kiosk' | 'replenish' | 'security' | 'notifications' | null;

const REPLENISH_AMOUNTS = [100, 250, 500, 1000];

export default function AgentProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const switchMode = useAuthStore((state) => state.switchMode);
  const updateAgentProfile = useAuthStore((state) => state.updateAgentProfile);
  const logout = useAuthStore((state) => state.logout);

  const agentBalance = useAgentStore((state) => state.agentBalance);
  const isSubmitting = useAgentStore((state) => state.isSubmitting);
  const fetchDashboard = useAgentStore((state) => state.fetchDashboard);
  const replenishQuota = useAgentStore((state) => state.replenishQuota);

  const [activeModal, setActiveModal] = useState<AgentModalType>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBusiness, setEditBusiness] = useState(agentProfile?.businessName || '');
  const [editAddress, setEditAddress] = useState(agentProfile?.businessAddress || '');

  const [notifRecharges, setNotifRecharges] = useState(true);
  const [notifLowQuota, setNotifLowQuota] = useState(true);
  const [notifDailyReport, setNotifDailyReport] = useState(false);

  const [replenishDone, setReplenishDone] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, [fetchDashboard]);

  const displayName = user?.name || user?.dni || 'Agente Tranqi';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AG';

  const handleSwitchToTraveler = () => {
    switchMode('traveler');
    router.replace('/(tabs)/home');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleOpenEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditBusiness(agentProfile?.businessName || '');
    setEditAddress(agentProfile?.businessAddress || '');
    setActiveModal('edit_kiosk');
  };

  const handleSaveKiosk = async () => {
    try {
      setSavingProfile(true);
      await updateAgentProfile({
        name: editName.trim() || displayName,
        email: editEmail.trim(),
        phone: editPhone.trim(),
        businessName: editBusiness.trim() || 'Punto Tranqi Autorizado',
        businessAddress: editAddress.trim(),
      });
      setActiveModal(null);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudieron guardar los datos');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleReplenish = async (amount: number) => {
    try {
      await replenishQuota(amount);
      setReplenishDone(amount);
      setTimeout(() => {
        setReplenishDone(null);
        setActiveModal(null);
      }, 900);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo reponer el cupo');
    }
  };

  const getModalTitle = (type: AgentModalType): string => {
    switch (type) {
      case 'edit_kiosk':
        return 'Datos del Agente y Punto';
      case 'replenish':
        return 'Reponer Cupo Operativo';
      case 'security':
        return 'Seguridad y Roles Activos';
      case 'notifications':
        return 'Alertas de Ventanilla';
      default:
        return '';
    }
  };

  interface ConfigRowProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
    badgeText?: string;
  }

  const ConfigRow = ({ title, subtitle, icon, onPress, badgeText }: ConfigRowProps) => (
    <TouchableOpacity style={styles.configRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.configIconPink}>{icon}</View>
      <View style={styles.configTextCol}>
        <View style={styles.configTitleRow}>
          <Text style={styles.configTitle}>{title}</Text>
          {badgeText ? (
            <View style={styles.smallPinkBadge}>
              <Text style={styles.smallPinkBadgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.configSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <Text style={styles.screenTitle}>Tu Perfil Agente</Text>

            <View style={styles.badgesRow}>
              <View style={styles.pinkPillBadge}>
                <Text style={styles.pinkPillBadgeText}>MODO AGENTE</Text>
              </View>
              <View style={styles.darkPillBadge}>
                <Text style={styles.darkPillBadgeText}>
                  {agentProfile?.agentCode || '---'}
                </Text>
              </View>
            </View>

            <View style={styles.avatarBorder}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>

            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.businessName}>
              {agentProfile?.businessName || 'Punto Tranqi Autorizado'}
            </Text>
            <Text style={styles.businessAddress}>
              {agentProfile?.businessAddress || ''}
            </Text>
          </View>

          <TouchableOpacity
            testID="agent-switch-to-traveler-button"
            style={styles.switchModeCard}
            onPress={handleSwitchToTraveler}
            activeOpacity={0.85}
          >
            <View style={styles.switchIconCircle}>
              <RepeatIcon size={22} color={Theme.colors.background.white} />
            </View>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Cambiar a modo Viajero</Text>
              <Text style={styles.switchSubtitle}>
                Vuelve a tus tarjetas, saldos y movimientos personales
              </Text>
            </View>
            <ChevronRightIcon size={22} color={Theme.colors.background.white} />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardHeading}>Información Registrada</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DNI</Text>
              <Text style={styles.infoValue}>{user?.dni || '---'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo</Text>
              <Text style={styles.infoValue}>{user?.email || '---'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user?.phone || '---'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cupo Operativo</Text>
              <Text style={styles.infoValuePink}>S/ {agentBalance.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Gestión del Punto</Text>

            <ConfigRow
              title="Cierre de caja del día"
              subtitle="Arqueo en Efectivo, Yape / Plin y comisiones del turno."
              icon={<ReceiptIcon size={20} color={Theme.colors.background.white} />}
              onPress={() => router.push('/agent-cash-close')}
              badgeText="CAJA"
            />

            <ConfigRow
              title="Emitir nueva tarjeta"
              subtitle="Activar tarjeta del inventario físico para un viajero."
              icon={<CardSmallIcon size={20} color={Theme.colors.background.white} />}
              onPress={() => router.push('/agent-issue-card')}
            />

            <ConfigRow
              title="Editar datos del punto"
              subtitle="Titular, correo, teléfono y dirección del kiosco."
              icon={<StoreIcon size={20} color={Theme.colors.background.white} />}
              onPress={handleOpenEditModal}
            />

            <ConfigRow
              title="Reponer cupo operativo"
              subtitle="Acreditar saldo disponible en PostgreSQL para recargas."
              icon={<WalletInIcon size={20} color={Theme.colors.background.white} />}
              onPress={() => setActiveModal('replenish')}
              badgeText="ACTIVO"
            />

            <ConfigRow
              title="Seguridad y roles"
              subtitle="Roles aditivos activos en tu token JWT."
              icon={<ShieldCheckIcon size={20} color={Theme.colors.background.white} />}
              onPress={() => setActiveModal('security')}
              badgeText="JWT"
            />

            <ConfigRow
              title="Alertas de ventanilla"
              subtitle="Notificaciones de recargas y límite de cupo."
              icon={<BellIcon size={20} color={Theme.colors.background.white} />}
              onPress={() => setActiveModal('notifications')}
            />
          </View>

          <TouchableOpacity
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

      <FloatingSlideModal
        visible={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle(activeModal)}
      >
        {activeModal === 'edit_kiosk' ? (
          <ScrollView
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <PillInputField
              label="Nombre Completo"
              value={editName}
              onChangeText={setEditName}
              icon={<UserIcon size={18} color={Theme.colors.background.white} />}
              iconBgColor={Theme.colors.primary.pink}
            />
            <PillInputField
              label="Correo Electrónico"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<MailIcon size={18} color={Theme.colors.background.white} />}
              iconBgColor={Theme.colors.primary.pink}
            />
            <PillInputField
              label="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              icon={<PhoneIcon size={18} color={Theme.colors.background.white} />}
              iconBgColor={Theme.colors.primary.pink}
            />
            <PillInputField
              label="Nombre del Kiosco"
              value={editBusiness}
              onChangeText={setEditBusiness}
              icon={<StoreIcon size={18} color={Theme.colors.background.white} />}
              iconBgColor={Theme.colors.primary.pink}
            />
            <PillInputField
              label="Dirección del Local"
              value={editAddress}
              onChangeText={setEditAddress}
              icon={<MapPinIcon size={18} color={Theme.colors.background.white} />}
              iconBgColor={Theme.colors.primary.pink}
            />

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleSaveKiosk}
              disabled={savingProfile}
              activeOpacity={0.85}
            >
              {savingProfile ? (
                <ActivityIndicator color={Theme.colors.background.white} />
              ) : (
                <Text style={styles.modalPrimaryButtonText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : null}

        {activeModal === 'replenish' ? (
          <View style={styles.modalBody}>
            <Text style={styles.modalLeadText}>
              Selecciona el monto de reposición para incrementar tu cupo operativo en PostgreSQL y registrar el movimiento.
            </Text>
            <View style={styles.replenishGrid}>
              {REPLENISH_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.replenishCard}
                  disabled={isSubmitting}
                  onPress={() => handleReplenish(amt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.replenishAmount}>+ S/ {amt.toFixed(2)}</Text>
                  <Text style={styles.replenishHint}>Abono inmediato</Text>
                </TouchableOpacity>
              ))}
            </View>
            {replenishDone !== null ? (
              <View style={styles.replenishSuccessBox}>
                <CheckCircleIcon size={18} color={Theme.colors.status.income} />
                <Text style={styles.replenishSuccessText}>
                  Cupo incrementado en S/ {replenishDone.toFixed(2)} correctamente.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {activeModal === 'security' ? (
          <View style={styles.modalBody}>
            <View style={styles.securityBox}>
              <Text style={styles.securityBoxTitle}>Roles Aditivos en Token JWT</Text>
              <Text style={styles.securityBoxText}>
                Tu cuenta mantiene una única identidad en PostgreSQL con roles acumulables verificados en el token JWT.
              </Text>
              <View style={styles.rolesList}>
                {(user?.roles || []).map((r) => (
                  <View
                    key={r}
                    style={[
                      styles.roleChip,
                      r === 'AGENTE_KIOSKO' && styles.roleChipPink,
                    ]}
                  >
                    <Text style={styles.roleChipText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDarkButton}
              onPress={() => setActiveModal(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeModal === 'notifications' ? (
          <View style={styles.modalBody}>
            <View style={styles.switchSettingRow}>
              <View style={styles.switchSettingTextCol}>
                <Text style={styles.switchSettingTitle}>Confirmación de recargas</Text>
                <Text style={styles.switchSettingSubtitle}>
                  Aviso visual al completar cada transacción.
                </Text>
              </View>
              <Switch
                value={notifRecharges}
                onValueChange={setNotifRecharges}
                trackColor={{
                  false: Theme.colors.ui.inputBorder,
                  true: Theme.colors.primary.pink,
                }}
                thumbColor={Theme.colors.background.white}
              />
            </View>

            <View style={styles.switchSettingRow}>
              <View style={styles.switchSettingTextCol}>
                <Text style={styles.switchSettingTitle}>Alerta de cupo bajo</Text>
                <Text style={styles.switchSettingSubtitle}>
                  Notificar cuando el saldo baje de S/ 100.00.
                </Text>
              </View>
              <Switch
                value={notifLowQuota}
                onValueChange={setNotifLowQuota}
                trackColor={{
                  false: Theme.colors.ui.inputBorder,
                  true: Theme.colors.primary.pink,
                }}
                thumbColor={Theme.colors.background.white}
              />
            </View>

            <View style={styles.switchSettingRow}>
              <View style={styles.switchSettingTextCol}>
                <Text style={styles.switchSettingTitle}>Cierre de turno diario</Text>
                <Text style={styles.switchSettingSubtitle}>
                  Resumen de recaudación y comisiones al final del día.
                </Text>
              </View>
              <Switch
                value={notifDailyReport}
                onValueChange={setNotifDailyReport}
                trackColor={{
                  false: Theme.colors.ui.inputBorder,
                  true: Theme.colors.primary.pink,
                }}
                thumbColor={Theme.colors.background.white}
              />
            </View>
          </View>
        ) : null}
      </FloatingSlideModal>
    </View>
  );
}

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
  profileHeader: {
    alignItems: 'center',
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.l,
  },
  pinkPillBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  pinkPillBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
    letterSpacing: 0.6,
  },
  darkPillBadge: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  darkPillBadgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.white,
  },
  avatarBorder: {
    width: 116,
    height: 116,
    borderRadius: 38,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
    borderWidth: 4,
    borderColor: Theme.colors.background.dark,
  },
  avatarInner: {
    width: 102,
    height: 102,
    borderRadius: 32,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: Theme.typography.family.black,
    fontSize: 32,
    color: Theme.colors.primary.pink,
  },
  userName: {
    fontFamily: Theme.typography.family.black,
    fontSize: 21,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  businessName: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.primary.pink,
    textAlign: 'center',
  },
  businessAddress: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    width: '100%',
    marginBottom: Theme.spacing.l,
    gap: 12,
  },
  switchIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
    marginBottom: 2,
  },
  switchSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#cccccc',
  },
  infoCard: {
    width: '100%',
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.xl,
  },
  infoCardHeading: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.s,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  infoValue: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.primary.pink,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.m,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  configIconPink: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  configTextCol: {
    flex: 1,
    marginRight: 8,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  configTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  configSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  smallPinkBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
  },
  smallPinkBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
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
    height: 110,
  },
  modalBody: {
    padding: Theme.spacing.l,
    paddingBottom: 40,
  },
  modalPrimaryButton: {
    backgroundColor: Theme.colors.primary.pink,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.s,
  },
  modalDarkButton: {
    backgroundColor: Theme.colors.background.dark,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.l,
  },
  modalPrimaryButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  modalLeadText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 19,
    marginBottom: Theme.spacing.l,
  },
  replenishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  replenishCard: {
    width: '47%',
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary.pink,
    padding: Theme.spacing.m,
    alignItems: 'center',
  },
  replenishAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.primary.pink,
    marginBottom: 4,
  },
  replenishHint: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  replenishSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginTop: Theme.spacing.l,
  },
  replenishSuccessText: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.income,
  },
  securityBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
  },
  securityBoxTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
    marginBottom: 6,
  },
  securityBoxText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.m,
  },
  rolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  roleChipPink: {
    backgroundColor: Theme.colors.primary.pink,
  },
  roleChipText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },
  switchSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
    gap: 12,
  },
  switchSettingTextCol: {
    flex: 1,
  },
  switchSettingTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  switchSettingSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
});
