import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Theme } from '@/constants/theme';
import { TranqiCard } from '@presentation/components/TranqiCard';
import { BalanceContainer } from '@presentation/components/BalanceContainer';
import { OtherCardItem } from '@presentation/components/OtherCardItem';
import { PlusIcon, HamburgerIcon } from '@presentation/components/icons';

export default function HomeScreen() {
  const [cards] = useState([
    { id: '01HB', name: 'Joaquin', fareType: 'Escolar', balance: 20.12 },
    { id: '05BB', name: 'Simple', fareType: 'General', balance: 1.10 }
  ]);

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton}>
        <HamburgerIcon size={24} color={Theme.colors.background.white} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>III</Text>
        </View>
        <Text style={styles.logoText}>Tranqi</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <Header />
        </SafeAreaView>
      </View>
      
      <View style={styles.mainContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Section */}
          <TranqiCard 
            id="AS89" 
            type="Predeterminada" 
          />
          
          <BalanceContainer 
            cardId="AS89"
            balance={50.23}
            fareType="Universitaria"
            updatedText="Actualizado hoy"
            onRecharge={() => {}}
            onSettings={() => {}}
          />

          {/* Other Cards Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Otras Tarjetas</Text>
            
            <View style={styles.cardsList}>
              {cards.map(card => (
                <OtherCardItem 
                  key={card.id}
                  id={card.id}
                  name={card.name}
                  fareType={card.fareType}
                  balance={card.balance}
                  onPress={() => {}}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Ver Mas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.newCardButton}>
              <PlusIcon size={20} color={Theme.colors.background.dark} />
              <Text style={styles.newCardText}>Nueva Tarjeta</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits Section Placeholder */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Beneficios</Text>
          </View>
          
          {/* Spacer for Bottom Tab */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  blackBackground: {
    backgroundColor: Theme.colors.background.dark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
  },
  menuButton: {
    padding: Theme.spacing.s,
    marginLeft: -Theme.spacing.s,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginRight: 24, // to balance the menu icon
  },
  logoIcon: {
    width: 24,
    height: 24,
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  logoText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.white,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
  },
  sectionContainer: {
    marginTop: Theme.spacing.xxl,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.l,
  },
  cardsList: {
    width: '100%',
    marginBottom: Theme.spacing.m,
  },
  linkButton: {
    padding: Theme.spacing.s,
    marginBottom: Theme.spacing.l,
  },
  linkText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.primary.blue,
    textDecorationLine: 'underline',
  },
  newCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
  },
  newCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  bottomSpacer: {
    height: 100, // For bottom tab
  }
});
