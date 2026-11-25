import { create } from 'zustand';
import {
  AgentCashCloseSummary,
  AgentIssueCardInput,
  AgentIssueCardResult,
  AgentPassengerCard,
  AgentRechargeInput,
  AgentRechargeResult,
  AgentTransaction,
  CashClosureRecord,
} from '@domain/models/Agent';
import { AgentApiService } from '@infrastructure/api/AgentApiService';

interface AgentState {
  agentBalance: number;
  commissionRate: number;
  todayTotalRecharged: number;
  todayTransactionsCount: number;
  estimatedCommission: number;
  transactions: AgentTransaction[];
  lookupResults: AgentPassengerCard[];
  inventoryCards: string[];
  cashClose: AgentCashCloseSummary | null;
  isLoadingDashboard: boolean;
  isLoadingTransactions: boolean;
  isSearchingCard: boolean;
  isLoadingInventory: boolean;
  isLoadingCashClose: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchTransactions: (type?: string) => Promise<AgentTransaction[]>;
  lookupCards: (query: string) => Promise<AgentPassengerCard[]>;
  processRecharge: (input: AgentRechargeInput) => Promise<AgentRechargeResult>;
  replenishQuota: (amount: number) => Promise<AgentTransaction>;
  fetchInventoryCards: () => Promise<string[]>;
  issueCard: (input: AgentIssueCardInput) => Promise<AgentIssueCardResult>;
  fetchCashClose: () => Promise<AgentCashCloseSummary>;
  confirmCashClose: (notes?: string) => Promise<CashClosureRecord>;
  clearError: () => void;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agentBalance: 0,
  commissionRate: 0.025,
  todayTotalRecharged: 0,
  todayTransactionsCount: 0,
  estimatedCommission: 0,
  transactions: [],
  lookupResults: [],
  inventoryCards: [],
  cashClose: null,
  isLoadingDashboard: false,
  isLoadingTransactions: false,
  isSearchingCard: false,
  isLoadingInventory: false,
  isLoadingCashClose: false,
  isSubmitting: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, error: null });
    try {
      const data = await AgentApiService.getDashboard();
      set({
        agentBalance: data.operationalBalance,
        commissionRate: data.commissionRate,
        todayTotalRecharged: data.todayTotalRecharged,
        todayTransactionsCount: data.todayTransactionsCount,
        estimatedCommission: data.estimatedCommission,
        transactions: data.recentTransactions,
        isLoadingDashboard: false,
      });
    } catch (err: unknown) {
      set({
        isLoadingDashboard: false,
        error: err instanceof Error ? err.message : 'Error al cargar el panel de agente',
      });
      throw err;
    }
  },

  fetchTransactions: async (type?: string) => {
    set({ isLoadingTransactions: true, error: null });
    try {
      const list = await AgentApiService.getTransactions(type);
      set({ transactions: list, isLoadingTransactions: false });
      return list;
    } catch (err: unknown) {
      set({
        isLoadingTransactions: false,
        error: err instanceof Error ? err.message : 'Error al cargar movimientos',
      });
      throw err;
    }
  },

  lookupCards: async (query: string) => {
    set({ isSearchingCard: true, error: null });
    try {
      const cards = await AgentApiService.lookupCards(query);
      set({ lookupResults: cards, isSearchingCard: false });
      return cards;
    } catch (err: unknown) {
      set({
        isSearchingCard: false,
        error: err instanceof Error ? err.message : 'Error al buscar tarjeta',
      });
      throw err;
    }
  },

  processRecharge: async (input: AgentRechargeInput) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await AgentApiService.processRecharge(input);
      set((state) => ({
        agentBalance: result.updatedAgentBalance,
        lookupResults: state.lookupResults.map((c) =>
          c.cardId === result.updatedCard.cardId ? result.updatedCard : c
        ),
        transactions: [result.transaction, ...state.transactions],
        isSubmitting: false,
      }));
      get().fetchDashboard().catch(() => {});
      return result;
    } catch (err: unknown) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Error al procesar recarga',
      });
      // Refresh transactions because rejected attempts are persisted for audit
      get().fetchTransactions().catch(() => {});
      throw err;
    }
  },

  replenishQuota: async (amount: number) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await AgentApiService.replenishQuota(amount);
      set((state) => ({
        agentBalance: res.operationalBalance,
        transactions: [res.transaction, ...state.transactions],
        isSubmitting: false,
      }));
      return res.transaction;
    } catch (err: unknown) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Error al reponer cupo',
      });
      throw err;
    }
  },

  fetchInventoryCards: async () => {
    set({ isLoadingInventory: true, error: null });
    try {
      const cards = await AgentApiService.listInventoryCards();
      set({ inventoryCards: cards, isLoadingInventory: false });
      return cards;
    } catch (err: unknown) {
      set({
        isLoadingInventory: false,
        error: err instanceof Error ? err.message : 'Error al cargar inventario',
      });
      throw err;
    }
  },

  issueCard: async (input: AgentIssueCardInput) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await AgentApiService.issueCard(input);
      set((state) => ({
        inventoryCards: state.inventoryCards.filter((id) => id !== res.cardId),
        transactions: [res.transaction, ...state.transactions],
        isSubmitting: false,
      }));
      get().fetchDashboard().catch(() => {});
      return res;
    } catch (err: unknown) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Error al emitir tarjeta',
      });
      throw err;
    }
  },

  fetchCashClose: async () => {
    set({ isLoadingCashClose: true, error: null });
    try {
      const summary = await AgentApiService.getCashClose();
      set({ cashClose: summary, agentBalance: summary.operationalBalance, isLoadingCashClose: false });
      return summary;
    } catch (err: unknown) {
      set({
        isLoadingCashClose: false,
        error: err instanceof Error ? err.message : 'Error al cargar cierre de caja',
      });
      throw err;
    }
  },

  confirmCashClose: async (notes?: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const record = await AgentApiService.confirmCashClose(notes);
      await get().fetchCashClose();
      set({ isSubmitting: false });
      return record;
    } catch (err: unknown) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Error al confirmar cierre de caja',
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      agentBalance: 0,
      commissionRate: 0.025,
      todayTotalRecharged: 0,
      todayTransactionsCount: 0,
      estimatedCommission: 0,
      transactions: [],
      lookupResults: [],
      inventoryCards: [],
      cashClose: null,
      isLoadingDashboard: false,
      isLoadingTransactions: false,
      isSearchingCard: false,
      isLoadingInventory: false,
      isLoadingCashClose: false,
      isSubmitting: false,
      error: null,
    }),
}));
