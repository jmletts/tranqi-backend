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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  ChevronLeftIcon,
  CloseIcon,
  BusFrontIcon,
  CpuIcon,
  KeyIcon,
  RefreshIcon,
  ChevronRightIcon,
} from '@presentation/components/icons';
import { useFleetStore } from '@presentation/state/useFleetStore';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

const formatTimestamp = (iso: string): string => {
  const [datePart, timePart] = iso.split('T');
  if (!datePart) return iso;
  const [yyyy, mm, dd] = datePart.split('-');
  const shortTime = timePart ? timePart.slice(0, 5) : '';
  return `${dd}/${mm}/${yyyy} • ${shortTime}`;
};

export default function TransporterBusDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ licensePlate?: string }>();

  const buses = useFleetStore((state) => state.buses);
  const earningsByPlate = useFleetStore((state) => state.earningsByPlate);
  const trips = useFleetStore((state) => state.trips);
  const isSubmitting = useFleetStore((state) => state.isSubmitting);
  const fetchDashboard = useFleetStore((state) => state.fetchDashboard);
  const syncTripBatch = useFleetStore((state) => state.syncTripBatch);

  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  useEffect(() => {
    if (buses.length === 0) {
      fetchDashboard();
    }
  }, [buses.length, fetchDashboard]);

  const bus =
    buses.find((b) => b.licensePlate === params.licensePlate) ?? buses[0];

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(transportista)/inicio');
    }
  };

  if (!bus) {
    return null;
  }

  const earnings = earningsByPlate[bus.licensePlate]?.totalEarnings ?? bus.totalEarnings ?? 0;
  const busTrips = trips.filter((t) => t.licensePlate === bus.licensePlate);
  const processedCount = busTrips.filter(
    (t) => t.processingStatus === 'PROCESSED'
  ).length;

  const handleSimulateBusBatch = async () => {
    if (isSubmitting) return;
    try {
      const res = await syncTripBatch(bus.licensePlate);
      setBatchMessage(
        `Lote sincronizado en PostgreSQL: ${res.successful} viajes exitosos, ${res.duplicates} duplicados.`
      );
      useTravelerStore.getState().refreshAll().catch(() => {});
    } catch (err) {
      setBatchMessage(
        err instanceof Error ? err.message : 'No se pudo sincronizar el lote de viajes.'
      );
    }
  };

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
            <Text style={styles.headerTitle}>Detalle de Bus</Text>
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
          {/* Blue Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrapper}>
              <BusFrontIcon size={32} color={Theme.colors.background.white} />
            </View>
            <Text style={styles.heroPlate}>{bus.licensePlate}</Text>
            <Text style={styles.heroEarnings}>S/ {earnings.toFixed(2)}</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {processedCount} {processedCount === 1 ? 'VIAJE PROCESADO' : 'VIAJES PROCESADOS'}
              </Text>
            </View>
          </View>

          {/* Validator Crypto & Hardware Info (Bus Aggregate) */}
          <Text style={styles.sectionHeading}>Datos del Validador ESP32</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <BusFrontIcon size={15} color={Theme.colors.primary.blue} />
                <Text style={styles.detailLabel}>Placa (licensePlate)</Text>
              </View>
              <Text style={styles.detailValueBold}>{bus.licensePlate}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <CpuIcon size={15} color={Theme.colors.primary.blue} />
                <Text style={styles.detailLabel}>Hardware ID (hardwareId)</Text>
              </View>
              <Text style={styles.detailValueBold}>{bus.hardwareId}</Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.detailRow}>
              <View style={styles.labelWithIcon}>
                <KeyIcon size={15} color={Theme.colors.primary.blue} />
                <Text style={styles.detailLabel}>Clave Pública ECDSA (publicKey)</Text>
              </View>
              <Text style={styles.detailValueMono} selectable>
                {bus.publicKey}
              </Text>
            </View>
          </View>

          {/* Simulate Batch Action */}
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={handleSimulateBusBatch}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <RefreshIcon size={16} color={Theme.colors.background.white} />
            <Text style={styles.simulateButtonText}>
              {isSubmitting
                ? 'Sincronizando lote...'
                : `Simular Lote de Viajes para ${bus.licensePlate}`}
            </Text>
          </TouchableOpacity>

          {batchMessage ? (
            <Text style={styles.batchMessage}>{batchMessage}</Text>
          ) : null}

          {/* Trips for this bus */}
          <Text style={styles.sectionHeading}>
            Viajes de esta Unidad ({busTrips.length})
          </Text>

          {busTrips.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Este bus aún no registra viajes sincronizados.
              </Text>
            </View>
          ) : (
            <View style={styles.tripsCard}>
              {busTrips.map((trip, index) => {
                const isDuplicate = trip.processingStatus === 'DISCARDED_DUPLICATE';
                return (
                  <TouchableOpacity
                    key={trip.tripId}
                    style={[
                      styles.tripRow,
                      index === busTrips.length - 1 && styles.noBorder,
                    ]}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({
                        pathname: '/transportista-trip-detail',
                        params: { tripId: trip.tripId },
                      })
                    }
                  >
                    <View style={styles.tripLeft}>
                      <Text style={styles.tripId}>{trip.tripId}</Text>
                      <Text style={styles.tripMeta}>
                        Tarjeta {trip.cardId} • {formatTimestamp(trip.localTimestamp)}
                      </Text>
                    </View>
                    <View style={styles.tripRight}>
                      <Text
                        style={[
                          styles.tripFare,
                          isDuplicate && styles.tripFareMuted,
                        ]}
                      >
                        {isDuplicate ? 'DUPLICADO' : `+ S/ ${trip.fare.toFixed(2)}`}
                      </Text>
                      <ChevronRightIcon size={16} color={Theme.colors.ui.textSecondary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.closeActionButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.closeActionButtonText}>Volver a Flota</Text>
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
    paddingBottom: Theme.spacing.xl,
  },
  heroCard: {
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  heroIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.cardMedium,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  heroPlate: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.white,
    marginBottom: 4,
  },
  heroEarnings: {
    fontFamily: Theme.typography.family.black,
    fontSize: 36,
    color: Theme.colors.background.white,
    marginBottom: Theme.spacing.m,
  },
  heroPill: {
    backgroundColor: Theme.colors.background.dark,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.pill,
  },
  heroPillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
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
    paddingVertical: Theme.spacing.xs,
    marginBottom: Theme.spacing.l,
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
  },
  detailValueMono: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.background.dark,
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
  },
  simulateButton: {
    backgroundColor: Theme.colors.primary.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: Theme.spacing.s,
  },
  simulateButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  batchMessage: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
  },
  emptyCard: {
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
  tripsCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    paddingHorizontal: Theme.spacing.m,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  tripLeft: {
    flex: 1,
    marginRight: 8,
  },
  tripId: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
    marginBottom: 2,
  },
  tripMeta: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  tripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripFare: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.primary.blue,
  },
  tripFareMuted: {
    color: Theme.colors.ui.textSecondary,
    fontSize: 10,
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
