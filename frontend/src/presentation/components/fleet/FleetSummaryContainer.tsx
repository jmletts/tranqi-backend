import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { PlusIcon, RefreshIcon } from '@presentation/components/icons';

interface FleetSummaryContainerProps {
  totalEarnings: number;
  busCount: number;
  processedTripsCount: number;
  onRegisterBus: () => void;
  onViewMovements: () => void;
}

export const FleetSummaryContainer = ({
  totalEarnings,
  busCount,
  processedTripsCount,
  onRegisterBus,
  onViewMovements,
}: FleetSummaryContainerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Recaudación Total de Flota:</Text>
        <View style={styles.darkPillBadge}>
          <Text style={styles.darkPillBadgeText}>GESTOR FLOTA</Text>
        </View>
      </View>

      <Text style={styles.balance}>S/ {totalEarnings.toFixed(2)}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {busCount} {busCount === 1 ? 'bus registrado' : 'buses registrados'}
        </Text>
        <Text style={styles.infoText}>
          {processedTripsCount} {processedTripsCount === 1 ? 'viaje cobrado' : 'viajes cobrados'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          testID="fleet-summary-register-bus"
          style={styles.pillButton}
          onPress={onRegisterBus}
          activeOpacity={0.85}
        >
          <PlusIcon size={16} color={Theme.colors.background.white} />
          <Text style={styles.buttonText}>Registrar Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="fleet-summary-view-movements"
          style={styles.pillButton}
          onPress={onViewMovements}
          activeOpacity={0.85}
        >
          <RefreshIcon size={16} color={Theme.colors.background.white} />
          <Text style={styles.buttonText}>Movimientos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontFamily: Theme.typography.family.medium,
    color: Theme.colors.background.white,
    fontSize: 13,
  },
  darkPillBadge: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
  },
  darkPillBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.6,
  },
  balance: {
    fontFamily: Theme.typography.family.black,
    color: Theme.colors.background.white,
    fontSize: 40,
    marginBottom: Theme.spacing.s,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xl,
  },
  infoText: {
    fontFamily: Theme.typography.family.medium,
    color: Theme.colors.background.white,
    fontSize: 12,
    opacity: 0.85,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Theme.spacing.s,
    justifyContent: 'space-between',
  },
  pillButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.s,
    borderRadius: Theme.borderRadius.pill,
    gap: 8,
  },
  buttonText: {
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.background.white,
    fontSize: 12,
  },
});
