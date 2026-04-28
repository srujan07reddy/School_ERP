import apiClient from './client';

export const UserApi = {
  getAll: () => apiClient.get('users/'),
  create: (data: any) => apiClient.post('users/', data),
  update: (id: string, data: any) => apiClient.patch(`users/${id}/`, data),
};

export const LeaveApi = {
  getAll: () => apiClient.get('leave-requests/'),
  create: (data: any) => apiClient.post('leave-requests/', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`leave-requests/${id}/`, { status }),
};

export const MessageApi = {
  getAll: () => apiClient.get('messages/'),
  send: (data: any) => apiClient.post('messages/', data),
};

export const AssignmentApi = {
  getAll: () => apiClient.get('assignments/'),
  create: (data: any) => apiClient.post('assignments/', data),
};

export const NoteApi = {
  getAll: () => apiClient.get('notes/'),
  create: (data: any) => apiClient.post('notes/', data),
};

export const SubstitutionApi = {
  getAll: () => apiClient.get('substitutions/'),
  create: (data: any) => apiClient.post('substitutions/', data),
};

export const TimetableApi = {
  getAll: () => apiClient.get('timetable/'),
  create: (data: any) => apiClient.post('timetable/', data),
  bulkCreate: (data: any[]) => apiClient.post('timetable/bulk_create/', { entries: data }),
};
