import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { Theme } from '@/constants/theme';

interface PillInputFieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  iconBgColor?: string;
  iconBackgroundColor?: string;
  error?: string;
}

export const PillInputField = ({
  label,
  icon,
  rightElement,
  containerStyle,
  iconBgColor,
  iconBackgroundColor,
  error,
  editable = true,
  style,
  ...rest
}: PillInputFieldProps) => {
  const resolvedIconBg = iconBgColor ?? iconBackgroundColor ?? Theme.colors.primary.yellow;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.pillContainer,
          !editable && styles.disabledContainer,
          error ? styles.errorContainer : null,
        ]}
      >
        {icon && (
          <View style={[styles.iconCircle, { backgroundColor: resolvedIconBg }]}>
            {icon}
          </View>
        )}
        <View style={styles.inputBody}>
          <Text style={styles.miniLabel}>{label}</Text>
          <TextInput
            style={[styles.textInput, style]}
            editable={editable}
            placeholderTextColor={Theme.colors.ui.textSecondary}
            {...rest}
          />
        </View>
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Theme.spacing.m,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 62,
  },
  disabledContainer: {
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    borderColor: Theme.colors.status.expense,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputBody: {
    flex: 1,
    justifyContent: 'center',
  },
  miniLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  textInput: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.dark,
    padding: 0,
    margin: 0,
  },
  rightElement: {
    marginLeft: 8,
  },
  errorText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.status.expense,
    marginTop: 5,
    marginLeft: 16,
  },
});
