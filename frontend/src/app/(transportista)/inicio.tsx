import React, { useEffect, useState } from 'react';
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
import { useFleetStore } from '@presentation/state/useFleetStore';
import { FleetSummaryContainer } from '@presentation/components/fleet/FleetSummaryContainer';
import { BusListItem } from '@presentation/components/fleet/BusListItem';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import { RegisterBusContent } from '@presentation/components/fleet/RegisterBusContent';
import { PlusIcon, ChevronRightIcon } from '@presentation/components/icons';

export default function TransporterInicioScreen() {
  const router = useRouter();
  const buses = useFleetStore((state) => state.buses);
  const earningsByPlate = useFleetStore((state) => state.earningsByPlate);
  const trips = useFleetStore((state) => state.trips);
  const isLoadingDashboard = useFleetStore((state) => state.isLoadingDashboard);
  const fetchDashboard = useFleetStore((state) => state.fetchDashboard);

  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalEarnings = Object.values(earningsByPlate).reduce(
    (sum, item) => sum + item.totalEarnings,
    0
  );
  const processedTrips = trips.filter((t) => t.processingStatus === 'PROCESSED');

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
          {/* Blue Hero Summary Container */}
          <FleetSummaryContainer
            totalEarnings={totalEarnings}
            busCount={buses.length}
            processedTripsCount={processedTrips.length}
            onRegisterBus={() => setRegisterModalVisible(true)}
            onViewMovements={() => router.push('/(transportista)/movimientos')}
          />

          {/* Registered Buses & Earnings List */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Buses Registrados</Text>
              <TouchableOpacity
                onPress={() => router.push('/(transportista)/flota')}
                activeOpacity={0.75}
                style={styles.seeAllRow}
              >
                <Text style={styles.seeAllText}>Gestionar</Text>
                <ChevronRightIcon size={16} color={Theme.colors.primary.blue} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>
              Total recaudado por cada placa según viajes procesados por su validador ESP32.
            </Text>

            <View style={styles.busesList}>
              {isLoadingDashboard && buses.length === 0 ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator color={Theme.colors.primary.blue} />
                  <Text style={styles.loadingText}>Cargando flota...</Text>
                </View>
              ) : buses.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Sin buses registrados</Text>
                  <Text style={styles.emptySub}>
                    Registra tu primera unidad y validador ESP32 para empezar a recaudar.
                  </Text>
                </View>
              ) : (
                buses.map((bus, index) => {
                  const busEarnings =
                    earningsByPlate[bus.licensePlate]?.totalEarnings ?? bus.totalEarnings ?? 0;
                  const busTripsCount = processedTrips.filter(
                    (t) => t.licensePlate === bus.licensePlate
                  ).length;

                  return (
                    <BusListItem
                      key={bus.id}
                      licensePlate={bus.licensePlate}
                      hardwareId={bus.hardwareId}
                      totalEarnings={busEarnings}
                      tripsCount={busTripsCount}
                      showDivider={index < buses.length - 1}
                      onPress={() =>
                        router.push({
                          pathname: '/transportista-bus-detail',
                          params: { licensePlate: bus.licensePlate },
                        })
                      }
                    />
                  );
                })
              )}
            </View>

            <TouchableOpacity
              testID="inicio-register-bus-button"
              style={styles.newBusButton}
              onPress={() => setRegisterModalVisible(true)}
              activeOpacity={0.85}
            >
              <PlusIcon size={20} color={Theme.colors.primary.blue} />
              <Text style={styles.newBusText}>Registrar Nuevo Bus</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        title="Registrar Nuevo Bus"
      >
        <RegisterBusContent onClose={() => setRegisterModalVisible(false)} />
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
  sectionContainer: {
    marginTop: Theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
  },
  sectionSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 17,
    marginBottom: Theme.spacing.m,
  },
  busesList: {
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  loadingState: {
    paddingVertical: Theme.spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  emptyBox: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  newBusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary.blue,
    alignSelf: 'center',
  },
  newBusText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.primary.blue,
  },
  bottomSpacer: {
    height: 110,
  },
});
