export type AppRole = 'USUARIO_FINAL' | 'GESTOR_FLOTA' | 'AGENTE_KIOSKO';

/**
 * Mirrors backend Bus aggregate & FleetBusDTO
 * (fleet/domain/model/Bus.java & FleetBusDTO.java)
 */
export interface Bus {
  id: string;
  licensePlate: string;
  hardwareId: string;
  publicKey: string;
  totalEarnings?: number;
  processedTripsCount?: number;
}

export interface RegisterBusPayload {
  licensePlate: string;
  hardwareId: string;
  publicKey: string;
}

export interface TransporterRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  licensePlate: string;
  hardwareId: string;
  publicKey: string;
}

/**
 * Mirrors backend FleetEarnings & FleetEarningsResponseDTO
 * (fleet/domain/model/FleetEarnings.java & FleetEarningsResponseDTO.java)
 */
export interface FleetEarnings {
  id: string;
  licensePlate: string;
  totalEarnings: number;
}

/**
 * Mirrors backend TripProcessingStatus (domain-rules.md)
 */
export type TripProcessingStatus = 'PENDING' | 'PROCESSED' | 'DISCARDED_DUPLICATE';

/**
 * Mirrors backend Trip aggregate & FleetTripDTO
 */
export interface FleetTrip {
  tripId: string;
  cardId: string;
  busId: string;
  licensePlate: string;
  fare: number;
  localTimestamp: string;
  processingStatus: TripProcessingStatus;
  requiresDebtReview: boolean;
}

/**
 * Mirrors backend TripBatchResponseDTO
 */
export interface TripBatchResponse {
  successful: number;
  duplicates: number;
  errors: number;
}

export interface FleetDashboardData {
  buses: Bus[];
  earningsByPlate: Record<string, FleetEarnings>;
  totalFleetEarnings: number;
  trips: FleetTrip[];
}

/**
 * Mirrors backend BlockReason & BlacklistSyncResponseDTO
 */
export type BlockReason = 'DEBT' | 'LOST_STOLEN' | 'FRAUD';

export interface BlacklistCard {
  cardId: string;
  reason: BlockReason;
}

export interface BlacklistDelta {
  add: string[];
  remove: string[];
}

export interface BlacklistSyncResponse {
  newVersion: number;
  isFullSnapshot: boolean;
  cards: BlacklistCard[] | null;
  changes: BlacklistDelta | null;
}

export interface BlacklistSyncState {
  newVersion: number;
  isFullSnapshot: boolean;
  cards: BlacklistCard[];
  changes: BlacklistDelta;
  lastSyncedAt: string;
}
