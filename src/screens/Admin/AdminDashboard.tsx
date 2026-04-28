import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import { useStore } from '../../store/useStore';
import { 
  Users, LogOut, TrendingUp, 
  UserPlus, Calendar, AlertCircle, Activity
} from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';
import { StatCard } from '../../components/Dashboard/StatCard';
import { REVENUE_DATA, EXPENSE_DATA } from '../../utils/mockData';

const screenWidth = Dimensions.get("window").width;

export const AdminDashboard = () => {
  const setUser = useStore((state) => state.setUser);
  const users = useStore((state) => state.users);
  const addUser = useStore((state) => state.addUser);
  const substitutions = useStore((state) => state.substitutions);
  const assignSubstitution = useStore((state) => state.assignSubstitution);

  const [activeTab, setActiveTab] = useState<'Overview' | 'Users' | 'Staff' | 'StudentsMaster' | 'StaffMaster' | 'Logs'>('Overview');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Staff' | 'StudentParent'>('Staff');

  const handleAddUser = () => {
    if (!newUserName) return;
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserName,
      email: `${newUserName.toLowerCase().replace(' ', '.')}@school.com`,
      role: newUserRole,
      phone: '9999999999'
    };
    addUser(newUser as any);
    setNewUserName('');
    Alert.alert('Success', `${newUserRole} added successfully!`);
  };

  const handleMarkAbsent = (staff: any) => {
    const availableStaff = users.filter(u => u.role === 'Staff' && u.id !== staff.id);
    if (availableStaff.length === 0) return;
    
    assignSubstitution(staff.id, availableStaff[0].id);
    Alert.alert('Staff Absent', `Assigned ${availableStaff[0].name} as substitute for ${staff.name}`);
  };

  const renderOverview = () => (
    <View>
      <View className="flex-row flex-wrap -mx-2 mb-8">
        <StatCard title="Total Students" value={850} icon={Users} trend="+5%" color="#3b82f6" />
        <StatCard title="Total Staff" value={users.filter(u => u.role === 'Staff').length} icon={Users} color="#10b981" />
        <StatCard title="Active Subs" value={substitutions.length} icon={Activity} color="#f59e0b" />
        <StatCard title="Avg Attendance" value="94%" icon={Calendar} color="#8b5cf6" />
      </View>

      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-2/3 px-4">
          <ChartContainer title="Exam Performance Comparison" subtitle="Current Term Average (%)">
            <BarChart
              data={{
                labels: ["Math", "Sci", "Eng", "Hist", "ICT"],
                datasets: [
                  { data: [75, 82, 78, 70, 85] }
                ]
              }}
              width={screenWidth * 0.55}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
            />
          </ChartContainer>
        </View>
        <View className="w-full lg:w-1/3 px-4">
          <ChartContainer title="Revenue vs Expenses" subtitle="Monthly Cashflow">
            <LineChart
              data={{
                labels: ["J", "F", "M", "A", "M", "J"],
                datasets: [
                  { data: REVENUE_DATA.slice(0, 6), color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` },
                  { data: EXPENSE_DATA.slice(0, 6), color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` }
                ]
              }}
              width={screenWidth * 0.25}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          </ChartContainer>
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <Text className="text-slate-900 text-xl font-bold mb-6">Add New Student/Staff</Text>
      <View className="flex-row gap-4 mb-6">
        <TextInput
          className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-900"
          placeholder="Full Name"
          value={newUserName}
          onChangeText={setNewUserName}
        />
        <View className="flex-row bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
          <TouchableOpacity 
            onPress={() => setNewUserRole('Staff')}
            className={`px-6 py-4 ${newUserRole === 'Staff' ? 'bg-blue-600' : ''}`}
          >
            <Text className={`font-bold ${newUserRole === 'Staff' ? 'text-white' : 'text-slate-400'}`}>STAFF</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setNewUserRole('StudentParent')}
            className={`px-6 py-4 ${newUserRole === 'StudentParent' ? 'bg-blue-600' : ''}`}
          >
            <Text className={`font-bold ${newUserRole === 'StudentParent' ? 'text-white' : 'text-slate-400'}`}>STUDENT</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleAddUser}
          className="bg-blue-600 px-8 rounded-2xl items-center justify-center"
        >
          <UserPlus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <Text className="text-slate-900 font-bold mb-4">Recent Users</Text>
      {users.slice(-5).reverse().map((u, i) => (
        <View key={i} className="flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl mb-2">
          <View>
            <Text className="text-slate-900 font-semibold">{u.name}</Text>
            <Text className="text-slate-400 text-xs">{u.role} • {u.email}</Text>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-600 text-[10px] font-bold">ACTIVE</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStaff = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-900 text-xl font-bold">Staff Attendance & Substitution</Text>
        <View className="flex-row items-center bg-orange-50 px-4 py-2 rounded-xl">
          <AlertCircle color="#f59e0b" size={16} />
          <Text className="text-orange-600 ml-2 font-bold text-xs">{substitutions.length} Substitutions Active</Text>
        </View>
      </View>

      <View className="space-y-3">
        {users.filter(u => u.role === 'Staff').map((staff) => {
          const isSubstituted = substitutions.some(s => s.staffId === staff.id);
          return (
            <View key={staff.id} className="flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold">{staff.name[0]}</Text>
                </View>
                <View>
                  <Text className="text-slate-900 font-semibold">{staff.name}</Text>
                  <Text className="text-slate-400 text-xs">Math Dept • Active</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleMarkAbsent(staff)}
                disabled={isSubstituted}
                className={`${isSubstituted ? 'bg-slate-200' : 'bg-red-50'} px-6 py-2 rounded-xl border ${isSubstituted ? 'border-slate-300' : 'border-red-100'}`}
              >
                <Text className={`${isSubstituted ? 'text-slate-500' : 'text-red-600'} font-bold text-sm`}>
                  {isSubstituted ? 'Marked Absent' : 'Absent?'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStudentMaster = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100">
      <Text className="text-slate-900 text-xl font-bold mb-6">Student Master List</Text>
      <View className="space-y-3">
        {users.filter(u => u.role === 'StudentParent').map((student) => (
          <View key={student.id} className="flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Text className="text-purple-600 font-bold">{student.name[0]}</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-semibold">{student.name}</Text>
                <Text className="text-slate-400 text-xs">ID: #{student.id} • Class 10-A</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-xl border border-slate-200">
              <Text className="text-slate-600 font-bold text-xs">View Profile</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStaffMaster = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100">
      <Text className="text-slate-900 text-xl font-bold mb-6">Staff Master List</Text>
      <View className="space-y-3">
        {users.filter(u => u.role === 'Staff').map((staff) => (
          <View key={staff.id} className="flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-bold">{staff.name[0]}</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-semibold">{staff.name}</Text>
                <Text className="text-slate-400 text-xs">{staff.staffData?.department || 'General'} • {staff.staffData?.experience || 0} yrs exp</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity className="bg-white px-4 py-2 rounded-xl border border-slate-200">
                <Text className="text-slate-600 font-bold text-xs">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLogs = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100">
      <Text className="text-slate-900 text-xl font-bold mb-6">System Security Logs</Text>
      <View className="space-y-3">
        {[
          { event: 'Admin Login', user: 'Admin User', time: '2 mins ago', status: 'Success' },
          { event: 'Database Backup', user: 'System', time: '1 hour ago', status: 'Success' },
          { event: 'Invalid Login Attempt', user: 'Unknown', time: '3 hours ago', status: 'Warning' },
        ].map((log, i) => (
          <View key={i} className="flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <View>
              <Text className="text-slate-900 font-semibold">{log.event}</Text>
              <Text className="text-slate-400 text-xs">{log.user} • {log.time}</Text>
            </View>
            <Text className={`text-xs font-bold ${log.status === 'Success' ? 'text-green-600' : 'text-orange-600'}`}>
              {log.status.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 flex-row">
      <View className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex">
        <Text className="text-xl font-bold text-slate-900 mb-8">Admin Center</Text>
        <View className="space-y-2">
          <TouchableOpacity onPress={() => setActiveTab('Overview')} className={`p-3 rounded-xl ${activeTab === 'Overview' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Overview' ? 'text-blue-600' : 'text-slate-600'}`}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Users')} className={`p-3 rounded-xl ${activeTab === 'Users' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Users' ? 'text-blue-600' : 'text-slate-600'}`}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Staff')} className={`p-3 rounded-xl ${activeTab === 'Staff' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Staff' ? 'text-blue-600' : 'text-slate-600'}`}>Staff Operations</Text>
          </TouchableOpacity>
          <View className="h-px bg-slate-100 my-2" />
          <TouchableOpacity onPress={() => setActiveTab('StaffMaster')} className={`p-3 rounded-xl ${activeTab === 'StaffMaster' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'StaffMaster' ? 'text-blue-600' : 'text-slate-600'}`}>Staff Master</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('StudentsMaster')} className={`p-3 rounded-xl ${activeTab === 'StudentsMaster' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'StudentsMaster' ? 'text-blue-600' : 'text-slate-600'}`}>Student Master</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Logs')} className={`p-3 rounded-xl ${activeTab === 'Logs' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Logs' ? 'text-blue-600' : 'text-slate-600'}`}>System Logs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="bg-white p-6 flex-row justify-between items-center border-b border-slate-100">
          <Text className="text-slate-900 text-3xl font-bold">
            {activeTab === 'Overview' ? 'Admin Dashboard' : 
             activeTab === 'StudentsMaster' ? 'Student Hub' : 
             activeTab === 'StaffMaster' ? 'Faculty Hub' : 
             activeTab}
          </Text>
          <TouchableOpacity onPress={() => setUser(null)} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <LogOut color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView className="p-8">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Users' && renderUsers()}
          {activeTab === 'Staff' && renderStaff()}
          {activeTab === 'StudentsMaster' && renderStudentMaster()}
          {activeTab === 'StaffMaster' && renderStaffMaster()}
          {activeTab === 'Logs' && renderLogs()}
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
};
