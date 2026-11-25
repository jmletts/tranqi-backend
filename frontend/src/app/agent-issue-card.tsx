import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAgentStore } from '@presentation/state/useAgentStore';
import { AgentIssueCardResult, AgentPaymentMethod } from '@domain/models/Agent';
import { FareCategory } from '@domain/models/Traveler';
import { FloatingSlideModal } from '@presentation/components/FloatingSlideModal';
import {
  ChevronLeftIcon,
  CloseIcon,
  CardSmallIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BarcodeIcon,
} from '@presentation/components/icons';

const FARE_OPTIONS: { key: FareCategory; label: string; initialBalance: string; docHint?: string }[] = [
  { key: 'GENERAL', label: 'General', initialBalance: 'S/ 5.00' },
  { key: 'UNIVERSITY', label: 'Universitaria', initialBalance: 'S/ 5.00', docHint: 'N° Carnet Universitario' },
  { key: 'SCHOOL', label: 'Escolar', initialBalance: 'S/ 2.50', docHint: 'DNI del estudiante' },
];

const PAYMENT_METHODS: AgentPaymentMethod[] = ['Efectivo', 'Yape / Plin'];

function formatVerificationNumber(num: string): string {
  const clean = num.replace(/\s+/g, '');
  return clean.replace(/(.{4})/g, '$1   ').trim();
}

export default function AgentIssueCardScreen() {
  const router = useRouter();
  const inventoryCards = useAgentStore((state) => state.inventoryCards);
  const isLoadingInventory = useAgentStore((state) => state.isLoadingInventory);
  const isSubmitting = useAgentStore((state) => state.isSubmitting);
  const fetchInventoryCards = useAgentStore((state) => state.fetchInventoryCards);
  const issueCard = useAgentStore((state) => state.issueCard);

  const [cardId, setCardId] = useState('');
  const [fareCategory, setFareCategory] = useState<FareCategory>('GENERAL');
  const [documentNumber, setDocumentNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<AgentPaymentMethod>('Efectivo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issuedReceipt, setIssuedReceipt] = useState<AgentIssueCardResult | null>(null);

  useEffect(() => {
    fetchInventoryCards()
      .then((list) => {
        if (list.length > 0) setCardId(list[0]);
      })
      .catch(() => {});
  }, [fetchInventoryCards]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(agent)/home');
    }
  };

  const selectedFare = FARE_OPTIONS.find((f) => f.key === fareCategory)!;
  const requiresDoc = fareCategory === 'SCHOOL' || fareCategory === 'UNIVERSITY';

  const handleIssue = async () => {
    setErrorMessage(null);
    if (!cardId.trim()) {
      setErrorMessage('Selecciona o ingresa el código de tarjeta del inventario.');
      return;
    }
    if (requiresDoc && !documentNumber.trim()) {
      setErrorMessage(`Ingresa el documento requerido (${selectedFare.docHint}).`);
      return;
    }

    try {
      const result = await issueCard({
        cardId: cardId.trim().toUpperCase(),
        fareCategory,
        documentNumber: requiresDoc ? documentNumber.trim() : undefined,
        paymentMethod,
      });
      setIssuedReceipt(result);
      setDocumentNumber('');
      const remaining = inventoryCards.filter((id) => id !== result.cardId);
      setCardId(remaining[0] || '');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo emitir la tarjeta.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Emitir Tarjeta</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <CloseIcon size={22} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topIntro}>
            <View style={styles.pinkBadge}>
              <Text style={styles.pinkBadgeText}>EMISIÓN EN KIOSCO (US-01)</Text>
            </View>
            <Text style={styles.screenTitle}>Activar Nueva Tarjeta</Text>
            <Text style={styles.screenSubtitle}>
              Asigna una tarjeta del inventario físico a una cuenta anónima activa con saldo inicial y código de seguridad para vinculación en la app.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>1. Tarjeta en Inventario</Text>
          {isLoadingInventory ? (
            <ActivityIndicator color={Theme.colors.primary.pink} style={{ marginVertical: 12 }} />
          ) : inventoryCards.length > 0 ? (
            <View style={styles.inventoryRow}>
              {inventoryCards.map((id) => {
                const active = cardId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.invPill, active && styles.invPillActive]}
                    onPress={() => {
                      setCardId(id);
                      setErrorMessage(null);
                    }}
                  >
                    <Text style={[styles.invPillText, active && styles.invPillTextActive]}>
                      {id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyHint}>
              No hay tarjetas pre-cargadas en inventario; ingresa manualmente un UID existente en estado IN_INVENTORY.
            </Text>
          )}

          <TextInput
            testID="issue-card-id-input"
            style={styles.pillInput}
            value={cardId}
            onChangeText={(t) => {
              setCardId(t.toUpperCase());
              setErrorMessage(null);
            }}
            placeholder="UID de tarjeta (ej. TRK-INV-01)"
            autoCapitalize="characters"
            placeholderTextColor={Theme.colors.ui.textSecondary}
          />

          <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.l }]}>
            2. Categoría Tarifaria
          </Text>
          <View style={styles.fareGrid}>
            {FARE_OPTIONS.map((opt) => {
              const selected = fareCategory === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.fareCard, selected && styles.fareCardActive]}
                  onPress={() => {
                    setFareCategory(opt.key);
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.fareTitle, selected && styles.fareTitleActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.fareBalance, selected && styles.fareBalanceActive]}>
                    Saldo inicial {opt.initialBalance}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {requiresDoc ? (
            <View style={{ marginTop: Theme.spacing.m }}>
              <Text style={styles.sectionTitle}>3. Documento de Validación</Text>
              <TextInput
                testID="issue-card-doc-input"
                style={styles.pillInput}
                value={documentNumber}
                onChangeText={(t) => {
                  setDocumentNumber(t);
                  setErrorMessage(null);
                }}
                placeholder={selectedFare.docHint}
                placeholderTextColor={Theme.colors.ui.textSecondary}
              />
            </View>
          ) : null}

          <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.l }]}>
            {requiresDoc ? '4.' : '3.'} Método de Cobro ({selectedFare.initialBalance})
          </Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentPill, selected && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[styles.paymentText, selected && styles.paymentTextActive]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <AlertCircleIcon size={18} color={Theme.colors.status.expense} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            testID="issue-card-submit-button"
            style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
            onPress={handleIssue}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <>
                <CardSmallIcon size={20} color={Theme.colors.background.white} />
                <Text style={styles.submitButtonText}>
                  Emitir Tarjeta ({selectedFare.initialBalance})
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>

      <FloatingSlideModal
        visible={!!issuedReceipt}
        onClose={() => setIssuedReceipt(null)}
        title="Tarjeta Emitida con Éxito"
      >
        {issuedReceipt ? (
          <ScrollView contentContainerStyle={styles.receiptScroll}>
            <View style={styles.receiptHero}>
              <View style={styles.receiptIconCircle}>
                <CheckCircleIcon size={32} color={Theme.colors.background.white} />
              </View>
              <Text style={styles.receiptTitle}>Tarjeta {issuedReceipt.cardId} Activada</Text>
              <Text style={styles.receiptAmount}>
                Saldo inicial S/ {issuedReceipt.initialBalance.toFixed(2)}
              </Text>
            </View>

            <View style={styles.credentialsBox}>
              <View style={styles.credLabelRow}>
                <BarcodeIcon size={16} color={Theme.colors.primary.pink} />
                <Text style={styles.credLabel}>N° DE VERIFICACIÓN (12 DÍGITOS)</Text>
              </View>
              <Text style={styles.credValue}>
                {formatVerificationNumber(issuedReceipt.verificationNumber)}
              </Text>

              <View style={styles.credDivider} />

              <Text style={styles.credLabel}>CÓDIGO DE SEGURIDAD (ENTREGAR AL VIAJERO)</Text>
              <Text style={styles.credPin}>{issuedReceipt.securityCode}</Text>
              <Text style={styles.credHint}>
                El pasajero puede usar estos dos datos en "Registrar Tarjeta" para vincularla a su app.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setIssuedReceipt(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Emitir Otra Tarjeta</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </FloatingSlideModal>
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
    paddingBottom: Theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.m,
  },
  headerButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.white,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
  },
  topIntro: {
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  pinkBadge: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
    marginBottom: Theme.spacing.s,
  },
  pinkBadgeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 1,
  },
  screenTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 22,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.s,
  },
  inventoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.m,
  },
  invPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
  },
  invPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  invPillText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.background.dark,
  },
  invPillTextActive: {
    color: Theme.colors.background.white,
  },
  emptyHint: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginBottom: Theme.spacing.s,
  },
  pillInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.l,
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  fareGrid: {
    gap: 10,
  },
  fareCard: {
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareCardActive: {
    borderColor: Theme.colors.primary.pink,
    backgroundColor: '#fff5fa',
  },
  fareTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  fareTitleActive: {
    color: Theme.colors.primary.pink,
  },
  fareBalance: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  fareBalanceActive: {
    color: Theme.colors.background.dark,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.l,
  },
  paymentPill: {
    flex: 1,
    height: 48,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentPillActive: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  paymentText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  paymentTextActive: {
    color: Theme.colors.background.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffecec',
    borderRadius: Theme.borderRadius.cardSmall,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },
  errorText: {
    flex: 1,
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.status.expense,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Theme.colors.primary.pink,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
  },
  submitButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  receiptScroll: {
    padding: Theme.spacing.l,
    paddingBottom: 40,
  },
  receiptHero: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    alignItems: 'center',
    marginBottom: Theme.spacing.l,
  },
  receiptIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Theme.colors.status.income,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.s,
  },
  receiptTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
    marginBottom: 4,
  },
  receiptAmount: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.primary.pink,
  },
  credentialsBox: {
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.l,
  },
  credLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  credLabel: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.dark,
    letterSpacing: 0.6,
  },
  credValue: {
    fontFamily: Theme.typography.family.black,
    fontSize: 20,
    color: Theme.colors.background.dark,
    letterSpacing: 1.5,
    marginVertical: 4,
  },
  credDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginVertical: Theme.spacing.m,
  },
  credPin: {
    fontFamily: Theme.typography.family.black,
    fontSize: 28,
    color: Theme.colors.primary.pink,
    letterSpacing: 6,
    marginVertical: 4,
  },
  credHint: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.background.dark,
    marginTop: 6,
    lineHeight: 16,
  },
  modalBtn: {
    backgroundColor: Theme.colors.background.dark,
    height: 54,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
});
