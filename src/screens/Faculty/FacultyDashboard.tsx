import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Switch, Dimensions, Alert } from 'react-native';
import { useStore } from '../../store/useStore';
import { 
  ClipboardCheck, Upload, LogOut, Users, BookOpen, Clock, ShieldCheck, 
  AlertTriangle, ChevronRight, LayoutGrid, Calendar, AlertCircle, BarChart as BarIcon 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';

const SECTIONS = ['Primary-A', 'Primary-B', 'Secondary-A', 'Secondary-B'];
const screenWidth = Dimensions.get("window").width - 80;

export const FacultyDashboard = () => {
  const navigation = useNavigation();
  const user = useStore((state: any) => state.user);
  const setUser = useStore((state: any) => state.setUser);
  const studentsPresent = useStore((state: any) => state.liveStats.studentsPresent);
  const updateLiveStats = useStore((state: any) => state.updateLiveStats);
  
  const [activeTab, setActiveTab] = useState<'Educator' | 'Coordinator' | 'Curriculum' | 'Assignments' | 'Assessments'>('Educator');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  
  const [attendance, setAttendance] = useState([
    { id: '1', name: 'Alice Smith', present: true },
    { id: '2', name: 'Bob Johnson', present: false },
    { id: '3', name: 'Charlie Brown', present: true },
    { id: '4', name: 'David Wilson', present: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      updateLiveStats({ studentsPresent: studentsPresent + fluctuation });
    }, 5000);
    return () => clearInterval(interval);
  }, [studentsPresent]);

  const toggleAttendance = (id: string) => {
    setAttendance(attendance.map((a: any) => a.id === id ? { ...a, present: !a.present } : a));
  };

  const triggerSubstitution = (staffName: string) => {
    Alert.alert(
      "Staff Absent",
      `${staffName} is marked as ABSENT. Suggested substitute: Mr. Robert (Math Dept).`,
      [
        { text: "Ignore", style: "cancel" },
        { text: "Approve Substitution", onPress: () => alert("Substitution assigned!") }
      ]
    );
  };

  const substitutions = useStore((state: any) => state.substitutions);
  const activeSub = substitutions.find((s: any) => s.staffId === user?.id || s.substituteId === user?.id);

  const renderEducatorView = () => (
    <View>
      {activeSub && (
        <View className={`p-6 rounded-3xl mb-8 flex-row items-center border ${activeSub.staffId === user?.id ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
          <View className={`p-3 rounded-2xl mr-4 ${activeSub.staffId === user?.id ? 'bg-red-100' : 'bg-blue-100'}`}>
            <AlertCircle color={activeSub.staffId === user?.id ? '#ef4444' : '#3b82f6'} size={24} />
          </View>
          <View className="flex-1">
            <Text className={`font-bold text-lg ${activeSub.staffId === user?.id ? 'text-red-900' : 'text-blue-900'}`}>
              {activeSub.staffId === user?.id ? 'You are marked as ABSENT' : 'Substitution Assigned'}
            </Text>
            <Text className={`${activeSub.staffId === user?.id ? 'text-red-600' : 'text-blue-600'} text-sm`}>
              {activeSub.staffId === user?.id 
                ? 'Admin has assigned a substitute for your classes today.' 
                : 'You have been assigned to cover classes for another staff member.'}
            </Text>
          </View>
        </View>
      )}

      <View className="bg-orange-50 border border-orange-100 p-6 rounded-3xl mb-8 flex-row items-center">
        <View className="bg-orange-100 p-3 rounded-2xl mr-4">
          <AlertTriangle color="#f59e0b" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-orange-900 font-bold text-lg">Urgent Action Required</Text>
          <Text className="text-orange-600 text-sm">3 students in Primary-A have attendance below 75%.</Text>
        </View>
        <TouchableOpacity className="bg-orange-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-bold">Review</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <Text className="text-slate-900 font-bold text-lg mb-4">Today's Schedule</Text>
            {[
              { time: '09:00 AM', class: 'Mathematics', room: 'Room 402', status: 'Completed' },
              { time: '11:30 AM', class: 'Physics Lab', room: 'Science Block', status: 'In Progress' },
              { time: '02:00 PM', class: 'Pure Math', room: 'Room 402', status: 'Upcoming' },
            ].map((item, i) => (
              <View key={i} className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-50 last:border-0">
                <View>
                  <Text className="text-slate-900 font-semibold">{item.class}</Text>
                  <Text className="text-slate-400 text-xs">{item.time} • {item.room}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.status === 'In Progress' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Text className={`text-[10px] font-bold ${item.status === 'In Progress' ? 'text-blue-600' : 'text-slate-500'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <View className="bg-blue-600 p-8 rounded-[32px] shadow-lg shadow-blue-200 justify-between h-full">
            <View>
              <Text className="text-white/80 text-sm font-medium">Students Currently Live</Text>
              <Text className="text-white text-5xl font-bold mt-2">{studentsPresent}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="bg-white p-4 rounded-2xl items-center mt-6"
            >
              <Text className="text-blue-600 font-bold">New Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-3xl border border-slate-100 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-slate-900 font-bold text-lg">Quick Attendance (Primary-A)</Text>
          <TouchableOpacity onPress={() => alert('Launching Scanner...')} className="bg-blue-50 px-4 py-2 rounded-xl flex-row items-center">
            <ClipboardCheck color="#3b82f6" size={16} />
            <Text className="text-blue-600 ml-2 font-bold text-sm">Scan QR</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {attendance.map((student) => (
            <View key={student.id} className="flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold">{student.name[0]}</Text>
                </View>
                <Text className="text-slate-700 font-medium">{student.name}</Text>
              </View>
              <Switch
                value={student.present}
                onValueChange={() => toggleAttendance(student.id)}
                trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCoordinatorView = () => (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 max-h-12">
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section}
            onPress={() => setSelectedSection(section)}
            className={`px-6 py-2 rounded-full mr-3 border ${
              selectedSection === section 
                ? 'bg-blue-600 border-blue-500' 
                : 'bg-white border-slate-200'
            }`}
          >
            <Text className={`font-medium ${selectedSection === section ? 'text-white' : 'text-slate-500'}`}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <TouchableOpacity 
            onPress={() => triggerSubstitution('Ms. Sarah (Science)')}
            className="bg-red-50 border border-red-100 p-6 rounded-3xl flex-row items-center h-full"
          >
            <View className="bg-red-100 p-3 rounded-2xl mr-4">
              <AlertCircle color="#ef4444" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-red-900 font-bold text-lg">Substitution Required</Text>
              <Text className="text-red-600 text-sm">Science Dept • Ms. Sarah is absent</Text>
            </View>
            <ChevronRight color="#ef4444" size={24} />
          </TouchableOpacity>
        </View>
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <View className="bg-white border border-slate-100 p-6 rounded-3xl flex-row justify-between items-center h-full shadow-sm">
            <View className="flex-row items-center">
              <View className="bg-blue-50 p-3 rounded-2xl mr-4">
                <Users color="#3b82f6" size={24} />
              </View>
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Students</Text>
                <Text className="text-slate-900 text-3xl font-bold">124</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-green-50 p-3 rounded-2xl mr-4 ml-8">
                <Calendar color="#10b981" size={24} />
              </View>
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Staff Count</Text>
                <Text className="text-slate-900 text-3xl font-bold">08</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-2/3 px-4">
          <ChartContainer title="Section-wise Performance" subtitle="Average marks comparison (%)">
            <BarChart
              data={{
                labels: ["Math", "Sci", "Eng", "Hist", "Comp"],
                datasets: [{ data: [78, 85, 92, 65, 88] }]
              }}
              width={screenWidth * 0.6}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})` }}
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </ChartContainer>
        </View>
        <View className="w-full lg:w-1/3 px-4">
          <ChartContainer title="Today's Timetable" subtitle="Ongoing & upcoming sessions">
            <View className="space-y-4">
              {[
                { subject: 'Mathematics', time: '9:00 AM', status: 'Ongoing', color: '#10b981' },
                { subject: 'Physics', time: '10:30 AM', status: 'Upcoming', color: '#64748b' },
                { subject: 'Computer Sci', time: '12:00 PM', status: 'Upcoming', color: '#64748b' },
              ].map((session, i) => (
                <View key={i} className="flex-row items-center justify-between border-b border-slate-50 pb-3">
                  <View>
                    <Text className="text-slate-900 font-semibold">{session.subject}</Text>
                    <View className="flex-row items-center mt-1">
                      <Clock color="#94a3b8" size={12} />
                      <Text className="text-slate-400 text-[10px] ml-1">{session.time}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: `${session.color}20` }} className="px-2 py-1 rounded-md">
                    <Text style={{ color: session.color }} className="text-[10px] font-bold">{session.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ChartContainer>
        </View>
      </View>
    </View>
  );

  const renderCurriculum = () => (
    <View className="bg-white rounded-3xl p-6 border border-slate-100">
      <Text className="text-slate-900 font-bold text-xl mb-6">Course Curriculum</Text>
      {[
        { topic: 'Calculus Basics', progress: '80%', status: 'Ongoing' },
        { topic: 'Trigonometry', progress: '100%', status: 'Completed' },
        { topic: 'Linear Algebra', progress: '0%', status: 'Upcoming' },
      ].map((item, i) => (
        <View key={i} className="mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-700 font-semibold">{item.topic}</Text>
            <Text className="text-blue-600 font-bold">{item.progress}</Text>
          </View>
          <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <View style={{ width: item.progress }} className="h-full bg-blue-600" />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAssignments = () => (
    <View className="bg-white rounded-3xl p-6 border border-slate-100">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-900 font-bold text-xl">Active Assignments</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">+ Create</Text>
        </TouchableOpacity>
      </View>
      {[
        { title: 'Algebra Homework #4', deadline: 'May 02', submissions: '24/30' },
        { title: 'Midterm Project Draft', deadline: 'May 05', submissions: '12/30' },
      ].map((item, i) => (
        <View key={i} className="flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl mb-3">
          <View>
            <Text className="text-slate-900 font-semibold">{item.title}</Text>
            <Text className="text-slate-400 text-xs">Deadline: {item.deadline}</Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-600 text-[10px] font-bold">{item.submissions}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 flex-row">
      <View className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex">
        <Text className="text-xl font-bold text-slate-900 mb-8">Faculty Portal</Text>
        <View className="space-y-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('Educator')}
            className={`p-3 rounded-xl ${activeTab === 'Educator' ? 'bg-blue-50' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === 'Educator' ? 'text-blue-600' : 'text-slate-600'}`}>Dashboard</Text>
          </TouchableOpacity>
          
          {user?.isCoordinator && (
            <TouchableOpacity 
              onPress={() => setActiveTab('Coordinator')}
              className={`p-3 rounded-xl ${activeTab === 'Coordinator' ? 'bg-purple-50' : ''}`}
            >
              <Text className={`font-semibold ${activeTab === 'Coordinator' ? 'text-purple-600' : 'text-slate-600'}`}>Coordination</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={() => setActiveTab('Curriculum')}
            className={`p-3 rounded-xl ${activeTab === 'Curriculum' ? 'bg-blue-50' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === 'Curriculum' ? 'text-blue-600' : 'text-slate-600'}`}>Curriculum</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('Assignments')}
            className={`p-3 rounded-xl ${activeTab === 'Assignments' ? 'bg-blue-50' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === 'Assignments' ? 'text-blue-600' : 'text-slate-600'}`}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('Assessments')}
            className={`p-3 rounded-xl ${activeTab === 'Assessments' ? 'bg-blue-50' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === 'Assessments' ? 'text-blue-600' : 'text-slate-600'}`}>Assessments</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="bg-white p-6 flex-row justify-between items-center border-b border-slate-100">
          <Text className="text-slate-900 text-3xl font-bold">
            {activeTab === 'Educator' ? 'Educator Console' : 
             activeTab === 'Coordinator' ? 'Academic Ops' :
             activeTab}
          </Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={() => (navigation as any).navigate('SafeChat')}
              className="p-3 bg-green-50 rounded-2xl border border-green-100"
            >
              <ShieldCheck color="#10b981" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUser(null)} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <LogOut color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="p-8">
          {activeTab === 'Educator' && renderEducatorView()}
          {activeTab === 'Coordinator' && renderCoordinatorView()}
          {activeTab === 'Curriculum' && renderCurriculum()}
          {activeTab === 'Assignments' && renderAssignments()}
          {activeTab === 'Assessments' && (
            <View className="bg-white p-10 rounded-3xl border border-slate-100 items-center">
              <BarIcon color="#3b82f6" size={48} className="opacity-20 mb-4" />
              <Text className="text-slate-900 font-bold text-xl">Assessment Center</Text>
              <Text className="text-slate-400 text-center mt-2">Create and monitor classroom quizzes and tests.</Text>
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-10 rounded-t-[48px] shadow-2xl">
            <Text className="text-slate-900 text-2xl font-bold mb-2">Assignment Uploader</Text>
            <Text className="text-slate-400 mb-8">Select files to distribute to your section</Text>
            <View className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl items-center mb-8">
              <Upload color="#3b82f6" size={48} className="opacity-30" />
              <Text className="text-slate-400 mt-4">Drop files here or browse</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-blue-600 p-5 rounded-2xl items-center">
              <Text className="text-white font-bold text-lg">Send to Students</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 p-2 items-center">
              <Text className="text-slate-400">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
