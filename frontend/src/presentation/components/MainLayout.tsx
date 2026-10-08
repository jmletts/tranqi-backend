import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/constants/theme';

interface MainLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  headerContent?: React.ReactNode;
}

export const MainLayout = ({ children, backgroundColor = Theme.colors.background.white, headerContent }: MainLayoutProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Black Header Area */}
      <View style={styles.header}>
        {headerContent}
      </View>
      
      {/* Asymmetric Curved Container */}
      <View style={[styles.curvedContainer, { backgroundColor }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  header: {
    backgroundColor: Theme.colors.background.dark,
    padding: Theme.spacing.l,
    minHeight: 120, // Enough space to show the logo
    justifyContent: 'center',
    alignItems: 'center',
  },
  curvedContainer: {
    flex: 1,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    borderTopRightRadius: 0,
    overflow: 'hidden',
    padding: Theme.spacing.l,
  }
});
