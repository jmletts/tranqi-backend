import { AgentProfile, AgentRegistrationData, User } from '@domain/models/Auth';
import {
  AgentCashCloseSummary,
  AgentDashboardData,
  AgentIssueCardInput,
  AgentIssueCardResult,
  AgentPassengerCard,
  AgentRechargeInput,
  AgentRechargeResult,
  AgentTransaction,
  AgentTransactionType,
  CashClosureRecord,
} from '@domain/models/Agent';
import { CardStatus, FareCategory, formatFareCategoryLabel } from '@domain/models/Traveler';
import { HttpClient, extractApiErrorMessage } from '../http/HttpClient';
import { TokenStorage } from '../storage/TokenStorage';

interface RawAgentProfile {
  agentCode: string;
  businessName: string;
  businessAddress: string;
  operationalBalance: number | string;
  commissionRate: number | string;
  status: string;
  registeredAt: string;
}

interface RawUserProfile {
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

interface RawAgentTransaction {
  id: string;
  referenceCode: string;
  type: string;
  cardId: string;
  cardHolder: string;
  fareCategory: string;
  amount: number | string;
  previousBalance?: number | string | null;
  newBalance?: number | string | null;
  paymentMethod: string;
  status: string;
  unlockedDebt: boolean;
  notes?: string | null;
  createdAt: string;
}

interface RawCardLookup {
  cardId: string;
  accountId?: string;
  verificationNumber?: string;
  holderName: string;
  holderDni: string;
  fareCategory: string;
  balance: number | string;
  cardStatus: string;
}

interface RawCashClosureRecord {
  id: string;
  closedAt: string;
  totalRecharged: number | string;
  cashTotal: number | string;
  digitalTotal: number | string;
  cardIssuesTotal: number | string;
  transactionsCount: number;
  estimatedCommission: number | string;
  operationalBalanceSnapshot: number | string;
  notes?: string | null;
}

function formatDateTime(iso: string): { dateStr: string; timeStr: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { dateStr: '--/--/--', timeStr: '--:--' };
  }
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const dateStr = isToday
    ? 'Hoy'
    : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
        d.getFullYear()
      ).slice(-2)}`;

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return {
    dateStr,
    timeStr: `${String(hours).padStart(2, '0')}:${minutes} ${period}`,
  };
}

function mapTransaction(raw: RawAgentTransaction): AgentTransaction {
  const { dateStr, timeStr } = formatDateTime(raw.createdAt);
  const rawType = (raw.type || 'RECHARGE').toUpperCase() as AgentTransactionType;
  const isRejected = (raw.status || '').toUpperCase().includes('RECHAZ');
  return {
    id: raw.id,
    referenceCode: raw.referenceCode,
    type: rawType,
    cardId: raw.cardId,
    cardHolder: raw.cardHolder,
    fareCategory: raw.fareCategory,
    fareType:
      raw.fareCategory === 'AGENTE' ? 'Agente' : formatFareCategoryLabel(raw.fareCategory),
    amount: Number(raw.amount) || 0,
    previousBalance:
      raw.previousBalance !== null && raw.previousBalance !== undefined
        ? Number(raw.previousBalance)
        : undefined,
    newBalance:
      raw.newBalance !== null && raw.newBalance !== undefined
        ? Number(raw.newBalance)
        : undefined,
    paymentMethod: raw.paymentMethod || 'Efectivo',
    status: isRejected ? 'Rechazado' : 'Completado',
    unlockedDebt: Boolean(raw.unlockedDebt),
    notes: raw.notes || '',
    createdAt: raw.createdAt,
    dateStr,
    timeStr,
  };
}

function mapCardLookup(raw: RawCardLookup): AgentPassengerCard {
  const fareCategory = ((raw.fareCategory || 'GENERAL').toUpperCase() as FareCategory);
  return {
    cardId: raw.cardId,
    accountId: raw.accountId,
    verificationNumber: raw.verificationNumber,
    holderName: raw.holderName || 'Tarjeta Anónima',
    holderDni: raw.holderDni || 'Sin vincular',
    fareCategory,
    fareType: formatFareCategoryLabel(fareCategory),
    balance: Number(raw.balance) || 0,
    cardStatus: (raw.cardStatus || 'ACTIVE').toUpperCase() as CardStatus,
  };
}

function mapAgentProfile(raw: RawAgentProfile): AgentProfile {
  return {
    agentCode: raw.agentCode,
    businessName: raw.businessName,
    businessAddress: raw.businessAddress,
    status: 'ACTIVE',
    registeredAt: raw.registeredAt,
  };
}

function mapUser(raw: RawUserProfile): User {
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

function mapClosure(raw: RawCashClosureRecord): CashClosureRecord {
  const { dateStr, timeStr } = formatDateTime(raw.closedAt);
  return {
    id: raw.id,
    closedAt: raw.closedAt,
    dateStr,
    timeStr,
    totalRecharged: Number(raw.totalRecharged) || 0,
    cashTotal: Number(raw.cashTotal) || 0,
    digitalTotal: Number(raw.digitalTotal) || 0,
    cardIssuesTotal: Number(raw.cardIssuesTotal) || 0,
    transactionsCount: raw.transactionsCount || 0,
    estimatedCommission: Number(raw.estimatedCommission) || 0,
    operationalBalanceSnapshot: Number(raw.operationalBalanceSnapshot) || 0,
    notes: raw.notes || '',
  };
}

export const AgentApiService = {
  async registerAsAgent(
    data: AgentRegistrationData
  ): Promise<{ token: string; user: User; agentProfile: AgentProfile }> {
    try {
      const response = await HttpClient.post<{
        token: string;
        user: RawUserProfile;
        agentProfile: RawAgentProfile;
      }>('/agent/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        acceptedTerms: data.acceptedTerms,
      });

      const { token, user, agentProfile } = response.data;
      if (token) {
        await TokenStorage.saveToken(token);
      }

      return {
        token,
        user: mapUser(user),
        agentProfile: mapAgentProfile(agentProfile),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo completar el registro como agente'));
    }
  },

  async getDashboard(): Promise<AgentDashboardData> {
    try {
      const response = await HttpClient.get<{
        agentProfile: RawAgentProfile;
        operationalBalance: number | string;
        commissionRate: number | string;
        todayTotalRecharged: number | string;
        todayTransactionsCount: number;
        estimatedCommission: number | string;
        recentTransactions: RawAgentTransaction[];
      }>('/agent/dashboard');

      const d = response.data;
      return {
        agentCode: d.agentProfile.agentCode,
        businessName: d.agentProfile.businessName,
        businessAddress: d.agentProfile.businessAddress,
        operationalBalance: Number(d.operationalBalance) || 0,
        commissionRate: Number(d.commissionRate) || 0.025,
        todayTotalRecharged: Number(d.todayTotalRecharged) || 0,
        todayTransactionsCount: d.todayTransactionsCount || 0,
        estimatedCommission: Number(d.estimatedCommission) || 0,
        status: d.agentProfile.status,
        registeredAt: d.agentProfile.registeredAt,
        recentTransactions: (d.recentTransactions || []).map(mapTransaction),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo cargar el panel de agente'));
    }
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    businessAddress?: string;
  }): Promise<{ user: User; agentProfile: AgentProfile }> {
    try {
      const response = await HttpClient.put<{
        user: RawUserProfile;
        agentProfile: RawAgentProfile;
      }>('/agent/profile', data);

      return {
        user: mapUser(response.data.user),
        agentProfile: mapAgentProfile(response.data.agentProfile),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo actualizar el perfil del punto'));
    }
  },

  async replenishQuota(
    amount: number
  ): Promise<{ operationalBalance: number; transaction: AgentTransaction }> {
    try {
      const response = await HttpClient.post<{
        operationalBalance: number | string;
        transaction: RawAgentTransaction;
      }>('/agent/quota/replenish', { amount });

      return {
        operationalBalance: Number(response.data.operationalBalance) || 0,
        transaction: mapTransaction(response.data.transaction),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo reponer el cupo operativo'));
    }
  },

  async lookupCards(query: string): Promise<AgentPassengerCard[]> {
    try {
      const response = await HttpClient.get<RawCardLookup[]>('/agent/cards/lookup', {
        params: { query },
      });
      return (response.data || []).map(mapCardLookup);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo buscar la tarjeta'));
    }
  },

  async listInventoryCards(): Promise<string[]> {
    try {
      const response = await HttpClient.get<string[]>('/agent/cards/inventory');
      return response.data || [];
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo cargar el inventario de tarjetas'));
    }
  },

  async issueCard(input: AgentIssueCardInput): Promise<AgentIssueCardResult> {
    try {
      const response = await HttpClient.post<{
        cardId: string;
        accountId: string;
        verificationNumber: string;
        securityCode: string;
        fareCategory: string;
        initialBalance: number | string;
        status: string;
        transaction: RawAgentTransaction;
      }>('/agent/cards/issue', input);

      const d = response.data;
      const fareCategory = (d.fareCategory || 'GENERAL').toUpperCase() as FareCategory;
      return {
        cardId: d.cardId,
        accountId: d.accountId,
        verificationNumber: d.verificationNumber,
        securityCode: d.securityCode,
        fareCategory,
        fareType: formatFareCategoryLabel(fareCategory),
        initialBalance: Number(d.initialBalance) || 0,
        status: d.status,
        transaction: mapTransaction(d.transaction),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo emitir la tarjeta'));
    }
  },

  async processRecharge(input: AgentRechargeInput): Promise<AgentRechargeResult> {
    try {
      const response = await HttpClient.post<{
        transaction: RawAgentTransaction;
        updatedCard: RawCardLookup;
        updatedAgentBalance: number | string;
      }>('/agent/recharges', input);

      return {
        transaction: mapTransaction(response.data.transaction),
        updatedCard: mapCardLookup(response.data.updatedCard),
        updatedAgentBalance: Number(response.data.updatedAgentBalance) || 0,
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo procesar la recarga'));
    }
  },

  async getTransactions(type?: string): Promise<AgentTransaction[]> {
    try {
      const response = await HttpClient.get<RawAgentTransaction[]>('/agent/transactions', {
        params: type && type !== 'ALL' ? { type } : undefined,
      });
      return (response.data || []).map(mapTransaction);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo cargar el historial de operaciones'));
    }
  },

  async getCashClose(): Promise<AgentCashCloseSummary> {
    try {
      const response = await HttpClient.get<{
        agentCode: string;
        businessName: string;
        generatedAt: string;
        operationalBalance: number | string;
        commissionRate: number | string;
        totalCollected: number | string;
        totalRecharged: number | string;
        cashTotal: number | string;
        cashCount: number;
        digitalTotal: number | string;
        digitalCount: number;
        cardIssuesTotal: number | string;
        cardIssuesCount: number;
        replenishmentsTotal: number | string;
        replenishmentsCount: number;
        rechargesCount: number;
        rejectedCount: number;
        estimatedCommission: number | string;
        netToSettle: number | string;
        todayTransactions: RawAgentTransaction[];
        recentClosures: RawCashClosureRecord[];
      }>('/agent/cash-close');

      const d = response.data;
      return {
        agentCode: d.agentCode,
        businessName: d.businessName,
        generatedAt: d.generatedAt,
        operationalBalance: Number(d.operationalBalance) || 0,
        commissionRate: Number(d.commissionRate) || 0.025,
        totalCollected: Number(d.totalCollected) || 0,
        totalRecharged: Number(d.totalRecharged) || 0,
        cashTotal: Number(d.cashTotal) || 0,
        cashCount: d.cashCount || 0,
        digitalTotal: Number(d.digitalTotal) || 0,
        digitalCount: d.digitalCount || 0,
        cardIssuesTotal: Number(d.cardIssuesTotal) || 0,
        cardIssuesCount: d.cardIssuesCount || 0,
        replenishmentsTotal: Number(d.replenishmentsTotal) || 0,
        replenishmentsCount: d.replenishmentsCount || 0,
        rechargesCount: d.rechargesCount || 0,
        rejectedCount: d.rejectedCount || 0,
        estimatedCommission: Number(d.estimatedCommission) || 0,
        netToSettle: Number(d.netToSettle) || 0,
        todayTransactions: (d.todayTransactions || []).map(mapTransaction),
        recentClosures: (d.recentClosures || []).map(mapClosure),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo cargar el cierre de caja'));
    }
  },

  async confirmCashClose(notes?: string): Promise<CashClosureRecord> {
    try {
      const response = await HttpClient.post<RawCashClosureRecord>('/agent/cash-close', {
        notes: notes || '',
      });
      return mapClosure(response.data);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo registrar el cierre de caja'));
    }
  },
};
