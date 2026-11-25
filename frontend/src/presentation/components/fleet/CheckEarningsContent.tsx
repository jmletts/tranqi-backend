import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import { SearchIcon, BusFrontIcon } from '@presentation/components/icons';
import { useFleetStore } from '@presentation/state/useFleetStore';
import { FleetEarnings } from '@domain/models/Fleet';

interface CheckEarningsContentProps {
  onClose: () => void;
}

export const CheckEarningsContent = ({ onClose }: CheckEarningsContentProps) => {
  const buses = useFleetStore((state) => state.buses);
  const fetchEarningsByPlate = useFleetStore((state) => state.fetchEarningsByPlate);
  const getEarningsByPlate = useFleetStore((state) => state.getEarningsByPlate);

  const [plateQuery, setPlateQuery] = useState(buses[0]?.licensePlate || '');
  const [result, setResult] = useState<FleetEarnings | null>(
    buses[0] ? getEarningsByPlate(buses[0].licensePlate) : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (explicitPlate?: string) => {
    const query = (explicitPlate ?? plateQuery).trim().toUpperCase();
    setErrorMessage(null);

    if (!query) {
      setResult(null);
      setErrorMessage('Ingresa una placa para consultar sus ganancias.');
      return;
    }

    setLoading(true);
    try {
      const found = await fetchEarningsByPlate(query);
      setResult(found);
    } catch (err) {
      setResult(null);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `No se encontraron ganancias registradas para la placa ${query}.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.leadText}>
          Consulta el total recaudado por placa según los viajes procesados (GET /api/v1/fleet/buses/{'{licensePlate}'}/earnings).
        </Text>

        <PillInputField
          label="Placa del Bus"
          value={plateQuery}
          onChangeText={(val) => {
            setPlateQuery(val.toUpperCase());
            setErrorMessage(null);
          }}
          placeholder="Ej. ABC-123"
          autoCapitalize="characters"
          icon={<SearchIcon size={18} color={Theme.colors.background.white} />}
          iconBgColor={Theme.colors.primary.blue}
        />

        {/* Quick selection chips */}
        <Text style={styles.chipsLabel}>Placas registradas:</Text>
        <View style={styles.chipsRow}>
          {buses.map((bus) => {
            const active = plateQuery.toUpperCase() === bus.licensePlate;
            return (
              <TouchableOpacity
                key={bus.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setPlateQuery(bus.licensePlate);
                  handleSearch(bus.licensePlate);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {bus.licensePlate}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconBox}>
                <BusFrontIcon size={22} color={Theme.colors.background.white} />
              </View>
              <View>
                <Text style={styles.resultLabel}>Placa Consultada</Text>
                <Text style={styles.resultPlate}>{result.licensePlate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.earningsLabel}>Ganancia Total Acumulada</Text>
            <Text style={styles.earningsValue}>S/ {result.totalEarnings.toFixed(2)}</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingBottomActions
        primaryTitle={loading ? 'Consultando...' : 'Consultar Ganancias'}
        onPrimaryPress={() => handleSearch()}
        onClosePress={onClose}
        primaryButtonColor={Theme.colors.primary.blue}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.l,
    paddingBottom: 120,
  },
  leadText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.l,
  },
  chipsLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.s,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.l,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
  },
  chipActive: {
    backgroundColor: Theme.colors.primary.blue,
    borderColor: Theme.colors.primary.blue,
  },
  chipText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  chipTextActive: {
    color: Theme.colors.background.white,
  },
  errorBox: {
    backgroundColor: '#fdecec',
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.status.expense,
    marginBottom: Theme.spacing.m,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.expense,
  },
  resultCard: {
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIconBox: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.cardSmall,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.white,
    opacity: 0.8,
  },
  resultPlate: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Theme.spacing.m,
  },
  earningsLabel: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.background.white,
    opacity: 0.85,
    marginBottom: 4,
  },
  earningsValue: {
    fontFamily: Theme.typography.family.black,
    fontSize: 34,
    color: Theme.colors.background.white,
  },
  bottomSpacer: {
    height: 30,
  },
});
