export type UserRole = 'Admin' | 'Accountant' | 'SectionCoord' | 'Staff' | 'StudentParent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isCoordinator?: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  studentData?: {
    grades: number[];
    previousExams: { name: string; score: number }[];
  };
  staffData?: {
    department: string;
    experience: number;
    subjects: string[];
    assignedClass?: string;
    isFree: boolean;
    freeHours: string[];
  };
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  sectionId: string;
}

export interface Financials {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  description: string;
}

export interface BusRoute {
  id: string;
  busNumber: string;
  driverName: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  stops: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

export interface Asset {
  id: string;
  name: string;
  category: 'Lab' | 'Furniture' | 'IT' | 'Infrastructure';
  lastMaintenance: string;
  nextMaintenance: string;
  condition: 'Good' | 'Needs Repair' | 'Critical';
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  month: string;
  status: 'Draft' | 'Pending Approval' | 'Disbursed';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isEncrypted?: boolean;
  expiresAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Holiday' | 'Event' | 'Meeting';
  description: string;
  visibility: 'All' | 'Staff' | 'Admins';
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  role: 'StudentParent' | 'Staff' | 'All';
  options: string[];
  results: Record<string, number>;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface LiveStats {
  staffPresent: number;
  studentsPresent: number;
  liveBuses: number;
  revenue?: number;
  expenses?: number;
}
