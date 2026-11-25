import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Theme } from '@/constants/theme';
import { HamburgerIcon, LogoTranqiInvertido } from './icons';

interface ScreenHeaderProps {
  onMenuPress?: () => void;
  modeBadge?: string;
  badgeColor?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onMenuPress,
  modeBadge,
  badgeColor = Theme.colors.primary.pink,
}) => {
  return (
    <View style={styles.blackBackground}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Menú principal"
          >
            <HamburgerIcon size={24} color={Theme.colors.background.white} />
          </TouchableOpacity>
          <View style={[styles.logoContainer, !modeBadge && styles.logoBalanced]}>
            <LogoTranqiInvertido width={135} height={27} />
          </View>
          {modeBadge ? (
            <View style={[styles.modeBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.modeBadgeText}>{modeBadge}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  blackBackground: {
    backgroundColor: Theme.colors.background.dark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
  },
  menuButton: {
    padding: Theme.spacing.s,
    marginLeft: -Theme.spacing.s,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBalanced: {
    marginRight: 24, // Para equilibrar el ícono del menú a la izquierda
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  modeBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
