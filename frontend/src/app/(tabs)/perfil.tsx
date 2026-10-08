import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Image } from 'react-native';
import { Theme } from '@/constants/theme';
import { HamburgerIcon, LockIcon, ChevronRightIcon, BusFrontIcon, MapPinIcon } from '@presentation/components/icons';

export default function ProfileScreen() {
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

  const ConfigItem = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <TouchableOpacity style={styles.configItemRow}>
      <View style={styles.iconWrapper}>
        <LockIcon size={20} color={Theme.colors.background.dark} />
      </View>
      <View style={styles.configTextWrapper}>
        <Text style={styles.configItemTitle}>{title}</Text>
        <Text style={styles.configItemSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
    </TouchableOpacity>
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
          {/* Profile Details */}
          <View style={styles.profileHeaderSection}>
            <Text style={styles.screenTitle}>Tu Perfil</Text>
            
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Tranqi Pass</Text>
            </View>

            <View style={styles.avatarBorder}>
              {/* Using a placeholder view for the avatar. Real image goes here. */}
              <View style={styles.avatarImagePlaceholder} />
            </View>

            <Text style={styles.userNameText}>Ali Brayan{'\n'}Romero Ezziel</Text>
            <Text style={styles.userRoleText}>Estudiante</Text>
          </View>

          {/* Action Cards */}
          <View style={styles.actionCardsRow}>
            <TouchableOpacity style={styles.actionCard}>
              <BusFrontIcon size={24} color={Theme.colors.background.white} />
              <Text style={styles.actionCardText}>Soy un{'\n'}Transportista</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MapPinIcon size={24} color={Theme.colors.background.white} />
              <Text style={styles.actionCardText}>Soy un{'\n'}Agente</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Lists */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Configuracion</Text>
            <ConfigItem title="Editar mis datos" subtitle="Contraseñas y datos sensibles." />
            <ConfigItem title="Seguridad de la cuenta" subtitle="Contraseñas y datos sensibles." />
            <ConfigItem title="Actualizar o cambiar tarifa" subtitle="Contraseñas y datos sensibles." />
            <ConfigItem title="Metodos de pago" subtitle="Contraseñas y datos sensibles." />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferencias</Text>
            <ConfigItem title="Administrar Notificaciones" subtitle="Contraseñas y datos sensibles." />
          </View>

          {/* Spacer for Floating Tab */}
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
    marginRight: 24,
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
    alignItems: 'center', // Center content horizontally
  },
  profileHeaderSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
    width: '100%',
  },
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
  },
  badgeContainer: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: Theme.spacing.l,
  },
  badgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.white,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary.blue, // Just a placeholder border effect like design
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
    borderWidth: 4,
    borderColor: Theme.colors.background.dark,
    // Add extra offset border as in design:
    borderLeftColor: Theme.colors.primary.pink,
    borderBottomColor: Theme.colors.primary.blue,
  },
  avatarImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 36,
    backgroundColor: Theme.colors.ui.textSecondary,
  },
  userNameText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  userRoleText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.ui.textSecondary,
  },
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.m,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    justifyContent: 'center',
  },
  actionCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.white,
    marginTop: Theme.spacing.s,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: Theme.spacing.l,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.m,
  },
  configItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  configTextWrapper: {
    flex: 1,
  },
  configItemTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.dark,
    marginBottom: 2,
  },
  configItemSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  }
});
