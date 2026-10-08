import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { ChevronRightIcon } from './icons';

interface OtherCardItemProps {
  id: string;
  name: string;
  fareType: string;
  balance: number;
  onPress: () => void;
}

export const OtherCardItem = ({ id, name, fareType, balance, onPress }: OtherCardItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        {/* Placeholder for small card icon */}
        <View style={styles.smallCard}>
          <View style={styles.chip} />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.idText}>{id}</Text>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{fareType}</Text>
          </View>
        </View>
        <Text style={styles.balanceText}>S/ {balance.toFixed(2)}</Text>
        <Text style={styles.subText}>Saldo Disponible</Text>
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
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  smallCard: {
    width: 24,
    height: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    borderRadius: 4,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  chip: {
    width: 6,
    height: 4,
    borderWidth: 1,
    borderColor: Theme.colors.background.dark,
    borderRadius: 1,
  },
  infoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  idText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    opacity: 0.5,
  },
  nameText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  badge: {
    backgroundColor: Theme.colors.primary.yellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 8,
    color: Theme.colors.background.dark,
  },
  balanceText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  subText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.background.dark,
  },
  chevronContainer: {
    paddingLeft: Theme.spacing.s,
  }
});
