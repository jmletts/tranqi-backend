import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import { NfcIcon } from './icons';

interface TranqiCardProps {
  id: string;
  type?: 'Predeterminada' | 'Secundaria';
  title?: string;
  isVirtual?: boolean;
}

export const TranqiCard = ({ 
  id, 
  type = 'Predeterminada', 
  title = 'Tarjeta Integrada de\nTransporte Urbano de Cusco'
}: TranqiCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardLeft}>
        <View style={styles.logoRow}>
          {/* Logo Placeholder */}
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>III</Text>
          </View>
          <Text style={styles.logoText}>Tranqi</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>{type}</Text>
        </View>
        <View style={styles.nfcContainer}>
          <NfcIcon size={32} color={Theme.colors.background.dark} />
          <Text style={styles.nfcText}>Un toque y listo.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 180,
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: -40, // Pulls the blue container up to overlap
    zIndex: 2,
  },
  cardLeft: {
    flex: 2,
    padding: Theme.spacing.l,
    justifyContent: 'space-between',
  },
  cardRight: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    padding: Theme.spacing.m,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.dark,
  },
  logoText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
  },
  cardInfo: {
    marginTop: 'auto',
  },
  cardTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  pillBadge: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginRight: -10, // Adjust to edge
    marginTop: -10,
  },
  pillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.primary.yellow,
  },
  nfcContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
    transform: [{ rotate: '-90deg' }],
    width: 100,
    position: 'absolute',
    right: -30,
    top: 80,
  }
});
