import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Theme } from '@/constants/theme';
import { OperationButton } from '@presentation/components/OperationButton';
import { MovementItem } from '@presentation/components/MovementItem';
import { HamburgerIcon, RefreshIcon, LockIcon, CardSmallIcon } from '@presentation/components/icons';

export default function MovimientosScreen() {
  const operations = [
    { title: 'Transferir\nSaldo', icon: <RefreshIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Bloquear\nTarjeta', icon: <LockIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Recargar\nTarjeta', icon: <RefreshIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Cambiar\nTarifa', icon: <CardSmallIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Tarjeta\nDigital', icon: <RefreshIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Registrar\nTarjeta', icon: <RefreshIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Sincronizar\nTarjeta', icon: <RefreshIcon size={24} color={Theme.colors.background.dark} /> },
    { title: 'Soporte\n', icon: <CardSmallIcon size={24} color={Theme.colors.background.dark} /> },
  ];

  const movements = [
    { id: 1, type: 'income', title: 'Recarga Fisica', amount: 20.12, dateStr: '20/05/26', cardId: '01HB' },
    { id: 2, type: 'expense', title: 'ET. Leon de San Jeronimo', amount: 0.60, dateStr: '20/05/26', cardId: '01HB' },
    { id: 3, type: 'expense', title: 'ET. Satelite', amount: 2.40, dateStr: '20/05/26', cardId: 'AS89' },
    { id: 4, type: 'expense', title: 'ET. Leon de San Jeronimo', amount: 0.60, dateStr: '19/05/26', cardId: '01HB' },
    { id: 5, type: 'income', title: 'Recarga Digital', amount: 15.00, dateStr: '17/05/26', cardId: 'AS89' },
    { id: 6, type: 'expense', title: 'ET. Leon de San Jeronimo', amount: 0.60, dateStr: '13/05/26', cardId: '01HB' },
  ] as const;

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
          {/* Operations Section */}
          <Text style={styles.sectionTitle}>Operaciones</Text>
          <View style={styles.operationsGrid}>
            {operations.map((op, idx) => (
              <OperationButton 
                key={idx}
                title={op.title}
                icon={op.icon}
                onPress={() => {}}
              />
            ))}
          </View>

          {/* Movements Section */}
          <View style={styles.movementsHeader}>
            <Text style={styles.sectionTitle}>Tus Movimientos</Text>
            <Text style={styles.descriptionText}>
              Los movimientos recientes pueden demorar hasta 6 horas en verse reflejados, dependiendo de la conexión y sincronización con el transporte elegido.
            </Text>
          </View>

          <View style={styles.movementsList}>
            {movements.map(mov => (
              <MovementItem
                key={mov.id}
                type={mov.type}
                title={mov.title}
                amount={mov.amount}
                dateStr={mov.dateStr}
                cardId={mov.cardId}
              />
            ))}
          </View>

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
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.l,
  },
  movementsHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  descriptionText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.m,
    lineHeight: 16,
  },
  movementsList: {
    width: '100%',
  },
  bottomSpacer: {
    height: 100, // For bottom tab
  }
});
