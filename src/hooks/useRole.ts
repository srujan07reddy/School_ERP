import { useStore } from '../store/useStore';
import { UserRole } from '../types';

export const useRole = () => {
  const user = useStore((state) => state.user);

  const isRole = (role: UserRole) => user?.role === role;

  return {
    role: user?.role,
    isAdmin: isRole('Admin'),
    isAccountant: isRole('Accountant'),
    isSectionCoord: isRole('SectionCoord'),
    isStaff: isRole('Staff'),
    isStudentParent: isRole('StudentParent'),
    isAuthenticated: !!user,
  };
};
