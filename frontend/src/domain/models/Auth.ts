export type UserRole = 'USUARIO_FINAL' | 'AGENTE_KIOSKO' | 'GESTOR_FLOTA';

export type AppMode = 'traveler' | 'agent' | 'transporter';

export interface AgentProfile {
  agentCode: string;
  businessName: string;
  businessAddress: string;
  status: 'ACTIVE';
  registeredAt: string;
}

export interface AgentRegistrationData {
  name: string;
  dni: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  acceptedTerms: boolean;
}

export interface User {
  id?: string;
  dni: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  address?: string;
  baseFare?: string;
  roles: (UserRole | string)[];
}

export interface AuthSession {
  token: string;
  user?: User; // Depending on if login returns user details or just token
}

export interface RegisterData {
  dni: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  address: string;
  baseFare: string;
  passwordPlainText: string;
}
