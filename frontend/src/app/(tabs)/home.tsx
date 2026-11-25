import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { TranqiCard } from '@presentation/components/TranqiCard';
import { BalanceContainer } from '@presentation/components/BalanceContainer';
import { OtherCardItem } from '@presentation/components/OtherCardItem';
import { PlusIcon } from '@presentation/components/icons';
import { useTravelerStore } from '@presentation/state/useTravelerStore';
import { formatCardStatusLabel } from '@domain/models/Traveler';

export default function HomeScreen() {
  const router = useRouter();
  const cards = useTravelerStore((state) => state.cards);
  const isLoadingCards = useTravelerStore((state) => state.isLoadingCards);
  const error = useTravelerStore((state) => state.error);
  const lastUpdatedAt = useTravelerStore((state) => state.lastUpdatedAt);
  const fetchCards = useTravelerStore((state) => state.fetchCards);
  const fetchMovements = useTravelerStore((state) => state.fetchMovements);
  const selectCard = useTravelerStore((state) => state.selectCard);

  useEffect(() => {
    fetchCards().catch(() => {});
    fetchMovements().catch(() => {});
  }, [fetchCards, fetchMovements]);

  const handleRefresh = useCallback(() => {
    fetchCards().catch(() => {});
    fetchMovements().catch(() => {});
  }, [fetchCards, fetchMovements]);

  const primaryCard = cards.find((c) => c.isDefault) || cards[0] || null;
  const otherCards = primaryCard ? cards.filter((c) => c.cardId !== primaryCard.cardId) : [];

  const openCardDetail = (cardId: string) => {
    selectCard(cardId);
    router.push({ pathname: '/card-detail', params: { cardId } });
  };

  const openRecharge = (cardId: string) => {
    selectCard(cardId);
    router.push({ pathname: '/recharge', params: { cardId } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoadingCards} onRefresh={handleRefresh} />
          }
        >
          {isLoadingCards && cards.length === 0 ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
              <Text style={styles.centerText}>Cargando tus tarjetas...</Text>
            </View>
          ) : error && cards.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : primaryCard ? (
            <>
              {/* Main Card Section */}
              <TranqiCard
                id={primaryCard.cardId}
                type={
                  primaryCard.cardStatus === 'ACTIVE'
                    ? primaryCard.name || 'Predeterminada'
                    : formatCardStatusLabel(primaryCard.cardStatus)
                }
              />

              <BalanceContainer
                cardId={primaryCard.cardId}
                balance={primaryCard.balance}
                fareType={primaryCard.fareType}
                updatedText={lastUpdatedAt || 'Actualizado hoy'}
                onRecharge={() => openRecharge(primaryCard.cardId)}
                onSettings={() => openCardDetail(primaryCard.cardId)}
              />

              {/* Other Cards Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Otras Tarjetas</Text>

                {otherCards.length > 0 ? (
                  <View style={styles.cardsList}>
                    {otherCards.map((card) => (
                      <OtherCardItem
                        key={card.cardId}
                        id={card.cardId}
                        name={card.name}
                        fareType={card.fareType}
                        balance={card.balance}
                        onPress={() => openCardDetail(card.cardId)}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptySubtitle}>
                    Aún no tienes tarjetas adicionales vinculadas.
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => openCardDetail(primaryCard.cardId)}
                >
                  <Text style={styles.linkText}>Ver Más</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.newCardButton}
                  onPress={() => router.push('/add-card')}
                >
                  <PlusIcon size={20} color={Theme.colors.background.dark} />
                  <Text style={styles.newCardText}>Nueva Tarjeta</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.centerBox}>
              <Text style={styles.sectionTitle}>Sin tarjetas vinculadas</Text>
              <Text style={styles.emptySubtitle}>
                Vincula tu primera tarjeta física Tranqi para consultar tu saldo, ver movimientos y transferir fondos.
              </Text>
              <TouchableOpacity
                style={[styles.newCardButton, { marginTop: Theme.spacing.l }]}
                onPress={() => router.push('/add-card')}
              >
                <PlusIcon size={20} color={Theme.colors.background.dark} />
                <Text style={styles.newCardText}>Vincular Tarjeta</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Spacer for Bottom Tab */}
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
    borderTopLeftRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    flexGrow: 1,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 14,
    color: Theme.colors.ui.textSecondary,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.status.expense,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Theme.colors.background.dark,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  sectionContainer: {
    marginTop: Theme.spacing.xxl,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.l,
  },
  emptySubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
  },
  cardsList: {
    width: '100%',
    marginBottom: Theme.spacing.m,
  },
  linkButton: {
    padding: Theme.spacing.s,
    marginBottom: Theme.spacing.l,
  },
  linkText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
    textDecorationLine: 'underline',
  },
  newCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
  },
  newCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  bottomSpacer: {
    height: 100,
  },
});
