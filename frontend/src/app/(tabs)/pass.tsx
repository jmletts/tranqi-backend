import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Próximamente: pass</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
  },
  text: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 20,
    color: Theme.colors.background.dark,
  }
});
