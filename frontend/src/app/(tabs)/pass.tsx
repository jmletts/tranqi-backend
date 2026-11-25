import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Theme } from '@/constants/theme';
import { 
  MapPinIcon, 
  ClockIcon, 
  ArrowUpDownIcon, 
  CheckCircleIcon 
} from '@presentation/components/icons';
import { 
  calculateTransitRoutes, 
  POPULAR_STOPS,
  TransitRouteOption
} from '@presentation/data/mockTransit';

export default function PassScreen() {
  const [origin, setOrigin] = useState('Paradero San Jerónimo');
  const [destination, setDestination] = useState('Plaza San Francisco');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [calculatedRoutes, setCalculatedRoutes] = useState<TransitRouteOption[]>(() => 
    calculateTransitRoutes('Paradero San Jerónimo', 'Plaza San Francisco')
  );

  const handleSwapStops = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setCalculatedRoutes(calculateTransitRoutes(destination, temp));
  };

  const handleCalculateRoute = () => {
    setCalculatedRoutes(calculateTransitRoutes(origin, destination));
  };

  const handleSelectPresetDestination = (stopName: string) => {
    setDestination(stopName);
    setCalculatedRoutes(calculateTransitRoutes(origin, stopName));
  };

  const activeRoute = calculatedRoutes[selectedRouteIndex] || calculatedRoutes[0];

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Badge de Tranqi Pass en formato Píldora */}
          <View style={styles.badgeWrapper}>
            <View style={styles.pinkPillBadge}>
              <Text style={styles.pinkPillBadgeText}>TRANQI PASS</Text>
            </View>
          </View>

          {/* Título "Planificar viaje" y Descripción en el Centro */}
          <Text style={styles.screenTitle}>Planificar viaje</Text>
          <Text style={styles.screenDescription}>
            Selecciona tu origen y destino para calcular la mejor ruta, cuánto transporte público tomar y la tarifa exacta.
          </Text>

          {/* Formulario en formato píldora */}
          <View style={styles.formContainer}>
            {/* Input Origen tipo Píldora */}
            <View style={styles.pillInputContainer}>
              <View style={styles.iconCirclePink}>
                <MapPinIcon size={16} color={Theme.colors.background.white} />
              </View>
              <View style={styles.inputBody}>
                <Text style={styles.inputMiniLabel}>Origen</Text>
                <TextInput
                  style={styles.pillTextInput}
                  value={origin}
                  onChangeText={setOrigin}
                  placeholder="Lugar de partida o paradero"
                  placeholderTextColor={Theme.colors.ui.textSecondary}
                />
              </View>
            </View>

            {/* Botón de Intercambio Circular/Píldora */}
            <TouchableOpacity 
              style={styles.swapPillButton}
              onPress={handleSwapStops}
              activeOpacity={0.7}
              accessibilityLabel="Intercambiar origen y destino"
            >
              <ArrowUpDownIcon size={18} color={Theme.colors.background.white} />
            </TouchableOpacity>

            {/* Input Destino tipo Píldora */}
            <View style={styles.pillInputContainer}>
              <View style={styles.iconCircleDark}>
                <MapPinIcon size={16} color={Theme.colors.background.white} />
              </View>
              <View style={styles.inputBody}>
                <Text style={styles.inputMiniLabel}>Destino</Text>
                <TextInput
                  style={styles.pillTextInput}
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Lugar de llegada o paradero"
                  placeholderTextColor={Theme.colors.ui.textSecondary}
                />
              </View>
            </View>

            {/* Sugerencias de Paraderos en formato Píldoras */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsLabel}>Destinos frecuentes:</Text>
              <View style={styles.presetPillsRow}>
                {POPULAR_STOPS.slice(0, 4).map((stop) => {
                  const isSelected = destination === stop.name;
                  return (
                    <TouchableOpacity
                      key={stop.id}
                      style={[styles.presetPill, isSelected && styles.presetPillActive]}
                      onPress={() => handleSelectPresetDestination(stop.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.presetPillText, isSelected && styles.presetPillTextActive]}>
                        {stop.name.replace('Paradero ', '')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Botón Principal en formato Píldora Rosada */}
            <TouchableOpacity 
              style={styles.calculatePillButton}
              onPress={handleCalculateRoute}
              activeOpacity={0.8}
            >
              <Text style={styles.calculatePillButtonText}>Calcular Transporte</Text>
            </TouchableOpacity>
          </View>

          {/* Resultados de Planificación */}
          {calculatedRoutes.length > 0 && (
            <View style={styles.resultsWrapper}>
              <Text style={styles.resultsTitle}>Rutas disponibles</Text>

              {/* Píldoras de Selección de Ruta */}
              <View style={styles.routeSelectorRow}>
                {calculatedRoutes.map((opt, index) => {
                  const isSelected = selectedRouteIndex === index;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.routeSelectorPill,
                        isSelected && styles.routeSelectorPillActive
                      ]}
                      onPress={() => setSelectedRouteIndex(index)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.tagPill,
                        isSelected ? styles.tagPillPink : styles.tagPillDark
                      ]}>
                        <Text style={styles.tagPillText}>{opt.tag}</Text>
                      </View>
                      <Text style={[
                        styles.routeTimeText,
                        isSelected && styles.routeTimeTextActive
                      ]}>
                        {opt.totalTimeMinutes} min
                      </Text>
                      <Text style={styles.routeFareSubText}>S/ {opt.totalFare.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tarjeta de Detalle en Formato Píldora / Bordes Suaves */}
              <View style={styles.routeCard}>
                <View style={styles.routeCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routeCardTitle}>{activeRoute.title}</Text>
                    <Text style={styles.routeCardSubtitle}>
                      {activeRoute.transportsCount === 1 
                        ? '1 transporte público directo' 
                        : `${activeRoute.transportsCount} transportes con 1 transbordo`}
                    </Text>
                  </View>
                  <View style={styles.farePill}>
                    <Text style={styles.farePillLabel}>Tarifa</Text>
                    <Text style={styles.farePillValue}>S/ {activeRoute.totalFare.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Unidades a tomar (SIN iconos de carro) */}
                <View style={styles.unitsSection}>
                  <Text style={styles.unitsTitle}>Transporte a tomar:</Text>
                  {activeRoute.buses.map((bus, idx) => (
                    <View key={idx} style={styles.unitPillRow}>
                      <View style={styles.unitCodePill}>
                        <Text style={styles.unitCodePillText}>{bus.busNumber}</Text>
                      </View>
                      <View style={styles.unitInfoCol}>
                        <Text style={styles.unitLineText}>{bus.lineName}</Text>
                        <Text style={styles.unitStopsText}>
                          {bus.fromStop} → {bus.toStop} ({bus.stopsCount} paraderos • ~{bus.durationMin} min)
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Itinerario Paso a Paso */}
                <View style={styles.itinerarySection}>
                  <Text style={styles.itineraryTitle}>Itinerario del viaje:</Text>
                  {activeRoute.steps.map((step, sIdx) => (
                    <View key={sIdx} style={styles.itineraryStepRow}>
                      <View style={styles.stepIndicatorCol}>
                        <View style={[
                          styles.stepBullet,
                          step.action === 'board' && styles.stepBulletPink,
                          step.action === 'transfer' && styles.stepBulletYellow,
                          step.action === 'arrive' && styles.stepBulletDark,
                        ]}>
                          <CheckCircleIcon size={12} color={Theme.colors.background.white} />
                        </View>
                        {sIdx < activeRoute.steps.length - 1 && <View style={styles.stepConnectingLine} />}
                      </View>
                      <View style={styles.stepContentCol}>
                        <Text style={styles.stepStopTitle}>{step.stopName}</Text>
                        <Text style={styles.stepInstructionText}>{step.instruction}</Text>
                        {step.timeEstimate && (
                          <View style={styles.estimatePill}>
                            <ClockIcon size={12} color={Theme.colors.primary.pink} />
                            <Text style={styles.estimatePillText}>{step.timeEstimate}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Espaciador inferior para no chocar con el FloatingBottomTab */}
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
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.m,
  },

  /* Badge superior */
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  pinkPillBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.xs + 1,
    borderRadius: Theme.borderRadius.pill,
  },
  pinkPillBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
    letterSpacing: 1.2,
  },

  /* Título y Descripción Centrados */
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 26,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  screenDescription: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },

  /* Formulario en formato píldora */
  formContainer: {
    backgroundColor: '#fafafa',
    borderRadius: Theme.borderRadius.cardLarge,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.l,
  },
  pillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 6,
  },
  iconCirclePink: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary.pink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.s,
  },
  iconCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.s,
  },
  inputBody: {
    flex: 1,
  },
  inputMiniLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.ui.textSecondary,
    marginBottom: -2,
  },
  pillTextInput: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
    paddingVertical: 2,
  },
  swapPillButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary.pink,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -6,
    zIndex: 10,
    borderWidth: 2,
    borderColor: Theme.colors.background.white,
  },

  /* Presets en formato píldora */
  presetsSection: {
    marginTop: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  presetsLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.xs,
  },
  presetPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    backgroundColor: Theme.colors.background.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 7,
  },
  presetPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  presetPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
  },
  presetPillTextActive: {
    color: Theme.colors.background.white,
  },

  /* Botón Principal Píldora */
  calculatePillButton: {
    backgroundColor: Theme.colors.primary.pink,
    height: 52,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatePillButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },

  /* Resultados */
  resultsWrapper: {
    marginTop: Theme.spacing.m,
  },
  resultsTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  routeSelectorRow: {
    flexDirection: 'row',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  routeSelectorPill: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderWidth: 2,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: 24,
    padding: Theme.spacing.m,
    alignItems: 'center',
  },
  routeSelectorPillActive: {
    borderColor: Theme.colors.primary.pink,
    backgroundColor: '#fffdfd',
  },
  tagPill: {
    paddingHorizontal: Theme.spacing.s + 4,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: 6,
  },
  tagPillPink: {
    backgroundColor: Theme.colors.primary.pink,
  },
  tagPillDark: {
    backgroundColor: Theme.colors.background.dark,
  },
  tagPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.background.white,
  },
  routeTimeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
    marginBottom: 2,
  },
  routeTimeTextActive: {
    color: Theme.colors.primary.pink,
  },
  routeFareSubText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },

  /* Tarjeta de Detalle */
  routeCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardLarge,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.l,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: Theme.spacing.m,
    borderBottomWidth: 1.5,
    borderBottomColor: Theme.colors.ui.inputBorder,
    marginBottom: Theme.spacing.m,
  },
  routeCardTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
  },
  routeCardSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
  farePill: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary.pink,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 6,
  },
  farePillLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 9,
    color: Theme.colors.background.white,
  },
  farePillValue: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },

  /* Unidades sin iconos de carro */
  unitsSection: {
    marginBottom: Theme.spacing.m,
  },
  unitsTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
  },
  unitPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary.pink,
  },
  unitCodePill: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.pill,
    marginRight: Theme.spacing.m,
  },
  unitCodePillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 11,
    color: Theme.colors.background.white,
  },
  unitInfoCol: {
    flex: 1,
  },
  unitLineText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  unitStopsText: {
    fontFamily: Theme.typography.family.regular,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
  },

  /* Itinerario */
  itinerarySection: {
    marginTop: Theme.spacing.s,
  },
  itineraryTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  itineraryStepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: Theme.spacing.m,
  },
  stepBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBulletPink: {
    backgroundColor: Theme.colors.primary.pink,
  },
  stepBulletYellow: {
    backgroundColor: Theme.colors.primary.yellow,
  },
  stepBulletDark: {
    backgroundColor: Theme.colors.background.dark,
  },
  stepConnectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
    marginVertical: 2,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: Theme.spacing.m,
  },
  stepStopTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  stepInstructionText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
  estimatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0fa',
    alignSelf: 'flex-start',
    paddingHorizontal: Theme.spacing.s,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.pill,
    gap: 4,
    marginTop: 4,
  },
  estimatePillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.primary.pink,
  },

  bottomSpacer: {
    height: 110,
  },
});
