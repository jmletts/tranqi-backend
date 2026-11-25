import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  ChevronLeftIcon,
  CloseIcon,
  WalletInIcon,
  BusFrontIcon,
  CheckCircleIcon,
  BarcodeIcon,
} from '@presentation/components/icons';
import { useTravelerStore } from '@presentation/state/useTravelerStore';
import { useAuthStore } from '@presentation/state/useAuthStore';

export default function MovementDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const movements = useTravelerStore((state) => state.movements);
  const isLoadingMovements = useTravelerStore((state) => state.isLoadingMovements);
  const fetchMovements = useTravelerStore((state) => state.fetchMovements);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (movements.length === 0) {
      fetchMovements().catch(() => {});
    }
  }, [movements.length, fetchMovements]);

  const detail = params.id
    ? movements.find((m) => m.identifier === params.id || m.id === params.id)
    : movements[0];

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/movimientos');
    }
  };

  if (isLoadingMovements && !detail) {
    return (
      <View style={styles.container}>
        <View style={styles.blackBackground}>
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalle de Movimiento</Text>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <CloseIcon size={24} color={Theme.colors.background.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <View style={[styles.mainContainer, styles.centerBox]}>
          <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
        </View>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.container}>
        <View style={styles.blackBackground}>
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalle de Movimiento</Text>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <CloseIcon size={24} color={Theme.colors.background.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <View style={[styles.mainContainer, styles.centerBox]}>
          <Text style={styles.emptyText}>No se encontró el movimiento solicitado.</Text>
        </View>
      </View>
    );
  }

  const isIncome = detail.type === 'income';
  const headerTitle =
    detail.rawType === 'RECARGA'
      ? 'Detalle de Recarga'
      : detail.rawType.startsWith('TRANSFERENCIA')
      ? 'Detalle de Transferencia'
      : 'Detalle de Viaje';
  const prefix = isIncome ? '+' : '-';
  const accentColor = isIncome ? Theme.colors.primary.blue : Theme.colors.status.expense;
  const IconComponent = isIncome ? WalletInIcon : BusFrontIcon;

  const operationTypeLabel =
    detail.rawType === 'RECARGA'
      ? 'Recarga de saldo'
      : detail.rawType === 'TRANSFERENCIA_ENVIADA'
      ? 'Transferencia entre tarjetas (enviada)'
      : detail.rawType === 'TRANSFERENCIA_RECIBIDA'
      ? 'Transferencia entre tarjetas (recibida)'
      : 'Cobro de pasaje';

  return (
    <View style={styles.container}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton} activeOpacity={0.7}>
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton} activeOpacity={0.7}>
              <CloseIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={[styles.iconWrapper, { backgroundColor: accentColor }]}>
              <IconComponent size={32} color={Theme.colors.background.white} />
            </View>

            <Text style={styles.heroTitle}>{detail.title}</Text>

            <View style={styles.amountRow}>
              <Text style={[styles.amountText, { color: accentColor }]}>
                {prefix} S/ {detail.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.statusPill}>
              <CheckCircleIcon size={14} color={Theme.colors.background.dark} />
              <Text style={styles.statusText}>{detail.status}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Información de la Operación</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <BarcodeIcon size={16} color={Theme.colors.background.dark} />
                <Text style={styles.detailLabel}>Código de referencia</Text>
              </View>
              <Text style={styles.detailValueBold}>{detail.identifier}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha y hora</Text>
              <Text style={styles.detailValue}>
                {detail.dateStr} • {detail.timeStr}
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo de operación</Text>
              <Text style={styles.detailValue}>{operationTypeLabel}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción</Text>
              <Text style={styles.detailValue}>{detail.detail}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Tarjeta Asociada</Text>

          <View style={styles.cardInfoBox}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{detail.cardId}</Text>
            </View>
            <View style={styles.cardInfoContent}>
              <Text style={styles.cardHolderText}>
                {detail.cardAlias} {user?.name ? `• ${user.name}` : ''}
              </Text>
              <Text style={styles.cardFareText}>Tarifa {detail.fareType}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.closeActionButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.closeActionButtonText}>Volver a Movimientos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelRoundButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
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
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 14,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.l,
  },
  heroCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.cardMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  heroTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  amountText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 32,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d632',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Theme.borderRadius.pill,
    gap: 8,
  },
  statusText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
    letterSpacing: 0.3,
  },
  sectionHeading: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  detailsCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 1,
    borderColor: Theme.colors.ui.inputBorder,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.xl,
  },
  detailRow: {
    paddingVertical: Theme.spacing.m,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  detailValueBold: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  cardInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  cardBadge: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: 8,
    marginRight: Theme.spacing.m,
  },
  cardBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.white,
  },
  cardInfoContent: {
    flex: 1,
  },
  cardHolderText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  cardFareText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.l,
    gap: Theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.l,
    backgroundColor: Theme.colors.background.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.ui.inputBorder,
  },
  closeActionButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeActionButtonText: {
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
