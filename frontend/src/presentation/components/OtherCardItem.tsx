import React from 'react';
import { TranqiCardItem, TranqiCardItemProps } from './TranqiCardItem';

export interface OtherCardItemProps extends Partial<TranqiCardItemProps> {
  id?: string;
  cardId?: string;
  name: string;
  fareType: string;
  balance: number;
  onPress?: () => void;
}

export const OtherCardItem = (props: OtherCardItemProps) => {
  return (
    <TranqiCardItem
      rightAction="chevron"
      variant="navigation"
      {...props}
    />
  );
};
