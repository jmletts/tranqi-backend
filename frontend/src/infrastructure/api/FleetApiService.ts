import { User } from '@domain/models/Auth';
import {
  BlacklistCard,
  BlacklistSyncResponse,
  BlockReason,
  Bus,
  FleetDashboardData,
  FleetEarnings,
  FleetTrip,
  RegisterBusPayload,
  TransporterRegistrationPayload,
  TripBatchResponse,
  TripProcessingStatus,
} from '@domain/models/Fleet';
import { HttpClient, extractApiErrorMessage } from '../http/HttpClient';
import { TokenStorage } from '../storage/TokenStorage';

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

interface RawFleetBus {
  id: string;
  licensePlate: string;
  hardwareId: string;
  publicKey: string;
  totalEarnings?: number | string;
  processedTripsCount?: number;
}

interface RawFleetEarnings {
  licensePlate: string;
  totalEarnings: number | string;
}

interface RawFleetTrip {
  tripId: string;
  cardId: string;
  busId: string;
  licensePlate: string;
  fare: number | string;
  localTimestamp: string;
  processingStatus: string;
  requiresDebtReview: boolean;
}

interface RawFleetDashboard {
  buses: RawFleetBus[];
  earningsByPlate: Record<string, RawFleetEarnings>;
  totalFleetEarnings: number | string;
  trips: RawFleetTrip[];
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

function mapBus(raw: RawFleetBus): Bus {
  return {
    id: raw.id,
    licensePlate: raw.licensePlate,
    hardwareId: raw.hardwareId,
    publicKey: raw.publicKey,
    totalEarnings: raw.totalEarnings !== undefined ? Number(raw.totalEarnings) : 0,
    processedTripsCount: raw.processedTripsCount ?? 0,
  };
}

function mapStatus(status: string): TripProcessingStatus {
  const normalized = (status || 'PROCESSED').toUpperCase();
  if (normalized === 'PROCESADO' || normalized === 'PROCESSED') return 'PROCESSED';
  if (normalized === 'DISCARDED_DUPLICATE') return 'DISCARDED_DUPLICATE';
  if (normalized === 'PENDING') return 'PENDING';
  return 'PROCESSED';
}

function mapTrip(raw: RawFleetTrip): FleetTrip {
  return {
    tripId: raw.tripId,
    cardId: raw.cardId,
    busId: raw.busId || '',
    licensePlate: raw.licensePlate || '',
    fare: Number(raw.fare) || 0,
    localTimestamp: raw.localTimestamp || '',
    processingStatus: mapStatus(raw.processingStatus),
    requiresDebtReview: Boolean(raw.requiresDebtReview),
  };
}

function mapDashboard(raw: RawFleetDashboard): FleetDashboardData {
  const earningsByPlate: Record<string, FleetEarnings> = {};
  for (const [plate, item] of Object.entries(raw.earningsByPlate || {})) {
    earningsByPlate[plate] = {
      id: `earnings-${plate}`,
      licensePlate: item.licensePlate || plate,
      totalEarnings: Number(item.totalEarnings) || 0,
    };
  }

  return {
    buses: (raw.buses || []).map(mapBus),
    earningsByPlate,
    totalFleetEarnings: Number(raw.totalFleetEarnings) || 0,
    trips: (raw.trips || []).map(mapTrip),
  };
}

export const FleetApiService = {
  async registerAsTransporter(
    payload: TransporterRegistrationPayload
  ): Promise<{ token: string; user: User; bus: Bus }> {
    try {
      const response = await HttpClient.post<{
        token: string;
        user: RawUserProfile;
        bus: RawFleetBus;
      }>('/fleet/register', {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        licensePlate: payload.licensePlate.trim().toUpperCase(),
        hardwareId: payload.hardwareId.trim().toUpperCase(),
        publicKey: payload.publicKey.trim(),
      });

      const { token, user, bus } = response.data;
      if (token) {
        await TokenStorage.saveToken(token);
      }

      return {
        token,
        user: mapUser(user),
        bus: mapBus(bus),
      };
    } catch (error) {
      throw new Error(
        extractApiErrorMessage(error, 'No se pudo completar el registro como transportista')
      );
    }
  },

  async getDashboard(): Promise<FleetDashboardData> {
    try {
      const response = await HttpClient.get<RawFleetDashboard>('/fleet/dashboard');
      return mapDashboard(response.data);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo cargar el panel de flota'));
    }
  },

  async registerBus(payload: RegisterBusPayload): Promise<Bus> {
    try {
      const response = await HttpClient.post<RawFleetBus>('/fleet/buses', {
        licensePlate: payload.licensePlate.trim().toUpperCase(),
        hardwareId: payload.hardwareId.trim().toUpperCase(),
        publicKey: payload.publicKey.trim(),
      });
      return mapBus(response.data);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo registrar el bus'));
    }
  },

  async getBusEarnings(licensePlate: string): Promise<FleetEarnings> {
    try {
      const normalized = licensePlate.trim().toUpperCase();
      const response = await HttpClient.get<RawFleetEarnings>(
        `/fleet/buses/${encodeURIComponent(normalized)}/earnings`
      );
      return {
        id: `earnings-${response.data.licensePlate}`,
        licensePlate: response.data.licensePlate,
        totalEarnings: Number(response.data.totalEarnings) || 0,
      };
    } catch (error) {
      throw new Error(
        extractApiErrorMessage(error, 'No se encontraron ganancias registradas para esa placa')
      );
    }
  },

  async getTrips(licensePlate?: string): Promise<FleetTrip[]> {
    try {
      const response = await HttpClient.get<RawFleetTrip[]>('/fleet/trips', {
        params: licensePlate ? { licensePlate: licensePlate.trim().toUpperCase() } : undefined,
      });
      return (response.data || []).map(mapTrip);
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudieron cargar los viajes de la flota'));
    }
  },

  async syncTripBatch(
    licensePlate: string
  ): Promise<{ batchResult: TripBatchResponse; dashboard: FleetDashboardData }> {
    try {
      const normalized = licensePlate.trim().toUpperCase();
      const response = await HttpClient.post<{
        batchResult: TripBatchResponse;
        dashboard: RawFleetDashboard;
      }>(`/fleet/buses/${encodeURIComponent(normalized)}/sync-batch`);
      return {
        batchResult: response.data.batchResult,
        dashboard: mapDashboard(response.data.dashboard),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo sincronizar el lote de viajes'));
    }
  },

  async syncBlacklist(localVersion: number): Promise<BlacklistSyncResponse> {
    try {
      const response = await HttpClient.get<{
        newVersion: number;
        isFullSnapshot: boolean;
        cards: Array<{ cardId: string; reason: string }> | null;
        changes: { add?: string[]; remove?: string[] } | null;
      }>('/blacklist/sync', {
        params: { localVersion },
      });

      const d = response.data;
      const cards: BlacklistCard[] | null = Array.isArray(d.cards)
        ? d.cards.map((c) => ({
            cardId: c.cardId,
            reason: (c.reason || 'DEBT').toUpperCase() as BlockReason,
          }))
        : null;

      return {
        newVersion: Number(d.newVersion) || 0,
        isFullSnapshot: Boolean(d.isFullSnapshot),
        cards,
        changes: d.changes
          ? {
              add: Array.isArray(d.changes.add) ? d.changes.add : [],
              remove: Array.isArray(d.changes.remove) ? d.changes.remove : [],
            }
          : null,
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo sincronizar la lista negra'));
    }
  },
};
