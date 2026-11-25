import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';

interface OperationButtonProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  backgroundColor?: string;
}

export const OperationButton = ({
  title,
  icon,
  onPress,
  backgroundColor = Theme.colors.primary.yellow,
}: OperationButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        {icon}
      </View>
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '25%', // 4 items per row
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  titleText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    lineHeight: 14,
  }
});
