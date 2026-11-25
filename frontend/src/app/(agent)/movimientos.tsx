import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAgentStore } from '@presentation/state/useAgentStore';
import { AgentTransaction, AgentTransactionType } from '@domain/models/Agent';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import {
  WalletInIcon,
  StoreIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  BarcodeIcon,
  CardSmallIcon,
  ReceiptIcon,
} from '@presentation/components/icons';

type FilterType = 'ALL' | AgentTransactionType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'RECHARGE', label: 'Recargas' },
  { key: 'CARD_ISSUE', label: 'Emisiones' },
  { key: 'REPLENISHMENT', label: 'Reposiciones' },
  { key: 'REJECTED', label: 'Rechazados' },
];

export default function AgentMovementsScreen() {
  const router = useRouter();
  const transactions = useAgentStore((state) => state.transactions);
  const isLoadingTransactions = useAgentStore((state) => state.isLoadingTransactions);
  const fetchTransactions = useAgentStore((state) => state.fetchTransactions);

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedTx, setSelectedTx] = useState<AgentTransaction | null>(null);

  useEffect(() => {
    fetchTransactions().catch(() => {});
  }, [fetchTransactions]);

  const handleRefresh = useCallback(() => {
    fetchTransactions().catch(() => {});
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'ALL') return transactions;
    return transactions.filter((tx) => tx.type === activeFilter);
  }, [transactions, activeFilter]);

  const totalFilteredRecharges = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'RECHARGE' || tx.type === 'CARD_ISSUE')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [filteredTransactions]);

  const getTxVisuals = (tx: AgentTransaction) => {
    if (tx.type === 'REJECTED') {
      return {
        iconBg: Theme.colors.status.expense,
        amountColor: Theme.colors.status.expense,
        typeLabel: 'Recarga Rechazada',
        prefix: '',
      };
    }
    if (tx.type === 'REPLENISHMENT') {
      return {
        iconBg: Theme.colors.background.dark,
        amountColor: Theme.colors.status.income,
        typeLabel: 'Reposición de Cupo',
        prefix: '+ ',
      };
    }
    if (tx.type === 'CARD_ISSUE') {
      return {
        iconBg: Theme.colors.primary.blue,
        amountColor: Theme.colors.primary.blue,
        typeLabel: 'Emisión de Tarjeta',
        prefix: '+ ',
      };
    }
    return {
      iconBg: Theme.colors.primary.pink,
      amountColor: Theme.colors.primary.pink,
      typeLabel: 'Recarga a Viajero',
      prefix: '+ ',
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoadingTransactions} onRefresh={handleRefresh} />
          }
        >
          <Text style={styles.screenTitle}>Movimientos</Text>
          <Text style={styles.screenSubtitle}>
            Historial real desde PostgreSQL de recargas, emisiones, reposiciones y validaciones ejecutadas desde tu punto.
          </Text>

          <TouchableOpacity
            style={styles.cashCloseBanner}
            onPress={() => router.push('/agent-cash-close')}
            activeOpacity={0.85}
          >
            <View style={styles.cashCloseIconCircle}>
              <ReceiptIcon size={18} color={Theme.colors.background.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cashCloseBannerTitle}>Ver Cierre de Caja del Día</Text>
              <Text style={styles.cashCloseBannerSub}>
                Desglose exacto en Efectivo vs. Yape / Plin
              </Text>
            </View>
            <ChevronRightIcon size={20} color={Theme.colors.background.white} />
          </TouchableOpacity>

          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Operaciones</Text>
              <Text style={styles.summaryValueDark}>{filteredTransactions.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cobros Acreditados</Text>
              <Text style={styles.summaryValuePink}>
                S/ {totalFilteredRecharges.toFixed(2)}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((f) => {
              const isSelected = activeFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterPill, isSelected && styles.filterPillActive]}
                  onPress={() => setActiveFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {isLoadingTransactions && transactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator color={Theme.colors.primary.pink} />
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Sin movimientos en esta categoría</Text>
              <Text style={styles.emptySubtitle}>
                Las nuevas recargas, emisiones o reposiciones aparecerán aquí de inmediato.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredTransactions.map((tx) => {
                const visuals = getTxVisuals(tx);

                return (
                  <TouchableOpacity
                    key={tx.id}
                    style={styles.txRow}
                    onPress={() => setSelectedTx(tx)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.iconBox, { backgroundColor: visuals.iconBg }]}>
                      {tx.type === 'REJECTED' ? (
                        <AlertCircleIcon size={22} color={Theme.colors.background.white} />
                      ) : tx.type === 'REPLENISHMENT' ? (
                        <StoreIcon size={22} color={Theme.colors.background.white} />
                      ) : tx.type === 'CARD_ISSUE' ? (
                        <CardSmallIcon size={22} color={Theme.colors.background.white} />
                      ) : (
                        <WalletInIcon size={22} color={Theme.colors.background.white} />
                      )}
                    </View>

                    <View style={styles.txDetails}>
                      <View style={styles.titleRow}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                tx.status === 'Completado'
                                  ? Theme.colors.status.income
                                  : Theme.colors.status.expense,
                            },
                          ]}
                        />
                        <Text style={styles.txTitle} numberOfLines={1}>
                          {tx.cardHolder}
                        </Text>
                      </View>
                      <Text style={[styles.txAmount, { color: visuals.amountColor }]}>
                        {visuals.prefix}S/ {tx.amount.toFixed(2)}
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

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Detalle de Operación"
      >
        {selectedTx ? (
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHero}>
              <View
                style={[
                  styles.modalIconCircle,
                  { backgroundColor: getTxVisuals(selectedTx).iconBg },
                ]}
              >
                {selectedTx.type === 'REJECTED' ? (
                  <AlertCircleIcon size={30} color={Theme.colors.background.white} />
                ) : selectedTx.type === 'REPLENISHMENT' ? (
                  <StoreIcon size={30} color={Theme.colors.background.white} />
                ) : selectedTx.type === 'CARD_ISSUE' ? (
                  <CardSmallIcon size={30} color={Theme.colors.background.white} />
                ) : (
                  <WalletInIcon size={30} color={Theme.colors.background.white} />
                )}
              </View>
              <Text style={styles.modalHeroTitle}>
                {getTxVisuals(selectedTx).typeLabel}
              </Text>
              <Text
                style={[
                  styles.modalHeroAmount,
                  { color: getTxVisuals(selectedTx).amountColor },
                ]}
              >
                {getTxVisuals(selectedTx).prefix}S/ {selectedTx.amount.toFixed(2)}
              </Text>
              <View
                style={[
                  styles.modalStatusPill,
                  {
                    backgroundColor:
                      selectedTx.status === 'Completado'
                        ? Theme.colors.status.income
                        : Theme.colors.status.expense,
                  },
                ]}
              >
                <CheckCircleIcon size={14} color={Theme.colors.background.white} />
                <Text style={styles.modalStatusText}>{selectedTx.status}</Text>
              </View>
            </View>

            <View style={styles.modalDetailsCard}>
              <View style={styles.modalDetailRow}>
                <View style={styles.refLabelRow}>
                  <BarcodeIcon size={16} color={Theme.colors.primary.pink} />
                  <Text style={styles.modalDetailLabel}>Código de referencia</Text>
                </View>
                <Text style={styles.modalDetailValueBold}>{selectedTx.referenceCode}</Text>
              </View>
              <View style={styles.modalDivider} />

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Titular / Concepto</Text>
                <Text style={styles.modalDetailValue}>{selectedTx.cardHolder}</Text>
              </View>
              <View style={styles.modalDivider} />

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Tarjeta / Tarifa</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedTx.cardId} • {selectedTx.fareType}
                </Text>
              </View>
              <View style={styles.modalDivider} />

              {selectedTx.previousBalance !== undefined &&
              selectedTx.newBalance !== undefined ? (
                <>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Saldo anterior / nuevo</Text>
                    <Text style={styles.modalDetailValue}>
                      S/ {selectedTx.previousBalance.toFixed(2)} → S/{' '}
                      {selectedTx.newBalance.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.modalDivider} />
                </>
              ) : null}

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Método de pago</Text>
                <Text style={styles.modalDetailValue}>{selectedTx.paymentMethod}</Text>
              </View>
              <View style={styles.modalDivider} />

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Fecha y hora</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedTx.dateStr} • {selectedTx.timeStr}
                </Text>
              </View>
            </View>

            <Text style={styles.modalNotes}>{selectedTx.notes}</Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedTx(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseBtnText}>Cerrar Detalle</Text>
            </TouchableOpacity>
          </ScrollView>
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
    fontSize: 24,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: Theme.spacing.m,
  },
  cashCloseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  cashCloseIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashCloseBannerTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.white,
  },
  cashCloseBannerSub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#cccccc',
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  summaryLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    marginBottom: 4,
  },
  summaryValueDark: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
  },
  summaryValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.primary.pink,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: Theme.spacing.m,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
  },
  filterPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  filterPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  filterPillTextActive: {
    color: Theme.colors.background.white,
  },
  listContainer: {
    width: '100%',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.cardSmall,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  txDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  txTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
    flex: 1,
  },
  txAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    marginBottom: 3,
  },
  txMeta: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
    marginLeft: 8,
  },
  txCardId: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  emptyBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginTop: Theme.spacing.m,
  },
  emptyTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 110,
  },
  modalContent: {
    padding: Theme.spacing.l,
    paddingBottom: 40,
  },
  modalHero: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.cardMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  modalHeroTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 17,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  modalHeroAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 30,
    marginBottom: Theme.spacing.s,
  },
  modalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  modalStatusText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
    textTransform: 'uppercase',
  },
  modalDetailsCard: {
    borderWidth: 1,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.cardMedium,
    paddingHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  modalDetailRow: {
    paddingVertical: 12,
  },
  refLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  modalDetailLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginBottom: 2,
  },
  modalDetailValue: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  modalDetailValueBold: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    letterSpacing: 0.5,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  modalNotes: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Theme.spacing.l,
  },
  modalCloseBtn: {
    backgroundColor: Theme.colors.background.dark,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
});
