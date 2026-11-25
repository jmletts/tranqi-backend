import { create } from 'zustand';
import {
  LinkCardInput,
  RechargeCardInput,
  TransferFundsInput,
  TravelerCard,
  TravelerMovement,
} from '@domain/models/Traveler';
import { TravelerApiService } from '@infrastructure/api/TravelerApiService';

interface TravelerState {
  cards: TravelerCard[];
  selectedCardId: string | null;
  movements: TravelerMovement[];
  totalBalance: number;
  isLoadingCards: boolean;
  isLoadingMovements: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastUpdatedAt: string | null;

  selectCard: (cardId: string) => void;
  fetchCards: () => Promise<TravelerCard[]>;
  fetchMovements: (accountId?: string) => Promise<TravelerMovement[]>;
  refreshAll: () => Promise<void>;
  transferFunds: (payload: TransferFundsInput) => Promise<void>;
  rechargeCard: (payload: RechargeCardInput) => Promise<void>;
  linkCard: (payload: LinkCardInput) => Promise<void>;
  reportCardLost: (cardId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const formatNowTime = () => {
  const now = new Date();
  return `Actualizado ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const useTravelerStore = create<TravelerState>((set, get) => ({
  cards: [],
  selectedCardId: null,
  movements: [],
  totalBalance: 0,
  isLoadingCards: false,
  isLoadingMovements: false,
  isSubmitting: false,
  error: null,
  lastUpdatedAt: null,

  selectCard: (cardId: string) => {
    set({ selectedCardId: cardId });
  },

  fetchCards: async () => {
    set({ isLoadingCards: true, error: null });
    try {
      const cards = await TravelerApiService.getMyCards();
      const currentSelected = get().selectedCardId;
      const stillExists = cards.some((c) => c.cardId === currentSelected);
      const nextSelected = stillExists
        ? currentSelected
        : cards.find((c) => c.isDefault)?.cardId || cards[0]?.cardId || null;

      set({
        cards,
        selectedCardId: nextSelected,
        totalBalance: cards.reduce((sum, c) => sum + c.balance, 0),
        isLoadingCards: false,
        lastUpdatedAt: formatNowTime(),
      });
      return cards;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar tarjetas';
      set({ isLoadingCards: false, error: message });
      throw error;
    }
  },

  fetchMovements: async (accountId?: string) => {
    set({ isLoadingMovements: true, error: null });
    try {
      const data = await TravelerApiService.getMyMovements(accountId);
      set({
        movements: data.movements,
        isLoadingMovements: false,
        lastUpdatedAt: formatNowTime(),
      });
      return data.movements;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cargar movimientos';
      set({ isLoadingMovements: false, error: message });
      throw error;
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchCards(), get().fetchMovements()]);
  },

  transferFunds: async (payload: TransferFundsInput) => {
    set({ isSubmitting: true, error: null });
    try {
      await TravelerApiService.transferFunds(payload);
      await Promise.all([get().fetchCards(), get().fetchMovements()]);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al transferir saldo';
      set({ isSubmitting: false, error: message });
      throw error;
    }
  },

  rechargeCard: async (payload: RechargeCardInput) => {
    set({ isSubmitting: true, error: null });
    try {
      await TravelerApiService.rechargeCard(payload);
      await Promise.all([get().fetchCards(), get().fetchMovements()]);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al recargar tarjeta';
      set({ isSubmitting: false, error: message });
      throw error;
    }
  },

  linkCard: async (payload: LinkCardInput) => {
    set({ isSubmitting: true, error: null });
    try {
      await TravelerApiService.linkMyCard(payload);
      await Promise.all([get().fetchCards(), get().fetchMovements()]);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al vincular tarjeta';
      set({ isSubmitting: false, error: message });
      throw error;
    }
  },

  reportCardLost: async (cardId: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await TravelerApiService.reportCardLost(cardId);
      await get().fetchCards();
      set({ isSubmitting: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al bloquear tarjeta';
      set({ isSubmitting: false, error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      cards: [],
      selectedCardId: null,
      movements: [],
      totalBalance: 0,
      isLoadingCards: false,
      isLoadingMovements: false,
      isSubmitting: false,
      error: null,
      lastUpdatedAt: null,
    }),
}));
