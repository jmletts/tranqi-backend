import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Theme } from '@/constants/theme';
interface NotificationsContentProps {
  onClose: () => void;
}

export const NotificationsContent = ({ onClose }: NotificationsContentProps) => {
  const [pushGeneral, setPushGeneral] = useState(true);
  const [tripAlerts, setTripAlerts] = useState(true);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [promotionsAlert, setPromotionsAlert] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const NotificationSwitchItem = ({
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
  }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemTextContainer}>
        <View style={styles.titleBadgeRow}>
          <Text style={styles.itemTitle}>{title}</Text>
          {value ? (
            <View style={styles.blueBadge}>
              <Text style={styles.blueBadgeText}>ACEPTADO</Text>
            </View>
          ) : (
            <View style={styles.disabledBadge}>
              <Text style={styles.disabledBadgeText}>NO ACEPTADO</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
        <Text style={[styles.choiceLabel, value ? styles.choiceActive : styles.choiceInactive]}>
          Interruptor: {value ? 'Aceptar (Activo)' : 'No aceptar (Inactivo)'}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e5e5', true: Theme.colors.primary.blue }}
        thumbColor={value ? Theme.colors.background.dark : '#ffffff'}
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header Badge in Tranqi Blue */}
      <View style={styles.topBadgeRow}>
        <View style={styles.blueHeaderBadge}>
          <Text style={styles.blueHeaderBadgeText}>ALERTAS ACTIVAS</Text>
        </View>
        <Text style={styles.topSubtitle}>Canales Push</Text>
      </View>

      <Text style={styles.description}>
        Configura qué avisos deseas permitir en tu teléfono. Usa el interruptor para elegir si aceptas o no aceptas cada tipo de notificación.
      </Text>

      {/* Notifications Items */}
      <View style={styles.listContainer}>
        <NotificationSwitchItem
          title="Notificaciones Push Generales"
          subtitle="Avisos sobre el estado general del servicio y actualizaciones importantes de la app."
          value={pushGeneral}
          onValueChange={setPushGeneral}
        />

        <NotificationSwitchItem
          title="Cobros de Pasaje y Viajes"
          subtitle="Confirmación instantánea al validar tu tarjeta en los buses y torniquetes."
          value={tripAlerts}
          onValueChange={setTripAlerts}
        />

        <NotificationSwitchItem
          title="Aviso de Saldo Bajo"
          subtitle="Te avisaremos con anticipación si tu saldo disponible es menor a S/ 5.00."
          value={lowBalanceAlert}
          onValueChange={setLowBalanceAlert}
        />

        <NotificationSwitchItem
          title="Promociones y Beneficios"
          subtitle="Campañas con saldo extra de regalo y descuentos en comercios aliados."
          value={promotionsAlert}
          onValueChange={setPromotionsAlert}
        />

        <NotificationSwitchItem
          title="Alertas de Seguridad"
          subtitle="Avisos prioritarios sobre inicios de sesión y cambios en tus credenciales."
          value={securityAlerts}
          onValueChange={setSecurityAlerts}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.l,
    paddingBottom: 60,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.m,
  },
  blueHeaderBadge: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueHeaderBadgeText: {
    color: Theme.colors.background.white,
    fontFamily: Theme.typography.family.black,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  topSubtitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 14,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.l,
  },
  listContainer: {
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  itemCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  itemSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  choiceLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
  },
  choiceActive: {
    color: Theme.colors.primary.blue,
  },
  choiceInactive: {
    color: Theme.colors.ui.textSecondary,
  },
  blueBadge: {
    backgroundColor: Theme.colors.primary.blue,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueBadgeText: {
    color: Theme.colors.background.white,
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  disabledBadge: {
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
  },
  disabledBadgeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 9,
    color: Theme.colors.ui.textSecondary,
  },
});
