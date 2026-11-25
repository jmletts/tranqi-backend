import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Theme } from '@/constants/theme';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import { PhosphorBadge } from '@presentation/components/PhosphorBadge';
import { CreditCardIcon, PlusIcon, WalletInIcon, NfcIcon } from '@presentation/components/icons';
import { useAuthStore } from '@presentation/state/useAuthStore';

interface PaymentMethodsContentProps {
  onClose: () => void;
}

export const PaymentMethodsContent = ({ onClose }: PaymentMethodsContentProps) => {
  const user = useAuthStore((state) => state.user);
  const [autoRecharge, setAutoRecharge] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Linked Credit/Debit Card Representation */}
        <View style={styles.cardContainer}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardBrandBox}>
              <Text style={styles.cardBrandLogo}>III</Text>
              <Text style={styles.cardBrandName}>Tranqi Pay</Text>
            </View>
            <PhosphorBadge label="PREDETERMINADA" size="small" />
          </View>

          <View style={styles.chipRow}>
            <View style={styles.cardChip}>
              <View style={styles.chipLine1} />
              <View style={styles.chipLine2} />
            </View>
            <NfcIcon size={24} color="#ffd900" />
          </View>

          <Text style={styles.cardNumber}>4152   ••••   ••••   4289</Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardSmallLabel}>TITULAR</Text>
              <Text style={styles.cardHolderName}>{(user?.name || 'USUARIO TRANQI').toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.cardSmallLabel}>EXPIRA</Text>
              <Text style={styles.cardExpDate}>12/28</Text>
            </View>
            <View style={styles.cardTypeBadge}>
              <Text style={styles.cardTypeText}>VISA</Text>
            </View>
          </View>
        </View>

        {/* Auto Recharge Toggle */}
        <View style={styles.sectionCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextContainer}>
              <View style={styles.toggleTitleBadgeRow}>
                <Text style={styles.toggleTitle}>Recarga Automática</Text>
                {autoRecharge && <PhosphorBadge label="ACTIVA" size="small" />}
              </View>
              <Text style={styles.toggleSubtitle}>
                Recargar automáticamente S/ 20.00 cuando el saldo de tu tarjeta principal sea menor a S/ 5.00.
              </Text>
              <Text style={styles.statusLabel}>
                {autoRecharge ? 'Estado: Aceptado y Activo' : 'Estado: No aceptado'}
              </Text>
            </View>
            <Switch
              value={autoRecharge}
              onValueChange={setAutoRecharge}
              trackColor={{ false: '#e5e5e5', true: '#00FF66' }}
              thumbColor={autoRecharge ? '#010100' : '#ffffff'}
            />
          </View>
        </View>

        {/* Digital Wallets Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircle}>
              <WalletInIcon size={18} color={Theme.colors.background.dark} />
            </View>
            <Text style={styles.sectionHeaderTitle}>Billeteras Digitales</Text>
          </View>

          <View style={styles.walletItemRow}>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Yape Vinculado</Text>
              <Text style={styles.walletDetail}>+51 987 ••• 321</Text>
            </View>
            <PhosphorBadge label="VINCULADO" size="small" />
          </View>

          <View style={[styles.walletItemRow, { borderBottomWidth: 0 }]}>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Plin / Interbank</Text>
              <Text style={styles.walletDetail}>Disponible para pagos QR</Text>
            </View>
            <TouchableOpacity style={styles.linkWalletButton}>
              <Text style={styles.linkWalletText}>Asociar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add New Card Button */}
        <TouchableOpacity style={styles.addNewCardButton} activeOpacity={0.8}>
          <PlusIcon size={18} color={Theme.colors.background.dark} />
          <Text style={styles.addNewCardText}>Vincular Nueva Tarjeta de Débito/Crédito</Text>
        </TouchableOpacity>

        {/* Spacer for Floating Bottom Actions */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Floating Bottom Actions */}
      <FloatingBottomActions
        primaryTitle={success ? "Métodos Guardados" : "Guardar Métodos de Pago"}
        onPrimaryPress={handleSave}
        onClosePress={onClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.l,
    paddingBottom: 110,
  },
  bottomSpacer: {
    height: 30,
  },
  cardContainer: {
    backgroundColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.cardLarge,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.l,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  cardBrandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrandLogo: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.yellow,
  },
  cardBrandName: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.white,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.l,
  },
  cardChip: {
    width: 38,
    height: 28,
    backgroundColor: '#d4af37',
    borderRadius: 6,
    padding: 3,
    justifyContent: 'space-around',
  },
  chipLine1: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chipLine2: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardNumber: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 18,
    color: Theme.colors.background.white,
    letterSpacing: 2,
    marginBottom: Theme.spacing.l,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardSmallLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 9,
    color: '#888888',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardHolderName: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  cardExpDate: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.white,
  },
  cardTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardTypeText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.white,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Theme.spacing.m,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  toggleTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  toggleSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  statusLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.primary.blue,
  },
  walletItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.s,
    borderBottomWidth: 1.5,
    borderBottomColor: Theme.colors.background.dark,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  walletDetail: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
  linkWalletButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
  },
  linkWalletText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.dark,
  },
  addNewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    backgroundColor: Theme.colors.background.white,
    marginBottom: Theme.spacing.l,
  },
  addNewCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  buttonsContainer: {
    marginTop: Theme.spacing.m,
  },
});
