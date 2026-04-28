import { create } from 'zustand';
import { User, LiveStats, BusRoute, Asset, PayrollRecord, AuditLog, Message, CalendarEvent, Survey } from '../types';
import { MOCK_BUS_ROUTE, MOCK_USERS } from '../utils/mockData';
import { setAuthToken } from '../utils/api';
import { UserApi, LeaveApi, MessageApi, AssignmentApi, NoteApi, SubstitutionApi } from '../api/services';

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
  auditLogs: AuditLog[];
  calendarEvents: CalendarEvent[];
  surveys: Survey[];
  performanceSettings: {
    high: string;
    medium: string;
    low: string;
  };
  liveStats: LiveStats;
  busRoute: BusRoute;
  notes: Array<{ id: string; sender: string; title: string; content: string; date: string; class: string }>;
  assignments: Array<{ id: string; title: string; deadline: string; totalMarks: number; submissions: number; class: string }>;
  leaveRequests: Array<{ id: string; senderId: string; senderName: string; receiverRole: string; reason: string; status: 'Pending' | 'Approved' | 'Rejected'; date: string }>;
  assets: Asset[];
  payroll: PayrollRecord[];
  messages: Message[];
  isLoading: boolean;

  setUser: (user: User | null, token?: string | null) => void;
  addUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, isCoordinator: boolean) => void;
  assignSubstitution: (staffId: string, substituteId: string) => void;
  updateLiveStats: (stats: Partial<LiveStats>) => void;
  updateBusLocation: (latitude: number, longitude: number) => void;
  addNote: (note: any) => void;
  addAssignment: (assignment: any) => void;
  addLeaveRequest: (req: any) => void;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  approvePayroll: (id: string) => void;
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  addSurvey: (survey: Survey) => void;
  voteSurvey: (surveyId: string, optionIndex: number) => void;
  updatePerformanceSettings: (settings: { high: string; medium: string; low: string }) => void;
  addMessage: (msg: any) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  users: MOCK_USERS,
  substitutions: [],
  auditLogs: [
    { id: '1', timestamp: new Date().toISOString(), actor: 'System', action: 'Login', details: 'Admin logged in', severity: 'Info' },
  ],
  calendarEvents: [
    { id: '1', title: 'Summer Holidays', date: '2024-05-01', type: 'Holiday', visibility: 'All', description: 'Annual summer break' },
    { id: '2', title: 'Faculty Meeting', date: '2024-04-30', type: 'Meeting', visibility: 'Staff', description: 'Curriculum review' }
  ],
  surveys: [],
  performanceSettings: {
    high: "Exemplary performance. Students are excelling in core benchmarks.",
    medium: "Standard proficiency. Consistent effort required for growth.",
    low: "Critical intervention needed. Intensive support recommended."
  },
  liveStats: {
    staffPresent: 42,
    studentsPresent: 780,
    liveBuses: 5,
    revenue: 12500
  },
  busRoute: MOCK_BUS_ROUTE,
  notes: [
    { id: '1', sender: 'John Doe', title: 'Math Homework', content: 'Complete exercises 1-10 on page 45.', date: '2024-04-25', class: '10-A' },
  ],
  assignments: [
    { id: '1', title: 'Physics Lab Report', deadline: '2024-05-05', totalMarks: 100, submissions: 25, class: '10-A' },
  ],
  leaveRequests: [],
  assets: [
    { id: '1', name: 'Physics Lab Microscopes', category: 'Lab', condition: 'Good', lastMaintenance: '2024-01-10', nextMaintenance: '2024-07-10' },
    { id: '2', name: 'Server Rack #4', category: 'IT', condition: 'Good', lastMaintenance: '2024-03-15', nextMaintenance: '2024-09-15' }
  ],
  payroll: [
    { id: '1', staffId: '2', staffName: 'Jane Smith', month: 'April 2024', amount: 4500, status: 'Pending Approval' },
    { id: '2', staffId: '3', staffName: 'Robert Wilson', month: 'April 2024', amount: 3800, status: 'Pending Approval' }
  ],
  messages: [],
  isLoading: false,

  setUser: (user, token) => {
    if (token) setAuthToken(token);
    set({ user, token });
  },
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  deleteUser: (userId) => set((state) => ({ users: state.users.filter(u => u.id !== userId) })),
  updateUserRole: (userId, isCoordinator) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, isCoordinator } : u)
  })),
  assignSubstitution: (staffId, substituteId) => set((state) => ({
    substitutions: [...state.substitutions, { staffId, substituteId, date: new Date().toISOString(), status: 'Active' }]
  })),
  updateLiveStats: (stats) => set((state) => ({ liveStats: { ...state.liveStats, ...stats } })),
  updateBusLocation: (lat, lng) => set((state) => ({
    busRoute: { ...state.busRoute, currentLat: lat, currentLng: lng }
  })),
  addNote: (note) => set((state) => {
    const newLogs = [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), actor: 'Faculty', action: 'Note Created', details: `New note: ${note.title}`, severity: 'Info' as const }, ...state.auditLogs];
    return { notes: [note, ...state.notes], auditLogs: newLogs };
  }),
  addAssignment: (assignment) => set((state) => {
    const newLogs = [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), actor: 'Faculty', action: 'Assignment Created', details: `New assignment: ${assignment.title}`, severity: 'Info' as const }, ...state.auditLogs];
    return { assignments: [assignment, ...state.assignments], auditLogs: newLogs };
  }),
  addLeaveRequest: (req) => set((state) => ({ leaveRequests: [req, ...state.leaveRequests] })),
  updateLeaveStatus: (id, status) => set((state) => ({
    leaveRequests: state.leaveRequests.map(r => r.id === id ? { ...r, status } : r)
  })),
  approvePayroll: (id) => set((state) => ({
    payroll: state.payroll.map(p => p.id === id ? { ...p, status: 'Disbursed' } : p)
  })),
  addLog: (log) => set((state) => ({
    auditLogs: [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), ...log } as AuditLog, ...state.auditLogs]
  })),
  addCalendarEvent: (event) => set((state) => ({ 
    calendarEvents: [...state.calendarEvents, event],
    auditLogs: [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), actor: 'Admin', action: 'Calendar Update', details: `New ${event.type}: ${event.title}`, severity: 'Info' as const }, ...state.auditLogs]
  })),
  addSurvey: (survey) => set((state) => ({ 
    surveys: [survey, ...state.surveys],
    auditLogs: [{ id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), actor: 'System', action: 'New Survey', details: survey.title, severity: 'Info' as const }, ...state.auditLogs]
  })),
  voteSurvey: (surveyId, optionIndex) => set((state) => ({
    surveys: state.surveys.map(s => {
      if (s.id === surveyId) {
        const optionKey = s.options[optionIndex];
        return { ...s, results: { ...s.results, [optionKey]: (s.results[optionKey] || 0) + 1 } };
      }
      return s;
    })
  })),
  updatePerformanceSettings: (settings) => set({ performanceSettings: settings }),
  addMessage: async (msg) => {
    set((state) => ({ messages: [msg, ...state.messages] }));
  },
}));
