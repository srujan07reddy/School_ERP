import { User, Financials, BusRoute } from '../types';

export const MOCK_CURRICULUM = [
  { id: '1', subject: 'Mathematics', topic: 'Algebraic Expressions', status: 'Completed', date: '2024-04-20' },
  { id: '2', subject: 'Mathematics', topic: 'Calculus Basics', status: 'Ongoing', date: '2024-04-28' },
  { id: '3', subject: 'Physics', topic: 'Quantum Mechanics', status: 'Upcoming', date: '2024-05-05' },
];

export const MOCK_ASSIGNMENTS = [
  { id: '1', title: 'Calculus Homework', deadline: '2024-05-01', submissions: 12, total: 30 },
  { id: '2', title: 'Lab Report - Optics', deadline: '2024-05-03', submissions: 5, total: 30 },
];

export const MOCK_USERS: User[] = [
  { 
    id: '1', name: 'Admin User', email: 'admin@school.com', role: 'Admin' 
  },
  { 
    id: '2', name: 'Accountant User', email: 'finance@school.com', role: 'Accountant' 
  },
  { 
    id: '4', name: 'Dr. Sarah Wilson', email: 'staff@school.com', role: 'Staff', 
    isCoordinator: false, phone: '9876543210',
    staffData: { department: 'Mathematics', experience: 12, subjects: ['Algebra', 'Calculus'], assignedClass: 'Primary-A', isFree: true, freeHours: ['09:00 AM', '11:00 AM'] }
  },
  { 
    id: '5', name: 'Prof. Robert Fox', email: 'coord@school.com', role: 'Staff', 
    isCoordinator: true, phone: '9876543211',
    staffData: { department: 'Physics', experience: 15, subjects: ['Optics', 'Quantum'], assignedClass: 'Secondary-B', isFree: false, freeHours: ['01:00 PM', '03:00 PM'] }
  },
  { 
    id: '6', name: 'Alex Johnson', email: 'parent@school.com', role: 'StudentParent', 
    address: '123 School Lane', phone: '9876543212',
    studentData: { grades: [85, 92, 78, 88], previousExams: [{ name: 'Midterm', score: 88 }] }
  },
];

export const MOCK_TRANSACTIONS: Financials[] = [
  { id: 't1', studentId: 's1', amount: 1200, date: '2024-04-20', status: 'Paid', description: 'Tuition Fee - Term 1' },
  { id: 't2', studentId: 's2', amount: 450, date: '2024-04-21', status: 'Pending', description: 'Bus Fee - April' },
  { id: 't3', studentId: 's3', amount: 800, date: '2024-04-22', status: 'Paid', description: 'Exam Fee' },
  { id: 't4', studentId: 's4', amount: 1200, date: '2024-04-23', status: 'Pending', description: 'Tuition Fee - Term 1' },
];

export const MOCK_BUS_ROUTE: BusRoute = {
  id: 'b1',
  busNumber: 'BUS-001',
  driverName: 'John Doe',
  currentLocation: { latitude: 28.6139, longitude: 77.2090 }, // Example coordinates
  stops: [
    { name: 'Station A', latitude: 28.6100, longitude: 77.2000 },
    { name: 'Station B', latitude: 28.6150, longitude: 77.2100 },
    { name: 'School', latitude: 28.6200, longitude: 77.2200 },
  ],
};

export const REVENUE_DATA = [50000, 42000, 48000, 55000, 52000, 60000];
export const EXPENSE_DATA = [30000, 32000, 31000, 34000, 33000, 35000];
export const ATTENDANCE_DATA = [85, 92, 88, 95, 90, 87, 93];

export const HEATMAP_DATA = [
  { value: 95, label: 'M' }, { value: 88, label: 'T' }, { value: 92, label: 'W' }, { value: 85, label: 'T' }, { value: 90, label: 'F' },
  { value: 40, label: 'S' }, { value: 10, label: 'S' }, { value: 94, label: 'M' }, { value: 91, label: 'T' }, { value: 89, label: 'W' },
  { value: 87, label: 'T' }, { value: 93, label: 'F' }, { value: 35, label: 'S' }, { value: 12, label: 'S' },
];
