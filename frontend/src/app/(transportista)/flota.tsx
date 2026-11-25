import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useFleetStore } from '@presentation/state/useFleetStore';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import { RegisterBusContent } from '@presentation/components/fleet/RegisterBusContent';
import { CheckEarningsContent } from '@presentation/components/fleet/CheckEarningsContent';
import {
  BusFrontIcon,
  CpuIcon,
  KeyIcon,
  ShieldCheckIcon,
  RefreshIcon,
  PlusIcon,
  SearchIcon,
  ChevronRightIcon,
} from '@presentation/components/icons';

type FlotaModalType = 'register_bus' | 'check_earnings' | null;

const REASON_LABELS: Record<string, string> = {
  DEBT: 'DEUDA',
  LOST_STOLEN: 'EXTRAVÍO',
  FRAUD: 'FRAUDE',
};

export default function TransporterFlotaScreen() {
  const router = useRouter();
  const buses = useFleetStore((state) => state.buses);
  const earningsByPlate = useFleetStore((state) => state.earningsByPlate);
  const blacklistSync = useFleetStore((state) => state.blacklistSync);
  const isLoadingDashboard = useFleetStore((state) => state.isLoadingDashboard);
  const isSyncingBlacklist = useFleetStore((state) => state.isSyncingBlacklist);
  const fetchDashboard = useFleetStore((state) => state.fetchDashboard);
  const syncBlacklist = useFleetStore((state) => state.syncBlacklist);

  const [activeModal, setActiveModal] = useState<FlotaModalType>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    syncBlacklist(true).catch(() => {});
  }, [fetchDashboard, syncBlacklist]);

  const handleRefresh = async () => {
    await Promise.allSettled([fetchDashboard(), syncBlacklist(true)]);
  };

  const handleSyncBlacklist = async () => {
    try {
      const updated = await syncBlacklist(false);
      if (updated.isFullSnapshot) {
        setSyncNotice(
          `Snapshot v${updated.newVersion} sincronizado (${updated.cards.length} tarjetas bloqueadas).`
        );
      } else {
        setSyncNotice(
          `Versión v${updated.newVersion} sincronizada (${updated.changes.add.length} altas, ${updated.changes.remove.length} bajas).`
        );
      }
    } catch (err) {
      setSyncNotice(
        err instanceof Error ? err.message : 'No se pudo sincronizar la lista negra.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingDashboard || isSyncingBlacklist}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary.blue}
            />
          }
        >
          <Text style={styles.screenTitle}>Flota y Validadores</Text>
          <Text style={styles.screenSubtitle}>
            Gestiona buses autorizados, hardware ESP32, claves públicas ECDSA y la lista negra en campo.
          </Text>

          {/* Top Action Pills */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              testID="flota-register-bus-button"
              style={styles.primaryActionPill}
              onPress={() => setActiveModal('register_bus')}
              activeOpacity={0.85}
            >
              <PlusIcon size={16} color={Theme.colors.background.white} />
              <Text style={styles.primaryActionText}>Registrar Bus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="flota-check-earnings-button"
              style={styles.outlineActionPill}
              onPress={() => setActiveModal('check_earnings')}
              activeOpacity={0.85}
            >
              <SearchIcon size={16} color={Theme.colors.primary.blue} />
              <Text style={styles.outlineActionText}>Consultar Placa</Text>
            </TouchableOpacity>
          </View>

          {/* Validators Directory (Bus + HardwareId + PublicKey) */}
          <Text style={styles.sectionTitle}>Validadores Vinculados ({buses.length})</Text>

          {buses.map((bus) => {
            const earnings = earningsByPlate[bus.licensePlate]?.totalEarnings ?? 0;
            const shortKey =
              bus.publicKey.length > 26
                ? `${bus.publicKey.slice(0, 14)}...${bus.publicKey.slice(-10)}`
                : bus.publicKey;

            return (
              <TouchableOpacity
                key={bus.id}
                style={styles.validatorCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/transportista-bus-detail',
                    params: { licensePlate: bus.licensePlate },
                  })
                }
              >
                <View style={styles.validatorHeader}>
                  <View style={styles.validatorTitleGroup}>
                    <View style={styles.blueIconSmall}>
                      <BusFrontIcon size={20} color={Theme.colors.background.white} />
                    </View>
                    <View>
                      <Text style={styles.validatorPlate}>{bus.licensePlate}</Text>
                      <Text style={styles.validatorEarnings}>
                        Recaudado: S/ {earnings.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
                </View>

                <View style={styles.validatorDivider} />

                <View style={styles.metaRow}>
                  <CpuIcon size={14} color={Theme.colors.primary.blue} />
                  <Text style={styles.metaLabel}>Hardware ID:</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {bus.hardwareId}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <KeyIcon size={14} color={Theme.colors.primary.blue} />
                  <Text style={styles.metaLabel}>Clave ECDSA:</Text>
                  <Text style={styles.metaValueMono} numberOfLines={1}>
                    {shortKey}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Blacklist Sync Status Section (US-11) */}
          <Text style={styles.sectionTitle}>Lista Negra en Validadores</Text>
          <View style={styles.blacklistCard}>
            <View style={styles.blacklistHeader}>
              <View style={styles.blacklistTitleRow}>
                <View style={styles.blueIconSmall}>
                  <ShieldCheckIcon size={20} color={Theme.colors.background.white} />
                </View>
                <View>
                  <Text style={styles.blacklistTitle}>
                    Versión Global v{blacklistSync.newVersion}
                  </Text>
                  <Text style={styles.blacklistSub}>
                    Última sinc.: {blacklistSync.lastSyncedAt}
                  </Text>
                </View>
              </View>

              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {blacklistSync.cards.length} BLOQ.
                </Text>
              </View>
            </View>

            <View style={styles.blockedCardsList}>
              {blacklistSync.cards.length === 0 ? (
                <View style={styles.blockedCardRow}>
                  <Text style={styles.blacklistSub}>
                    Sin tarjetas bloqueadas activas en el servidor.
                  </Text>
                </View>
              ) : (
                blacklistSync.cards.map((card) => (
                  <View key={card.cardId} style={styles.blockedCardRow}>
                    <Text style={styles.blockedCardId}>{card.cardId}</Text>
                    <View
                      style={[
                        styles.reasonPill,
                        card.reason === 'DEBT'
                          ? styles.reasonPillBlue
                          : styles.reasonPillExpense,
                      ]}
                    >
                      <Text style={styles.reasonPillText}>
                        {REASON_LABELS[card.reason] || card.reason}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {syncNotice ? (
              <Text style={styles.syncNoticeText}>{syncNotice}</Text>
            ) : null}

            <TouchableOpacity
              testID="flota-sync-blacklist-button"
              style={styles.syncButton}
              onPress={handleSyncBlacklist}
              disabled={isSyncingBlacklist}
              activeOpacity={0.85}
            >
              <RefreshIcon size={16} color={Theme.colors.background.white} />
              <Text style={styles.syncButtonText}>
                {isSyncingBlacklist
                  ? 'Sincronizando...'
                  : 'Sincronizar Delta Lista Negra'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'register_bus'
            ? 'Registrar Nuevo Bus'
            : 'Consultar Ganancias por Placa'
        }
      >
        {activeModal === 'register_bus' ? (
          <RegisterBusContent onClose={() => setActiveModal(null)} />
        ) : activeModal === 'check_earnings' ? (
          <CheckEarningsContent onClose={() => setActiveModal(null)} />
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
  },
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: 6,
  },
  screenSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Theme.spacing.l,
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    marginBottom: Theme.spacing.xl,
  },
  primaryActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary.blue,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.pill,
  },
  primaryActionText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  outlineActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.background.white,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary.blue,
  },
  outlineActionText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.primary.blue,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 17,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  validatorCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  validatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validatorTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blueIconSmall: {
    width: 42,
    height: 42,
    borderRadius: Theme.borderRadius.cardSmall,
    backgroundColor: Theme.colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatorPlate: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  validatorEarnings: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
  },
  validatorDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  metaValue: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  metaValueMono: {
    flex: 1,
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.dark,
  },
  blacklistCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  blacklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  blacklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blacklistTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  blacklistSub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  countPill: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  countPillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
  },
  blockedCardsList: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardSmall,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.m,
  },
  blockedCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  blockedCardId: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  reasonPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
  },
  reasonPillBlue: {
    backgroundColor: Theme.colors.primary.blue,
  },
  reasonPillExpense: {
    backgroundColor: Theme.colors.status.expense,
  },
  reasonPillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },
  syncNoticeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.primary.blue,
    textAlign: 'center',
    marginBottom: Theme.spacing.m,
  },
  syncButton: {
    backgroundColor: Theme.colors.background.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.pill,
  },
  syncButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  bottomSpacer: {
    height: 110,
  },
});
