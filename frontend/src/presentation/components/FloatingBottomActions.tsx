import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Theme } from '@/constants/theme';
import { CloseIcon } from '@presentation/components/icons';

interface FloatingBottomActionsProps {
  primaryTitle: string;
  onPrimaryPress: () => void;
  onClosePress: () => void;
  disabled?: boolean;
  primaryButtonColor?: string;
}

export const FloatingBottomActions = ({
  primaryTitle,
  onPrimaryPress,
  onClosePress,
  disabled,
  primaryButtonColor = Theme.colors.background.dark,
}: FloatingBottomActionsProps) => {
  return (
    <View style={styles.floatingBottomBar}>
      <TouchableOpacity
        style={[
          styles.floatingPrimaryButton,
          { backgroundColor: primaryButtonColor },
          disabled && { opacity: 0.6 },
        ]}
        onPress={onPrimaryPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={styles.floatingPrimaryText}>{primaryTitle}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.floatingCloseButton}
        onPress={onClosePress}
        activeOpacity={0.8}
        accessibilityLabel="Cerrar"
      >
        <CloseIcon size={22} color={Theme.colors.background.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 24,
    left: Theme.spacing.l,
    right: Theme.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  floatingPrimaryButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingPrimaryText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.white,
  },
  floatingCloseButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
