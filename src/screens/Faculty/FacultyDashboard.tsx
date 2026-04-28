import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { CalendarModule } from '../../components/Dashboard/CalendarModule';
import { 
  ClipboardCheck, Upload, LogOut, Users, BookOpen, Clock, ShieldCheck, 
  LayoutGrid, AlertCircle, AlertTriangle, MessageSquare, ChevronRight,
  Calendar
} from 'lucide-react-native';

export const FacultyDashboard = () => {
  const { user, setUser, users, assignments, addAssignment, notes, addNote, leaveRequests, addLeaveRequest, messages, addMessage } = useStore();
  const [activeTab, setActiveTab] = useState<'Educator' | 'Assignments' | 'Notes' | 'Leave' | 'Messages' | 'Profile' | 'Assessments' | 'Calendar'>('Educator');
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const assignedClass = user?.staffData?.assignedClass || '10-A';
  const studentsPresent = useStore((state) => state.liveStats.studentsPresent);

  const handleCreateAssignment = () => {
    if (!assignmentTitle || !assignmentDeadline) return;
    const newAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      title: assignmentTitle,
      deadline: assignmentDeadline,
      totalMarks: 100,
      submissions: 0,
      class: assignedClass
    };
    addAssignment(newAssignment);
    setModalVisible(false);
    setAssignmentTitle('');
    setAssignmentDeadline('');
    Alert.alert('Success', 'Assignment posted to students.');
  };

  const handleCreateNote = () => {
    if (!noteTitle || !noteContent) return;
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      sender: user?.name || 'Faculty',
      title: noteTitle,
      content: noteContent,
      date: new Date().toISOString().split('T')[0],
      class: assignedClass
    };
    addNote(newNote);
    setNoteModalVisible(false);
    setNoteTitle('');
    setNoteContent('');
    Alert.alert('Success', 'Class notes updated.');
  };

  const handleStaffLeave = () => {
    if (!leaveDate || !leaveReason) return;
    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user?.id || '',
      senderName: user?.name || '',
      receiverRole: 'Admin',
      reason: leaveReason,
      status: 'Pending',
      date: leaveDate
    };
    addLeaveRequest(newRequest as any);
    Alert.alert('Success', 'Leave request sent to Admin.');
    setLeaveDate('');
    setLeaveReason('');
  };

  const handleSendMessage = async () => {
    if (!messageText || !selectedParentId) return;
    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user?.id || '',
      receiverId: selectedParentId,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    try {
      await addMessage(newMsg);
      setMessageText('');
    } catch (e) {
      // Restriction error already handled by store alert
    }
  };

  const renderEducator = () => (
    <View className="space-y-8">
      <View className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-8 flex-row items-center">
        <View className="bg-blue-600/20 p-3 rounded-2xl mr-4">
          <AlertTriangle color="#60a5fa" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Class Alert</Text>
          <Text className="text-slate-300 text-sm">3 students in {assignedClass} have attendance below 75%.</Text>
        </View>
        <TouchableOpacity className="bg-blue-600 px-6 py-2 rounded-xl">
          <Text className="text-white font-bold">Review</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white font-bold text-lg">Quick Attendance ({assignedClass})</Text>
          <TouchableOpacity onPress={() => alert('Scanner active')} className="bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/30">
            <Text className="text-blue-400 font-bold text-sm">Open Gate Scanner</Text>
          </TouchableOpacity>
        </View>
        <View className="space-y-3">
          {users.filter(u => u.role === 'StudentParent').slice(0, 5).map((student) => (
            <View key={student.id} className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl">
              <Text className="text-slate-300 font-medium">{student.name}</Text>
              <Switch
                value={true}
                trackColor={{ false: '#334155', true: '#2563eb' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMessages = () => (
    <View className="flex-row h-[600px] bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-sm">
      <View className="w-80 border-r border-white/10 p-6">
        <Text className="text-white font-bold text-xl mb-6">Parent Contacts</Text>
        <ScrollView>
          {users.filter((u: any) => u.role === 'StudentParent').map((parent: any) => (
            <TouchableOpacity 
              key={parent.id} 
              onPress={() => setSelectedParentId(parent.id)}
              className={`p-4 rounded-2xl mb-2 ${selectedParentId === parent.id ? 'bg-blue-600' : 'bg-white/5'}`}
            >
              <Text className={`font-bold ${selectedParentId === parent.id ? 'text-white' : 'text-slate-300'}`}>{parent.name}</Text>
              <Text className="text-slate-400 text-xs">Parent of Alex</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">
        {selectedParentId ? (
          <>
            <View className="p-6 border-b border-white/10 flex-row justify-between items-center">
              <Text className="text-white font-bold text-lg">Safe-Chat with {users.find(u => u.id === selectedParentId)?.name}</Text>
              <View className="bg-blue-600/20 px-4 py-1 rounded-full flex-row items-center border border-blue-500/30">
                <ShieldCheck color="#60a5fa" size={14} />
                <Text className="text-blue-400 text-[10px] font-bold ml-2">PROFESSIONAL CHANNEL</Text>
              </View>
            </View>
            <ScrollView className="flex-1 p-6">
              <View className="space-y-4">
                {messages.filter((m: any) => 
                  (m.senderId === user?.id && m.receiverId === selectedParentId) || 
                  (m.senderId === selectedParentId && m.receiverId === user?.id)
                ).map((msg: any) => (
                  <View key={msg.id} className={`max-w-[80%] p-4 rounded-2xl ${msg.senderId === user?.id ? 'bg-blue-600 self-end' : 'bg-white/10 self-start'}`}>
                    <Text className="text-white">{msg.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View className="p-6 border-t border-white/10 flex-row gap-4 items-center">
              <TextInput
                placeholder="Type professional update..."
                placeholderTextColor="#94a3b8"
                className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 text-white"
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity onPress={handleSendMessage} className="bg-blue-600 p-4 rounded-2xl h-14 w-14 items-center justify-center">
                <MessageSquare color="white" size={24} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <MessageSquare color="#1e293b" size={80} />
            <Text className="text-slate-500 mt-4 text-lg">Select a parent contact to start a safe-chat</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProfile = () => (
    <View className="space-y-8">
      <View className="bg-white/5 rounded-3xl p-10 border border-white/10 flex-row items-center">
        <View className="w-32 h-32 bg-blue-600 rounded-full items-center justify-center mr-8 border-4 border-white/10">
          <Text className="text-white font-bold text-4xl">{user?.name[0]}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-3xl font-bold">{user?.name}</Text>
          <Text className="text-slate-300 text-lg">Senior Faculty • {user?.staffData?.department} Dept.</Text>
          <View className="flex-row mt-4 gap-3">
            <View className="bg-blue-600/20 px-4 py-1 rounded-full"><Text className="text-blue-300 font-bold text-xs">YEARS EXP: {user?.staffData?.experience}</Text></View>
            <View className="bg-green-600/20 px-4 py-1 rounded-full"><Text className="text-green-300 font-bold text-xs">ACTIVE</Text></View>
          </View>
        </View>
      </View>

      <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
        <Text className="text-white font-bold text-xl mb-6">Professional Bio</Text>
        <Text className="text-slate-300 leading-relaxed mb-6">
          Experienced educator with a deep commitment to student success. Specialized in developing innovative curriculum strategies for {user?.staffData?.department}.
        </Text>
        <View className="h-px bg-white/10 my-6" />
        <View className="space-y-4">
          <View className="flex-row justify-between">
            <Text className="text-slate-400">Class Assigned</Text>
            <Text className="text-white font-bold">{user?.staffData?.assignedClass}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-400">Certifications</Text>
            <Text className="text-white font-bold">M.Ed, Digital Learning Expert</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAssignments = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Manage Assignments ({assignedClass})</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">New Post</Text>
        </TouchableOpacity>
      </View>
      <View className="space-y-4">
        {assignments.filter((a: any) => a.class === assignedClass).map((item: any) => (
          <View key={item.id} className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl">
            <View>
              <Text className="text-white font-semibold">{item.title}</Text>
              <Text className="text-slate-400 text-xs">Deadline: {item.deadline}</Text>
            </View>
            <View className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/20">
              <Text className="text-blue-400 text-[10px] font-bold">{item.submissions} Submissions</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNotes = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Class Resources</Text>
        <TouchableOpacity onPress={() => setNoteModalVisible(true)} className="bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">Post Note</Text>
        </TouchableOpacity>
      </View>
      {notes.filter((n: any) => n.class === assignedClass).map((note: any) => (
        <View key={note.id} className="bg-white/5 p-6 rounded-2xl mb-4 border border-white/5">
          <Text className="text-white font-bold text-lg">{note.title}</Text>
          <Text className="text-slate-300">{note.content}</Text>
        </View>
      ))}
    </View>
  );

  const renderLeave = () => (
    <View className="bg-white/5 rounded-3xl p-10 border border-white/10">
      <Text className="text-white text-2xl font-bold mb-8">Request Leave from Admin</Text>
      <TextInput placeholder="Date" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white mb-4" value={leaveDate} onChangeText={setLeaveDate} />
      <TextInput placeholder="Reason" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 h-32 text-white mb-4" value={leaveReason} onChangeText={setLeaveReason} />
      <TouchableOpacity onPress={handleStaffLeave} className="bg-blue-600 p-5 rounded-2xl items-center">
        <Text className="text-white font-bold text-lg">Submit Request</Text>
      </TouchableOpacity>
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
          <Text className="text-xl font-bold text-white mb-8 tracking-tight">Faculty Portal</Text>
          <View className="space-y-2">
            <TouchableOpacity onPress={() => setActiveTab('Educator')} className={`p-3 rounded-xl ${activeTab === 'Educator' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Educator' ? 'text-white' : 'text-slate-400'}`}>My Classes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Calendar')} className={`p-3 rounded-xl ${activeTab === 'Calendar' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Calendar' ? 'text-white' : 'text-slate-400'}`}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Assignments')} className={`p-3 rounded-xl ${activeTab === 'Assignments' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Assignments' ? 'text-white' : 'text-slate-400'}`}>Assignments</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Notes')} className={`p-3 rounded-xl ${activeTab === 'Notes' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Notes' ? 'text-white' : 'text-slate-400'}`}>Class Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Leave')} className={`p-3 rounded-xl ${activeTab === 'Leave' ? 'bg-blue-600' : ''}`}>
              <Text className={`font-semibold ${activeTab === 'Leave' ? 'text-white' : 'text-slate-400'}`}>Request Leave</Text>
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
              <Text className="text-slate-400 font-medium">Faculty Member • Class {assignedClass}</Text>
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
            {activeTab === 'Educator' && renderEducator()}
            {activeTab === 'Calendar' && <CalendarModule />}
            {activeTab === 'Assignments' && renderAssignments()}
            {activeTab === 'Notes' && renderNotes()}
            {activeTab === 'Leave' && renderLeave()}
            {activeTab === 'Messages' && renderMessages()}
            {activeTab === 'Profile' && renderProfile()}
            <View className="h-20" />
          </ScrollView>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-[#1E293B] w-full max-w-md p-8 rounded-[32px] border border-white/10">
            <Text className="text-white text-2xl font-bold mb-6">New Assignment</Text>
            <TextInput placeholder="Assignment Title" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white mb-4" value={assignmentTitle} onChangeText={setAssignmentTitle} />
            <TextInput placeholder="Deadline (YYYY-MM-DD)" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white mb-6" value={assignmentDeadline} onChangeText={setAssignmentDeadline} />
            <TouchableOpacity onPress={handleCreateAssignment} className="bg-blue-600 p-5 rounded-2xl items-center">
              <Text className="text-white font-bold">Post to Class</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 items-center">
              <Text className="text-slate-400">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={noteModalVisible} onRequestClose={() => setNoteModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-[#1E293B] w-full max-w-md p-8 rounded-[32px] border border-white/10">
            <Text className="text-white text-2xl font-bold mb-6">New Class Note</Text>
            <TextInput placeholder="Topic" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white mb-4" value={noteTitle} onChangeText={setNoteTitle} />
            <TextInput placeholder="Content" multiline numberOfLines={4} placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-2xl border border-white/10 h-32 text-white mb-6" value={noteContent} onChangeText={setNoteContent} />
            <TouchableOpacity onPress={handleCreateNote} className="bg-blue-600 p-5 rounded-2xl items-center">
              <Text className="text-white font-bold">Share with Students</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNoteModalVisible(false)} className="mt-4 items-center">
              <Text className="text-slate-400">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
