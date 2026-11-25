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
  TextInput,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { ChevronLeftIcon, CloseIcon } from '@presentation/components/icons';
import { TranqiCardItem } from '@presentation/components/TranqiCardItem';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

export default function RechargeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cardId?: string }>();

  const cards = useTravelerStore((state) => state.cards);
  const storeSelectedCardId = useTravelerStore((state) => state.selectedCardId);
  const isLoadingCards = useTravelerStore((state) => state.isLoadingCards);
  const isSubmitting = useTravelerStore((state) => state.isSubmitting);
  const fetchCards = useTravelerStore((state) => state.fetchCards);
  const rechargeCard = useTravelerStore((state) => state.rechargeCard);

  const [selectedCardId, setSelectedCardId] = useState<string>(
    params.cardId || storeSelectedCardId || cards[0]?.cardId || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const quickAmounts = ['5.00', '10.00', '20.00', '50.00'];

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards().catch(() => {});
    }
  }, [cards.length, fetchCards]);

  useEffect(() => {
    if (params.cardId) {
      setSelectedCardId(params.cardId);
    } else if (!selectedCardId && cards.length > 0) {
      setSelectedCardId(cards[0].cardId);
    }
  }, [params.cardId, cards, selectedCardId]);

  const selectedCard = cards.find((c) => c.cardId === selectedCardId) || cards[0] || null;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleConfirmRecharge = async () => {
    setFeedbackError(null);
    if (!selectedCard) {
      setFeedbackError('Selecciona una tarjeta para recargar.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFeedbackError('Ingresa un monto válido mayor a S/ 0.00.');
      return;
    }
    if (numericAmount > 100) {
      setFeedbackError('El monto máximo por recarga es de S/ 100.00.');
      return;
    }

    try {
      await rechargeCard({
        cardId: selectedCard.cardId,
        amount: Number(numericAmount.toFixed(2)),
      });
      Alert.alert(
        'Recarga confirmada',
        `Se acreditaron S/ ${numericAmount.toFixed(2)} en la tarjeta ${selectedCard.cardId}.`
      );
      handleGoBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo completar la recarga';
      setFeedbackError(msg);
      Alert.alert('Error en recarga', msg);
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

            <Text style={styles.headerTitle}>Recargar Tarjeta</Text>

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
          </View>
        ) : !selectedCard ? (
          <View style={styles.centerBox}>
            <Text style={styles.descriptionText}>No tienes tarjetas vinculadas para recargar.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Seleccionar tarjeta:</Text>

            <TranqiCardItem
              cardId={selectedCard.cardId}
              name={selectedCard.name}
              fareType={selectedCard.fareType}
              balance={selectedCard.balance}
              cards={cards}
              selectedCardId={selectedCard.cardId}
              onSelectCard={(card) => {
                setSelectedCardId(card.cardId);
                setFeedbackError(null);
              }}
              rightAction="refresh"
              modalTitle="Seleccionar Tarjeta a Recargar"
            />

            <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.xl }]}>
              Moneda y Monto:
            </Text>

            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>S/</Text>
              <TextInput
                testID="recharge-amount-input"
                style={styles.amountInput}
                value={amount}
                placeholder="0.00"
                placeholderTextColor="rgba(102, 102, 102, 0.4)"
                keyboardType="decimal-pad"
                onChangeText={(text) => {
                  setAmount(text);
                  setFeedbackError(null);
                }}
              />
            </View>

            <View style={styles.quickAmountRow}>
              {quickAmounts.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickAmountPill,
                    amount === val && styles.quickAmountPillActive,
                  ]}
                  onPress={() => {
                    setAmount(val);
                    setFeedbackError(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === val && styles.quickAmountTextActive,
                    ]}
                  >
                    S/ {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {feedbackError ? (
              <Text style={styles.errorText}>{feedbackError}</Text>
            ) : (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  Tu recarga será acreditada de forma inmediata en tu cuenta y quedará registrada en tus movimientos (límite máximo S/ 100.00).
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            testID="recharge-confirm-button"
            style={[
              styles.confirmButton,
              (isSubmitting || !selectedCard) && styles.confirmButtonDisabled,
            ]}
            disabled={isSubmitting || !selectedCard}
            onPress={handleConfirmRecharge}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelRoundButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
            accessibilityLabel="Cerrar"
          >
            <CloseIcon size={20} color={Theme.colors.background.white} />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  scrollContent: {
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.xl,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.s,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.s,
  },
  currencySymbol: {
    fontFamily: Theme.typography.family.black,
    fontSize: 48,
    color: Theme.colors.background.dark,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: Theme.typography.family.black,
    fontSize: 48,
    color: Theme.colors.background.dark,
    padding: 0,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  quickAmountPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background.white,
  },
  quickAmountPillActive: {
    borderColor: Theme.colors.background.dark,
    backgroundColor: Theme.colors.primary.yellow,
  },
  quickAmountText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  quickAmountTextActive: {
    fontFamily: Theme.typography.family.black,
    color: Theme.colors.background.dark,
  },
  descriptionBox: {
    marginTop: Theme.spacing.m,
    paddingHorizontal: 2,
  },
  descriptionText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 18,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.status.expense,
    marginTop: Theme.spacing.m,
  },
  bottomActions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : Theme.spacing.l,
    left: Theme.spacing.l,
    right: Theme.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.m,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.white,
  },
  cancelRoundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
