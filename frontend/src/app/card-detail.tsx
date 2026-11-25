import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  ChevronLeftIcon,
  CloseIcon,
  RefreshIcon,
  WalletInIcon,
  BusFrontIcon,
  ChevronRightIcon,
} from '@presentation/components/icons';
import { TranqiCardItem } from '@presentation/components/TranqiCardItem';
import { useTravelerStore } from '@presentation/state/useTravelerStore';
import { formatCardStatusLabel } from '@domain/models/Traveler';

export default function CardDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cardId?: string }>();

  const cards = useTravelerStore((state) => state.cards);
  const movements = useTravelerStore((state) => state.movements);
  const storeSelectedCardId = useTravelerStore((state) => state.selectedCardId);
  const isLoadingCards = useTravelerStore((state) => state.isLoadingCards);
  const isSubmitting = useTravelerStore((state) => state.isSubmitting);
  const lastUpdatedAt = useTravelerStore((state) => state.lastUpdatedAt);
  const fetchCards = useTravelerStore((state) => state.fetchCards);
  const fetchMovements = useTravelerStore((state) => state.fetchMovements);
  const selectCard = useTravelerStore((state) => state.selectCard);
  const reportCardLost = useTravelerStore((state) => state.reportCardLost);

  const [activeCardId, setActiveCardId] = useState<string>(
    params.cardId || storeSelectedCardId || cards[0]?.cardId || ''
  );

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards().catch(() => {});
    }
    if (movements.length === 0) {
      fetchMovements().catch(() => {});
    }
  }, [cards.length, movements.length, fetchCards, fetchMovements]);

  useEffect(() => {
    if (params.cardId) {
      setActiveCardId(params.cardId);
      selectCard(params.cardId);
    } else if (!activeCardId && cards.length > 0) {
      setActiveCardId(cards[0].cardId);
    }
  }, [params.cardId, cards, activeCardId, selectCard]);

  const selectedCard = cards.find((c) => c.cardId === activeCardId) || cards[0] || null;
  const cardMovements = selectedCard
    ? movements.filter((m) => m.accountId === selectedCard.accountId || m.cardId === selectedCard.cardId)
    : [];

  const handleRefresh = async () => {
    await Promise.all([fetchCards(), fetchMovements()]).catch(() => {});
  };

  const handleBlockCard = () => {
    if (!selectedCard) return;
    if (selectedCard.cardStatus === 'LOST_REPORTED' || selectedCard.cardStatus === 'FRAUD_BLOCKED') {
      Alert.alert('Tarjeta bloqueada', `Esta tarjeta ya tiene estado: ${formatCardStatusLabel(selectedCard.cardStatus)}.`);
      return;
    }

    const executeBlock = async () => {
      try {
        await reportCardLost(selectedCard.cardId);
        Alert.alert('Tarjeta bloqueada', `La tarjeta ${selectedCard.cardId} fue reportada como perdida y bloqueada.`);
      } catch (err: unknown) {
        Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo bloquear la tarjeta');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        `¿Seguro que deseas bloquear permanentemente la tarjeta ${selectedCard.cardId} por pérdida?`
      );
      if (confirmed) {
        executeBlock();
      }
      return;
    }

    Alert.alert(
      'Bloquear tarjeta',
      `¿Seguro que deseas reportar la tarjeta ${selectedCard.cardId} como perdida? Esta acción es irreversible.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Bloquear', style: 'destructive', onPress: executeBlock },
      ]
    );
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => gestureState.dx > 25 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2,
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dx > 70 && gestureState.vx > 0.25) {
          handleGoBack();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
              accessibilityLabel="Volver"
            >
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Administrar Tarjetas</Text>

            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
              accessibilityLabel="Cerrar"
            >
              <CloseIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        {isLoadingCards && !selectedCard ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
            <Text style={styles.emptyText}>Cargando tarjetas...</Text>
          </View>
        ) : !selectedCard ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>No tienes tarjetas vinculadas.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.selectorSectionTitle}>Seleccionar tarjeta:</Text>

            <TranqiCardItem
              cardId={selectedCard.cardId}
              name={selectedCard.name}
              fareType={selectedCard.fareType}
              balance={selectedCard.balance}
              cards={cards}
              selectedCardId={selectedCard.cardId}
              onSelectCard={(pickedCard) => {
                setActiveCardId(pickedCard.cardId);
                selectCard(pickedCard.cardId);
              }}
              rightAction="refresh"
              showDivider={false}
            />

            <View style={styles.horizontalDivider} />

            <View style={styles.cardStageSection}>
              <View style={styles.grayCardWrapper}>
                <View style={styles.grayCardPlaceholder}>
                  <View style={styles.grayCardTopRow}>
                    <View style={styles.grayCardChip} />
                    <Text style={styles.grayCardStatusBadge}>
                      {formatCardStatusLabel(selectedCard.cardStatus)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.grayCardIdText}>{selectedCard.cardId}</Text>
                    {selectedCard.verificationNumber ? (
                      <Text style={styles.grayCardVerifText}>
                        N° {selectedCard.verificationNumber}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.blueBalanceBox}>
                <View style={styles.blueShadowZone} />

                <View style={styles.blueHeaderRow}>
                  <Text style={styles.blueBoxLabel}>Saldo de Tarjeta:</Text>
                  <Text style={styles.blueCardWatermark}>{selectedCard.cardId}</Text>
                </View>

                <Text style={styles.blueBoxAmount}>S/ {selectedCard.balance.toFixed(2)}</Text>

                <View style={styles.blueFareRow}>
                  <View style={styles.blueFarePill}>
                    <Text style={styles.blueFarePillText}>{selectedCard.fareType}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.blueRefreshPill}
                    activeOpacity={0.7}
                    onPress={handleRefresh}
                  >
                    <RefreshIcon size={14} color={Theme.colors.background.dark} />
                  </TouchableOpacity>
                  <Text style={styles.blueUpdatedText}>{lastUpdatedAt || 'Actualizado hoy'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.pillActionButton}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({ pathname: '/recharge', params: { cardId: selectedCard.cardId } })
                }
              >
                <RefreshIcon size={18} color={Theme.colors.background.white} />
                <Text style={styles.pillActionButtonText}>Recargar Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pillActionButton,
                  selectedCard.cardStatus !== 'ACTIVE' && styles.pillActionButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={isSubmitting || selectedCard.cardStatus !== 'ACTIVE'}
                onPress={handleBlockCard}
              >
                <RefreshIcon size={18} color={Theme.colors.background.white} />
                <Text style={styles.pillActionButtonText}>
                  {selectedCard.cardStatus === 'ACTIVE' ? 'Bloquear Tarjeta' : 'Bloqueada'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.movementsSectionHeader}>
              <Text style={styles.movementsTitle}>Movimientos de {selectedCard.name}</Text>
              <Text style={styles.movementsDescription}>
                Historial en tiempo real asociado a la tarjeta {selectedCard.cardId}.
              </Text>
            </View>

            {cardMovements.length === 0 ? (
              <View style={styles.emptyMovementsBox}>
                <Text style={styles.emptyText}>
                  Esta tarjeta aún no tiene movimientos registrados.
                </Text>
              </View>
            ) : (
              <View style={styles.movementsList}>
                {cardMovements.map((item) => {
                  const isIncome = item.type === 'income';
                  const iconBg = isIncome
                    ? Theme.colors.primary.blue
                    : Theme.colors.status.expense;
                  const amountColor = isIncome
                    ? Theme.colors.primary.blue
                    : Theme.colors.status.expense;
                  const prefix = isIncome ? '+' : '-';
                  const IconComp = isIncome ? WalletInIcon : BusFrontIcon;

                  return (
                    <TouchableOpacity
                      key={item.identifier}
                      style={styles.movementItemRow}
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push({
                          pathname: '/movement-detail',
                          params: { id: item.identifier },
                        })
                      }
                    >
                      <View style={[styles.movementIconBox, { backgroundColor: iconBg }]}>
                        <IconComp size={24} color={Theme.colors.background.white} />
                      </View>

                      <View style={styles.movementCenter}>
                        <View style={styles.movementTitleRow}>
                          <View style={styles.statusDot} />
                          <Text style={styles.movementTitleText}>{item.title}</Text>
                        </View>

                        <Text style={[styles.movementAmountText, { color: amountColor }]}>
                          {prefix} S/ {item.amount.toFixed(2)}
                        </Text>

                        <Text style={styles.movementDateText}>
                          {item.dateStr} • {item.timeStr}
                        </Text>
                      </View>

                      <View style={styles.movementRight}>
                        <ChevronRightIcon size={18} color={Theme.colors.ui.textSecondary} />
                        <Text style={styles.movementCardIdText}>{item.cardId}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}

        <View style={styles.floatingBottomBar} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.floatingCloseButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
            accessibilityLabel="Cerrar"
          >
            <CloseIcon size={22} color={Theme.colors.background.white} />
          </TouchableOpacity>
        </View>
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
    paddingBottom: Theme.spacing.l,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  emptyMovementsBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.l,
    paddingTop: Theme.spacing.l,
    paddingBottom: 110,
  },
  selectorSectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 17,
    color: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.m,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
    marginTop: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  cardStageSection: {
    marginBottom: Theme.spacing.l,
    alignItems: 'center',
    width: '100%',
  },
  grayCardWrapper: {
    width: 300,
    height: 185,
    alignSelf: 'center',
    zIndex: 10,
    marginBottom: -52,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  grayCardPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  grayCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grayCardChip: {
    width: 34,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#d4af37',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  grayCardStatusBadge: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.background.dark,
    backgroundColor: Theme.colors.primary.yellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  grayCardIdText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.white,
    letterSpacing: 1.5,
  },
  grayCardVerifText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  blueBalanceBox: {
    width: '100%',
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardLarge,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.l,
    paddingTop: 68,
    zIndex: 1,
  },
  blueShadowZone: {
    height: 6,
  },
  blueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  blueBoxLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  blueCardWatermark: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  blueBoxAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 36,
    color: Theme.colors.background.white,
    marginVertical: 4,
  },
  blueFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  blueFarePill: {
    backgroundColor: Theme.colors.primary.yellow,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  blueFarePillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
  },
  blueRefreshPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueUpdatedText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginLeft: 'auto',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.xl,
  },
  pillActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background.dark,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    gap: 8,
  },
  pillActionButtonDisabled: {
    opacity: 0.45,
  },
  pillActionButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  movementsSectionHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  movementsTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    marginBottom: 6,
  },
  movementsDescription: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Theme.spacing.s,
  },
  movementsList: {
    width: '100%',
  },
  movementItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  movementIconBox: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.cardSmall,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  movementCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  movementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.status.income,
    marginRight: 6,
  },
  movementTitleText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  movementAmountText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    marginBottom: 4,
  },
  movementDateText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: '#a0a0a0',
  },
  movementRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  movementCardIdText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: '#a0a0a0',
  },
  bottomSpacer: {
    height: 30,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 24,
    right: Theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCloseButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
