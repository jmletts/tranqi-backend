import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Theme } from '@/constants/theme';

interface TextInputPillProps extends TextInputProps {}

export const TextInputPill = (props: TextInputPillProps) => {
  return (
    <TextInput
      style={[styles.input, props.style]}
      placeholderTextColor={Theme.colors.ui.textSecondary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
    paddingHorizontal: Theme.spacing.l,
    fontFamily: Theme.typography.family.medium,
    fontSize: 16,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  }
});
