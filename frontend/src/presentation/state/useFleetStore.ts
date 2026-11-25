import { create } from 'zustand';
import {
  BlacklistSyncState,
  Bus,
  FleetEarnings,
  FleetTrip,
  RegisterBusPayload,
  TripBatchResponse,
} from '@domain/models/Fleet';
import { FleetApiService } from '@infrastructure/api/FleetApiService';

const formatSyncDate = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;
};

const EMPTY_BLACKLIST_SYNC: BlacklistSyncState = {
  newVersion: 0,
  isFullSnapshot: true,
  cards: [],
  changes: { add: [], remove: [] },
  lastSyncedAt: 'Sin sincronizar',
};

interface RegisterBusResult {
  ok: boolean;
  error?: string;
  bus?: Bus;
}

interface FleetState {
  buses: Bus[];
  earningsByPlate: Record<string, FleetEarnings>;
  totalFleetEarnings: number;
  trips: FleetTrip[];
  blacklistSync: BlacklistSyncState;
  isLoadingDashboard: boolean;
  isSubmitting: boolean;
  isSyncingBlacklist: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  registerBus: (payload: RegisterBusPayload) => Promise<RegisterBusResult>;
  fetchEarningsByPlate: (licensePlate: string) => Promise<FleetEarnings>;
  getEarningsByPlate: (licensePlate: string) => FleetEarnings | null;
  getTotalFleetEarnings: () => number;
  syncTripBatch: (licensePlate?: string) => Promise<TripBatchResponse>;
  syncBlacklist: (forceFullSnapshot?: boolean) => Promise<BlacklistSyncState>;
  reset: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  buses: [],
  earningsByPlate: {},
  totalFleetEarnings: 0,
  trips: [],
  blacklistSync: EMPTY_BLACKLIST_SYNC,
  isLoadingDashboard: false,
  isSubmitting: false,
  isSyncingBlacklist: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, error: null });
    try {
      const data = await FleetApiService.getDashboard();
      set({
        buses: data.buses,
        earningsByPlate: data.earningsByPlate,
        totalFleetEarnings: data.totalFleetEarnings,
        trips: data.trips,
        isLoadingDashboard: false,
      });
    } catch (err) {
      set({
        isLoadingDashboard: false,
        error: err instanceof Error ? err.message : 'Error al cargar la flota',
      });
    }
  },

  registerBus: async (payload: RegisterBusPayload): Promise<RegisterBusResult> => {
    const licensePlate = payload.licensePlate.trim().toUpperCase();
    const hardwareId = payload.hardwareId.trim().toUpperCase();
    const publicKey = payload.publicKey.trim();

    if (!licensePlate) {
      return { ok: false, error: 'La placa del bus es obligatoria.' };
    }
    if (!hardwareId) {
      return { ok: false, error: 'El identificador de hardware (ESP32) es obligatorio.' };
    }
    if (!publicKey) {
      return { ok: false, error: 'La clave pública ECDSA del validador es obligatoria.' };
    }

    set({ isSubmitting: true, error: null });
    try {
      const createdBus = await FleetApiService.registerBus({
        licensePlate,
        hardwareId,
        publicKey,
      });

      const current = get();
      set({
        buses: [createdBus, ...current.buses],
        earningsByPlate: {
          ...current.earningsByPlate,
          [createdBus.licensePlate]: {
            id: `earnings-${createdBus.licensePlate}`,
            licensePlate: createdBus.licensePlate,
            totalEarnings: createdBus.totalEarnings ?? 0,
          },
        },
        isSubmitting: false,
      });

      return { ok: true, bus: createdBus };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo registrar el bus.';
      set({ isSubmitting: false, error: message });
      return { ok: false, error: message };
    }
  },

  fetchEarningsByPlate: async (licensePlate: string): Promise<FleetEarnings> => {
    const earnings = await FleetApiService.getBusEarnings(licensePlate);
    set((state) => ({
      earningsByPlate: {
        ...state.earningsByPlate,
        [earnings.licensePlate]: earnings,
      },
    }));
    return earnings;
  },

  getEarningsByPlate: (licensePlate: string): FleetEarnings | null => {
    const normalized = licensePlate.trim().toUpperCase();
    return get().earningsByPlate[normalized] ?? null;
  },

  getTotalFleetEarnings: (): number => {
    const state = get();
    if (Object.keys(state.earningsByPlate).length === 0) {
      return state.totalFleetEarnings;
    }
    return Number(
      Object.values(state.earningsByPlate)
        .reduce((acc, item) => acc + item.totalEarnings, 0)
        .toFixed(2)
    );
  },

  syncTripBatch: async (licensePlate?: string): Promise<TripBatchResponse> => {
    const state = get();
    const targetPlate = (licensePlate || state.buses[0]?.licensePlate || '').trim().toUpperCase();
    if (!targetPlate) {
      throw new Error('No hay buses registrados para sincronizar un lote de viajes.');
    }

    set({ isSubmitting: true, error: null });
    try {
      const { batchResult, dashboard } = await FleetApiService.syncTripBatch(targetPlate);
      set({
        buses: dashboard.buses,
        earningsByPlate: dashboard.earningsByPlate,
        totalFleetEarnings: dashboard.totalFleetEarnings,
        trips: dashboard.trips,
        isSubmitting: false,
      });
      return batchResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo sincronizar el lote de viajes.';
      set({ isSubmitting: false, error: message });
      throw new Error(message);
    }
  },

  syncBlacklist: async (forceFullSnapshot = false): Promise<BlacklistSyncState> => {
    set({ isSyncingBlacklist: true, error: null });
    try {
      const current = get().blacklistSync;
      const localVersion = forceFullSnapshot ? 0 : current.newVersion;
      const response = await FleetApiService.syncBlacklist(localVersion);

      let nextCards = current.cards;
      let deltaChanges = response.changes ?? { add: [], remove: [] };

      if (response.isFullSnapshot && response.cards) {
        nextCards = response.cards;
        deltaChanges = { add: [], remove: [] };
      } else if (
        deltaChanges.add.length > 0 ||
        deltaChanges.remove.length > 0 ||
        (current.cards.length === 0 && response.newVersion > 0)
      ) {
        // Fetch full snapshot to keep accurate BlockReason metadata for added cards
        const snapshot = await FleetApiService.syncBlacklist(0);
        if (snapshot.cards) {
          nextCards = snapshot.cards;
        }
      }

      const updated: BlacklistSyncState = {
        newVersion: response.newVersion,
        isFullSnapshot: response.isFullSnapshot,
        cards: nextCards,
        changes: deltaChanges,
        lastSyncedAt: formatSyncDate(),
      };

      set({ blacklistSync: updated, isSyncingBlacklist: false });
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo sincronizar la lista negra.';
      set({ isSyncingBlacklist: false, error: message });
      throw new Error(message);
    }
  },

  reset: () => {
    set({
      buses: [],
      earningsByPlate: {},
      totalFleetEarnings: 0,
      trips: [],
      blacklistSync: EMPTY_BLACKLIST_SYNC,
      isLoadingDashboard: false,
      isSubmitting: false,
      isSyncingBlacklist: false,
      error: null,
    });
  },
}));
