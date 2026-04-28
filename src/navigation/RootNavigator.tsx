import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useStore } from '../store/useStore';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { AdminDashboard } from '../screens/Admin/AdminDashboard';
import { TransactionList } from '../screens/Accountant/TransactionList';
import { FacultyDashboard } from '../screens/Faculty/FacultyDashboard';
import { StudentDashboard } from '../screens/StudentParent/StudentDashboard';
import { SafeChat } from '../screens/SafeChat';

const Stack = createStackNavigator();

export const RootNavigator = () => {
  const user = useStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {user.role === 'Admin' && (
              <Stack.Screen name="AdminStack" component={AdminDashboard} />
            )}
            {user.role === 'Accountant' && (
              <Stack.Screen name="AccountantStack" component={TransactionList} />
            )}
            {(user.role === 'SectionCoord' || user.role === 'Staff') && (
              <Stack.Screen name="FacultyStack" component={FacultyDashboard} />
            )}
            {user.role === 'StudentParent' && (
              <Stack.Screen name="StudentParentStack" component={StudentDashboard} />
            )}
            <Stack.Screen name="SafeChat" component={SafeChat} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
