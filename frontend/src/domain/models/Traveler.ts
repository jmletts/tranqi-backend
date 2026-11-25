export type FareCategory = 'GENERAL' | 'SCHOOL' | 'UNIVERSITY';

export type CardStatus =
  | 'IN_INVENTORY'
  | 'ACTIVE'
  | 'BLOCKED_DEBT'
  | 'FRAUD_BLOCKED'
  | 'LOST_REPORTED';

export interface TravelerCard {
  id: string;
  cardId: string;
  accountId: string;
  name: string;
  verificationNumber: string;
  cardStatus: CardStatus;
  accountStatus: string;
  fareCategory: FareCategory;
  fareType: string;
  balance: number;
  debtMarginLimit: number;
  isDefault: boolean;
}

export interface TravelerMovement {
  id: string;
  identifier: string;
  accountId: string;
  cardId: string;
  cardAlias: string;
  fareCategory: FareCategory;
  fareType: string;
  rawType: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  dateStr: string;
  timeStr: string;
  detail: string;
  status: 'Completado';
}

export interface TransferFundsInput {
  originAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export interface RechargeCardInput {
  cardId: string;
  amount: number;
}

export interface LinkCardInput {
  cardIdentifier: string;
  securityCode: string;
  alias?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function formatFareCategoryLabel(fareCategory?: string): string {
  switch ((fareCategory || '').toUpperCase()) {
    case 'UNIVERSITY':
      return 'Universitaria';
    case 'SCHOOL':
      return 'Escolar';
    default:
      return 'General';
  }
}

export function formatCardStatusLabel(status?: string): string {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE':
      return 'Activa';
    case 'BLOCKED_DEBT':
      return 'Bloqueada por deuda';
    case 'LOST_REPORTED':
      return 'Reportada perdida';
    case 'FRAUD_BLOCKED':
      return 'Bloqueada por fraude';
    case 'IN_INVENTORY':
      return 'En inventario';
    default:
      return status || 'Desconocido';
  }
}
