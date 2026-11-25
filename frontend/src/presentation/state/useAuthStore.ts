import { create } from 'zustand';
import {
  AgentProfile,
  AgentRegistrationData,
  AppMode,
  AuthSession,
  User,
  UserRole,
} from '@domain/models/Auth';
import { UpdateProfileInput } from '@domain/models/Traveler';
import { TransporterRegistrationPayload } from '@domain/models/Fleet';
import { TokenStorage } from '@infrastructure/storage/TokenStorage';
import { decodeJwtPayload, isJwtExpired, normalizeRoleName } from '@infrastructure/auth/jwtUtils';
import { TravelerApiService } from '@infrastructure/api/TravelerApiService';
import { AgentApiService } from '@infrastructure/api/AgentApiService';
import { FleetApiService } from '@infrastructure/api/FleetApiService';
import { registerUnauthorizedHandler } from '@infrastructure/http/HttpClient';
import { useTravelerStore } from './useTravelerStore';
import { useAgentStore } from './useAgentStore';
import { useFleetStore } from './useFleetStore';

const EMPTY_USER: User = {
  id: undefined,
  dni: '',
  name: '',
  phone: '',
  email: '',
  age: 0,
  address: '',
  baseFare: 'GENERAL',
  roles: [],
};

export interface UpdateAgentProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  token: string | null;
  user: User;
  activeMode: AppMode;
  agentProfile: AgentProfile | null;

  setSession: (session: AuthSession) => Promise<void>;
  hydrateUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  switchMode: (mode: AppMode) => void;
  registerAsAgent: (data: AgentRegistrationData) => Promise<void>;
  updateAgentProfile: (data: UpdateAgentProfileInput) => Promise<void>;
  registerAsTransporter: (data: TransporterRegistrationPayload) => Promise<void>;
  updateUserProfile: (partial: Partial<User>) => void;
  saveUserProfile: (data: UpdateProfileInput) => Promise<User>;
}

function mergeRoles(existing: (UserRole | string)[], incoming: (UserRole | string)[]): (UserRole | string)[] {
  const normalized = [...existing, ...incoming]
    .filter(Boolean)
    .map((r) => normalizeRoleName(String(r)));
  return Array.from(new Set(normalized));
}

async function hydrateAgentProfileIfEligible(roles: (UserRole | string)[]): Promise<AgentProfile | null> {
  if (!roles.includes('AGENTE_KIOSKO')) {
    return null;
  }
  try {
    const dashboard = await AgentApiService.getDashboard();
    useAgentStore.setState({
      agentBalance: dashboard.operationalBalance,
      commissionRate: dashboard.commissionRate,
      todayTotalRecharged: dashboard.todayTotalRecharged,
      todayTransactionsCount: dashboard.todayTransactionsCount,
      estimatedCommission: dashboard.estimatedCommission,
      transactions: dashboard.recentTransactions,
    });
    return {
      agentCode: dashboard.agentCode,
      businessName: dashboard.businessName,
      businessAddress: dashboard.businessAddress,
      status: 'ACTIVE',
      registeredAt: dashboard.registeredAt,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isCheckingSession: false,
  token: null,
  user: EMPTY_USER,
  activeMode: 'traveler',
  agentProfile: null,

  setSession: async (session: AuthSession) => {
    const decoded = decodeJwtPayload(session.token);
    const tokenRoles = Array.isArray(decoded?.roles) ? decoded.roles : [];
    const mergedRoles = mergeRoles(
      ['USUARIO_FINAL'],
      [...(session.user?.roles ?? []), ...tokenRoles]
    );

    const provisionalUser: User = {
      ...EMPTY_USER,
      ...(session.user ?? {}),
      id: session.user?.id || (typeof decoded?.userId === 'string' ? decoded.userId : undefined),
      dni: session.user?.dni || (typeof decoded?.sub === 'string' ? decoded.sub : ''),
      roles: mergedRoles,
    };

    set({
      isAuthenticated: true,
      token: session.token,
      user: provisionalUser,
      activeMode: 'traveler',
    });

    try {
      const freshProfile = await TravelerApiService.getCurrentUser();
      const finalRoles = mergeRoles(mergedRoles, freshProfile.roles);
      const agentProfile = await hydrateAgentProfileIfEligible(finalRoles);
      set({
        user: {
          ...freshProfile,
          roles: finalRoles,
        },
        agentProfile,
      });
    } catch {
      // Keep provisional JWT identity if /auth/me fails transiently
    }
  },

  hydrateUser: async () => {
    try {
      const freshProfile = await TravelerApiService.getCurrentUser();
      const finalRoles = mergeRoles(get().user.roles, freshProfile.roles);
      const agentProfile = await hydrateAgentProfileIfEligible(finalRoles);
      set({
        user: {
          ...freshProfile,
          roles: finalRoles,
        },
        agentProfile: agentProfile ?? get().agentProfile,
      });
      return freshProfile;
    } catch {
      return null;
    }
  },

  logout: async () => {
    await TokenStorage.deleteToken();
    useTravelerStore.getState().reset();
    useAgentStore.getState().reset();
    useFleetStore.getState().reset();
    set({
      isAuthenticated: false,
      token: null,
      user: EMPTY_USER,
      activeMode: 'traveler',
      agentProfile: null,
    });
  },

  checkSession: async () => {
    set({ isCheckingSession: true });
    try {
      const token = await TokenStorage.getToken();
      if (!token || isJwtExpired(token)) {
        await TokenStorage.deleteToken();
        useTravelerStore.getState().reset();
        useAgentStore.getState().reset();
        useFleetStore.getState().reset();
        set({
          isAuthenticated: false,
          isCheckingSession: false,
          token: null,
          user: EMPTY_USER,
          agentProfile: null,
        });
        return false;
      }

      const profile = await TravelerApiService.getCurrentUser();
      const decoded = decodeJwtPayload(token);
      const tokenRoles = Array.isArray(decoded?.roles) ? decoded.roles : [];
      const finalRoles = mergeRoles(profile.roles, tokenRoles);
      const agentProfile = await hydrateAgentProfileIfEligible(finalRoles);

      set({
        isAuthenticated: true,
        isCheckingSession: false,
        token,
        user: {
          ...profile,
          roles: finalRoles,
        },
        agentProfile,
      });
      return true;
    } catch {
      await TokenStorage.deleteToken();
      useTravelerStore.getState().reset();
      useAgentStore.getState().reset();
      useFleetStore.getState().reset();
      set({
        isAuthenticated: false,
        isCheckingSession: false,
        token: null,
        user: EMPTY_USER,
        agentProfile: null,
      });
      return false;
    }
  },

  hasRole: (role: UserRole) => {
    const roles = get().user?.roles ?? [];
    return roles.includes(role) || roles.includes(`ROLE_${role}`);
  },

  switchMode: (mode: AppMode) => {
    set({ activeMode: mode });
  },

  registerAsAgent: async (data: AgentRegistrationData) => {
    const response = await AgentApiService.registerAsAgent(data);
    const normalizedRoles = mergeRoles(['USUARIO_FINAL', 'AGENTE_KIOSKO'], response.user.roles);

    set({
      isAuthenticated: true,
      token: response.token,
      activeMode: 'agent',
      agentProfile: response.agentProfile,
      user: {
        ...response.user,
        roles: normalizedRoles,
      },
    });

    await useAgentStore.getState().fetchDashboard().catch(() => {});
  },

  updateAgentProfile: async (data: UpdateAgentProfileInput) => {
    const response = await AgentApiService.updateProfile(data);
    const normalizedRoles = mergeRoles(get().user.roles, response.user.roles);

    set({
      user: {
        ...response.user,
        roles: normalizedRoles,
      },
      agentProfile: response.agentProfile,
    });
  },

  registerAsTransporter: async (data: TransporterRegistrationPayload) => {
    const response = await FleetApiService.registerAsTransporter(data);
    const normalizedRoles = mergeRoles(['USUARIO_FINAL', 'GESTOR_FLOTA'], response.user.roles);

    set({
      isAuthenticated: true,
      token: response.token,
      activeMode: 'transporter',
      user: {
        ...response.user,
        roles: normalizedRoles,
      },
    });

    await useFleetStore.getState().fetchDashboard().catch(() => {});
  },

  updateUserProfile: (partial: Partial<User>) => {
    set((state) => ({
      user: { ...state.user, ...partial },
    }));
  },

  saveUserProfile: async (data: UpdateProfileInput) => {
    const updated = await TravelerApiService.updateProfile(data);
    set((state) => ({
      user: {
        ...updated,
        roles: mergeRoles(state.user.roles, updated.roles),
      },
    }));
    return updated;
  },
}));

registerUnauthorizedHandler(() => {
  useTravelerStore.getState().reset();
  useAgentStore.getState().reset();
  useFleetStore.getState().reset();
  useAuthStore.setState({
    isAuthenticated: false,
    token: null,
    user: EMPTY_USER,
    activeMode: 'traveler',
    agentProfile: null,
  });
});
