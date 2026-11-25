import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useFleetStore } from '@presentation/state/useFleetStore';
import { useTravelerStore } from '@presentation/state/useTravelerStore';
import { OperationButton } from '@presentation/components/OperationButton';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import { RegisterBusContent } from '@presentation/components/fleet/RegisterBusContent';
import { CheckEarningsContent } from '@presentation/components/fleet/CheckEarningsContent';
import {
  BusFrontIcon,
  PlusIcon,
  SearchIcon,
  RefreshIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from '@presentation/components/icons';
import { FleetTrip } from '@domain/models/Fleet';

type MovementsModalType = 'register_bus' | 'check_earnings' | null;

const formatTimestamp = (iso: string): string => {
  const [datePart, timePart] = iso.split('T');
  if (!datePart) return iso;
  const [yyyy, mm, dd] = datePart.split('-');
  const shortTime = timePart ? timePart.slice(0, 5) : '';
  return `${dd}/${mm}/${yyyy?.slice(2) ?? ''} • ${shortTime}`;
};

export default function TransporterMovimientosScreen() {
  const router = useRouter();
  const buses = useFleetStore((state) => state.buses);
  const trips = useFleetStore((state) => state.trips);
  const isLoadingDashboard = useFleetStore((state) => state.isLoadingDashboard);
  const isSubmitting = useFleetStore((state) => state.isSubmitting);
  const fetchDashboard = useFleetStore((state) => state.fetchDashboard);
  const syncTripBatch = useFleetStore((state) => state.syncTripBatch);
  const syncBlacklist = useFleetStore((state) => state.syncBlacklist);

  const [selectedPlate, setSelectedPlate] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<MovementsModalType>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const filteredTrips =
    selectedPlate === 'ALL'
      ? trips
      : trips.filter((t) => t.licensePlate === selectedPlate);

  const handleSimulateBatch = async () => {
    if (isSubmitting) return;
    try {
      const targetPlate = selectedPlate === 'ALL' ? undefined : selectedPlate;
      const ack = await syncTripBatch(targetPlate);
      setFeedbackBanner(
        `Lote procesado en backend: ${ack.successful} exitosos, ${ack.duplicates} duplicados, ${ack.errors} errores.`
      );
      useTravelerStore.getState().refreshAll().catch(() => {});
    } catch (err) {
      setFeedbackBanner(
        err instanceof Error ? err.message : 'No se pudo procesar el lote de viajes.'
      );
    }
  };

  const handleSyncBlacklist = async () => {
    try {
      const res = await syncBlacklist(false);
      setFeedbackBanner(
        `Lista negra sincronizada a versión v${res.newVersion} (${res.cards.length} tarjetas).`
      );
    } catch (err) {
      setFeedbackBanner(
        err instanceof Error ? err.message : 'No se pudo sincronizar la lista negra.'
      );
    }
  };

  const operations = [
    {
      title: 'Registrar\nBus',
      icon: <PlusIcon size={24} color={Theme.colors.background.white} />,
      onPress: () => setActiveModal('register_bus'),
    },
    {
      title: 'Consultar\nGanancias',
      icon: <SearchIcon size={24} color={Theme.colors.background.white} />,
      onPress: () => setActiveModal('check_earnings'),
    },
    {
      title: 'Simular\nLote',
      icon: <RefreshIcon size={24} color={Theme.colors.background.white} />,
      onPress: handleSimulateBatch,
    },
    {
      title: 'Lista\nNegra',
      icon: <ShieldCheckIcon size={24} color={Theme.colors.background.white} />,
      onPress: handleSyncBlacklist,
    },
  ];

  const renderTripRow = (trip: FleetTrip) => {
    const isDuplicate = trip.processingStatus === 'DISCARDED_DUPLICATE';
    const isDebtReview = trip.requiresDebtReview;

    const iconBg = isDuplicate
      ? Theme.colors.ui.textSecondary
      : isDebtReview
      ? Theme.colors.status.expense
      : Theme.colors.primary.blue;

    const amountColor = isDuplicate
      ? Theme.colors.ui.textSecondary
      : Theme.colors.primary.blue;

    return (
      <TouchableOpacity
        key={trip.tripId}
        style={styles.tripRow}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname: '/transportista-trip-detail',
            params: { tripId: trip.tripId },
          })
        }
      >
        <View style={[styles.tripIconBox, { backgroundColor: iconBg }]}>
          <BusFrontIcon size={24} color={Theme.colors.background.white} />
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripTitleRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isDuplicate
                    ? Theme.colors.ui.textSecondary
                    : isDebtReview
                    ? Theme.colors.status.expense
                    : Theme.colors.status.income,
                },
              ]}
            />
            <Text style={styles.tripTitle}>
              Bus {trip.licensePlate} • {trip.tripId}
            </Text>
          </View>

          <Text style={[styles.tripAmount, { color: amountColor }]}>
            {isDuplicate ? 'S/ 0.00 (Duplicado)' : `+ S/ ${trip.fare.toFixed(2)}`}
          </Text>

          <Text style={styles.tripDate}>
            {formatTimestamp(trip.localTimestamp)}
            {isDebtReview ? ' • Revisión deuda' : ''}
          </Text>
        </View>

        <View style={styles.tripRight}>
          <ChevronRightIcon size={20} color={Theme.colors.ui.textSecondary} />
          <Text style={styles.cardIdText}>{trip.cardId}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingDashboard}
              onRefresh={fetchDashboard}
              tintColor={Theme.colors.primary.blue}
            />
          }
        >
          {/* Operations Section */}
          <Text style={styles.sectionTitle}>Operaciones</Text>
          <View style={styles.operationsGrid}>
            {operations.map((op, idx) => (
              <OperationButton
                key={idx}
                title={op.title}
                icon={op.icon}
                backgroundColor={Theme.colors.primary.blue}
                onPress={op.onPress}
              />
            ))}
          </View>

          {feedbackBanner ? (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedbackBanner}</Text>
            </View>
          ) : null}

          {/* Movements Section */}
          <View style={styles.movementsHeader}>
            <Text style={styles.sectionTitle}>Movimientos de Flota</Text>
            <Text style={styles.descriptionText}>
              Viajes sincronizados en lotes desde los validadores ESP32. Los viajes duplicados se descartan automáticamente por idempotencia.
            </Text>
          </View>

          {/* Plate Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedPlate === 'ALL' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedPlate('ALL')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedPlate === 'ALL' && styles.filterChipTextActive,
                ]}
              >
                Todos ({trips.length})
              </Text>
            </TouchableOpacity>

            {buses.map((bus) => {
              const active = selectedPlate === bus.licensePlate;
              return (
                <TouchableOpacity
                  key={bus.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedPlate(bus.licensePlate)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {bus.licensePlate}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.movementsList}>
            {filteredTrips.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Sin viajes sincronizados</Text>
                <Text style={styles.emptySub}>
                  Usa "Simular Lote" para generar viajes de prueba en esta placa.
                </Text>
              </View>
            ) : (
              filteredTrips.map(renderTripRow)
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'register_bus'
            ? 'Registrar Nuevo Bus'
            : 'Consultar Ganancias por Placa'
        }
      >
        {activeModal === 'register_bus' ? (
          <RegisterBusContent onClose={() => setActiveModal(null)} />
        ) : activeModal === 'check_earnings' ? (
          <CheckEarningsContent onClose={() => setActiveModal(null)} />
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
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.s,
  },
  feedbackBanner: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary.blue,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  feedbackText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
  },
  movementsHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  descriptionText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.m,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primary.blue,
    borderColor: Theme.colors.primary.blue,
  },
  filterChipText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  filterChipTextActive: {
    color: Theme.colors.background.white,
  },
  movementsList: {
    width: '100%',
  },
  tripRow: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
    alignItems: 'center',
  },
  tripIconBox: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.cardSmall,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  tripDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  tripTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tripTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  tripAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    marginBottom: 4,
  },
  tripDate: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: '#a0a0a0',
  },
  tripRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  cardIdText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#a0a0a0',
  },
  emptyBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 110,
  },
});
