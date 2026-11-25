import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/theme';
import { PillInputField } from '@presentation/components/PillInputField';
import { FloatingBottomActions } from '@presentation/components/FloatingBottomActions';
import { PhosphorBadge } from '@presentation/components/PhosphorBadge';
import { UploadCloudIcon, FileTextIcon, CheckIcon, PercentIcon } from '@presentation/components/icons';

interface TariffContentProps {
  onClose: () => void;
}

export const TariffContent = ({ onClose }: TariffContentProps) => {
  const [selectedTariff, setSelectedTariff] = useState<'universitaria' | 'escolar' | 'general'>('universitaria');
  const [hasDocument, setHasDocument] = useState(true);
  const [documentName, setDocumentName] = useState('carnet_universitario_2026.pdf');
  const [studentCode, setStudentCode] = useState('U202115482');
  const [expiryDate, setExpiryDate] = useState('31/12/2026');
  const [institution, setInstitution] = useState('Universidad Nacional Mayor de San Marcos');
  const [success, setSuccess] = useState(false);

  const handleConfirm = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 600);
  };

  const handleUploadSimulate = () => {
    setHasDocument(true);
    setDocumentName('carnet_universitario_vigente.pdf');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* Top Header Badge */}
      <View style={styles.topBadgeRow}>
        <PhosphorBadge label="TARIFA VIGENTE" size="medium" />
        <Text style={styles.topSubtitle}>Medio Pasaje y Subvención</Text>
      </View>

      <Text style={styles.description}>
        Elige tu modalidad tarifaria y adjunta la documentación requerida para validar tus beneficios según la ley universitaria y escolar.
      </Text>

      {/* Tariff Options */}
      <View style={styles.tariffsContainer}>
        {/* Universitaria */}
        <TouchableOpacity
          style={[
            styles.tariffCard,
            selectedTariff === 'universitaria' && styles.tariffCardActive,
          ]}
          onPress={() => setSelectedTariff('universitaria')}
          activeOpacity={0.8}
        >
          <View style={styles.tariffCardHeader}>
            <View style={styles.tariffTitleGroup}>
              <Text style={styles.tariffTitle}>Tarifa Universitaria</Text>
              <PhosphorBadge label="50% DCTO" size="small" />
            </View>
            <View
              style={[
                styles.radioCircle,
                selectedTariff === 'universitaria' && styles.radioCircleSelected,
              ]}
            >
              {selectedTariff === 'universitaria' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </View>
          <Text style={styles.tariffDescription}>
            Medio pasaje para estudiantes de pregrado y postgrado reconocidos por SUNEDU.
          </Text>
          <View style={styles.fareAmountRow}>
            <Text style={styles.fareLabel}>Pasaje Promedio:</Text>
            <Text style={styles.fareAmount}>S/ 1.25</Text>
          </View>
        </TouchableOpacity>

        {/* Escolar */}
        <TouchableOpacity
          style={[
            styles.tariffCard,
            selectedTariff === 'escolar' && styles.tariffCardActive,
          ]}
          onPress={() => setSelectedTariff('escolar')}
          activeOpacity={0.8}
        >
          <View style={styles.tariffCardHeader}>
            <View style={styles.tariffTitleGroup}>
              <Text style={styles.tariffTitle}>Tarifa Escolar</Text>
              <PhosphorBadge label="ESCOLAR" size="small" />
            </View>
            <View
              style={[
                styles.radioCircle,
                selectedTariff === 'escolar' && styles.radioCircleSelected,
              ]}
            >
              {selectedTariff === 'escolar' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </View>
          <Text style={styles.tariffDescription}>
            Para alumnos de instituciones educativas de nivel básica regular y especial.
          </Text>
          <View style={styles.fareAmountRow}>
            <Text style={styles.fareLabel}>Pasaje Promedio:</Text>
            <Text style={styles.fareAmount}>S/ 1.00</Text>
          </View>
        </TouchableOpacity>

        {/* General */}
        <TouchableOpacity
          style={[
            styles.tariffCard,
            selectedTariff === 'general' && styles.tariffCardActive,
          ]}
          onPress={() => setSelectedTariff('general')}
          activeOpacity={0.8}
        >
          <View style={styles.tariffCardHeader}>
            <View style={styles.tariffTitleGroup}>
              <Text style={styles.tariffTitle}>Tarifa General</Text>
              <PhosphorBadge label="ESTÁNDAR" size="small" />
            </View>
            <View
              style={[
                styles.radioCircle,
                selectedTariff === 'general' && styles.radioCircleSelected,
              ]}
            >
              {selectedTariff === 'general' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </View>
          <Text style={styles.tariffDescription}>
            Sin requisitos adicionales. Aplica tarifa estándar en todas las rutas urbanas.
          </Text>
          <View style={styles.fareAmountRow}>
            <Text style={styles.fareLabel}>Pasaje Regular:</Text>
            <Text style={styles.fareAmount}>S/ 2.50</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Upload Document / Carnet Section */}
      {(selectedTariff === 'universitaria' || selectedTariff === 'escolar') && (
        <View style={styles.uploadSectionCard}>
          <View style={styles.uploadHeaderRow}>
            <View style={styles.iconCircle}>
              <UploadCloudIcon size={18} color={Theme.colors.background.dark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Subir Carnet Universitario / Escolar</Text>
              <Text style={styles.uploadSubtitle}>
                Adjunta fotografía legible de tu carnet vigente expedido por la entidad oficial.
              </Text>
            </View>
          </View>

          {hasDocument ? (
            <View style={styles.uploadedFileBox}>
              <View style={styles.fileIconBox}>
                <FileTextIcon size={22} color={Theme.colors.primary.blue} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{documentName}</Text>
                <Text style={styles.fileSize}>1.4 MB - Documento validado</Text>
                <View style={{ marginTop: 4 }}>
                  <PhosphorBadge label="CARNET ADJUNTADO" size="small" />
                </View>
              </View>
              <TouchableOpacity
                style={styles.replaceButton}
                onPress={handleUploadSimulate}
                activeOpacity={0.7}
              >
                <Text style={styles.replaceButtonText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dropZone}
              onPress={handleUploadSimulate}
              activeOpacity={0.7}
            >
              <UploadCloudIcon size={32} color={Theme.colors.background.dark} />
              <Text style={styles.dropZoneTitle}>Subir carnet o documento</Text>
              <Text style={styles.dropZoneHint}>Formatos aceptados: PDF, JPG o PNG (máx. 5 MB)</Text>
            </TouchableOpacity>
          )}

          {/* Form details */}
          <View style={styles.metaForm}>
            <PillInputField
              label="Centro de Estudios"
              value={institution}
              onChangeText={setInstitution}
              placeholder="Universidad o Colegio"
            />

            <PillInputField
              label="Código de Estudiante / Matrícula"
              value={studentCode}
              onChangeText={setStudentCode}
              placeholder="Código de alumno"
            />

            <PillInputField
              label="Fecha de Vencimiento de Carnet"
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="DD/MM/AAAA"
            />
          </View>
        </View>
      )}

        {/* Spacer for Floating Bottom Actions */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Floating Bottom Actions */}
      <FloatingBottomActions
        primaryTitle={success ? "Solicitud Enviada" : "Confirmar y Solicitar Tarifa"}
        onPrimaryPress={handleConfirm}
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
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.m,
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
  tariffsContainer: {
    gap: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  tariffCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.m,
  },
  tariffCardActive: {
    borderColor: Theme.colors.background.dark,
    backgroundColor: '#fafafa',
  },
  tariffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tariffTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tariffTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Theme.colors.background.dark,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.background.dark,
  },
  tariffDescription: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  fareAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fareLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
  },
  fareAmount: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.primary.blue,
  },
  uploadSectionCard: {
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 2,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  uploadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  uploadTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 15,
    color: Theme.colors.background.dark,
  },
  uploadSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  uploadedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardSmall,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.m,
    gap: 12,
    marginBottom: Theme.spacing.m,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e6ebff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
  },
  fileSize: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
  replaceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
    backgroundColor: Theme.colors.background.dark,
  },
  replaceButtonText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 11,
    color: Theme.colors.background.white,
  },
  dropZone: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background.white,
    borderRadius: Theme.borderRadius.cardSmall,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Theme.colors.background.dark,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  dropZoneTitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
    marginTop: 8,
  },
  dropZoneHint: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 11,
    color: Theme.colors.ui.textSecondary,
    marginTop: 4,
  },
  metaForm: {
    marginTop: Theme.spacing.s,
  },
  fieldLabel: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.background.dark,
    marginBottom: 6,
    marginLeft: Theme.spacing.xs,
  },
  inputSpacing: {
    marginBottom: Theme.spacing.m,
  },
  buttonsContainer: {
    marginTop: Theme.spacing.m,
  },
});
