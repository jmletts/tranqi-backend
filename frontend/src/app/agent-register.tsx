import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import {
  ChevronLeftIcon,
  CloseIcon,
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  StoreIcon,
  MapPinIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@presentation/components/icons';
import { useAuthStore } from '@presentation/state/useAuthStore';

interface FormErrors {
  name?: string;
  dni?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
  acceptedTerms?: string;
}

export default function AgentRegisterScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const registerAsAgent = useAuthStore((state) => state.registerAsAgent);

  const [name, setName] = useState(user?.name || '');
  const [dni] = useState(user?.dni || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState(user?.address || '');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/perfil');
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => gestureState.dx > 25 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2,
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dx > 70 && gestureState.vx > 0.25) {
          handleGoBack();
        }
      },
    })
  ).current;

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim() || name.trim().length < 3) {
      nextErrors.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
    }

    const cleanDni = dni.replace(/\D/g, '');
    if (cleanDni.length !== 8) {
      nextErrors.dni = 'Tu cuenta debe tener un DNI válido de 8 dígitos.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      nextErrors.phone = 'Ingresa un número de teléfono válido (mínimo 9 dígitos).';
    }

    if (!businessName.trim() || businessName.trim().length < 3) {
      nextErrors.businessName = 'Ingresa el nombre de tu comercio o kiosco.';
    }

    if (!businessAddress.trim() || businessAddress.trim().length < 5) {
      nextErrors.businessAddress = 'Ingresa la dirección de tu punto de atención.';
    }

    if (!acceptedTerms) {
      nextErrors.acceptedTerms = 'Debes confirmar tus datos para activar el rol de Agente.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await registerAsAgent({
        name: name.trim(),
        dni: dni.replace(/\D/g, ''),
        email: email.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        acceptedTerms,
      });

      router.replace('/(agent)/home');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo activar el rol de Agente';
      setApiError(msg);
      Alert.alert('Error de registro', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.blackBackground}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
              accessibilityLabel="Volver"
              testID="agent-register-back-button"
            >
              <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Registro de Agente</Text>

            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerButton}
              activeOpacity={0.7}
              accessibilityLabel="Cerrar"
            >
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
              <Text style={styles.pinkBadgeText}>MODO AGENTE TRANQI</Text>
            </View>
            <Text style={styles.introTitle}>Conviértete en Agente</Text>
            <Text style={styles.introSubtitle}>
              Confirma tus datos y registra tu punto de atención. Se asignará el rol AGENTE_KIOSKO en tu cuenta con un cupo operativo inicial de S/ 500.00.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Datos Personales</Text>

          <PillInputField
            testID="agent-register-name-input"
            label="Nombre Completo"
            value={name}
            onChangeText={(val) => {
              setName(val);
              clearError('name');
            }}
            placeholder="Tu nombre completo"
            icon={<UserIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.name}
          />

          <PillInputField
            testID="agent-register-dni-input"
            label="Documento de Identidad (DNI)"
            value={dni}
            editable={false}
            placeholder="8 dígitos"
            icon={<LockIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.dni}
          />

          <PillInputField
            testID="agent-register-email-input"
            label="Correo Electrónico"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              clearError('email');
            }}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<MailIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.email}
          />

          <PillInputField
            testID="agent-register-phone-input"
            label="Número de Teléfono"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              clearError('phone');
            }}
            placeholder="+51 900 000 000"
            keyboardType="phone-pad"
            icon={<PhoneIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.phone}
          />

          <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.m }]}>
            Punto de Recarga Autorizado
          </Text>

          <PillInputField
            testID="agent-register-business-input"
            label="Nombre del Kiosco / Comercio"
            value={businessName}
            onChangeText={(val) => {
              setBusinessName(val);
              clearError('businessName');
            }}
            placeholder="Ej. Bodega Punto San Jerónimo"
            icon={<StoreIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.businessName}
          />

          <PillInputField
            testID="agent-register-address-input"
            label="Dirección del Punto de Atención"
            value={businessAddress}
            onChangeText={(val) => {
              setBusinessAddress(val);
              clearError('businessAddress');
            }}
            placeholder="Av. / Calle, Distrito"
            icon={<MapPinIcon size={18} color={Theme.colors.background.white} />}
            iconBgColor={Theme.colors.primary.pink}
            error={errors.businessAddress}
          />

          <View style={styles.rolesSummaryCard}>
            <View style={styles.rolesHeaderRow}>
              <ShieldCheckIcon size={20} color={Theme.colors.primary.pink} />
              <Text style={styles.rolesSummaryTitle}>Activación de Rol Aditivo + Cupo S/ 500.00</Text>
            </View>
            <Text style={styles.rolesSummaryText}>
              Al confirmar, el backend guardará tu perfil de agente en PostgreSQL y emitirá un nuevo JWT con tus roles actualizados sin perder tu perfil de viajero.
            </Text>
            <View style={styles.rolePillsRow}>
              <View style={styles.rolePillDark}>
                <Text style={styles.rolePillText}>USUARIO_FINAL</Text>
              </View>
              <View style={styles.rolePillPink}>
                <Text style={styles.rolePillText}>+ AGENTE_KIOSKO</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            testID="agent-register-confirm-checkbox"
            style={[
              styles.confirmBox,
              acceptedTerms && styles.confirmBoxActive,
              errors.acceptedTerms ? styles.confirmBoxError : null,
            ]}
            onPress={() => {
              setAcceptedTerms((prev) => !prev);
              clearError('acceptedTerms');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms ? (
                <CheckIcon size={14} color={Theme.colors.background.white} />
              ) : null}
            </View>
            <Text style={styles.confirmBoxText}>
              Confirmo que todos los datos ingresados son verídicos y autorizo activar el modo Agente en mi cuenta Tranqi.
            </Text>
          </TouchableOpacity>
          {errors.acceptedTerms ? (
            <Text style={styles.termsErrorText}>{errors.acceptedTerms}</Text>
          ) : null}
          {apiError ? <Text style={styles.termsErrorText}>{apiError}</Text> : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            testID="agent-register-submit-button"
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Theme.colors.background.white} />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar y Ser Agente</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelRoundButton}
            onPress={handleGoBack}
            activeOpacity={0.85}
            accessibilityLabel="Cancelar"
          >
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
    paddingTop: Theme.spacing.xl,
  },
  topIntro: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
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
  introTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 24,
    color: Theme.colors.background.dark,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  introSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.pink,
    marginBottom: Theme.spacing.m,
  },
  rolesSummaryCard: {
    backgroundColor: Theme.colors.background.lightGray,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    marginTop: Theme.spacing.s,
    marginBottom: Theme.spacing.l,
  },
  rolesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rolesSummaryTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
    flex: 1,
  },
  rolesSummaryText: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 17,
    marginBottom: Theme.spacing.m,
  },
  rolePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rolePillDark: {
    backgroundColor: Theme.colors.background.dark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  rolePillPink: {
    backgroundColor: Theme.colors.primary.pink,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.pill,
  },
  rolePillText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 10,
    color: Theme.colors.background.white,
    letterSpacing: 0.5,
  },
  confirmBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.background.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    borderRadius: Theme.borderRadius.cardMedium,
    padding: Theme.spacing.m,
    gap: 12,
  },
  confirmBoxActive: {
    borderColor: Theme.colors.primary.pink,
  },
  confirmBoxError: {
    borderColor: Theme.colors.status.expense,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primary.pink,
    borderColor: Theme.colors.primary.pink,
  },
  confirmBoxText: {
    flex: 1,
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.background.dark,
    lineHeight: 18,
  },
  termsErrorText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.status.expense,
    marginTop: 6,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 110,
  },
  bottomActions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : Theme.spacing.l,
    left: Theme.spacing.l,
    right: Theme.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.m,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Theme.colors.primary.pink,
    height: 56,
    borderRadius: Theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
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
