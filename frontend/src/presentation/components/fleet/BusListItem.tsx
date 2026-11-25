import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { BusFrontIcon, ChevronRightIcon } from '@presentation/components/icons';

interface BusListItemProps {
  licensePlate: string;
  hardwareId: string;
  totalEarnings: number;
  tripsCount: number;
  onPress: () => void;
  showDivider?: boolean;
}

export const BusListItem = ({
  licensePlate,
  hardwareId,
  totalEarnings,
  tripsCount,
  onPress,
  showDivider = true,
}: BusListItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, !showDivider && styles.noDivider]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconBox}>
          <BusFrontIcon size={24} color={Theme.colors.background.white} />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.plateText}>{licensePlate}</Text>
            <View style={styles.validatorBadge}>
              <Text style={styles.validatorBadgeText}>ESP32 ACTIVO</Text>
            </View>
          </View>

          <Text style={styles.earningsText}>S/ {totalEarnings.toFixed(2)}</Text>

          <Text style={styles.metaText} numberOfLines={1}>
            HW: {hardwareId} • {tripsCount} {tripsCount === 1 ? 'viaje' : 'viajes'}
          </Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  noDivider: {
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: Theme.borderRadius.cardSmall,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  plateText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  validatorBadge: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
  },
  validatorBadgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 9,
    color: Theme.colors.background.white,
    letterSpacing: 0.4,
  },
  earningsText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.blue,
    marginBottom: 2,
  },
  metaText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },
  chevronContainer: {
    paddingLeft: Theme.spacing.s,
  },
});
