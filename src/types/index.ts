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

export interface LiveStats {
  staffPresent: number;
  studentsPresent: number;
  liveBuses: number;
}
