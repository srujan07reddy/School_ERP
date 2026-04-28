import { create } from 'zustand';
import { User, LiveStats, BusRoute } from '../types';
import { MOCK_BUS_ROUTE, MOCK_USERS } from '../utils/mockData';
import { setAuthToken } from '../utils/api';

interface Substitution {
  staffId: string;
  substituteId: string;
  date: string;
  status: 'Active' | 'Completed';
}

interface AppState {
  user: User | null;
  token: string | null;
  users: User[];
  substitutions: Substitution[];
  setUser: (user: User | null, token?: string | null) => void;
  addUser: (user: User) => void;
  updateUserRole: (userId: string, isCoordinator: boolean) => void;
  assignSubstitution: (staffId: string, substituteId: string) => void;
  
  liveStats: LiveStats;
  updateLiveStats: (stats: Partial<LiveStats>) => void;
  
  busRoute: BusRoute;
  updateBusLocation: (latitude: number, longitude: number) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  users: MOCK_USERS,
  substitutions: [],
  setUser: (user, token = null) => {
    set({ user, token });
    setAuthToken(token);
  },
  addUser: (newUser) => set((state) => ({ users: [...state.users, newUser] })),
  updateUserRole: (userId, isCoordinator) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, isCoordinator } : u)
  })),
  assignSubstitution: (staffId, substituteId) => set((state) => ({
    substitutions: [
      ...state.substitutions.filter(s => s.staffId !== staffId),
      { staffId, substituteId, date: new Date().toISOString().split('T')[0], status: 'Active' }
    ]
  })),
  
  liveStats: {
    staffPresent: 45,
    studentsPresent: 850,
    liveBuses: 12,
  },
  updateLiveStats: (stats) => set((state) => ({
    liveStats: { ...state.liveStats, ...stats },
  })),
  
  busRoute: MOCK_BUS_ROUTE,
  updateBusLocation: (latitude, longitude) => set((state) => ({
    busRoute: {
      ...state.busRoute,
      currentLocation: { latitude, longitude },
    },
  })),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
