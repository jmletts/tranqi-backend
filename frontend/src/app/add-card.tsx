import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { ChevronLeftIcon, CloseIcon } from '@presentation/components/icons';
import { useTravelerStore } from '@presentation/state/useTravelerStore';

export default function AddCardScreen() {
  const router = useRouter();
  const linkCard = useTravelerStore((state) => state.linkCard);
  const isSubmitting = useTravelerStore((state) => state.isSubmitting);

  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [alias, setAlias] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const combinedIdentifier = `${part1}${part2}${part3}`.trim();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleRegisterCard = async () => {
    setFeedbackError(null);

    if (!combinedIdentifier) {
      setFeedbackError('Ingresa el número de verificación o ID de la tarjeta.');
      return;
    }
    if (!securityCode.trim()) {
      setFeedbackError('Ingresa el código de seguridad de tu tarjeta.');
      return;
    }

    try {
      await linkCard({
        cardIdentifier: combinedIdentifier,
        securityCode: securityCode.trim(),
        alias: alias.trim() || undefined,
      });
      Alert.alert('Tarjeta vinculada', 'La tarjeta se vinculó correctamente a tu cuenta.');
      handleGoBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo vincular la tarjeta';
      setFeedbackError(msg);
      Alert.alert('Error al vincular', msg);
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
            <Text style={styles.headerTitle}>Registrar Tarjeta</Text>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <CloseIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardPreview}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>III</Text>
            </View>

            <View style={styles.cardTextContent}>
              <Text style={styles.cardMainText}>Afíliate en Nuestra App</Text>

              <Text style={styles.cardLabel}>Identificación única de tarjeta (12 dígitos o UID):</Text>
              <Text style={styles.cardValue}>
                {part1 || '----'}   {part2 || '----'}   {part3 || '----'}
              </Text>

              <Text style={styles.cardLabel}>Código de Seguridad:</Text>
              <Text style={styles.cardValue}>{securityCode ? '••••' : '----'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.formSection}>
            <Text style={styles.inputTitle}>Identificación Única (3 bloques de 4):</Text>
            <View style={styles.idInputRow}>
              <TextInput
                testID="add-card-part1"
                style={styles.idInput}
                value={part1}
                onChangeText={(t) => {
                  setPart1(t.toUpperCase());
                  setFeedbackError(null);
                }}
                placeholder="0000"
                maxLength={4}
                textAlign="center"
                autoCapitalize="characters"
                placeholderTextColor={Theme.colors.ui.textSecondary}
              />
              <TextInput
                testID="add-card-part2"
                style={styles.idInput}
                value={part2}
                onChangeText={(t) => {
                  setPart2(t.toUpperCase());
                  setFeedbackError(null);
                }}
                placeholder="0000"
                maxLength={4}
                textAlign="center"
                autoCapitalize="characters"
                placeholderTextColor={Theme.colors.ui.textSecondary}
              />
              <TextInput
                testID="add-card-part3"
                style={styles.idInput}
                value={part3}
                onChangeText={(t) => {
                  setPart3(t.toUpperCase());
                  setFeedbackError(null);
                }}
                placeholder="0000"
                maxLength={4}
                textAlign="center"
                autoCapitalize="characters"
                placeholderTextColor={Theme.colors.ui.textSecondary}
              />
            </View>

            <Text style={styles.inputTitle}>Código de Seguridad:</Text>
            <View style={styles.codeInputRow}>
              <TextInput
                testID="add-card-code"
                style={styles.codeInput}
                value={securityCode}
                onChangeText={(t) => {
                  setSecurityCode(t);
                  setFeedbackError(null);
                }}
                placeholder="----"
                maxLength={6}
                textAlign="center"
                keyboardType="numeric"
                secureTextEntry
                placeholderTextColor={Theme.colors.ui.textSecondary}
              />
              <Text style={styles.codeHint}>
                Es el código de seguridad impreso{'\n'}al reverso de tu tarjeta física.
              </Text>
            </View>

            <Text style={styles.inputTitle}>Alias de tarjeta (opcional):</Text>
            <TextInput
              testID="add-card-alias"
              style={styles.aliasInput}
              value={alias}
              onChangeText={setAlias}
              placeholder="Ej. Tarjeta Personal, Trabajo, Estudio"
              placeholderTextColor={Theme.colors.ui.textSecondary}
            />

            {feedbackError ? <Text style={styles.errorText}>{feedbackError}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            testID="add-card-submit"
            style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
            disabled={isSubmitting}
            onPress={handleRegisterCard}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <Text style={styles.registerButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelRoundButton} onPress={handleGoBack}>
            <CloseIcon size={20} color={Theme.colors.background.white} />
          </TouchableOpacity>
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
  blackBackground: {
    backgroundColor: Theme.colors.background.dark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.xl,
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
    borderTopLeftRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Theme.spacing.l,
  },
  cardPreview: {
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.l,
    minHeight: 190,
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.m,
  },
  cardLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  cardTextContent: {
    marginTop: Theme.spacing.m,
  },
  cardMainText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.blue,
    marginBottom: Theme.spacing.m,
  },
  cardLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.primary.blue,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.ui.inputBorder,
    marginVertical: Theme.spacing.m,
  },
  formSection: {
    marginTop: Theme.spacing.s,
  },
  inputTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.s,
  },
  idInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  idInput: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.pill,
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  codeInput: {
    width: 96,
    height: 50,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.pill,
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  codeHint: {
    flex: 1,
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  aliasInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    borderRadius: Theme.borderRadius.pill,
    paddingHorizontal: Theme.spacing.l,
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginBottom: Theme.spacing.m,
  },
  errorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.status.expense,
    marginTop: Theme.spacing.s,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.l,
    paddingVertical: Theme.spacing.l,
    gap: Theme.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.l,
  },
  registerButton: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 16,
    color: Theme.colors.background.white,
  },
  cancelRoundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
