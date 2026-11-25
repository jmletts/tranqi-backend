import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import {
  HomeIcon,
  PassIcon,
  RefreshIcon,
  PercentIcon,
  UserIcon,
  BusFrontIcon,
  WalletInIcon,
} from './icons';

export type BottomTabVariant = 'traveler' | 'agent' | 'transporter';

interface FloatingBottomTabProps {
  state: any;
  descriptors: any;
  navigation: any;
  variant?: BottomTabVariant;
  accentColor?: string;
  activeContentColor?: string;
}

export const FloatingBottomTab = ({
  state,
  descriptors,
  navigation,
  variant = 'traveler',
  accentColor,
  activeContentColor,
}: FloatingBottomTabProps) => {
  const resolvedAccentColor =
    accentColor ??
    (variant === 'agent'
      ? Theme.colors.primary.pink
      : variant === 'transporter'
      ? Theme.colors.primary.blue
      : Theme.colors.primary.yellow);

  const resolvedActiveContentColor =
    activeContentColor ??
    (variant === 'traveler'
      ? Theme.colors.background.dark
      : Theme.colors.background.white);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = () => {
            const color = isFocused
              ? resolvedActiveContentColor
              : Theme.colors.background.white;
            switch (route.name) {
              case 'home':
              case 'inicio':
                return <HomeIcon color={color} size={20} />;
              case 'pass':
                return <PassIcon color={color} size={20} />;
              case 'recargar':
                return <WalletInIcon color={color} size={20} />;
              case 'flota':
                return <BusFrontIcon color={color} size={20} />;
              case 'movimientos':
                return <RefreshIcon color={color} size={20} />;
              case 'beneficios':
                return <PercentIcon color={color} size={20} />;
              case 'perfil':
                return <UserIcon color={color} size={20} />;
              default:
                return <HomeIcon color={color} size={20} />;
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                isFocused && { backgroundColor: resolvedAccentColor },
              ]}
            >
              {getIcon()}
              <Text
                style={[
                  styles.tabText,
                  isFocused && { color: resolvedActiveContentColor },
                ]}
              >
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Theme.spacing.l,
    left: Theme.spacing.l,
    right: Theme.spacing.l,
    backgroundColor: Theme.colors.background.dark,
    borderRadius: 40,
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 30,
    height: 54,
  },
  tabText: {
    fontFamily: Theme.typography.family.bold,
    fontSize: 10,
    color: Theme.colors.background.white,
    marginTop: 4,
  },
});
