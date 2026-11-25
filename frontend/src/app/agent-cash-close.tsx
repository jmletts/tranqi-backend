import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAgentStore } from '@presentation/state/useAgentStore';
import {
  ChevronLeftIcon,
  CloseIcon,
  ReceiptIcon,
  CheckCircleIcon,
  WalletInIcon,
  CardSmallIcon,
} from '@presentation/components/icons';

export default function AgentCashCloseScreen() {
  const router = useRouter();
  const cashClose = useAgentStore((state) => state.cashClose);
  const isLoadingCashClose = useAgentStore((state) => state.isLoadingCashClose);
  const isSubmitting = useAgentStore((state) => state.isSubmitting);
  const fetchCashClose = useAgentStore((state) => state.fetchCashClose);
  const confirmCashClose = useAgentStore((state) => state.confirmCashClose);

  const [notes, setNotes] = useState('');
  const [closedSuccess, setClosedSuccess] = useState(false);

  useEffect(() => {
    fetchCashClose().catch(() => {});
  }, [fetchCashClose]);

  const handleRefresh = useCallback(() => {
    fetchCashClose().catch(() => {});
  }, [fetchCashClose]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(agent)/home');
    }
  };

  const handleConfirmClose = async () => {
    try {
      await confirmCashClose(notes.trim() || undefined);
      setNotes('');
      setClosedSuccess(true);
      Alert.alert(
        'Cierre de caja registrado',
        'El arqueo del día fue guardado correctamente en PostgreSQL.'
      );
      setTimeout(() => setClosedSuccess(false), 2500);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo registrar el cierre');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cierre de Caja</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <CloseIcon size={22} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        {isLoadingCashClose && !cashClose ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Theme.colors.primary.pink} />
            <Text style={styles.centerText}>Calculando arqueo del día...</Text>
          </View>
        ) : !cashClose ? (
          <View style={styles.centerBox}>
            <Text style={styles.centerText}>No se pudo cargar el cierre de caja.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoadingCashClose} onRefresh={handleRefresh} />
            }
          >
            {/* Hero Total Cobrado Hoy */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroBusiness}>{cashClose.businessName}</Text>
                  <Text style={styles.heroCode}>Agente {cashClose.agentCode}</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>ARQUEO HOY</Text>
                </View>
              </View>

              <Text style={styles.heroLabel}>Total Cobrado Hoy (Caja + Digital):</Text>
              <Text style={styles.heroAmount}>S/ {cashClose.totalCollected.toFixed(2)}</Text>

              <View style={styles.heroBottomRow}>
                <Text style={styles.heroSub}>
                  Recargas: {cashClose.rechargesCount} • Emisiones: {cashClose.cardIssuesCount}
                </Text>
                <Text style={styles.heroSub}>Cupo actual: S/ {cashClose.operationalBalance.toFixed(2)}</Text>
              </View>
            </View>

            {/* Desglose por Método de Cobro */}
            <Text style={styles.sectionTitle}>¿Cuánto debe haber en caja?</Text>
            <View style={styles.splitRow}>
              <View style={[styles.methodCard, styles.methodCardCash]}>
                <Text style={styles.methodBadge}>EFECTIVO EN CAJA</Text>
                <Text style={styles.methodAmount}>S/ {cashClose.cashTotal.toFixed(2)}</Text>
                <Text style={styles.methodMeta}>
                  {cashClose.cashCount} {cashClose.cashCount === 1 ? 'cobro' : 'cobros'} en efectivo
                </Text>
              </View>

              <View style={[styles.methodCard, styles.methodCardDigital]}>
                <Text style={styles.methodBadgeDigital}>YAPE / PLIN</Text>
                <Text style={styles.methodAmountDigital}>S/ {cashClose.digitalTotal.toFixed(2)}</Text>
                <Text style={styles.methodMeta}>
                  {cashClose.digitalCount} {cashClose.digitalCount === 1 ? 'cobro' : 'cobros'} digitales
                </Text>
              </View>
            </View>

            {/* Resumen Financiero Detallado */}
            <Text style={styles.sectionTitle}>Resumen Financiero del Turno</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recargas acreditadas ({cashClose.rechargesCount})</Text>
                <Text style={styles.summaryValue}>S/ {cashClose.totalRecharged.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Emisión de tarjetas ({cashClose.cardIssuesCount})</Text>
                <Text style={styles.summaryValue}>S/ {cashClose.cardIssuesTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Reposiciones de cupo ({cashClose.replenishmentsCount})</Text>
                <Text style={styles.summaryValue}>S/ {cashClose.replenishmentsTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Operaciones rechazadas</Text>
                <Text style={styles.summaryValue}>{cashClose.rejectedCount}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Comisión estimada ({(cashClose.commissionRate * 100).toFixed(1)}%)
                </Text>
                <Text style={styles.summaryValueGreen}>
                  + S/ {cashClose.estimatedCommission.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelBold}>Neto a rendir a Tranqi</Text>
                <Text style={styles.summaryValuePink}>S/ {cashClose.netToSettle.toFixed(2)}</Text>
              </View>
            </View>

            {/* Registrar Cierre de Caja */}
            <Text style={styles.sectionTitle}>Confirmar Cierre de Turno</Text>
            <TextInput
              testID="cash-close-notes-input"
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Observaciones del cierre (opcional, ej. Turno tarde cuadrado)"
              placeholderTextColor={Theme.colors.ui.textSecondary}
            />

            <TouchableOpacity
              testID="cash-close-submit-button"
              style={[styles.closeButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleConfirmClose}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Theme.colors.background.white} />
              ) : (
                <>
                  <ReceiptIcon size={18} color={Theme.colors.background.white} />
                  <Text style={styles.closeButtonText}>
                    {closedSuccess ? 'Cierre Guardado en BD' : 'Registrar Cierre de Caja'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cobros del Día */}
            <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.xl }]}>
              Detalle de Cobros de Hoy ({cashClose.todayTransactions.length})
            </Text>
            {cashClose.todayTransactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No se registraron operaciones el día de hoy.</Text>
              </View>
            ) : (
              <View style={styles.listBox}>
                {cashClose.todayTransactions.map((tx) => {
                  const isCardIssue = tx.type === 'CARD_ISSUE';
                  return (
                    <View key={tx.id} style={styles.txRow}>
                      <View
                        style={[
                          styles.txIcon,
                          {
                            backgroundColor:
                              tx.type === 'REJECTED'
                                ? Theme.colors.status.expense
                                : isCardIssue
                                ? Theme.colors.primary.blue
                                : tx.type === 'REPLENISHMENT'
                                ? Theme.colors.background.dark
                                : Theme.colors.primary.pink,
                          },
                        ]}
                      >
                        {isCardIssue ? (
                          <CardSmallIcon size={18} color={Theme.colors.background.white} />
                        ) : (
                          <WalletInIcon size={18} color={Theme.colors.background.white} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle} numberOfLines={1}>
                          {tx.cardHolder} ({tx.cardId})
                        </Text>
                        <Text style={styles.txSub}>
                          {tx.timeStr} • {tx.paymentMethod} • {tx.status}
                        </Text>
                      </View>
                      <Text style={styles.txAmount}>S/ {tx.amount.toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Cierres Anteriores */}
            {cashClose.recentClosures.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.xl }]}>
                  Cierres Registrados Recientes
                </Text>
                {cashClose.recentClosures.map((c) => (
                  <View key={c.id} style={styles.closureCard}>
                    <View style={styles.closureHeader}>
                      <View style={styles.closureTitleRow}>
                        <CheckCircleIcon size={15} color={Theme.colors.status.income} />
                        <Text style={styles.closureDate}>
                          {c.dateStr} • {c.timeStr}
                        </Text>
                      </View>
                      <Text style={styles.closureTotal}>
                        S/ {(c.totalRecharged + c.cardIssuesTotal).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.closureBreakdown}>
                      Efectivo: S/ {c.cashTotal.toFixed(2)} • Yape/Plin: S/ {c.digitalTotal.toFixed(2)} • Ops: {c.transactionsCount}
                    </Text>
                    {c.notes ? <Text style={styles.closureNotes}>{c.notes}</Text> : null}
                  </View>
                ))}
              </>
            ) : null}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  blackBackground: {
    backgroundColor: Theme.colors.background.dark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.m,
  },
  headerButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.white,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: Theme.spacing.xl,
  },
  centerText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
  },
  retryBtn: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.pill,
  },
  retryBtnText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  scrollContent: {
    padding: Theme.spacing.l,
  },
  heroCard: {
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.m,
  },
  heroBusiness: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  heroCode: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#cccccc',
    marginTop: 2,
  },
  heroPill: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  heroPillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
  },
  heroLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: '#cccccc',
  },
  heroAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 36,
    color: Theme.colors.background.white,
    marginVertical: 4,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.s,
    flexWrap: 'wrap',
    gap: 6,
  },
  heroSub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#cccccc',
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },
  methodCard: {
    flex: 1,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    borderWidth: 1.5,
  },
  methodCardCash: {
    backgroundColor: '#fff5fa',
    borderColor: Theme.colors.primary.pink,
  },
  methodCardDigital: {
    backgroundColor: '#f4f7ff',
    borderColor: Theme.colors.primary.blue,
  },
  methodBadge: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.primary.pink,
    marginBottom: 6,
  },
  methodBadgeDigital: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.primary.blue,
    marginBottom: 6,
  },
  methodAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  methodAmountDigital: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  methodMeta: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  summaryCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  summaryLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  summaryLabelBold: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  summaryValue: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  summaryValueGreen: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.status.income,
  },
  summaryValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.pink,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  notesInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.l,
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Theme.colors.primary.pink,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
  },
  closeButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
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
  },
  listBox: {
    width: '100%',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
    gap: 10,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  txSub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
  },
  txAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  closureCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.s,
  },
  closureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closureDate: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  closureTotal: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.primary.pink,
  },
  closureBreakdown: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  closureNotes: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.dark,
    marginTop: 4,
  },
});
