import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import { ChevronRightIcon, WalletInIcon, BusFrontIcon } from './icons';

interface MovementItemProps {
  type: 'income' | 'expense';
  title: string;
  amount: number;
  dateStr: string;
  cardId: string;
}

export const MovementItem = ({ type, title, amount, dateStr, cardId }: MovementItemProps) => {
  const isIncome = type === 'income';
  
  const iconBackgroundColor = isIncome ? Theme.colors.primary.blue : Theme.colors.status.expense;
  const IconComponent = isIncome ? WalletInIcon : BusFrontIcon;
  const amountColor = isIncome ? Theme.colors.primary.blue : Theme.colors.status.expense;
  const prefix = isIncome ? '+' : '-';

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <IconComponent size={24} color={Theme.colors.background.white} />
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <View style={styles.dot} />
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {prefix} S/ {amount.toFixed(2)}
        </Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        <ChevronRightIcon size={20} color={Theme.colors.ui.textSecondary} />
        <Text style={styles.cardIdText}>{cardId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.status.income,
    marginRight: 6,
  },
  titleText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  amountText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: '#a0a0a0', // Lighter gray for date
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  cardIdText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: '#a0a0a0',
  }
});
