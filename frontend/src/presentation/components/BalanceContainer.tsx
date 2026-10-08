import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { RefreshIcon, SettingsIcon } from './icons';

interface BalanceContainerProps {
  cardId: string;
  balance: number;
  fareType: string;
  updatedText: string;
  onRecharge: () => void;
  onSettings: () => void;
}

export const BalanceContainer = ({
  cardId,
  balance,
  fareType,
  updatedText,
  onRecharge,
  onSettings
}: BalanceContainerProps) => {
  return (
    <View style={styles.container}>
      {/* Spacer to push content down because of overlapping card */}
      <View style={{ height: 60 }} /> 
      
      <View style={styles.headerRow}>
        <Text style={styles.label}>Saldo de Tarjeta:</Text>
        <Text style={styles.cardId}>{cardId}</Text>
      </View>
      
      <Text style={styles.balance}>
        S/ {balance.toFixed(2)}
      </Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Tarifa: {fareType}</Text>
        <Text style={styles.infoText}>{updatedText}</Text>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.pillButton} onPress={onRecharge}>
          <RefreshIcon size={16} color={Theme.colors.background.white} />
          <Text style={styles.buttonText}>Recargar Tarjeta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pillButton} onPress={onSettings}>
          <SettingsIcon size={16} color={Theme.colors.background.white} />
          <Text style={styles.buttonText}>Ajustes de tarjeta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.primary.blue,
    borderRadius: 24,
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.m,
    zIndex: 1,
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
    fontSize: 14,
  },
  cardId: {
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.background.white,
    fontSize: 14,
    opacity: 0.5,
  },
  balance: {
    fontFamily: Theme.typography.family.black,
    color: Theme.colors.background.white,
    fontSize: 40,
    marginBottom: Theme.spacing.m,
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
    opacity: 0.8,
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
    borderRadius: 30,
    gap: 8,
  },
  buttonText: {
    fontFamily: Theme.typography.family.bold,
    color: Theme.colors.background.white,
    fontSize: 12,
  }
});
