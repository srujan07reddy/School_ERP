import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';
import { CalendarModule } from '../../components/Dashboard/CalendarModule';
import { LineChart } from 'react-native-chart-kit';
import { 
  LogOut, Book, Award, Clock, Map as MapIcon, 
  Bus, GraduationCap, MessageSquare, AlertCircle, 
  MapPin, Radio, ShieldCheck, Bell, Calendar
} from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width;

export const StudentDashboard = () => {
  const { user, setUser, users, leaveRequests, addLeaveRequest, messages, addMessage, busRoute } = useStore();
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Notes' | 'Assignments' | 'Leave' | 'Messages' | 'Profile' | 'Calendar'>('Dashboard');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const studentClass = user?.role === 'StudentParent' ? '10-A' : 'N/A';
  
  // Mock performance data for "At-Risk" logic
  const avgGrade = 68; // Below 70 is at risk
  const isAtRisk = avgGrade < 70;

  const handleRequestLeave = () => {
    if (!leaveDate || !leaveReason) return;
    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user?.id || '6',
      senderName: user?.name || 'Alex Johnson',
      receiverRole: 'Coordinator',
      reason: leaveReason,
      status: 'Pending',
      date: leaveDate
    };
    addLeaveRequest(newRequest as any);
    Alert.alert('Success', 'Leave application submitted to Coordinator.');
    setLeaveDate('');
    setLeaveReason('');
  };

  const handleSendMessage = async () => {
    if (!messageText || !selectedStaffId) return;
    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user?.id || '6',
      receiverId: selectedStaffId,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    try {
      await addMessage(newMsg);
      setMessageText('');
    } catch (e: any) {
      // Safe-chat error handled in store, alert already shown
    }
  };

  const renderDashboard = () => (
    <View className="space-y-8">
      {isAtRisk && (
        <View className="bg-red-600/20 border border-red-500/30 p-6 rounded-[32px] flex-row items-center">
          <AlertCircle color="#ef4444" size={32} />
          <View className="ml-4 flex-1">
            <Text className="text-red-400 font-bold text-lg">Academic At-Risk Alert</Text>
            <Text className="text-red-300/80 text-sm">Your current average (68%) is below benchmarks. Please contact your Coordinator.</Text>
          </View>
          <TouchableOpacity className="bg-red-600 px-6 py-2 rounded-xl">
            <Text className="text-white font-bold">Action Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row gap-6">
        <View className="flex-1 space-y-6">
          <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Attendance Tap-In Stream</Text>
              <Bell color="#60a5fa" size={20} />
            </View>
            <View className="space-y-4">
              {[
                { time: '08:12 AM', event: 'School Gate Tap-In', status: 'Success' },
                { time: 'Yesterday', event: 'Bus Boarding', status: 'Success' }
              ].map((log, i) => (
                <View key={i} className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Clock color="#94a3b8" size={18} />
                  <View className="ml-4">
                    <Text className="text-white font-semibold">{log.event}</Text>
                    <Text className="text-slate-400 text-xs">{log.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
            <Text className="text-white text-xl font-bold mb-4">Exam Performance</Text>
            <ChartContainer title="Subject Proficiency" subtitle="Grade progression (%)">
              <LineChart
                data={{
                  labels: ["Math", "Sci", "Eng", "Hist"],
                  datasets: [{ data: [65, 72, 85, 68] }]
                }}
                width={screenWidth * 0.35}
                height={200}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{...chartConfig, backgroundGradientFrom: '#1e293b', backgroundGradientTo: '#1e293b' }}
                style={{ borderRadius: 16 }}
              />
            </ChartContainer>
          </View>
        </View>

        <View className="w-96">
          <View className="bg-white/5 rounded-3xl p-8 border border-white/10 h-full">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Live Bus GPS</Text>
              <View className="bg-green-500/20 px-3 py-1 rounded-full flex-row items-center">
                <Radio color="#10b981" size={12} />
                <Text className="text-green-400 text-[10px] font-bold ml-1">LIVE</Text>
              </View>
            </View>
            <View className="bg-slate-900 rounded-2xl h-64 mb-6 items-center justify-center overflow-hidden relative">
              <MapIcon color="#1e293b" size={120} />
              <View className="absolute">
                <MapPin color="#ef4444" size={32} />
              </View>
              <View className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded-xl backdrop-blur-md">
                <Text className="text-white font-bold text-xs">Route 4: Green Valley Area</Text>
                <Text className="text-slate-400 text-[10px]">Bus #B-402 • ETA: 12 mins</Text>
              </View>
            </View>
            <View className="space-y-4">
              {busRoute.stops.slice(0, 3).map((stop, i) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mr-4" />
                  <Text className="text-slate-300 font-medium">{stop.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMessages = () => (
    <View className="flex-row h-[600px] bg-white/5 rounded-3xl overflow-hidden border border-white/10">
      <View className="w-80 border-r border-white/10 p-6">
        <Text className="text-white font-bold text-xl mb-6">Faculty Contacts</Text>
        <ScrollView>
          {users.filter((u: any) => u.role === 'Staff').map((staff: any) => (
            <TouchableOpacity 
              key={staff.id} 
              onPress={() => setSelectedStaffId(staff.id)}
              className={`p-4 rounded-2xl mb-2 ${selectedStaffId === staff.id ? 'bg-blue-600' : 'bg-white/5'}`}
            >
              <Text className={`font-bold ${selectedStaffId === staff.id ? 'text-white' : 'text-slate-300'}`}>{staff.name}</Text>
              <Text className="text-slate-400 text-xs">{staff.staffData?.department}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 bg-white/5">
        {selectedStaffId ? (
          <>
            <View className="p-6 border-b border-white/10 flex-row justify-between items-center">
              <Text className="text-white font-bold text-lg">Safe-Chat with {users.find(u => u.id === selectedStaffId)?.name}</Text>
              <View className="bg-blue-600/20 px-4 py-1 rounded-full flex-row items-center border border-blue-500/30">
                <ShieldCheck color="#60a5fa" size={14} />
                <Text className="text-blue-400 text-[10px] font-bold ml-2">ENCRYPTED</Text>
              </View>
            </View>
            <ScrollView className="flex-1 p-6">
              <View className="space-y-4">
                {messages.filter((m: any) => 
                  (m.senderId === user?.id && m.receiverId === selectedStaffId) || 
                  (m.senderId === selectedStaffId && m.receiverId === user?.id)
                ).map((msg: any) => (
                  <View key={msg.id} className={`max-w-[80%] p-4 rounded-2xl ${msg.senderId === user?.id ? 'bg-blue-600 self-end' : 'bg-white/10 self-start'}`}>
                    <Text className="text-white">{msg.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View className="p-6 border-t border-white/10 flex-row gap-4 items-center">
              <TextInput
                placeholder="Type your message..."
                placeholderTextColor="#94a3b8"
                className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 text-white"
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity onPress={handleSendMessage} className="bg-blue-600 p-4 rounded-2xl h-14 w-14 items-center justify-center">
                <MessageSquare color="white" size={24} />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-500 text-[10px] text-center pb-4 italic">
              Note: Messages are monitored for professional compliance and locked after school hours.
            </Text>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <MessageSquare color="#1e293b" size={80} />
            <Text className="text-slate-500 mt-4 text-lg">Select a faculty member to start a safe-chat</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProfile = () => (
    <View className="space-y-8">
      <View className="bg-white/5 rounded-3xl p-10 border border-white/10 flex-row items-center">
        <View className="w-32 h-32 bg-blue-600 rounded-full items-center justify-center mr-8 border-4 border-white/5">
          <Text className="text-white font-bold text-4xl">AJ</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-3xl font-bold">Alex Johnson</Text>
          <Text className="text-slate-300 text-lg">Student ID: #STU202409 • Class {studentClass}</Text>
          <View className="flex-row mt-4 gap-3">
            <View className="bg-green-500/20 px-4 py-1 rounded-full"><Text className="text-green-400 font-bold text-xs">ENROLLED</Text></View>
            <View className="bg-blue-500/20 px-4 py-1 rounded-full"><Text className="text-blue-400 font-bold text-xs">SPORTS CAPTAIN</Text></View>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap -mx-4">
        <View className="w-full lg:w-1/2 px-4 mb-8">
          <View className="bg-white/5 rounded-3xl p-8 border border-white/10 h-full">
            <Text className="text-white font-bold text-xl mb-6">Personal Biography</Text>
            <Text className="text-slate-300 leading-relaxed">
              Alex is a high-achieving student with a passion for Mathematics and Physics. He has been part of the school's Robotics club for 2 years and currently serves as the Junior Sports Captain.
            </Text>
            <View className="h-px bg-white/10 my-6" />
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-slate-400">Date of Birth</Text>
                <Text className="text-white font-bold">May 15, 2008</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400">Blood Group</Text>
                <Text className="text-white font-bold">O+ Positive</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full lg:w-1/2 px-4 mb-8">
          <View className="bg-white/5 rounded-3xl p-8 border border-white/10 h-full">
            <Text className="text-white font-bold text-xl mb-6">Guardian Information</Text>
            <View className="bg-blue-600/20 p-6 rounded-2xl border border-blue-600/20 mb-6">
              <Text className="text-blue-300 font-bold mb-1">Emergency Contact</Text>
              <Text className="text-white">+1 (555) 012-3456 (Robert Johnson)</Text>
            </View>
            <View className="space-y-4">
               <View className="flex-row justify-between">
                <Text className="text-slate-400">Parent Name</Text>
                <Text className="text-white font-bold">Robert Johnson</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400">Occupation</Text>
                <Text className="text-white font-bold">Software Engineer</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAssignments = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <Text className="text-white text-xl font-bold mb-6">Upcoming Assignments</Text>
      {useStore.getState().assignments.filter((a: any) => a.class === studentClass || a.class === 'Primary-A').map((item: any) => (
        <View key={item.id} className="flex-row justify-between items-center bg-white/5 p-6 rounded-2xl mb-4 border border-white/5">
          <View>
            <Text className="text-white font-bold text-lg">{item.title}</Text>
            <Text className="text-slate-400 text-xs mt-1">Due Date: {item.deadline}</Text>
          </View>
          <TouchableOpacity className="bg-blue-600 px-6 py-2 rounded-xl">
            <Text className="text-white font-bold">Open</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderNotes = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <Text className="text-white text-xl font-bold mb-6">Faculty Notes & Resources</Text>
      {useStore.getState().notes.filter((n: any) => n.class === studentClass || n.class === 'Primary-A').map((note: any) => (
        <View key={note.id} className="bg-white/5 p-6 rounded-2xl mb-4 border-l-4 border-blue-600 border border-white/5">
          <Text className="text-white font-bold text-lg mb-2">{note.title}</Text>
          <Text className="text-slate-300 mb-4 leading-5">{note.content}</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{note.sender}</Text>
            <Text className="text-slate-500 text-[10px]">{note.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeave = () => (
    <View className="bg-white/5 rounded-3xl p-10 border border-white/10">
      <Text className="text-white text-2xl font-bold mb-2">Leave Application</Text>
      <Text className="text-slate-300 mb-8">Requests are sent to your Section Coordinator for approval.</Text>
      
      <View className="space-y-4 mb-8">
        <TextInput placeholder="Date" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white" value={leaveDate} onChangeText={setLeaveDate} />
        <TextInput placeholder="Reason" multiline numberOfLines={4} placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 h-32 text-white" value={leaveReason} onChangeText={setLeaveReason} />
        <TouchableOpacity onPress={handleRequestLeave} className="bg-blue-600 p-5 rounded-2xl items-center">
          <Text className="text-white font-bold text-lg">Submit Request</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white font-bold mb-4">Request History</Text>
      {leaveRequests.filter((r: any) => r.senderId === user?.id).map((req: any) => (
        <View key={req.id} className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/5">
          <View>
            <Text className="text-white font-semibold">{req.date}</Text>
            <Text className="text-slate-400 text-xs truncate w-48">{req.reason}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${req.status === 'Pending' ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
            <Text className={`text-[10px] font-bold ${req.status === 'Pending' ? 'text-orange-400' : 'text-green-400'}`}>
              {req.status.toUpperCase()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1">
      <LinearGradient 
        colors={['#0F172A', '#1E293B']} 
        className="absolute inset-0"
      />
      <View className="flex-1 flex-row">
        <View className="w-64 bg-[#0F172A] border-r border-white/5 p-6 hidden md:flex">
          <Text className="text-xl font-bold text-white mb-8 tracking-tight">Student Hub</Text>
          <View className="space-y-2">
            <TouchableOpacity onPress={() => setActiveTab('Dashboard')} className={`p-3 rounded-xl ${activeTab === 'Dashboard' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Dashboard' ? 'text-white' : 'text-slate-400'}`}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Calendar')} className={`p-3 rounded-xl ${activeTab === 'Calendar' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Calendar' ? 'text-white' : 'text-slate-400'}`}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Notes')} className={`p-3 rounded-xl ${activeTab === 'Notes' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Notes' ? 'text-white' : 'text-slate-400'}`}>Class Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Assignments')} className={`p-3 rounded-xl ${activeTab === 'Assignments' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Assignments' ? 'text-white' : 'text-slate-400'}`}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Leave')} className={`p-3 rounded-xl ${activeTab === 'Leave' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Leave' ? 'text-white' : 'text-slate-400'}`}>Leave Application</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Messages')} className={`p-3 rounded-xl ${activeTab === 'Messages' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Messages' ? 'text-white' : 'text-slate-400'}`}>Safe-Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Profile')} className={`p-3 rounded-xl ${activeTab === 'Profile' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Profile' ? 'text-white' : 'text-slate-400'}`}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1">
          <View className="bg-[#0F172A]/50 p-6 flex-row justify-between items-center border-b border-white/5 backdrop-blur-md">
            <View>
              <Text className="text-white text-3xl font-bold tracking-tight">Welcome, {user?.name}</Text>
              <Text className="text-slate-400 font-medium">Student • Class {studentClass}</Text>
            </View>
            <TouchableOpacity onPress={() => setUser(null)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <LogOut color="#ef4444" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ padding: 32, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'Dashboard' && renderDashboard()}
            {activeTab === 'Calendar' && <CalendarModule />}
            {activeTab === 'Notes' && renderNotes()}
            {activeTab === 'Assignments' && renderAssignments()}
            {activeTab === 'Leave' && renderLeave()}
            {activeTab === 'Messages' && renderMessages()}
            {activeTab === 'Profile' && renderProfile()}
            <View className="h-20" />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
