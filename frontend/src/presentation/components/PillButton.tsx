import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Theme } from '@/constants/theme';

interface PillButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'dark' | 'outline';
  loading?: boolean;
}

export const PillButton = ({ title, variant = 'dark', loading, style, ...rest }: PillButtonProps) => {
  const isDark = variant === 'dark';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isDark ? styles.darkButton : styles.outlineButton,
        style
      ]} 
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? Theme.colors.background.white : Theme.colors.background.dark} />
      ) : (
        <Text style={[
          styles.text,
          isDark ? styles.darkText : styles.outlineText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  darkButton: {
    backgroundColor: Theme.colors.background.dark,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.background.dark,
  },
  text: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
  },
  darkText: {
    color: Theme.colors.background.white,
  },
  outlineText: {
    color: Theme.colors.background.dark,
  }
});
