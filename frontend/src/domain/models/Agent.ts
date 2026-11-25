import { CardStatus, FareCategory } from './Traveler';

export type AgentTransactionType = 'RECHARGE' | 'REPLENISHMENT' | 'REJECTED' | 'CARD_ISSUE';

export type AgentPaymentMethod = 'Efectivo' | 'Yape / Plin';

export interface AgentPassengerCard {
  cardId: string;
  accountId?: string;
  verificationNumber?: string;
  holderName: string;
  holderDni: string;
  fareCategory: FareCategory;
  fareType: string;
  balance: number;
  cardStatus: CardStatus;
}

export interface AgentTransaction {
  id: string;
  referenceCode: string;
  type: AgentTransactionType;
  cardId: string;
  cardHolder: string;
  fareCategory: string;
  fareType: string;
  amount: number;
  previousBalance?: number;
  newBalance?: number;
  paymentMethod: string;
  status: 'Completado' | 'Rechazado';
  unlockedDebt: boolean;
  notes: string;
  createdAt: string;
  dateStr: string;
  timeStr: string;
}

export interface AgentDashboardData {
  agentCode: string;
  businessName: string;
  businessAddress: string;
  operationalBalance: number;
  commissionRate: number;
  todayTotalRecharged: number;
  todayTransactionsCount: number;
  estimatedCommission: number;
  status: string;
  registeredAt: string;
  recentTransactions: AgentTransaction[];
}

export interface AgentRechargeInput {
  cardId: string;
  amount: number;
  paymentMethod: AgentPaymentMethod;
}

export interface AgentRechargeResult {
  transaction: AgentTransaction;
  updatedCard: AgentPassengerCard;
  updatedAgentBalance: number;
}

export interface AgentIssueCardInput {
  cardId: string;
  fareCategory: FareCategory;
  documentNumber?: string;
  paymentMethod: AgentPaymentMethod;
}

export interface AgentIssueCardResult {
  cardId: string;
  accountId: string;
  verificationNumber: string;
  securityCode: string;
  fareCategory: FareCategory;
  fareType: string;
  initialBalance: number;
  status: string;
  transaction: AgentTransaction;
}

export interface CashClosureRecord {
  id: string;
  closedAt: string;
  dateStr: string;
  timeStr: string;
  totalRecharged: number;
  cashTotal: number;
  digitalTotal: number;
  cardIssuesTotal: number;
  transactionsCount: number;
  estimatedCommission: number;
  operationalBalanceSnapshot: number;
  notes: string;
}

export interface AgentCashCloseSummary {
  agentCode: string;
  businessName: string;
  generatedAt: string;
  operationalBalance: number;
  commissionRate: number;
  totalCollected: number;
  totalRecharged: number;
  cashTotal: number;
  cashCount: number;
  digitalTotal: number;
  digitalCount: number;
  cardIssuesTotal: number;
  cardIssuesCount: number;
  replenishmentsTotal: number;
  replenishmentsCount: number;
  rechargesCount: number;
  rejectedCount: number;
  estimatedCommission: number;
  netToSettle: number;
  todayTransactions: AgentTransaction[];
  recentClosures: CashClosureRecord[];
}
