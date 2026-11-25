import { User } from '@domain/models/Auth';
import {
  CardStatus,
  FareCategory,
  LinkCardInput,
  RechargeCardInput,
  TransferFundsInput,
  TravelerCard,
  TravelerMovement,
  UpdateProfileInput,
  formatFareCategoryLabel,
} from '@domain/models/Traveler';
import { HttpClient, extractApiErrorMessage } from '../http/HttpClient';

interface RawTravelerCardDTO {
  cardId: string;
  accountId: string;
  alias?: string | null;
  verificationNumber?: string | null;
  cardStatus: string;
  accountStatus: string;
  fareCategory: string;
  balance: number | string;
  debtMarginLimit: number | string;
  isDefault: boolean;
}

interface RawTravelerMovementDTO {
  identifier: string;
  accountId: string;
  cardId: string;
  cardAlias?: string | null;
  fareCategory?: string | null;
  type: string;
  amount: number | string;
  date: string;
  detail?: string | null;
}

interface RawTravelerMovementsResponse {
  totalBalance: number | string;
  movements: RawTravelerMovementDTO[];
}

interface RawUserProfileDTO {
  id: string;
  dni: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  address: string;
  baseFare: string;
  roles: string[];
}

function formatDateParts(isoDate: string): { dateStr: string; timeStr: string } {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return { dateStr: isoDate || '--/--/--', timeStr: '--:--' };
  }
  const dd = String(parsed.getDate()).padStart(2, '0');
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const yyyy = parsed.getFullYear();
  const yy = String(yyyy).slice(-2);

  let hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return {
    dateStr: `${dd}/${mm}/${yy}`,
    timeStr: `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`,
  };
}

function mapMovement(raw: RawTravelerMovementDTO): TravelerMovement {
  const rawTypeUpper = (raw.type || '').toUpperCase();
  const isIncome =
    rawTypeUpper === 'RECARGA' ||
    rawTypeUpper === 'TRANSFERENCIA_RECIBIDA' ||
    rawTypeUpper === 'INCOME';

  let title = raw.detail?.trim() || raw.type;
  if (rawTypeUpper === 'RECARGA' && (!raw.detail || raw.detail.startsWith('Recarga confirmada'))) {
    title = 'Recarga de Saldo';
  } else if (rawTypeUpper === 'TRANSFERENCIA_ENVIADA') {
    title = 'Transferencia Enviada';
  } else if (rawTypeUpper === 'TRANSFERENCIA_RECIBIDA') {
    title = 'Transferencia Recibida';
  } else if (rawTypeUpper === 'VIAJE') {
    title = raw.detail?.trim() || 'Viaje en Transporte';
  }

  const { dateStr, timeStr } = formatDateParts(raw.date);
  const fareCat = ((raw.fareCategory || 'GENERAL').toUpperCase() as FareCategory);

  return {
    id: raw.identifier,
    identifier: raw.identifier,
    accountId: raw.accountId,
    cardId: raw.cardId,
    cardAlias: raw.cardAlias || raw.cardId,
    fareCategory: fareCat,
    fareType: formatFareCategoryLabel(fareCat),
    rawType: rawTypeUpper,
    type: isIncome ? 'income' : 'expense',
    title,
    amount: Math.abs(Number(raw.amount) || 0),
    date: raw.date,
    dateStr,
    timeStr,
    detail: raw.detail || title,
    status: 'Completado',
  };
}

function mapCard(raw: RawTravelerCardDTO): TravelerCard {
  const fareCat = ((raw.fareCategory || 'GENERAL').toUpperCase() as FareCategory);
  return {
    id: raw.cardId,
    cardId: raw.cardId,
    accountId: raw.accountId,
    name: raw.alias?.trim() || raw.cardId,
    verificationNumber: raw.verificationNumber || '',
    cardStatus: (raw.cardStatus || 'ACTIVE').toUpperCase() as CardStatus,
    accountStatus: raw.accountStatus || 'ACTIVE',
    fareCategory: fareCat,
    fareType: formatFareCategoryLabel(fareCat),
    balance: Number(raw.balance) || 0,
    debtMarginLimit: Number(raw.debtMarginLimit) || -3.0,
    isDefault: Boolean(raw.isDefault),
  };
}

function mapProfile(raw: RawUserProfileDTO): User {
  return {
    id: raw.id,
    dni: raw.dni,
    name: raw.name,
    phone: raw.phone,
    email: raw.email,
    age: raw.age,
    address: raw.address,
    baseFare: raw.baseFare,
    roles: Array.isArray(raw.roles) ? raw.roles : ['USUARIO_FINAL'],
  };
}

export const TravelerApiService = {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await HttpClient.get<RawUserProfileDTO>('/auth/me');
      return mapProfile(response.data);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo obtener el perfil del usuario'));
    }
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    try {
      const response = await HttpClient.put<RawUserProfileDTO>('/auth/me', data);
      return mapProfile(response.data);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo actualizar el perfil'));
    }
  },

  async getMyCards(): Promise<TravelerCard[]> {
    try {
      const response = await HttpClient.get<RawTravelerCardDTO[]>('/cards/me');
      return (response.data || []).map(mapCard);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudieron cargar tus tarjetas'));
    }
  },

  async getMyMovements(accountId?: string): Promise<{ totalBalance: number; movements: TravelerMovement[] }> {
    try {
      const response = await HttpClient.get<RawTravelerMovementsResponse>('/accounts/me/movements', {
        params: accountId ? { accountId } : undefined,
      });
      return {
        totalBalance: Number(response.data?.totalBalance) || 0,
        movements: (response.data?.movements || []).map(mapMovement),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudieron cargar los movimientos'));
    }
  },

  async transferFunds(payload: TransferFundsInput): Promise<void> {
    try {
      await HttpClient.post('/accounts/me/transfer', {
        originAccountId: payload.originAccountId,
        destinationAccountId: payload.destinationAccountId,
        amount: payload.amount,
      });
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo realizar la transferencia'));
    }
  },

  async rechargeCard(payload: RechargeCardInput): Promise<void> {
    try {
      const transactionId = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await HttpClient.post('/accounts/recharge', {
        transactionId,
        cardId: payload.cardId,
        amount: payload.amount,
        origin: 'DIGITAL_GATEWAY',
      });
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo completar la recarga'));
    }
  },

  async linkMyCard(payload: LinkCardInput): Promise<void> {
    try {
      await HttpClient.post('/cards/me/link', {
        cardIdentifier: payload.cardIdentifier,
        securityCode: payload.securityCode,
        alias: payload.alias,
      });
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo vincular la tarjeta'));
    }
  },

  async reportCardLost(cardId: string): Promise<void> {
    try {
      await HttpClient.post(`/cards/${encodeURIComponent(cardId)}/report-lost`);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo bloquear la tarjeta'));
    }
  },
};
