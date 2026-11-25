import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { OperationButton } from '@presentation/components/OperationButton';
import { MovementItem } from '@presentation/components/MovementItem';
import { RefreshIcon, LockIcon, CardSmallIcon } from '@presentation/components/icons';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

export default function MovimientosScreen() {
  const router = useRouter();
  const movements = useTravelerStore((state) => state.movements);
  const isLoadingMovements = useTravelerStore((state) => state.isLoadingMovements);
  const error = useTravelerStore((state) => state.error);
  const fetchMovements = useTravelerStore((state) => state.fetchMovements);
  const refreshAll = useTravelerStore((state) => state.refreshAll);

  useEffect(() => {
    fetchMovements().catch(() => {});
  }, [fetchMovements]);

  const handleRefresh = useCallback(() => {
    refreshAll().catch(() => {});
  }, [refreshAll]);

  const operations = [
    {
      title: 'Transferir\nSaldo',
      icon: <RefreshIcon size={24} color={Theme.colors.background.dark} />,
      onPress: () => router.push('/transfer'),
    },
    {
      title: 'Bloquear\nTarjeta',
      icon: <LockIcon size={24} color={Theme.colors.background.dark} />,
      onPress: () => router.push('/card-detail'),
    },
    {
      title: 'Recargar\nTarjeta',
      icon: <RefreshIcon size={24} color={Theme.colors.background.dark} />,
      onPress: () => router.push('/recharge'),
    },
    {
      title: 'Administrar\nTarjetas',
      icon: <CardSmallIcon size={24} color={Theme.colors.background.dark} />,
      onPress: () => router.push('/card-detail'),
    },
    {
      title: 'Registrar\nTarjeta',
      icon: <RefreshIcon size={24} color={Theme.colors.background.dark} />,
      onPress: () => router.push('/add-card'),
    },
    {
      title: 'Sincronizar\nDatos',
      icon: <RefreshIcon size={24} color={Theme.colors.background.dark} />,
      onPress: async () => {
        try {
          await refreshAll();
          Alert.alert('Sincronizado', 'Saldos y movimientos actualizados desde el servidor.');
        } catch (err: unknown) {
          Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo sincronizar');
        }
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoadingMovements} onRefresh={handleRefresh} />
          }
        >
          {/* Operations Section */}
          <Text style={styles.sectionTitle}>Operaciones</Text>
          <View style={styles.operationsGrid}>
            {operations.map((op, idx) => (
              <OperationButton
                key={idx}
                title={op.title}
                icon={op.icon}
                onPress={op.onPress}
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

          {isLoadingMovements && movements.length === 0 ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="large" color={Theme.colors.primary.blue} />
              <Text style={styles.emptyText}>Cargando movimientos...</Text>
            </View>
          ) : error && movements.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : movements.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aún no tienes movimientos registrados en tus tarjetas.</Text>
            </View>
          ) : (
            <View style={styles.movementsList}>
              {movements.map((mov) => (
                <MovementItem
                  key={mov.identifier}
                  type={mov.type}
                  title={mov.title}
                  amount={mov.amount}
                  dateStr={mov.dateStr}
                  cardId={mov.cardId}
                  onPress={() => {
                    router.push({
                      pathname: '/movement-detail',
                      params: { id: mov.identifier },
                    });
                  }}
                />
              ))}
            </View>
          )}

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
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    flexGrow: 1,
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
  emptyBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.status.expense,
    textAlign: 'center',
  },
  movementsList: {
    width: '100%',
  },
  bottomSpacer: {
    height: 100,
  },
});
