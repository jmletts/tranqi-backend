import React from 'react';
import { TranqiCardItem, TranqiCardItemProps } from './TranqiCardItem';

export interface CardSelectorDropdownProps extends Partial<TranqiCardItemProps> {
  cardId?: string;
  id?: string;
  name: string;
  fareType: string;
  balance: number;
  onPress?: () => void;
}

export const CardSelectorDropdown = (props: CardSelectorDropdownProps) => {
  return (
    <TranqiCardItem
      rightAction="refresh"
      {...props}
    />
  );
};
