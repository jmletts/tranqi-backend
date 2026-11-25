import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthStore } from '@presentation/state/useAuthStore';
import { useAgentStore } from '@presentation/state/useAgentStore';
import {
  WalletInIcon,
  ReceiptIcon,
  StoreIcon,
  RepeatIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  CardSmallIcon,
} from '@presentation/components/icons';

export default function AgentHomeScreen() {
  const router = useRouter();
  const agentProfile = useAuthStore((state) => state.agentProfile);
  const switchMode = useAuthStore((state) => state.switchMode);

  const agentBalance = useAgentStore((state) => state.agentBalance);
  const todayTotalRecharged = useAgentStore((state) => state.todayTotalRecharged);
  const todayTransactionsCount = useAgentStore((state) => state.todayTransactionsCount);
  const estimatedCommission = useAgentStore((state) => state.estimatedCommission);
  const transactions = useAgentStore((state) => state.transactions);
  const isLoadingDashboard = useAgentStore((state) => state.isLoadingDashboard);
  const fetchDashboard = useAgentStore((state) => state.fetchDashboard);

  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, [fetchDashboard]);

  const handleRefresh = useCallback(() => {
    fetchDashboard().catch(() => {});
  }, [fetchDashboard]);

  const recentTransactions = transactions.slice(0, 4);

  const handleSwitchToTraveler = () => {
    switchMode('traveler');
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoadingDashboard} onRefresh={handleRefresh} />
          }
        >
          {/* Tarjeta Hero del Agente */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroKioskCol}>
                <Text style={styles.heroKioskLabel}>
                  {agentProfile?.businessName || 'Punto Tranqi Autorizado'}
                </Text>
                <Text style={styles.heroCodeText}>
                  Código: {agentProfile?.agentCode || '---'}
                </Text>
              </View>
              <View style={styles.statusPillDark}>
                <Text style={styles.statusPillDarkText}>TURNO ACTIVO</Text>
              </View>
            </View>

            <Text style={styles.balanceLabel}>Cupo Operativo Disponible:</Text>
            <Text style={styles.balanceValue}>S/ {agentBalance.toFixed(2)}</Text>

            <View style={styles.heroInfoRow}>
              <Text style={styles.heroInfoText}>Rol: AGENTE_KIOSKO</Text>
              <Text style={styles.heroInfoText}>Conectado a PostgreSQL</Text>
            </View>

            <View style={styles.heroButtonRow}>
              <TouchableOpacity
                testID="agent-home-recharge-cta"
                style={styles.heroActionButton}
                onPress={() => router.push('/(agent)/recargar')}
                activeOpacity={0.85}
              >
                <WalletInIcon size={16} color={Theme.colors.background.white} />
                <Text style={styles.heroActionText}>Recargar Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="agent-home-cashclose-cta"
                style={styles.heroActionButton}
                onPress={() => router.push('/agent-cash-close')}
                activeOpacity={0.85}
              >
                <ReceiptIcon size={16} color={Theme.colors.background.white} />
                <Text style={styles.heroActionText}>Cierre de Caja</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Resumen Diario */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Resumen del Día</Text>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Recaudado</Text>
                <Text style={styles.kpiValuePink}>S/ {todayTotalRecharged.toFixed(2)}</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Recargas</Text>
                <Text style={styles.kpiValueDark}>{todayTransactionsCount}</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Comisión</Text>
                <Text style={styles.kpiValueDark}>S/ {estimatedCommission.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Operaciones Rápidas */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Operaciones Rápidas</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={styles.quickItem}
                onPress={() => router.push('/(agent)/recargar')}
                activeOpacity={0.8}
              >
                <View style={styles.quickIconPink}>
                  <WalletInIcon size={24} color={Theme.colors.background.white} />
                </View>
                <Text style={styles.quickLabel}>Recargar{'\n'}Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="agent-home-issue-card-cta"
                style={styles.quickItem}
                onPress={() => router.push('/agent-issue-card')}
                activeOpacity={0.8}
              >
                <View style={styles.quickIconPink}>
                  <CardSmallIcon size={24} color={Theme.colors.background.white} />
                </View>
                <Text style={styles.quickLabel}>Emitir{'\n'}Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickItem}
                onPress={() => router.push('/agent-cash-close')}
                activeOpacity={0.8}
              >
                <View style={styles.quickIconPink}>
                  <ReceiptIcon size={24} color={Theme.colors.background.white} />
                </View>
                <Text style={styles.quickLabel}>Cierre{'\n'}de Caja</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickItem}
                onPress={handleSwitchToTraveler}
                activeOpacity={0.8}
              >
                <View style={styles.quickIconDark}>
                  <RepeatIcon size={24} color={Theme.colors.background.white} />
                </View>
                <Text style={styles.quickLabel}>Modo{'\n'}Viajero</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Últimas Transacciones */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleInline}>Últimas Operaciones</Text>
              <TouchableOpacity
                onPress={() => router.push('/(agent)/movimientos')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllLink}>Ver todo</Text>
              </TouchableOpacity>
            </View>

            {isLoadingDashboard && recentTransactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator color={Theme.colors.primary.pink} />
              </View>
            ) : recentTransactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  Aún no hay operaciones registradas en este punto de atención.
                </Text>
              </View>
            ) : (
              <View style={styles.txList}>
                {recentTransactions.map((tx) => {
                  const isRejected = tx.type === 'REJECTED';
                  const isReplenishment = tx.type === 'REPLENISHMENT';
                  const isCardIssue = tx.type === 'CARD_ISSUE';
                  const iconBg = isRejected
                    ? Theme.colors.status.expense
                    : isReplenishment
                    ? Theme.colors.background.dark
                    : isCardIssue
                    ? Theme.colors.primary.blue
                    : Theme.colors.primary.pink;
                  const amountColor = isRejected
                    ? Theme.colors.status.expense
                    : isReplenishment
                    ? Theme.colors.status.income
                    : isCardIssue
                    ? Theme.colors.primary.blue
                    : Theme.colors.primary.pink;

                  return (
                    <TouchableOpacity
                      key={tx.id}
                      style={styles.txRow}
                      onPress={() => router.push('/(agent)/movimientos')}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.txIconBox, { backgroundColor: iconBg }]}>
                        {isRejected ? (
                          <AlertCircleIcon size={22} color={Theme.colors.background.white} />
                        ) : isReplenishment ? (
                          <StoreIcon size={22} color={Theme.colors.background.white} />
                        ) : isCardIssue ? (
                          <CardSmallIcon size={22} color={Theme.colors.background.white} />
                        ) : (
                          <WalletInIcon size={22} color={Theme.colors.background.white} />
                        )}
                      </View>

                      <View style={styles.txDetails}>
                        <Text style={styles.txTitle} numberOfLines={1}>
                          {tx.cardHolder}
                        </Text>
                        <Text style={[styles.txAmount, { color: amountColor }]}>
                          {isRejected ? 'Rechazada' : '+'} S/ {tx.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.txMeta}>
                          {tx.dateStr} • {tx.timeStr} • {tx.paymentMethod}
                        </Text>
                      </View>

                      <View style={styles.txRight}>
                        <ChevronRightIcon size={18} color={Theme.colors.ui.textSecondary} />
                        <Text style={styles.txCardId}>{tx.cardId}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
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
  heroCard: {
    backgroundColor: Theme.colors.primary.pink,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.l,
    gap: 8,
  },
  heroKioskCol: {
    flex: 1,
  },
  heroKioskLabel: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  heroCodeText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.background.white,
    opacity: 0.85,
    marginTop: 2,
  },
  statusPillDark: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  statusPillDarkText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 0.6,
  },
  balanceLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.background.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: Theme.typography.family.black,
    fontSize: 38,
    color: Theme.colors.background.white,
    marginBottom: Theme.spacing.m,
  },
  heroInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.l,
  },
  heroInfoText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.white,
    opacity: 0.85,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
  },
  heroActionButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Theme.spacing.s,
    borderRadius: Theme.borderRadius.pill,
    gap: 8,
  },
  heroActionText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.white,
  },
  sectionBlock: {
    marginTop: Theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  sectionTitleInline: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
  },
  seeAllLink: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.pink,
    textDecorationLine: 'underline',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    alignItems: 'flex-start',
  },
  kpiLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    marginBottom: 6,
  },
  kpiValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.pink,
  },
  kpiValueDark: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    width: '23%',
    alignItems: 'center',
  },
  quickIconPink: {
    width: 58,
    height: 58,
    borderRadius: Theme.borderRadius.cardSmall,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  quickIconDark: {
    width: 58,
    height: 58,
    borderRadius: Theme.borderRadius.cardSmall,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  quickLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  txList: {
    width: '100%',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  txIconBox: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.cardSmall,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
    marginBottom: 2,
  },
  txAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    marginBottom: 2,
  },
  txMeta: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 42,
    marginLeft: 8,
  },
  txCardId: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  bottomSpacer: {
    height: 110,
  },
});
