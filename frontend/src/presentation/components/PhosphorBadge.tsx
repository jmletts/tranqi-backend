import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Theme } from '@/constants/theme';

interface PhosphorBadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'small' | 'medium';
}

export const PhosphorBadge = ({ label, style, textStyle, size = 'small' }: PhosphorBadgeProps) => {
  const isSmall = size === 'small';
  return (
    <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium, style]}>
      <Text style={[styles.text, isSmall ? styles.textSmall : styles.textMedium, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#00FF66',
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    color: '#010100',
    fontFamily: Theme.typography.family.black,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});
