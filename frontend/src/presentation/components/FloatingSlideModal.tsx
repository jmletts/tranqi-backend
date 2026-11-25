import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Theme } from '@/constants/theme';
import { ChevronLeftIcon, CloseIcon } from '@presentation/components/icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingSlideModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const FloatingSlideModal = ({
  visible,
  onClose,
  title,
  children,
}: FloatingSlideModalProps) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture downward gesture from drag area or header
        return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header Black Container with Slide Pan Handlers */}
          <View style={styles.blackHeaderWrapper} {...panResponder.panHandlers}>
            <SafeAreaView>
              {/* Drag Indicator Pill */}
              <View style={styles.dragPillHandle}>
                <View style={styles.dragPillBar} />
              </View>

              {/* Navigation Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.headerIconButton}
                  accessibilityLabel="Volver"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <ChevronLeftIcon size={24} color={Theme.colors.background.white} />
                </TouchableOpacity>

                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>

                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.headerIconButton}
                  accessibilityLabel="Cerrar"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <CloseIcon size={22} color={Theme.colors.background.white} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>

          {/* White Main Asymmetrical Body Container */}
          <View style={styles.bodyContainer}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 0, 0.6)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.dark,
  },
  blackHeaderWrapper: {
    backgroundColor: Theme.colors.background.dark,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    paddingHorizontal: Theme.spacing.l,
    paddingBottom: Theme.spacing.m,
  },
  dragPillHandle: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  dragPillBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.s,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: Theme.typography.family.black,
    fontSize: 18,
    color: Theme.colors.background.white,
    textAlign: 'center',
    marginHorizontal: Theme.spacing.s,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.white,
    borderTopLeftRadius: Theme.borderRadius.asymmetricContainer, // 40px
    overflow: 'hidden',
  },
});
