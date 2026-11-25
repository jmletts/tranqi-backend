import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Theme } from '@/constants/theme';

interface TextInputPillProps extends TextInputProps {}

export const TextInputPill = (props: TextInputPillProps) => {
  return (
    <TextInput
      testID={props.testID}
      style={[styles.input, props.style]}
      placeholderTextColor={Theme.colors.ui.textSecondary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    backgroundColor: Theme.colors.background.white,
    paddingHorizontal: Theme.spacing.l,
    fontFamily: Theme.typography.family.medium,
    fontSize: 15,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  }
});
