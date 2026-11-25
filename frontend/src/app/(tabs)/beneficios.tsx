import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export default function BeneficiosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.content}>
          <Text style={styles.text}>Próximamente: Beneficios</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.l,
  },
  text: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 20,
    color: Theme.colors.background.dark,
  },
});
