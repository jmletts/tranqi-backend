import React, { useEffect, useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { ChevronLeftIcon, CloseIcon } from '@presentation/components/icons';
import { TranqiCardItem } from '@presentation/components/TranqiCardItem';
import { TravelerCard } from '@domain/models/Traveler';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

export default function TransferScreen() {
  const router = useRouter();
  const cards = useTravelerStore((state) => state.cards);
  const isLoadingCards = useTravelerStore((state) => state.isLoadingCards);
  const isSubmitting = useTravelerStore((state) => state.isSubmitting);
  const fetchCards = useTravelerStore((state) => state.fetchCards);
  const transferFunds = useTravelerStore((state) => state.transferFunds);

  const [sourceCardId, setSourceCardId] = useState<string>('');
  const [destinationCardId, setDestinationCardId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const quickAmounts = ['2.00', '5.00', '10.00', '20.00'];

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards().catch(() => {});
    }
  }, [cards.length, fetchCards]);

  useEffect(() => {
    if (cards.length >= 2) {
      if (!sourceCardId || !cards.some((c) => c.cardId === sourceCardId)) {
        setSourceCardId(cards[0].cardId);
      }
      if (!destinationCardId || !cards.some((c) => c.cardId === destinationCardId)) {
        setDestinationCardId(cards[1].cardId);
      }
    } else if (cards.length === 1 && !sourceCardId) {
      setSourceCardId(cards[0].cardId);
    }
  }, [cards, sourceCardId, destinationCardId]);

  const sourceCard: TravelerCard | undefined = cards.find((c) => c.cardId === sourceCardId) || cards[0];
  const destinationCard: TravelerCard | undefined =
    cards.find((c) => c.cardId === destinationCardId) || cards[1] || cards[0];

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleSelectSource = (card: TravelerCard) => {
    setSourceCardId(card.cardId);
    if (card.cardId === destinationCardId && cards.length >= 2) {
      const other = cards.find((c) => c.cardId !== card.cardId);
      if (other) setDestinationCardId(other.cardId);
    }
    setFeedbackError(null);
  };

  const handleSelectDestination = (card: TravelerCard) => {
    setDestinationCardId(card.cardId);
    if (card.cardId === sourceCardId && cards.length >= 2) {
      const other = cards.find((c) => c.cardId !== card.cardId);
      if (other) setSourceCardId(other.cardId);
    }
    setFeedbackError(null);
  };

  const handleTransfer = async () => {
    setFeedbackError(null);

    if (!sourceCard || !destinationCard || cards.length < 2) {
      setFeedbackError('Necesitas al menos 2 tarjetas vinculadas para transferir saldo.');
      return;
    }
    if (sourceCard.accountId === destinationCard.accountId) {
      setFeedbackError('La tarjeta de origen y destino deben ser diferentes.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFeedbackError('Ingresa un monto válido mayor a S/ 0.00.');
      return;
    }

    try {
      await transferFunds({
        originAccountId: sourceCard.accountId,
        destinationAccountId: destinationCard.accountId,
        amount: Number(numericAmount.toFixed(2)),
      });
      Alert.alert(
        'Transferencia exitosa',
        `Se transfirieron S/ ${numericAmount.toFixed(2)} desde ${sourceCard.cardId} hacia ${destinationCard.cardId}.`
      );
      handleGoBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo realizar la transferencia';
      setFeedbackError(msg);
      Alert.alert('Error en transferencia', msg);
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
            <Text style={styles.headerTitle}>Transferir Saldo</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <CloseIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        {isLoadingCards && cards.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
            <Text style={styles.infoText}>Cargando tus tarjetas...</Text>
          </View>
        ) : cards.length < 2 ? (
          <View style={styles.centerBox}>
            <Text style={styles.sectionTitle}>Se requieren 2 tarjetas</Text>
            <Text style={styles.infoText}>
              Las transferencias solo están habilitadas entre tus propias tarjetas vinculadas. Vincula una segunda tarjeta para transferir saldo.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Desde:</Text>
            {sourceCard && (
              <TranqiCardItem
                cardId={sourceCard.cardId}
                name={sourceCard.name}
                fareType={sourceCard.fareType}
                balance={sourceCard.balance}
                cards={cards}
                selectedCardId={sourceCard.cardId}
                onSelectCard={handleSelectSource}
                rightAction="refresh"
                modalTitle="Transferir Desde"
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.l }]}>Enviar a:</Text>
            {destinationCard && (
              <TranqiCardItem
                cardId={destinationCard.cardId}
                name={destinationCard.name}
                fareType={destinationCard.fareType}
                balance={destinationCard.balance}
                cards={cards}
                selectedCardId={destinationCard.cardId}
                onSelectCard={handleSelectDestination}
                rightAction="refresh"
                modalTitle="Enviar a"
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.l }]}>Moneda y Monto:</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>S/</Text>
              <TextInput
                testID="transfer-amount-input"
                style={styles.amountInput}
                value={amount}
                placeholder="0.00"
                placeholderTextColor="rgba(102, 102, 102, 0.45)"
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
                >
                  <Text style={styles.quickAmountText}>S/ {val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {feedbackError ? (
              <Text style={styles.errorText}>{feedbackError}</Text>
            ) : (
              <Text style={styles.helperText}>
                Solo puedes transferir saldo entre tus propias tarjetas vinculadas.
              </Text>
            )}
          </ScrollView>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            testID="transfer-submit-button"
            style={[
              styles.transferButton,
              (isSubmitting || cards.length < 2) && styles.transferButtonDisabled,
            ]}
            disabled={isSubmitting || cards.length < 2}
            onPress={handleTransfer}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <Text style={styles.transferButtonText}>Realizar Transferencia</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelRoundButton} onPress={handleGoBack}>
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
    paddingBottom: Theme.spacing.xl,
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
    borderTopLeftRadius: 40,
    overflow: 'hidden',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
    gap: 10,
  },
  infoText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.xl,
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
  helperText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: Theme.spacing.s,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.status.expense,
    marginTop: Theme.spacing.s,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.l,
    gap: Theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.l,
  },
  transferButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferButtonDisabled: {
    opacity: 0.5,
  },
  transferButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
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
