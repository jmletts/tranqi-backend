import React from 'react';
import Svg, { Path, Rect, Circle, Polyline, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const HomeIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const PassIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z" />
    <Path d="M4 14h16" />
    <Path d="M8 17h.01" />
    <Path d="M16 17h.01" />
    <Path d="M6 20v2" />
    <Path d="M18 20v2" />
    <Path d="M8 6h8v4H8z" />
  </Svg>
);

export const RefreshIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <Path d="M3 3v5h5" />
  </Svg>
);

export const PercentIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="19" y1="5" x2="5" y2="19" />
    <Circle cx="6.5" cy="6.5" r="2.5" />
    <Circle cx="17.5" cy="17.5" r="2.5" />
  </Svg>
);

export const UserIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

export const SettingsIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const PlusIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="16" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </Svg>
);

export const NfcIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5.5 17.5a13.3 13.3 0 0 1 0-11" />
    <Path d="M9 19.5a16.8 16.8 0 0 1 0-15" />
    <Path d="M13 21.5a21.3 21.3 0 0 1 0-19" />
    <Path d="M17 23.5a25.5 25.5 0 0 1 0-23" />
  </Svg>
);

export const ChevronRightIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const HamburgerIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="3" y1="12" x2="21" y2="12" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const LockIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const CardSmallIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <Line x1="2" y1="10" x2="22" y2="10" />
  </Svg>
);

export const WalletInIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    <Path d="M10 2l3 3-3 3" />
    <Line x1="13" y1="5" x2="6" y2="5" />
  </Svg>
);

export const BusFrontIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 14V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8" />
    <Path d="M2 14h20v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5z" />
    <Circle cx="7" cy="17" r="1.5" />
    <Circle cx="17" cy="17" r="1.5" />
    <Path d="M6 10h12" />
    <Path d="M12 2v4" />
  </Svg>
);

export const MapPinIcon = ({ size = 24, color = '#010100' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);
