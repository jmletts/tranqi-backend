import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAgentStore } from '@presentation/state/useAgentStore';
import { useTravelerStore } from '@presentation/state/useTravelerStore';
import {
  AgentPassengerCard,
  AgentPaymentMethod,
  AgentTransaction,
} from '@domain/models/Agent';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import {
  SearchIcon,
  WalletInIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BarcodeIcon,
} from '@presentation/components/icons';

const QUICK_AMOUNTS = ['5.00', '10.00', '20.00', '50.00'];
const PAYMENT_METHODS: AgentPaymentMethod[] = ['Efectivo', 'Yape / Plin'];

export default function AgentRechargeScreen() {
  const router = useRouter();
  const agentBalance = useAgentStore((state) => state.agentBalance);
  const lookupResults = useAgentStore((state) => state.lookupResults);
  const isSearchingCard = useAgentStore((state) => state.isSearchingCard);
  const isSubmitting = useAgentStore((state) => state.isSubmitting);
  const fetchDashboard = useAgentStore((state) => state.fetchDashboard);
  const lookupCards = useAgentStore((state) => state.lookupCards);
  const processRecharge = useAgentStore((state) => state.processRecharge);
  const refreshTraveler = useTravelerStore((state) => state.refreshAll);

  const [cardQuery, setCardQuery] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<AgentPassengerCard | null>(null);
  const [amountText, setAmountText] = useState<string>('10.00');
  const [paymentMethod, setPaymentMethod] = useState<AgentPaymentMethod>('Efectivo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptTx, setReceiptTx] = useState<AgentTransaction | null>(null);

  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, [fetchDashboard]);

  const parsedAmount = parseFloat(amountText.replace(',', '.')) || 0;
  const isBlockedUnrecoverable =
    selectedCard?.cardStatus === 'FRAUD_BLOCKED' ||
    selectedCard?.cardStatus === 'LOST_REPORTED' ||
    selectedCard?.cardStatus === 'IN_INVENTORY';
  const isBlockedDebt = selectedCard?.cardStatus === 'BLOCKED_DEBT';
  const projectedBalance = selectedCard ? selectedCard.balance + parsedAmount : 0;
  const willUnlockDebt = isBlockedDebt && projectedBalance > 0;
  const projectedAgentBalance = agentBalance - parsedAmount;

  const handleSearchCard = async () => {
    setErrorMessage(null);
    const trimmed = cardQuery.trim();
    if (!trimmed) {
      setErrorMessage('Ingresa el código de tarjeta (ej. TRK-1001), número de verificación o DNI.');
      return;
    }

    try {
      const results = await lookupCards(trimmed);
      if (results.length === 0) {
        setSelectedCard(null);
        setErrorMessage('No se encontró ninguna tarjeta registrada con ese código o DNI.');
        return;
      }
      setSelectedCard(results[0]);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al buscar la tarjeta.');
    }
  };

  const handleConfirmRecharge = async () => {
    setErrorMessage(null);

    if (!selectedCard) {
      setErrorMessage('Primero busca y selecciona una tarjeta de viajero.');
      return;
    }
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Ingresa un monto válido mayor a S/ 0.00.');
      return;
    }

    try {
      const result = await processRecharge({
        cardId: selectedCard.cardId,
        amount: Number(parsedAmount.toFixed(2)),
        paymentMethod,
      });
      setSelectedCard(result.updatedCard);
      setReceiptTx(result.transaction);
      refreshTraveler().catch(() => {});
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo procesar la recarga.');
    }
  };

  const handleNewRecharge = () => {
    setReceiptTx(null);
    setAmountText('10.00');
    setErrorMessage(null);
  };

  const getStatusMeta = (card: AgentPassengerCard) => {
    switch (card.cardStatus) {
      case 'ACTIVE':
        return { label: 'ACTIVA', bg: Theme.colors.status.income };
      case 'BLOCKED_DEBT':
        return { label: 'BLOQUEADA POR DEUDA', bg: Theme.colors.primary.pink };
      case 'FRAUD_BLOCKED':
        return { label: 'BLOQUEADA POR FRAUDE', bg: Theme.colors.status.expense };
      case 'LOST_REPORTED':
        return { label: 'REPORTADA PERDIDA', bg: Theme.colors.status.expense };
      default:
        return { label: card.cardStatus, bg: Theme.colors.ui.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <View style={styles.pinkBadge}>
              <Text style={styles.pinkBadgeText}>VENTANILLA AUTORIZADA</Text>
            </View>
            <Text style={styles.screenTitle}>Recargar Tarjeta</Text>
            <Text style={styles.screenSubtitle}>
              Acredita saldo instantáneo desde tu cupo operativo disponible (S/ {agentBalance.toFixed(2)}).
            </Text>
          </View>

          <Text style={styles.sectionTitle}>1. Identificar Tarjeta del Viajero</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchPillInput}>
              <TextInput
                testID="agent-recharge-card-input"
                style={styles.searchTextInput}
                value={cardQuery}
                onChangeText={(text) => {
                  setCardQuery(text);
                  setErrorMessage(null);
                }}
                placeholder="Código de tarjeta, N° 12 dígitos o DNI"
                placeholderTextColor={Theme.colors.ui.textSecondary}
                autoCapitalize="characters"
                onSubmitEditing={handleSearchCard}
              />
            </View>

            <TouchableOpacity
              testID="agent-recharge-search-button"
              style={styles.searchButton}
              onPress={handleSearchCard}
              disabled={isSearchingCard}
              activeOpacity={0.8}
              accessibilityLabel="Buscar tarjeta"
            >
              {isSearchingCard ? (
                <ActivityIndicator color={Theme.colors.background.white} />
              ) : (
                <SearchIcon size={20} color={Theme.colors.background.white} />
              )}
            </TouchableOpacity>
          </View>

          {lookupResults.length > 1 ? (
            <View style={styles.quickCardsSection}>
              <Text style={styles.helperLabel}>Tarjetas encontradas para esta búsqueda:</Text>
              <View style={styles.quickCardsRow}>
                {lookupResults.map((card) => {
                  const isSelected = selectedCard?.cardId === card.cardId;
                  return (
                    <TouchableOpacity
                      key={card.cardId}
                      style={[
                        styles.quickCardPill,
                        isSelected && styles.quickCardPillActive,
                      ]}
                      onPress={() => {
                        setSelectedCard(card);
                        setErrorMessage(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.quickCardPillText,
                          isSelected && styles.quickCardPillTextActive,
                        ]}
                      >
                        {card.cardId} ({card.fareType})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {selectedCard ? (
            <View style={styles.cardPreviewBox}>
              <View style={styles.cardPreviewStripe} />
              <View style={styles.cardPreviewInner}>
                <View style={styles.cardPreviewTop}>
                  <View style={styles.cardCodeBadge}>
                    <Text style={styles.cardCodeBadgeText}>{selectedCard.cardId}</Text>
                  </View>
                  <View
                    style={[
                      styles.cardStatusPill,
                      { backgroundColor: getStatusMeta(selectedCard).bg },
                    ]}
                  >
                    <Text style={styles.cardStatusPillText}>
                      {getStatusMeta(selectedCard).label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardHolderName}>{selectedCard.holderName}</Text>
                <Text style={styles.cardSubMeta}>
                  DNI {selectedCard.holderDni} • Tarifa {selectedCard.fareType}
                </Text>

                <View style={styles.cardBalanceRow}>
                  <Text style={styles.cardBalanceLabel}>Saldo actual</Text>
                  <Text
                    style={[
                      styles.cardBalanceAmount,
                      selectedCard.balance < 0 && styles.negativeBalanceText,
                    ]}
                  >
                    S/ {selectedCard.balance.toFixed(2)}
                  </Text>
                </View>

                {isBlockedDebt ? (
                  <View style={styles.debtCallout}>
                    <AlertCircleIcon size={16} color={Theme.colors.primary.pink} />
                    <Text style={styles.debtCalloutText}>
                      Esta tarjeta tiene deuda pendiente. Una recarga mayor a S/{' '}
                      {Math.abs(selectedCard.balance).toFixed(2)} la desbloqueará automáticamente.
                    </Text>
                  </View>
                ) : null}

                {isBlockedUnrecoverable ? (
                  <View style={styles.blockedCallout}>
                    <AlertCircleIcon size={16} color={Theme.colors.status.expense} />
                    <Text style={styles.blockedCalloutText}>
                      Bloqueo no recuperable ({selectedCard.cardStatus}). El sistema rechazará cualquier intento de recarga.
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.xl }]}>
            2. Monto a Recargar
          </Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>S/</Text>
            <TextInput
              testID="agent-recharge-amount-input"
              style={styles.amountInput}
              value={amountText}
              placeholder="0.00"
              placeholderTextColor="rgba(102, 102, 102, 0.4)"
              keyboardType="decimal-pad"
              onChangeText={(text) => {
                setAmountText(text.replace(/[^0-9.,]/g, ''));
                setErrorMessage(null);
              }}
            />
          </View>

          <View style={styles.quickAmountRow}>
            {QUICK_AMOUNTS.map((val) => {
              const isSelected = amountText === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickAmountPill,
                    isSelected && styles.quickAmountPillActive,
                  ]}
                  onPress={() => {
                    setAmountText(val);
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      isSelected && styles.quickAmountTextActive,
                    ]}
                  >
                    S/ {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.l }]}>
            3. Método de Cobro Recibido
          </Text>

          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentPill, isSelected && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod(method)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.paymentPillText,
                      isSelected && styles.paymentPillTextActive,
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedCard ? (
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nuevo saldo de tarjeta</Text>
                <Text style={styles.summaryValuePink}>S/ {projectedBalance.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tu cupo tras recarga</Text>
                <Text style={styles.summaryValueDark}>
                  S/ {Math.max(0, projectedAgentBalance).toFixed(2)}
                </Text>
              </View>
              {willUnlockDebt ? (
                <View style={styles.unlockBanner}>
                  <CheckCircleIcon size={15} color={Theme.colors.status.income} />
                  <Text style={styles.unlockBannerText}>
                    La tarjeta pasará automáticamente a estado ACTIVA.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner} testID="agent-recharge-error">
              <AlertCircleIcon size={18} color={Theme.colors.status.expense} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            testID="agent-recharge-submit-button"
            style={[
              styles.confirmButton,
              isBlockedUnrecoverable && styles.confirmButtonDark,
              isSubmitting && { opacity: 0.6 },
            ]}
            onPress={handleConfirmRecharge}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <>
                <WalletInIcon size={20} color={Theme.colors.background.white} />
                <Text style={styles.confirmButtonText}>
                  {isBlockedUnrecoverable
                    ? 'Validar Operación (Tarjeta Bloqueada)'
                    : `Confirmar Recarga S/ ${parsedAmount.toFixed(2)}`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={!!receiptTx}
        onClose={handleNewRecharge}
        title="Comprobante de Recarga"
      >
        {receiptTx ? (
          <View style={styles.receiptContainer}>
            <ScrollView
              contentContainerStyle={styles.receiptScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.receiptHero}>
                <View style={styles.receiptCheckCircle}>
                  <CheckCircleIcon size={34} color={Theme.colors.background.white} />
                </View>
                <Text style={styles.receiptTitle}>Recarga Acreditada</Text>
                <Text style={styles.receiptAmount}>+ S/ {receiptTx.amount.toFixed(2)}</Text>
                <View style={styles.receiptStatusPill}>
                  <Text style={styles.receiptStatusText}>{receiptTx.status}</Text>
                </View>
              </View>

              <View style={styles.receiptDetailsCard}>
                <View style={styles.receiptRow}>
                  <View style={styles.receiptRefLabel}>
                    <BarcodeIcon size={16} color={Theme.colors.primary.pink} />
                    <Text style={styles.receiptLabel}>Código de Transacción</Text>
                  </View>
                  <Text style={styles.receiptValueBold}>{receiptTx.referenceCode}</Text>
                </View>
                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Tarjeta</Text>
                  <Text style={styles.receiptValue}>
                    {receiptTx.cardId} — {receiptTx.cardHolder}
                  </Text>
                </View>
                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Nuevo saldo del viajero</Text>
                  <Text style={styles.receiptValuePink}>
                    S/ {(receiptTx.newBalance ?? 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cobro recibido</Text>
                  <Text style={styles.receiptValue}>{receiptTx.paymentMethod}</Text>
                </View>
                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Fecha y hora</Text>
                  <Text style={styles.receiptValue}>
                    {receiptTx.dateStr} • {receiptTx.timeStr}
                  </Text>
                </View>
              </View>

              {receiptTx.unlockedDebt ? (
                <View style={styles.receiptUnlockBox}>
                  <CheckCircleIcon size={18} color={Theme.colors.status.income} />
                  <Text style={styles.receiptUnlockText}>
                    Deuda saldada: la tarjeta fue removida de lista negra y activada.
                  </Text>
                </View>
              ) : null}

              <View style={styles.receiptActions}>
                <TouchableOpacity
                  style={styles.receiptPrimaryBtn}
                  onPress={handleNewRecharge}
                  activeOpacity={0.85}
                >
                  <Text style={styles.receiptPrimaryBtnText}>Nueva Recarga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.receiptSecondaryBtn}
                  onPress={() => {
                    setReceiptTx(null);
                    router.push('/(agent)/movimientos');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.receiptSecondaryBtnText}>Ver Movimientos</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  pinkBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: Theme.spacing.s,
  },
  pinkBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 1,
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
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.s,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Theme.spacing.m,
  },
  searchPillInput: {
    flex: 1,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    backgroundColor: Theme.colors.background.white,
    paddingHorizontal: Theme.spacing.l,
    justifyContent: 'center',
  },
  searchTextInput: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCardsSection: {
    marginBottom: Theme.spacing.m,
  },
  helperLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    marginBottom: 8,
  },
  quickCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCardPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
  },
  quickCardPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  quickCardPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
  },
  quickCardPillTextActive: {
    color: Theme.colors.background.white,
  },
  cardPreviewBox: {
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardMedium,
    overflow: 'hidden',
    marginTop: Theme.spacing.xs,
  },
  cardPreviewStripe: {
    height: 6,
    backgroundColor: Theme.colors.primary.pink,
    width: '100%',
  },
  cardPreviewInner: {
    padding: Theme.spacing.m,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
    gap: 8,
  },
  cardCodeBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  cardCodeBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    color: Theme.colors.background.white,
  },
  cardStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  cardStatusPillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },
  cardHolderName: {
    fontFamily: Theme.typography.family.black,
    fontSize: 17,
    color: Theme.colors.background.white,
  },
  cardSubMeta: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: '#cccccc',
    marginTop: 2,
    marginBottom: Theme.spacing.m,
  },
  cardBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: Theme.spacing.s,
  },
  cardBalanceLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: '#cccccc',
  },
  cardBalanceAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.white,
  },
  negativeBalanceText: {
    color: Theme.colors.primary.pink,
  },
  debtCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 10,
    marginTop: Theme.spacing.m,
  },
  debtCalloutText: {
    flex: 1,
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.white,
    lineHeight: 16,
  },
  blockedCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2b1216',
    borderRadius: 12,
    padding: 10,
    marginTop: Theme.spacing.m,
  },
  blockedCalloutText: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.white,
    lineHeight: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  currencySymbol: {
    fontFamily: Theme.typography.family.black,
    fontSize: 44,
    color: Theme.colors.background.dark,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: Theme.typography.family.black,
    fontSize: 44,
    color: Theme.colors.background.dark,
    padding: 0,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Theme.spacing.m,
  },
  quickAmountPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
  },
  quickAmountPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  quickAmountText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  quickAmountTextActive: {
    color: Theme.colors.background.white,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.l,
  },
  paymentPill: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
  },
  paymentPillActive: {
    borderColor: Theme.colors.primary.pink,
    backgroundColor: Theme.colors.primary.pink,
  },
  paymentPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  paymentPillTextActive: {
    color: Theme.colors.background.white,
  },
  summaryBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  summaryValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.pink,
  },
  summaryValueDark: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.ui.inputBorder,
  },
  unlockBannerText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.status.income,
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffecec',
    borderRadius: Theme.borderRadius.cardSmall,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.expense,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Theme.colors.primary.pink,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    marginTop: Theme.spacing.s,
  },
  confirmButtonDark: {
    backgroundColor: Theme.colors.background.dark,
  },
  confirmButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  bottomSpacer: {
    height: 110,
  },
  receiptContainer: {
    flex: 1,
  },
  receiptScroll: {
    padding: Theme.spacing.l,
    paddingBottom: 40,
  },
  receiptHero: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  receiptCheckCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.status.income,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  receiptTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  receiptAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 32,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.s,
  },
  receiptStatusPill: {
    backgroundColor: Theme.colors.status.income,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  receiptStatusText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
    textTransform: 'uppercase',
  },
  receiptDetailsCard: {
    borderWidth: 1,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.cardMedium,
    paddingHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  receiptRow: {
    paddingVertical: 12,
  },
  receiptRefLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  receiptLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginBottom: 2,
  },
  receiptValue: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  receiptValueBold: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  receiptValuePink: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.pink,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  receiptUnlockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  receiptUnlockText: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.income,
  },
  receiptActions: {
    gap: 10,
    marginTop: Theme.spacing.s,
  },
  receiptPrimaryBtn: {
    backgroundColor: Theme.colors.primary.pink,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPrimaryBtnText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  receiptSecondaryBtn: {
    backgroundColor: Theme.colors.background.dark,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptSecondaryBtnText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.white,
  },
});
