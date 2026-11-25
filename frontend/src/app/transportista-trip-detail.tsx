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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  ChevronLeftIcon,
  CloseIcon,
  BusFrontIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BarcodeIcon,
} from '@presentation/components/icons';
import { useFleetStore } from '@presentation/state/useFleetStore';

const STATUS_LABELS: Record<string, string> = {
  PROCESSED: 'Procesado',
  PENDING: 'Pendiente',
  DISCARDED_DUPLICATE: 'Duplicado Descartado',
};

export default function TransporterTripDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripId?: string }>();

  const trips = useFleetStore((state) => state.trips);
  const fetchDashboard = useFleetStore((state) => state.fetchDashboard);

  useEffect(() => {
    if (trips.length === 0) {
      fetchDashboard();
    }
  }, [trips.length, fetchDashboard]);

  const trip = trips.find((t) => t.tripId === params.tripId) ?? trips[0];

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(transportista)/movimientos');
    }
  };

  if (!trip) {
    return null;
  }

  const isDuplicate = trip.processingStatus === 'DISCARDED_DUPLICATE';
  const isDebtReview = trip.requiresDebtReview;
  const accentColor = isDuplicate
    ? Theme.colors.ui.textSecondary
    : isDebtReview
    ? Theme.colors.status.expense
    : Theme.colors.primary.blue;

  const [datePart, timePart] = trip.localTimestamp.split('T');
  const formattedDate = datePart
    ? `${datePart.split('-').reverse().join('/')} • ${(timePart || '').slice(0, 5)}`
    : trip.localTimestamp;

  return (
    <View style={styles.container}>
      {/* Black Header */}
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle de Viaje</Text>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <CloseIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Main White Asymmetric Container */}
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Summary */}
          <View style={styles.heroCard}>
            <View style={[styles.iconWrapper, { backgroundColor: accentColor }]}>
              <BusFrontIcon size={32} color={Theme.colors.background.white} />
            </View>

            <Text style={styles.heroTitle}>Bus {trip.licensePlate}</Text>

            <Text style={[styles.amountText, { color: accentColor }]}>
              {isDuplicate ? 'S/ 0.00' : `+ S/ ${trip.fare.toFixed(2)}`}
            </Text>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isDuplicate
                    ? Theme.colors.ui.textSecondary
                    : isDebtReview
                    ? Theme.colors.status.expense
                    : Theme.colors.primary.blue,
                },
              ]}
            >
              {isDebtReview || isDuplicate ? (
                <AlertCircleIcon size={14} color={Theme.colors.background.white} />
              ) : (
                <CheckCircleIcon size={14} color={Theme.colors.background.white} />
              )}
              <Text style={styles.statusText}>
                {STATUS_LABELS[trip.processingStatus] || trip.processingStatus}
              </Text>
            </View>
          </View>

          {/* Trip Model Details (Exact backend fields) */}
          <Text style={styles.sectionHeading}>Información del Registro (Trip)</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <BarcodeIcon size={16} color={Theme.colors.primary.blue} />
                <Text style={styles.detailLabel}>ID de Viaje (tripId)</Text>
              </View>
              <Text style={styles.detailValueBold}>{trip.tripId}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Marca de tiempo local (localTimestamp)</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tarjeta NFC (cardId)</Text>
              <Text style={styles.detailValue}>{trip.cardId}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Validador / Bus ID (busId)</Text>
              <Text style={styles.detailValue}>{trip.busId}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estado de Procesamiento</Text>
              <Text style={styles.detailValue}>{trip.processingStatus}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Revisión de Exceso de Deuda</Text>
              <Text
                style={[
                  styles.detailValue,
                  isDebtReview && { color: Theme.colors.status.expense },
                ]}
              >
                {isDebtReview ? 'Sí (requiresDebtReview)' : 'No'}
              </Text>
            </View>
          </View>

          {/* Associated Bus Box */}
          <Text style={styles.sectionHeading}>Unidad Asociada</Text>
          <TouchableOpacity
            style={styles.busInfoBox}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/transportista-bus-detail',
                params: { licensePlate: trip.licensePlate },
              })
            }
          >
            <View style={styles.busBadge}>
              <Text style={styles.busBadgeText}>{trip.licensePlate}</Text>
            </View>
            <View style={styles.busInfoContent}>
              <Text style={styles.busTitle}>Validador {trip.busId}</Text>
              <Text style={styles.busSub}>Toca para ver ganancias del bus</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Actions */}
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
  amountText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 32,
    marginBottom: Theme.spacing.m,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Theme.borderRadius.pill,
    gap: 8,
  },
  statusText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    color: Theme.colors.background.white,
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
  busInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  busBadge: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderRadius: 8,
    marginRight: Theme.spacing.m,
  },
  busBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.white,
  },
  busInfoContent: {
    flex: 1,
  },
  busTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.white,
  },
  busSub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.white,
    opacity: 0.85,
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
