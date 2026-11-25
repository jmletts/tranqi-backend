import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import {
  CardSmallIcon,
  RefreshIcon,
  ChevronRightIcon,
  CloseIcon,
  CheckCircleIcon,
  PlusIcon,
} from './icons';
import { TravelerCard } from '@domain/models/Traveler';

export interface TranqiCardItemProps {
  id?: string;
  cardId?: string;
  name: string;
  fareType: string;
  balance: number;

  /** List of cards available for selection (enables floating dropdown menu) */
  cards?: TravelerCard[];
  selectedCardId?: string;
  onSelectCard?: (card: TravelerCard) => void;

  /** Visual variant or icon for right side */
  rightAction?: 'refresh' | 'chevron' | 'none';
  variant?: 'selectable' | 'navigation' | 'static';

  /** Custom press action (e.g. for Home navigation) */
  onPress?: () => void;

  /** Title in the selection modal */
  modalTitle?: string;

  /** Custom container styling */
  containerStyle?: StyleProp<ViewStyle>;
  showDivider?: boolean;
}

export const TranqiCardItem = ({
  id,
  cardId,
  name,
  fareType,
  balance,
  cards,
  selectedCardId,
  onSelectCard,
  rightAction = 'chevron',
  variant,
  onPress,
  modalTitle = 'Seleccionar Tarjeta',
  containerStyle,
  showDivider = true,
}: TranqiCardItemProps) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const displayId = id || cardId || '';
  const currentSelectedId = selectedCardId || displayId;

  // Whether this instance allows opening the floating selection menu
  const isSelectable =
    variant === 'selectable' ||
    (Boolean(cards && cards.length > 0) && rightAction !== 'chevron');

  const handlePress = () => {
    if (isSelectable) {
      setModalVisible(true);
    } else if (onPress) {
      onPress();
    }
  };

  const handleCardPick = (card: TravelerCard) => {
    if (onSelectCard) {
      onSelectCard(card);
    }
    setModalVisible(false);
  };

  const handleAddNewCard = () => {
    setModalVisible(false);
    router.push('/add-card');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, !showDivider && { borderBottomWidth: 0 }, containerStyle]}
        onPress={handlePress}
        activeOpacity={isSelectable || onPress ? 0.7 : 1}
      >
        <View style={styles.leftContent}>
          {/* Card Icon Box */}
          <View style={styles.iconContainer}>
            <CardSmallIcon size={24} color={Theme.colors.background.dark} />
          </View>

          {/* Card Info Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.cardId}>{displayId}</Text>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.fareTypeBadge}>
                <Text style={styles.fareTypeText}>{fareType}</Text>
              </View>
            </View>
            <Text style={styles.balance}>S/ {balance.toFixed(2)}</Text>
            <Text style={styles.subtitle}>Saldo Disponible</Text>
          </View>
        </View>

        {/* Right Action */}
        {rightAction === 'refresh' && (
          <TouchableOpacity
            style={styles.switchButton}
            onPress={isSelectable ? () => setModalVisible(true) : onPress}
            activeOpacity={0.8}
            accessibilityLabel="Cambiar tarjeta"
          >
            <RefreshIcon size={16} color={Theme.colors.background.white} />
          </TouchableOpacity>
        )}

        {rightAction === 'chevron' && (
          <View style={styles.chevronContainer}>
            <ChevronRightIcon size={20} color={Theme.colors.background.dark} />
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Modal for Card Selection */}
      {isSelectable && cards && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />

            <View style={styles.modalSheet}>
              <SafeAreaView>
                {/* Drag Handle Indicator */}
                <View style={styles.dragPillHandle}>
                  <View style={styles.dragPillBar} />
                </View>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleBox}>
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <Text style={styles.modalSubtitle}>
                      Elige la tarjeta que deseas utilizar
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                    accessibilityLabel="Cerrar"
                    activeOpacity={0.7}
                  >
                    <CloseIcon size={18} color={Theme.colors.background.white} />
                  </TouchableOpacity>
                </View>

                {/* Cards List */}
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {cards.map((item) => {
                    const isSelected = item.id === currentSelectedId;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.cardOptionItem,
                          isSelected && styles.cardOptionItemSelected,
                        ]}
                        onPress={() => handleCardPick(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.cardOptionLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              isSelected && styles.iconContainerSelected,
                            ]}
                          >
                            <CardSmallIcon size={24} color={Theme.colors.background.dark} />
                          </View>

                          <View style={styles.detailsContainer}>
                            <View style={styles.nameRow}>
                              <Text style={styles.cardId}>{item.id}</Text>
                              <Text style={styles.name}>{item.name}</Text>
                              <View style={styles.fareTypeBadge}>
                                <Text style={styles.fareTypeText}>{item.fareType}</Text>
                              </View>
                            </View>
                            <Text style={styles.balance}>
                              S/ {item.balance.toFixed(2)}
                            </Text>
                            <Text style={styles.subtitle}>Saldo Disponible</Text>
                          </View>
                        </View>

                        <View style={styles.selectionIndicator}>
                          {isSelected ? (
                            <View style={styles.selectedBadge}>
                              <CheckCircleIcon size={20} color={Theme.colors.background.dark} />
                            </View>
                          ) : (
                            <View style={styles.unselectedRadio} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Add New Card Action */}
                  <TouchableOpacity
                    style={styles.addNewCardOption}
                    onPress={handleAddNewCard}
                    activeOpacity={0.8}
                  >
                    <PlusIcon size={18} color={Theme.colors.background.dark} />
                    <Text style={styles.addNewCardText}>Registrar Nueva Tarjeta</Text>
                  </TouchableOpacity>
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.ui.inputBorder,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.primary.yellow,
    borderRadius: Theme.borderRadius.cardSmall, // 12
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  iconContainerSelected: {
    backgroundColor: Theme.colors.primary.yellow,
    borderWidth: 1,
    borderColor: Theme.colors.background.dark,
  },
  detailsContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardId: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 13,
    color: Theme.colors.ui.textSecondary,
    opacity: 0.6,
  },
  name: {
    fontFamily: Theme.typography.family.black,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
  fareTypeBadge: {
    backgroundColor: Theme.colors.primary.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
  },
  fareTypeText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 8.5,
    color: Theme.colors.background.dark,
  },
  balance: {
    fontFamily: Theme.typography.family.black,
    fontSize: 16,
    color: Theme.colors.background.dark,
  },
  subtitle: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.background.dark,
  },
  switchButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.s,
  },
  chevronContainer: {
    paddingLeft: Theme.spacing.s,
  },

  /* Modal Floating Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer, // 40
    borderTopRightRadius: 28,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.xl,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  dragPillHandle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragPillBar: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8d8d8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
    paddingTop: Theme.spacing.xs,
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.dark,
  },
  modalSubtitle: {
    fontFamily: Theme.typography.family.medium,
    fontSize: 12,
    color: Theme.colors.ui.textSecondary,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.m,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalScrollContent: {
    paddingVertical: Theme.spacing.s,
    gap: Theme.spacing.s,
  },
  cardOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.cardMedium,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
    backgroundColor: Theme.colors.background.white,
  },
  cardOptionItemSelected: {
    borderColor: Theme.colors.background.dark,
    backgroundColor: '#fffdf0', // Subtle light yellow highlight matching Tranqi theme
  },
  cardOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionIndicator: {
    marginLeft: Theme.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.ui.inputBorder,
  },
  addNewCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: Theme.colors.background.dark,
    backgroundColor: Theme.colors.background.white,
    marginTop: Theme.spacing.s,
    marginBottom: Theme.spacing.s,
  },
  addNewCardText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 14,
    color: Theme.colors.background.dark,
  },
});
