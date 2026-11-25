import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

interface TranqiCardProps {
  id?: string;
  type?: string;
  title?: string;
  isVirtual?: boolean;
}

export const TranqiCard = ({
  id,
  type = 'Predeterminada',
  title
}: TranqiCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardPlaceholder}>
        {/* Subtle card chip and accent lines for realistic static card */}
        <View style={styles.cardChip} />
        <View style={styles.cardAccentLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 300, // Tamaño estático y fijo (no responsive)
    height: 185,
    alignSelf: 'center',
    marginBottom: -52, // Superpuesto sobre el contenedor azul de saldo
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: '#b8b8b8',
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  cardChip: {
    width: 34,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#9e9e9e',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  cardAccentLine: {
    width: '50%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a8a8a8',
  },
});
