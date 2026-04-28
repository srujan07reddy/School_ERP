import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert, Modal, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { 
  Users, LogOut, TrendingUp, 
  UserPlus, Calendar, AlertCircle, Activity,
  ShieldCheck, Briefcase, Database, Wallet,
  Clock, MapPin, CheckCircle, BarChart as BarChartIcon,
  Filter, Layers, Search, Eye, Edit, Trash2,
  MessageSquare, Mail, ClipboardList, Plus, ChevronRight,
  Target, GraduationCap
} from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';
import { StatCard } from '../../components/Dashboard/StatCard';
import { CalendarModule } from '../../components/Dashboard/CalendarModule';

const screenWidth = Dimensions.get("window").width;
const GRADES = ['PP1', 'PP2', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export const AdminDashboard = () => {
  const { 
    user, setUser, users, addUser, deleteUser, substitutions, 
    assignSubstitution, assets, payroll, approvePayroll, addLog, 
    leaveRequests, updateLeaveStatus, surveys, addSurvey, 
    performanceSettings, updatePerformanceSettings, addMessage, auditLogs
  } = useStore();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Users' | 'Staff' | 'StudentsMaster' | 'StaffMaster' | 'Logs' | 'Analytics' | 'Profile' | 'Finance' | 'Inventory' | 'Payroll' | 'Calendar' | 'Surveys' | 'Timetable' | 'BusTracking'>('Overview');
  
  // Modals
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [admissionModalVisible, setAdmissionModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [surveyModalVisible, setSurveyModalVisible] = useState(false);
  const [groupMessageModalVisible, setGroupMessageModalVisible] = useState(false);
  const [perfSettingsModalVisible, setPerfSettingsModalVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [selectedAbsentStaff, setSelectedAbsentStaff] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState('10th');
  const [analyticsMetric, setAnalyticsMetric] = useState<'Attendance' | 'Assignments' | 'Assessments' | 'ExamComparison'>('Attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [analyticsSortOrder, setAnalyticsSortOrder] = useState<'high' | 'low' | 'none' | 'improvement'>('none');
  const [segmentFilter, setSegmentFilter] = useState<'high' | 'medium' | 'low' | 'none'>('none');
  const [messagingTargetIds, setMessagingTargetIds] = useState<string[]>([]);
  const [emergencyText, setEmergencyText] = useState('');
  
  // Survey Form
  const [surveyForm, setSurveyForm] = useState({ title: '', description: '', role: 'All' as any, options: '' });
  
  // Messaging Form
  const [messageForm, setMessageForm] = useState({ title: '', body: '', targetGroup: '' });
  
  // Timetable State
  const [timetableMode, setTimetableMode] = useState<'Class' | 'Teacher'>('Class');
  const [timetableFilter, setTimetableFilter] = useState('10th-A');
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Performance Segmentation Logic
  const sortedStudents = useMemo(() => {
    let base = users.filter(u => u.role === 'StudentParent').map(s => {
      const score = (parseInt(s.id) * 7) % 100 || 75;
      let segment: 'high' | 'medium' | 'low' = 'medium';
      if (score >= 85) segment = 'high';
      else if (score < 60) segment = 'low';
      
      // Mock fee due logic
      const feeDue = (parseInt(s.id) * 100) % 5000;
      const isDefaulter = feeDue > 2000;
      
      // Mock exam comparison data
      const preLastExam = (parseInt(s.id) * 7) % 40 + 45;
      const lastExam = (parseInt(s.id) * 9) % 40 + 50;
      const presentExam = (parseInt(s.id) * 11) % 40 + 55;
      const improvement = presentExam - lastExam;
      const overallTrend = presentExam - preLastExam;
      
      return { ...s, score, segment, feeDue, isDefaulter, preLastExam, lastExam, presentExam, improvement, overallTrend };
    });

    if (analyticsSortOrder === 'high') return base.sort((a, b) => b.presentExam - a.presentExam);
    if (analyticsSortOrder === 'low') return base.sort((a, b) => a.presentExam - b.presentExam);
    if (analyticsSortOrder === 'improvement') return base.sort((a, b) => b.improvement - a.improvement);
    return base;
  }, [users, analyticsSortOrder]);

  const filteredAnalyticsStudents = sortedStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = segmentFilter === 'none' || s.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const handleCreateSurvey = () => {
    if (!surveyForm.title || !surveyForm.options) return;
    const newSurvey = {
      id: Math.random().toString(36).substr(2, 9),
      title: surveyForm.title,
      description: surveyForm.description,
      role: surveyForm.role,
      options: surveyForm.options.split(',').map(o => o.trim()),
      results: {},
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    addSurvey(newSurvey as any);
    setSurveyModalVisible(false);
    setSurveyForm({ title: '', description: '', role: 'All', options: '' });
    Alert.alert('Survey Published', `Survey "${newSurvey.title}" is now live for ${newSurvey.role}s.`);
  };

  const handleGroupMessage = async () => {
    if (!messageForm.title || messagingTargetIds.length === 0) return;
    
    for (const targetId of messagingTargetIds) {
      await addMessage({
        id: Math.random().toString(36).substr(2, 9),
        senderId: user?.id || 'admin',
        receiverId: targetId,
        text: `[${messageForm.title}] ${messageForm.body}`,
        timestamp: new Date().toISOString()
      });
    }
    setGroupMessageModalVisible(false);
    setMessagingTargetIds([]);
    Alert.alert('Group Message Sent', `Notification delivered to ${messagingTargetIds.length} recipients.`);
  };

  const handleBroadcast = () => {
    if (!emergencyText) return;
    addLog({ actor: 'Admin', action: 'Emergency Broadcast', details: emergencyText, severity: 'Critical' });
    Alert.alert('Success', 'Emergency notification broadcasted to all users via FCM engine.');
    setEmergencyText('');
  };

  const [formData, setFormData] = useState<any>({
    name: '', motherName: '', fatherName: '', phone: '', email: '', aadhar: '', 
    sex: 'Male', nationality: 'Indian', dob: '', applyingClass: '', 
    previousSchool: '', staffChildName: '', siblingsInfo: '',
    correspondenceAddress: '', permanentAddress: '', 
    religion: '', caste: '', category: '', hobbies: '',
    stayingWithParents: true, hostelRequired: false, transportRequired: false,
    motherQualification: '', motherOccupation: '', motherPhone: '', motherAadhar: '',
    fatherQualification: '', fatherOccupation: '', fatherPhone: '', fatherAadhar: '',
    department: '', experience: '', certifications: '', subjects: ''
  });

  const handleFinalSubmit = (role: 'Staff' | 'StudentParent') => {
    if (!formData.name || !formData.email) return;
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: role,
      phone: formData.phone,
      staffData: role === 'Staff' ? {
        department: formData.department,
        experience: parseInt(formData.experience),
        subjects: formData.subjects.split(','),
        isFree: true,
        freeHours: ['09:00 AM', '02:00 PM']
      } : undefined,
      studentData: role === 'StudentParent' ? {
        grades: [],
        previousExams: [],
        dob: formData.dob,
        aadhar: formData.aadhar,
        applyingClass: formData.applyingClass,
        parents: {
          mother: { name: formData.motherName, phone: formData.motherPhone },
          father: { name: formData.fatherName, phone: formData.fatherPhone }
        }
      } : undefined
    };
    addUser(newUser as any);
    setAdmissionModalVisible(false);
    setAppointmentModalVisible(false);
    setFormData({
      name: '', motherName: '', fatherName: '', phone: '', email: '', aadhar: '', 
      sex: 'Male', nationality: 'Indian', dob: '', applyingClass: '', 
      previousSchool: '', staffChildName: '', siblingsInfo: '',
      correspondenceAddress: '', permanentAddress: '', 
      religion: '', caste: '', category: '', hobbies: '',
      stayingWithParents: true, hostelRequired: false, transportRequired: false,
      motherQualification: '', motherOccupation: '', motherPhone: '', motherAadhar: '',
      fatherQualification: '', fatherOccupation: '', fatherPhone: '', fatherAadhar: '',
      department: '', experience: '', certifications: '', subjects: ''
    });
    Alert.alert('Success', `${role === 'Staff' ? 'Faculty Appointed' : 'Admission Successful'}!`);
  };

  const handleAutoGenerateTimetable = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Logic: 
      // 1. Identify staff on leave
      const absentStaffIds = leaveRequests.filter(r => r.status === 'Approved').map(r => r.senderId);
      
      // 2. Identify available substitutes (Staff not on leave)
      const availableStaff = users.filter(u => u.role === 'Staff' && !absentStaffIds.includes(u.id));
      
      // 3. Generate 8 slots for 6 days
      const newSchedule: any[] = [];
      const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computers', 'Physical Ed'];
      
      for (let d = 0; d < 6; d++) {
        for (let s = 0; s < 8; s++) {
          const teacher = availableStaff[Math.floor(Math.random() * availableStaff.length)];
          newSchedule.push({
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d],
            slot: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'][s],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            teacher: teacher?.name || 'Guest Faculty',
            room: `RM 10${s}`,
            isSubstitute: false
          });
        }
      }
      setTimetableData(newSchedule);
      setIsGenerating(false);
      Alert.alert('AI Optimization Complete', 'Schedule generated based on faculty availability and leave records.');
    }, 1500);
  };

  const handleMarkAbsent = (staff: any) => {
    setSelectedAbsentStaff(staff);
    setReassignModalVisible(true);
  };

  const confirmReassignment = (substitute: any) => {
    assignSubstitution(selectedAbsentStaff.id, substitute.id);
    setReassignModalVisible(false);
    Alert.alert('Reassigned', `${substitute.name} will cover classes for ${selectedAbsentStaff.name} today.`);
  };

  const renderTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];
    
    return (
      <View className="space-y-6">
        <View className="flex-row justify-between items-center bg-white/5 p-8 rounded-[40px] border border-white/10">
          <View>
            <Text className="text-white text-3xl font-bold">Master Academic Schedule</Text>
            <Text className="text-slate-400 mt-1">Viewing {timetableMode}-wise timetable for {timetableFilter}</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleAutoGenerateTimetable}
              className="bg-blue-600 px-8 py-3 rounded-2xl flex-row items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Activity color="white" size={18} />
              <Text className="text-white font-bold text-xs">{isGenerating ? 'Optimizing...' : 'Generate AI Schedule'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setTimetableMode('Class'); setTimetableFilter('10th-A'); }}
              className={`px-6 py-3 rounded-2xl border ${timetableMode === 'Class' ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
            >
              <Text className="text-white font-bold text-xs">Class-wise</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setTimetableMode('Teacher'); setTimetableFilter('Mr. Ramesh'); }}
              className={`px-6 py-3 rounded-2xl border ${timetableMode === 'Teacher' ? 'bg-purple-600 border-purple-500' : 'bg-white/5 border-white/10'}`}
            >
              <Text className="text-white font-bold text-xs">Teacher-wise</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-4 mb-2">
           {timetableMode === 'Class' ? (
             <View className="space-y-4">
               <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                 {GRADES.map((grade) => (
                   <TouchableOpacity 
                     key={grade} 
                     onPress={() => setTimetableFilter(grade + '-A')}
                     className={`px-6 py-3 rounded-xl border ${timetableFilter.startsWith(grade) ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10'}`}
                   >
                     <Text className={`font-bold ${timetableFilter.startsWith(grade) ? 'text-white' : 'text-slate-400'}`}>{grade}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
               <View className="flex-row gap-3">
                 {['Section A', 'Section B', 'Section C'].map((sec) => (
                   <TouchableOpacity 
                     key={sec} 
                     onPress={() => setTimetableFilter(timetableFilter.split('-')[0] + '-' + sec.split(' ')[1])}
                     className={`px-8 py-3 rounded-xl border ${timetableFilter.endsWith(sec.split(' ')[1]) ? 'bg-blue-500/20 border-blue-500/40' : 'bg-white/5 border-white/10'}`}
                   >
                     <Text className={`font-bold text-xs ${timetableFilter.endsWith(sec.split(' ')[1]) ? 'text-blue-400' : 'text-slate-500'}`}>{sec}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>
           ) : (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
               {['Mr. Ramesh', 'Ms. Priya', 'Mr. Amit', 'Ms. Sneha', 'Mr. Vikram'].map((teacher) => (
                 <TouchableOpacity 
                   key={teacher} 
                   onPress={() => setTimetableFilter(teacher)}
                   className={`px-6 py-3 rounded-xl border ${timetableFilter === teacher ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10'}`}
                 >
                   <Text className={`font-bold ${timetableFilter === teacher ? 'text-white' : 'text-slate-400'}`}>{teacher}</Text>
                 </TouchableOpacity>
               ))}
             </ScrollView>
           )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
          <View className="bg-white/5 p-4 rounded-[40px] border border-white/10">
            <View className="flex-row border-b border-white/10 pb-6">
              <View className="w-32 items-center justify-center">
                <Clock color="#64748b" size={24} />
              </View>
              {days.map(day => (
                <View key={day} className="w-56 items-center py-2">
                  <Text className="text-blue-400 font-bold text-lg">{day}</Text>
                </View>
              ))}
            </View>

            {timeSlots.map((slot, i) => (
              <View key={slot} className={`flex-row border-b border-white/5 ${i === timeSlots.length - 1 ? 'border-b-0' : ''}`}>
                <View className="w-32 h-32 items-center justify-center border-r border-white/5">
                  <Text className="text-slate-500 font-medium text-xs">{slot}</Text>
                </View>
                {days.map(day => {
                  const entry = timetableData.find(e => e.day === day && e.slot === slot) || (timetableData.length === 0 ? { subject: 'Mathematics', teacher: 'Mr. Ramesh', room: 'RM 101' } : null);
                  return (
                    <View key={`${day}-${slot}`} className="w-56 h-32 p-3 border-r border-white/5">
                      {entry ? (
                        <View className={`flex-1 rounded-3xl p-5 justify-center border ${i % 2 === 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                          <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-white font-bold text-sm">
                              {timetableMode === 'Class' ? entry.subject : (timetableFilter.includes('10th') ? entry.subject : 'Grade 10-A')}
                            </Text>
                            <View className="bg-white/10 px-2 py-1 rounded-md">
                              <Text className="text-white/60 text-[8px] font-bold">{entry.room}</Text>
                            </View>
                          </View>
                          <Text className="text-slate-400 text-xs">
                            {timetableMode === 'Class' ? entry.teacher : 'Advanced Algebra'}
                          </Text>
                          <View className="flex-row items-center mt-3">
                            <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                            <Text className="text-green-400 text-[10px] font-bold">OPTIMIZED</Text>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-1 rounded-3xl border border-dashed border-white/5 items-center justify-center bg-black/20">
                          <Text className="text-slate-700 text-xs font-medium">Interval / Free</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderOverview = () => (
    <View className="space-y-8">
      <View className="flex-row flex-wrap -mx-2">
        <StatCard title="Total Students" value={850} icon={Users} trend="+12%" color="#3b82f6" />
        <StatCard title="Staff Count" value={users.filter(u => u.role === 'Staff').length} icon={Calendar} trend="+2%" color="#10b981" />
        <StatCard title="Daily Revenue" value="$42.5k" icon={TrendingUp} trend="+5.4%" color="#8b5cf6" />
        <StatCard title="Active Subs" value={substitutions.length} icon={Activity} color="#f59e0b" />
      </View>

      <View className="flex-row gap-6">
        <View className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10">
          <Text className="text-white text-xl font-bold mb-6">HR Compliance & Health</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between items-center p-4 bg-blue-600/10 rounded-2xl">
              <View className="flex-row items-center">
                <Users color="#60a5fa" size={20} />
                <Text className="text-blue-300 font-semibold ml-2">Staff-Student Ratio</Text>
              </View>
              <Text className="text-white font-bold">1:18</Text>
            </View>
            <View className="flex-row justify-between items-center p-4 bg-green-600/10 rounded-2xl">
              <View className="flex-row items-center">
                <TrendingUp color="#34d399" size={20} />
                <Text className="text-green-300 font-semibold ml-2">Academic Benchmark</Text>
              </View>
              <Text className="text-white font-bold">94.2%</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10">
          <Text className="text-white text-xl font-bold mb-4">Emergency Broadcast Center</Text>
          <TextInput
            placeholder="Type emergency alert (Holidays, Urgent alerts)..."
            placeholderTextColor="#64748b"
            className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white h-24 mb-4"
            multiline
            value={emergencyText}
            onChangeText={setEmergencyText}
          />
          <TouchableOpacity onPress={handleBroadcast} className="bg-red-600 p-4 rounded-2xl items-center flex-row justify-center">
            <ShieldCheck color="white" size={20} />
            <Text className="text-white font-bold ml-2">Send FCM Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFinance = () => (
    <View className="space-y-8">
      <View className="bg-white/5 p-8 rounded-3xl border border-white/10">
        <Text className="text-white text-xl font-bold mb-6">Live Revenue vs. Expenses</Text>
        <ChartContainer title="Financial Performance" subtitle="Real-time collection vs operational costs">
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr"],
              datasets: [
                { data: [35, 42, 38, 45], color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, strokeWidth: 3 },
                { data: [28, 30, 29, 32], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, strokeWidth: 2 }
              ],
              legend: ["Revenue", "Expenses"]
            }}
            width={screenWidth * 0.7}
            height={250}
            yAxisLabel="$"
            yAxisSuffix="k"
            chartConfig={{...chartConfig, backgroundGradientFrom: '#0F172A', backgroundGradientTo: '#0F172A' }}
            style={{ borderRadius: 16 }}
          />
        </ChartContainer>
      </View>

      <View className="bg-white/5 p-8 rounded-[40px] border border-white/10">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-white text-2xl font-bold">Fee Default Tracker</Text>
            <Text className="text-slate-400 mt-1">Students with outstanding dues {'>'} $2000</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              const defaulters = sortedStudents.filter(s => s.isDefaulter);
              setMessagingTargetIds(defaulters.map(s => s.id));
              setMessageForm({...messageForm, title: 'Urgent: Fee Payment Pending'});
              setGroupMessageModalVisible(true);
            }} 
            className="bg-red-600 px-6 py-3 rounded-2xl flex-row items-center shadow-lg shadow-red-500/30"
          >
            <Mail color="white" size={18} />
            <Text className="text-white font-bold ml-2">Message All Defaulters</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row flex-wrap gap-4 mb-8">
          {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((grade, i) => {
            const defaultRate = [15, 8, 22, 5, 12, 30][i];
            const color = defaultRate > 20 ? 'bg-red-600/40' : defaultRate > 10 ? 'bg-orange-600/40' : 'bg-green-600/40';
            return (
              <View key={grade} className={`w-32 h-32 ${color} rounded-3xl items-center justify-center border border-white/10`}>
                <Text className="text-white font-bold">{grade}</Text>
                <Text className="text-white/60 text-[10px] mt-1">{defaultRate}% Pending</Text>
              </View>
            );
          })}
        </View>

        <View className="space-y-3">
          {sortedStudents.filter(s => s.isDefaulter).map((s) => (
            <View key={s.id} className="flex-row items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center mr-4"><Text className="text-red-400 font-bold">{s.name[0]}</Text></View>
                <View>
                  <Text className="text-white font-bold">{s.name}</Text>
                  <Text className="text-red-400 text-xs">Due Amount: ${s.feeDue}</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setMessagingTargetIds([s.id]);
                  setMessageForm({...messageForm, title: 'Fee Due Reminder'});
                  setGroupMessageModalVisible(true);
                }}
                className="bg-white/5 p-3 rounded-xl border border-white/10"
              >
                <Mail color="#ef4444" size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderInventory = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <Text className="text-white text-2xl font-bold mb-8">Asset & Inventory Tracking</Text>
      <View className="space-y-4">
        {assets.map((asset: any) => (
          <View key={asset.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg">{asset.name}</Text>
              <Text className="text-slate-400">{asset.category} • Condition: {asset.condition}</Text>
              <Text className="text-slate-500 text-xs mt-1">Next Maint: {asset.nextMaintenance}</Text>
            </View>
            <TouchableOpacity className="bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/30">
              <Text className="text-blue-400 font-bold text-xs">Schedule Maintenance</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPayroll = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
      <Text className="text-white text-2xl font-bold mb-8">Monthly Payroll Approval</Text>
      <View className="space-y-4">
        {payroll.map((p: any) => (
          <View key={p.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg">{p.staffName}</Text>
              <Text className="text-slate-400">{p.month} • Amount: ${p.amount}</Text>
              <View className="bg-orange-500/20 px-3 py-1 rounded-full mt-2 w-32">
                <Text className="text-orange-400 text-[10px] font-bold text-center">{p.status}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => {
                approvePayroll(p.id);
                addLog({ actor: 'Admin', action: 'Payroll Authorized', details: `Salary for ${p.staffName} approved for ${p.month}`, severity: 'Info' as const });
                Alert.alert('Success', 'Payroll disbursement authorized.');
              }}
              className="bg-green-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Authorize Payment</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUsers = () => (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-white text-2xl font-bold">Registration Center</Text>
          <Text className="text-slate-400 mt-1">Manage school admissions and appointments</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => setAppointmentModalVisible(true)}
            className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center shadow-lg shadow-blue-900/50"
          >
            <UserPlus color="white" size={20} />
            <Text className="text-white font-bold ml-2">Appoint Faculty</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setAdmissionModalVisible(true)}
            className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center shadow-lg shadow-blue-900/50"
          >
            <Users color="white" size={20} />
            <Text className="text-white font-bold ml-2">New Admission</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="space-y-3">
        {users.slice(-5).reverse().map((u, i) => (
          <View key={i} className="flex-row items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${u.role === 'Staff' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                <Text className={`font-bold ${u.role === 'Staff' ? 'text-blue-400' : 'text-purple-400'}`}>{u.name[0]}</Text>
              </View>
              <View>
                <Text className="text-white font-bold">{u.name}</Text>
                <Text className="text-slate-400 text-xs">{u.role} • {u.email}</Text>
              </View>
            </View>
            <View className="bg-green-500/20 px-3 py-1 rounded-full">
              <Text className="text-green-400 text-[10px] font-bold">VERIFIED</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStaff = () => {
    const handleApproveAndReassign = (req: any) => {
      updateLeaveStatus(req.id, 'Approved');
      const staff = users.find(u => u.id === req.senderId);
      if (staff) handleMarkAbsent(staff);
    };

    return (
      <View>
        <View className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm mb-8">
          <Text className="text-white text-xl font-bold mb-6">Staff Leave Requests</Text>
          <View className="space-y-4">
            {leaveRequests.filter((r: any) => r.receiverRole === 'Admin' && r.status === 'Pending').map((req: any) => (
              <View key={req.id} className="flex-row justify-between items-center bg-white/5 p-6 rounded-2xl">
                <View>
                  <Text className="text-white font-bold">{req.senderName}</Text>
                  <Text className="text-slate-400 text-xs mt-1">Leave Date: {req.date}</Text>
                  <Text className="text-slate-300 mt-2 italic">"{req.reason}"</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => handleApproveAndReassign(req)} className="bg-blue-600 px-4 py-2 rounded-xl">
                    <Text className="text-white font-bold text-xs">Approve & Reassign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateLeaveStatus(req.id, 'Rejected')} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    <Text className="text-slate-300 font-bold text-xs">Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Staff Attendance & Substitution</Text>
            <View className="flex-row items-center bg-orange-500/10 px-4 py-2 rounded-xl">
              <AlertCircle color="#f59e0b" size={16} />
              <Text className="text-orange-400 ml-2 font-bold text-xs">{substitutions.length} Active Subs</Text>
            </View>
          </View>
          <View className="space-y-3">
            {users.filter(u => u.role === 'Staff').map((staff) => {
              const isSub = substitutions.some(s => s.staffId === staff.id);
              return (
                <View key={staff.id} className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                      <Text className="text-blue-400 font-bold">{staff.name[0]}</Text>
                    </View>
                    <View><Text className="text-white font-semibold">{staff.name}</Text></View>
                  </View>
                  <TouchableOpacity onPress={() => handleMarkAbsent(staff)} disabled={isSub} className={`${isSub ? 'bg-white/5' : 'bg-red-500/10'} px-6 py-2 rounded-xl`}>
                    <Text className={`${isSub ? 'text-slate-500' : 'text-red-400'} font-bold text-sm`}>{isSub ? 'Reassigned' : 'Mark Absent'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderStudentMaster = () => {
    const filtered = sortedStudents.filter((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery));
    return (
      <View className="space-y-6">
        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-row items-center">
          <Search color="#64748b" size={20} />
          <TextInput placeholder="Search students..." placeholderTextColor="#64748b" className="flex-1 ml-4 text-white" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
          <Text className="text-white text-xl font-bold mb-6">Student Master List</Text>
          <View className="space-y-3">
            {filtered.map((s: any) => (
              <View key={s.id} className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-purple-400 font-bold">{s.name[0]}</Text>
                  </View>
                  <View><Text className="text-white font-bold">{s.name}</Text></View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => { setSelectedUser(s); setDetailModalVisible(true); setIsEditing(false); }} className="bg-blue-600/20 p-2 rounded-lg"><Eye color="#60a5fa" size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setSelectedUser(s); setFormData({...s}); setIsEditing(true); setDetailModalVisible(true); }} className="bg-white/10 p-2 rounded-lg"><Edit color="#94a3b8" size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUser(s.id)} className="bg-red-500/10 p-2 rounded-lg"><Trash2 color="#ef4444" size={16} /></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderStaffMaster = () => {
    const filtered = users.filter((u: any) => u.role === 'Staff' && (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)));
    return (
      <View className="space-y-6">
        <View className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-row items-center">
          <Search color="#64748b" size={20} />
          <TextInput placeholder="Search staff..." placeholderTextColor="#64748b" className="flex-1 ml-4 text-white" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
          <Text className="text-white text-xl font-bold mb-6">Staff Master List</Text>
          <View className="space-y-3">
            {filtered.map((s: any) => (
              <View key={s.id} className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-400 font-bold">{s.name[0]}</Text>
                  </View>
                  <View><Text className="text-white font-bold">{s.name}</Text></View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => { setSelectedUser(s); setDetailModalVisible(true); setIsEditing(false); }} className="bg-blue-600/20 p-2 rounded-lg"><Eye color="#60a5fa" size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setSelectedUser(s); setFormData({...s, ...s.staffData}); setIsEditing(true); setDetailModalVisible(true); }} className="bg-white/10 p-2 rounded-lg"><Edit color="#94a3b8" size={16} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUser(s.id)} className="bg-red-500/10 p-2 rounded-lg"><Trash2 color="#ef4444" size={16} /></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderBusTracking = () => {
    const routes = [
      { id: '1', busNo: 'KA-01-2024', driver: 'Ramesh Kumar', phone: '+91 98765 43210', route: 'Electronic City - Silk Board', status: 'On Time', students: 45, currentStop: 'Silk Board' },
      { id: '2', busNo: 'KA-01-2025', driver: 'Suresh Singh', phone: '+91 98765 43211', route: 'Indiranagar - MG Road', status: 'Delayed', students: 38, currentStop: 'Domlur' },
      { id: '3', busNo: 'KA-01-2026', driver: 'Amit Patel', phone: '+91 98765 43212', route: 'Whitefield - Marathahalli', status: 'On Time', students: 50, currentStop: 'Marathahalli' }
    ];

    return (
      <View className="space-y-8">
        <View className="flex-row justify-between items-center bg-white/5 p-8 rounded-[40px] border border-white/10">
          <View>
            <Text className="text-white text-3xl font-bold">Fleet Management</Text>
            <Text className="text-slate-400 mt-1">Real-time GPS bus tracking & route monitoring</Text>
          </View>
          <View className="flex-row gap-4">
            <View className="bg-green-500/20 px-4 py-2 rounded-2xl flex-row items-center border border-green-500/30">
              <Activity color="#10b981" size={16} />
              <Text className="text-green-400 font-bold ml-2">8/10 BUSES ACTIVE</Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap -mx-3">
          {routes.map((bus) => (
            <View key={bus.id} className="w-full lg:w-1/2 px-3 mb-6">
              <View className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-blue-600/20 rounded-2xl items-center justify-center mr-4 border border-blue-500/20">
                      <MapPin color="#3b82f6" size={28} />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-xl">{bus.busNo}</Text>
                      <Text className="text-slate-400 text-xs mt-1">Route: {bus.route}</Text>
                    </View>
                  </View>
                  <View className={`px-4 py-2 rounded-xl ${bus.status === 'On Time' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    <Text className={`font-bold text-xs ${bus.status === 'On Time' ? 'text-green-400' : 'text-red-400'}`}>{bus.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 mb-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 text-sm">Current Stop</Text>
                    <Text className="text-white font-bold">{bus.currentStop}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 text-sm">Capacity</Text>
                    <Text className="text-blue-400 font-bold">{bus.students} / 50 Students</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-2"><Text className="text-white text-[10px] font-bold">{bus.driver[0]}</Text></View>
                    <View>
                      <Text className="text-white text-xs font-semibold">{bus.driver}</Text>
                      <Text className="text-slate-500 text-[10px]">{bus.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20">
                    <Text className="text-white font-bold text-xs">View on Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLogs = () => {
    return (
      <View className="bg-white/5 rounded-3xl p-8 border border-white/10">
        <Text className="text-white text-xl font-bold mb-6">Audit Logs</Text>
        <ScrollView className="max-h-[600px] space-y-3">
          {auditLogs.map((log) => (
            <View key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-white font-bold">{log.action}</Text>
                <Text className="text-slate-400 text-xs">{log.actor} • {new Date(log.timestamp).toLocaleTimeString()}</Text>
                <Text className="text-slate-500 text-xs mt-1">{log.details}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full h-6 ${log.severity === 'Critical' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                <Text className={`text-[10px] font-bold ${log.severity === 'Critical' ? 'text-red-400' : 'text-blue-400'}`}>{log.severity}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAnalytics = () => {
    const getChartData = () => {
      if (analyticsMetric === 'Attendance') {
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            { data: [92, 94, 88, 95, 91], color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, strokeWidth: 3 },
            { data: [85, 87, 82, 89, 86], color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, strokeWidth: 2 }
          ],
          legend: ["Section A", "Section B"]
        };
      } else if (analyticsMetric === 'Assignments') {
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            { data: [45, 52, 38, 65, 48], color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, strokeWidth: 3 },
            { data: [40, 48, 35, 60, 42], color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, strokeWidth: 2 }
          ],
          legend: ["Section A", "Section B"]
        };
      } else if (analyticsMetric === 'ExamComparison') {
        return {
          labels: ["Math", "Sci", "Eng", "Hist", "Soc"],
          datasets: [
            { data: [58, 62, 65, 60, 68], color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, strokeWidth: 1 }, // Previous Exam
            { data: [65, 70, 72, 68, 75], color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, strokeWidth: 2 }, // Last Exam
            { data: [78, 82, 85, 80, 88], color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, strokeWidth: 3 }  // Present Exam
          ],
          legend: ["Prev Exam", "Last Exam", "Present Exam"]
        };
      } else {
        return {
          labels: ["Math", "Sci", "Eng", "Hist", "Soc"],
          datasets: [
            { data: [78, 82, 75, 88, 80], color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, strokeWidth: 3 },
            { data: [72, 75, 70, 82, 78], color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, strokeWidth: 2 }
          ],
          legend: ["Section A", "Section B"]
        };
      }
    };

    return (
      <View className="space-y-8">
        <View className="bg-white/5 rounded-[40px] p-8 border border-white/10 shadow-sm">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-white text-3xl font-bold">Academic Intelligence</Text>
              <Text className="text-slate-400 mt-1">Real-time performance tracking</Text>
            </View>
            <TouchableOpacity onPress={() => setPerfSettingsModalVisible(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <ClipboardList color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-4 mb-8">
             {['Attendance', 'Assignments', 'Assessments', 'ExamComparison'].map((m: any) => (
                <TouchableOpacity key={m} onPress={() => setAnalyticsMetric(m)} className={`flex-1 p-4 rounded-2xl border ${analyticsMetric === m ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                  <Text className={`text-center font-bold text-[10px] uppercase ${analyticsMetric === m ? 'text-white' : 'text-slate-400'}`}>{m === 'ExamComparison' ? 'Exam Progress' : m}</Text>
                </TouchableOpacity>
              ))}
          </View>
          <View className="mb-8">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
              {GRADES.map((grade) => (
                <TouchableOpacity key={grade} onPress={() => setSelectedGrade(grade)} className={`px-8 py-4 rounded-2xl border ${selectedGrade === grade ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                  <Text className={`font-bold ${selectedGrade === grade ? 'text-white' : 'text-slate-400'}`}>{grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <ChartContainer title={`${analyticsMetric} Comparison`} subtitle={`Grade ${selectedGrade}`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
              <LineChart data={getChartData()} width={Math.max(screenWidth * 0.7, 600)} height={300} yAxisLabel="" yAxisSuffix={analyticsMetric === 'Assessments' ? "" : "%"} chartConfig={{...chartConfig, backgroundGradientFrom: '#0F172A', backgroundGradientTo: '#0F172A', decimalPlaces: 0 }} bezier style={{ marginVertical: 8, borderRadius: 24 }} />
            </ScrollView>
          </ChartContainer>
        </View>

        <View className="bg-white/5 rounded-[40px] p-8 border border-white/10">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-white text-2xl font-bold">Performance Segmentation</Text>
              <Text className="text-slate-400 mt-1">{filteredAnalyticsStudents.length} Students Selected</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => {
                  if (analyticsSortOrder === 'none') setAnalyticsSortOrder('high');
                  else if (analyticsSortOrder === 'high') setAnalyticsSortOrder('low');
                  else if (analyticsSortOrder === 'low') setAnalyticsSortOrder('improvement');
                  else setAnalyticsSortOrder('none');
                }} 
                className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex-row items-center gap-2"
              >
                <TrendingUp color={analyticsSortOrder !== 'none' ? '#3b82f6' : '#94a3b8'} size={20} />
                <Text className="text-white font-bold text-xs">
                  {analyticsSortOrder === 'none' ? 'Sort' : `Sorted: ${analyticsSortOrder}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setMessagingTargetIds(filteredAnalyticsStudents.map(s => s.id));
                  setMessageForm({...messageForm, title: 'Academic Progress Update'});
                  setGroupMessageModalVisible(true);
                }} 
                className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center shadow-lg shadow-blue-500/30"
              >
                <Mail color="white" size={18} />
                <Text className="text-white font-bold ml-2">Message Filtered</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row gap-4 mb-8">
            {[
              { label: 'High', color: 'text-green-400', bg: 'bg-green-500/10', desc: performanceSettings.high, key: 'high' },
              { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: performanceSettings.medium, key: 'medium' },
              { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/10', desc: performanceSettings.low, key: 'low' }
            ].map((seg) => (
              <TouchableOpacity 
                key={seg.label} 
                onPress={() => setSegmentFilter(seg.key as any === segmentFilter ? 'none' : seg.key as any)}
                className={`flex-1 ${seg.bg} p-6 rounded-3xl border ${segmentFilter === seg.key ? 'border-white/40' : 'border-white/5'}`}
              >
                <Text className={`${seg.color} font-bold text-lg`}>{seg.label}</Text>
                <Text className="text-slate-400 text-[10px] mt-2">{seg.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="space-y-3">
            {filteredAnalyticsStudents.map((s: any) => (
              <View key={s.id} className="flex-row items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-4"><Text className="text-white font-bold">{s.name[0]}</Text></View>
                  <View>
                    <Text className="text-white font-bold">{s.name}</Text>
                    <Text className="text-slate-500 text-[10px]">
                      {s.preLastExam}% → {s.lastExam}% → {s.presentExam}% ({s.overallTrend > 0 ? '+' : ''}{s.overallTrend}% Trend)
                    </Text>
                  </View>
                </View>
                <View className={`px-4 py-1 rounded-full ${s.segment === 'high' ? 'bg-green-500/20' : s.segment === 'low' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}><Text className={`text-[10px] font-bold ${s.segment === 'high' ? 'text-green-400' : s.segment === 'low' ? 'text-red-400' : 'text-blue-400'}`}>{s.segment.toUpperCase()}</Text></View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderSurveys = () => (
    <View className="space-y-8">
      <View className="flex-row justify-between items-center">
        <View><Text className="text-white text-3xl font-bold">Surveys</Text></View>
        <TouchableOpacity onPress={() => setSurveyModalVisible(true)} className="bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center"><Plus color="white" size={24} /><Text className="text-white font-bold ml-2">New Survey</Text></TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap -mx-3">
        {surveys.map((s) => (
          <View key={s.id} className="w-full lg:w-1/2 px-3 mb-6">
            <View className="bg-white/5 p-8 rounded-[32px] border border-white/10">
              <Text className="text-white font-bold text-xl mb-2">{s.title}</Text>
              <Text className="text-slate-400 text-xs mb-4">Target: {s.role}</Text>
              <View className="space-y-3">
                {s.options.map((opt, i) => {
                  const total = Object.values(s.results).reduce((a,b) => a+b, 0) || 1;
                  const pct = Math.round(((s.results[opt] || 0) / total) * 100);
                  return (
                    <View key={i} className="bg-white/5 rounded-2xl overflow-hidden h-12 justify-center px-4 relative">
                      <View className="absolute inset-0 bg-blue-600/10" style={{ width: `${pct}%` }} />
                      <View className="flex-row justify-between relative z-10"><Text className="text-white">{opt}</Text><Text className="text-blue-400 font-bold">{pct}%</Text></View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : { flex: 1 }) as any}>
      <LinearGradient colors={['#0F172A', '#1E293B']} className="absolute inset-0" />
      <View className="flex-1 flex-row">
        {/* Desktop Sidebar */}
        <View className="w-72 bg-[#0F172A]/80 border-r border-white/10 p-8 hidden lg:flex">
          <View className="flex-row items-center mb-10">
            <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center mr-3 shadow-lg shadow-blue-500/50">
              <ShieldCheck color="white" size={24} />
            </View>
            <Text className="text-2xl font-bold text-white tracking-tighter">AdminCenter</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-1">
              {[
                { id: 'Overview', icon: Activity, label: 'Overview' },
                { id: 'Analytics', icon: TrendingUp, label: 'Analytics' },
                { id: 'Surveys', icon: ClipboardList, label: 'Surveys' },
                { id: 'Calendar', icon: Calendar, label: 'Calendar' },
                { id: 'Users', icon: UserPlus, label: 'Registration' },
                { id: 'Finance', icon: Wallet, label: 'Financials' },
                { id: 'Inventory', icon: Database, label: 'Assets' },
                { id: 'Payroll', icon: Briefcase, label: 'Payroll' },
                { id: 'StaffMaster', icon: Users, label: 'Staff Master' },
                { id: 'StudentsMaster', icon: GraduationCap, label: 'Student Master' },
                { id: 'Timetable', icon: Calendar, label: 'Timetable' },
                { id: 'BusTracking', icon: MapPin, label: 'Bus Route' },
                { id: 'Logs', icon: ShieldCheck, label: 'Audit Logs' }
              ].map((tab) => (
                <TouchableOpacity 
                  key={tab.id} 
                  onPress={() => setActiveTab(tab.id as any)} 
                  className={`p-4 rounded-2xl flex-row items-center transition-all ${activeTab === tab.id ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'hover:bg-white/5'}`}
                >
                  <tab.icon color={activeTab === tab.id ? 'white' : '#64748b'} size={20} />
                  <Text className={`font-bold ml-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="flex-1" style={Platform.OS === 'web' ? { height: '100%', overflow: 'hidden' } : {}}>
          {/* Header */}
          <View className="bg-[#0F172A]/40 p-6 flex-row justify-between items-center border-b border-white/10 backdrop-blur-xl">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setMobileMenuVisible(true)} className="lg:hidden p-2 mr-4 bg-white/5 rounded-xl border border-white/10">
                <Layers color="white" size={24} />
              </TouchableOpacity>
              <View>
                <Text className="text-white text-3xl font-bold tracking-tight">{activeTab}</Text>
                <Text className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Management Console</Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-4">
              <View className="hidden md:flex flex-row items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/10 mr-4">
                <Activity color="#10b981" size={16} />
                <Text className="text-green-400 text-xs font-bold ml-2">SYSTEM LIVE</Text>
              </View>
              <TouchableOpacity onPress={() => setUser(null)} className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                <LogOut color="#ef4444" size={20} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 32, paddingBottom: 300 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Analytics' && renderAnalytics()}
            {activeTab === 'Surveys' && renderSurveys()}
            {activeTab === 'Calendar' && <CalendarModule />}
            {activeTab === 'Users' && renderUsers()}
            {activeTab === 'Finance' && renderFinance()}
            {activeTab === 'Inventory' && renderInventory()}
            {activeTab === 'Payroll' && renderPayroll()}
            {activeTab === 'StudentsMaster' && renderStudentMaster()}
            {activeTab === 'StaffMaster' && renderStaffMaster()}
            {activeTab === 'Logs' && renderLogs()}
            {activeTab === 'Timetable' && renderTimetable()}
            {activeTab === 'BusTracking' && renderBusTracking()}
            <View className="h-20" />
          </ScrollView>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={groupMessageModalVisible} onRequestClose={() => setGroupMessageModalVisible(false)}><View className="flex-1 justify-center items-center bg-black/60 p-4"><View className="bg-[#1E293B] w-full max-w-xl p-10 rounded-[40px] border border-white/10"><Text className="text-white text-3xl font-bold mb-8">Targeted Messaging</Text><View className="space-y-4"><View className="flex-row gap-4">{['high', 'medium', 'low'].map((seg) => (<TouchableOpacity key={seg} onPress={() => setMessageForm({...messageForm, targetGroup: seg})} className={`flex-1 p-4 rounded-2xl border ${messageForm.targetGroup === seg ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}><Text className={`text-center font-bold uppercase text-[10px] ${messageForm.targetGroup === seg ? 'text-white' : 'text-slate-400'}`}>{seg}</Text></TouchableOpacity>))}</View><TextInput placeholder="Subject" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={messageForm.title} onChangeText={(t) => setMessageForm({...messageForm, title: t})} /><TextInput placeholder="Content" multiline numberOfLines={4} placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white h-32" value={messageForm.body} onChangeText={(t) => setMessageForm({...messageForm, body: t})} /><TouchableOpacity onPress={handleGroupMessage} className="bg-blue-600 p-6 rounded-2xl items-center mt-6"><Text className="text-white font-bold">Send Private Broadcast</Text></TouchableOpacity><TouchableOpacity onPress={() => setGroupMessageModalVisible(false)} className="p-4 items-center"><Text className="text-slate-400">Cancel</Text></TouchableOpacity></View></View></View></Modal>
      <Modal animationType="slide" transparent={true} visible={surveyModalVisible} onRequestClose={() => setSurveyModalVisible(false)}><View className="flex-1 justify-center items-center bg-black/60 p-4"><View className="bg-[#1E293B] w-full max-w-xl p-10 rounded-[40px] border border-white/10"><Text className="text-white text-3xl font-bold mb-8">Create Survey</Text><View className="space-y-4"><TextInput placeholder="Title" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={surveyForm.title} onChangeText={(t) => setSurveyForm({...surveyForm, title: t})} /><TextInput placeholder="Description" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={surveyForm.description} onChangeText={(t) => setSurveyForm({...surveyForm, description: t})} /><TextInput placeholder="Options (comma separated)" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={surveyForm.options} onChangeText={(t) => setSurveyForm({...surveyForm, options: t})} /><TouchableOpacity onPress={handleCreateSurvey} className="bg-blue-600 p-6 rounded-2xl items-center mt-6"><Text className="text-white font-bold">Publish Survey</Text></TouchableOpacity><TouchableOpacity onPress={() => setSurveyModalVisible(false)} className="p-4 items-center"><Text className="text-slate-400">Cancel</Text></TouchableOpacity></View></View></View></Modal>
      <Modal animationType="fade" transparent={true} visible={perfSettingsModalVisible} onRequestClose={() => setPerfSettingsModalVisible(false)}><View className="flex-1 justify-center items-center bg-black/60 p-4"><View className="bg-[#1E293B] w-full max-w-lg p-10 rounded-[40px] border border-white/10"><Text className="text-white text-2xl font-bold mb-6">Performance Definitions</Text><View className="space-y-6"><View><Text className="text-green-400 font-bold mb-2">High</Text><TextInput multiline className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white h-20" value={performanceSettings.high} onChangeText={(t) => updatePerformanceSettings({...performanceSettings, high: t})} /></View><View><Text className="text-blue-400 font-bold mb-2">Medium</Text><TextInput multiline className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white h-20" value={performanceSettings.medium} onChangeText={(t) => updatePerformanceSettings({...performanceSettings, medium: t})} /></View><View><Text className="text-red-400 font-bold mb-2">Low</Text><TextInput multiline className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white h-20" value={performanceSettings.low} onChangeText={(t) => updatePerformanceSettings({...performanceSettings, low: t})} /></View><TouchableOpacity onPress={() => setPerfSettingsModalVisible(false)} className="bg-blue-600 p-5 rounded-2xl items-center"><Text className="text-white font-bold">Update</Text></TouchableOpacity></View></View></View></Modal>
      <Modal animationType="slide" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}><View className="flex-1 justify-center items-center bg-black/60 p-4"><View className="bg-[#1E293B] w-full max-w-2xl p-10 rounded-[40px] border border-white/10"><Text className="text-white text-2xl font-bold mb-8">{selectedUser?.name}</Text><ScrollView className="max-h-96 mb-8">{isEditing ? (<View className="space-y-4"><TextInput className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} /><TextInput className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} /></View>) : (<View><Text className="text-slate-400 leading-relaxed">{selectedUser?.role} record details.</Text></View>)}</ScrollView><View className="flex-row gap-4"><TouchableOpacity onPress={() => setDetailModalVisible(false)} className="flex-1 bg-blue-600 p-4 rounded-2xl items-center"><Text className="text-white font-bold">Close</Text></TouchableOpacity></View></View></View></Modal>
      <Modal animationType="slide" transparent={true} visible={appointmentModalVisible} onRequestClose={() => setAppointmentModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-[#1E293B] w-full max-w-xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
            <Text className="text-white text-3xl font-bold mb-8">Appoint Faculty</Text>
            <View className="space-y-4">
              <TextInput placeholder="Full Name" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
              <TextInput placeholder="Email" placeholderTextColor="#64748b" className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} />
              <TouchableOpacity onPress={() => handleFinalSubmit('Staff')} className="bg-blue-600 p-6 rounded-2xl items-center mt-6">
                <Text className="text-white font-bold">Confirm Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAppointmentModalVisible(false)} className="p-4 items-center">
                <Text className="text-slate-400">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comprehensive Admission Form Modal */}
      <Modal animationType="slide" transparent={true} visible={admissionModalVisible} onRequestClose={() => setAdmissionModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-[#1E293B] w-full max-w-4xl p-10 rounded-[40px] border border-white/10 shadow-2xl h-[90%]">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white text-3xl font-bold">Comprehensive Admission Form</Text>
              <TouchableOpacity onPress={() => setAdmissionModalVisible(false)} className="p-2">
                <CheckCircle color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} className="pr-4">
              <View className="space-y-8">
                {/* Section 1: Student Details */}
                <View>
                  <Text className="text-blue-400 font-bold mb-4 uppercase tracking-widest text-xs">1. Student Information</Text>
                  <View className="flex-row flex-wrap -mx-2">
                    <View className="w-full md:w-1/2 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Student's Full Name (Block Letters)</Text>
                      <TextInput placeholder="FULL NAME" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
                    </View>
                    <View className="w-full md:w-1/2 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Date of Birth</Text>
                      <TextInput placeholder="DD/MM/YYYY" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.dob} onChangeText={(t) => setFormData({...formData, dob: t})} />
                    </View>
                    <View className="w-full md:w-1/3 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Sex</Text>
                      <View className="flex-row gap-2">
                        {['Male', 'Female'].map(s => (
                          <TouchableOpacity key={s} onPress={() => setFormData({...formData, sex: s})} className={`flex-1 p-3 rounded-xl border ${formData.sex === s ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                            <Text className="text-white text-center text-xs font-bold">{s}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View className="w-full md:w-1/3 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Aadhar No.</Text>
                      <TextInput placeholder="12 Digit No." placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.aadhar} onChangeText={(t) => setFormData({...formData, aadhar: t})} />
                    </View>
                    <View className="w-full md:w-1/3 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Nationality</Text>
                      <TextInput placeholder="Nationality" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.nationality} onChangeText={(t) => setFormData({...formData, nationality: t})} />
                    </View>
                    <View className="w-full md:w-1/2 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Applying for Class</Text>
                      <TextInput placeholder="Standard" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.applyingClass} onChangeText={(t) => setFormData({...formData, applyingClass: t})} />
                    </View>
                    <View className="w-full md:w-1/2 px-2 mb-4">
                      <Text className="text-slate-400 text-xs mb-2">Previous School</Text>
                      <TextInput placeholder="School Name" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.previousSchool} onChangeText={(t) => setFormData({...formData, previousSchool: t})} />
                    </View>
                  </View>
                </View>

                {/* Section 2: Parent Details */}
                <View>
                  <Text className="text-purple-400 font-bold mb-4 uppercase tracking-widest text-xs">2. Parent / Guardian Details</Text>
                  <View className="flex-row -mx-4">
                    {/* Mother */}
                    <View className="flex-1 px-4 border-r border-white/5">
                      <Text className="text-white font-bold mb-4">Mother</Text>
                      <TextInput placeholder="Name" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.motherName} onChangeText={(t) => setFormData({...formData, motherName: t})} />
                      <TextInput placeholder="Qualification" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.motherQualification} onChangeText={(t) => setFormData({...formData, motherQualification: t})} />
                      <TextInput placeholder="Occupation" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.motherOccupation} onChangeText={(t) => setFormData({...formData, motherOccupation: t})} />
                      <TextInput placeholder="Contact No." placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.motherPhone} onChangeText={(t) => setFormData({...formData, motherPhone: t})} />
                      <TextInput placeholder="Aadhar No." placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.motherAadhar} onChangeText={(t) => setFormData({...formData, motherAadhar: t})} />
                    </View>
                    {/* Father */}
                    <View className="flex-1 px-4">
                      <Text className="text-white font-bold mb-4">Father</Text>
                      <TextInput placeholder="Name" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.fatherName} onChangeText={(t) => setFormData({...formData, fatherName: t})} />
                      <TextInput placeholder="Qualification" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.fatherQualification} onChangeText={(t) => setFormData({...formData, fatherQualification: t})} />
                      <TextInput placeholder="Occupation" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.fatherOccupation} onChangeText={(t) => setFormData({...formData, fatherOccupation: t})} />
                      <TextInput placeholder="Contact No." placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mb-3" value={formData.fatherPhone} onChangeText={(t) => setFormData({...formData, fatherPhone: t})} />
                      <TextInput placeholder="Aadhar No." placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.fatherAadhar} onChangeText={(t) => setFormData({...formData, fatherAadhar: t})} />
                    </View>
                  </View>
                  <TextInput placeholder="Parent E-Mail ID" placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white mt-4" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} />
                </View>

                {/* Section 3: Address & Logistics */}
                <View>
                  <Text className="text-green-400 font-bold mb-4 uppercase tracking-widest text-xs">3. Address & Logistics</Text>
                  <View className="space-y-4">
                    <TextInput placeholder="Correspondence Address" multiline numberOfLines={3} placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white h-24" value={formData.correspondenceAddress} onChangeText={(t) => setFormData({...formData, correspondenceAddress: t})} />
                    <TextInput placeholder="Permanent Address" multiline numberOfLines={3} placeholderTextColor="#64748b" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white h-24" value={formData.permanentAddress} onChangeText={(t) => setFormData({...formData, permanentAddress: t})} />
                    <View className="flex-row gap-4">
                      <TextInput placeholder="Religion" placeholderTextColor="#64748b" className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.religion} onChangeText={(t) => setFormData({...formData, religion: t})} />
                      <TextInput placeholder="Caste" placeholderTextColor="#64748b" className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.caste} onChangeText={(t) => setFormData({...formData, caste: t})} />
                      <TextInput placeholder="Category" placeholderTextColor="#64748b" className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.category} onChangeText={(t) => setFormData({...formData, category: t})} />
                    </View>
                    
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-slate-400 text-xs mb-2">School Transport?</Text>
                        <TouchableOpacity onPress={() => setFormData({...formData, transportRequired: !formData.transportRequired})} className={`p-3 rounded-xl border ${formData.transportRequired ? 'bg-green-600 border-green-500' : 'bg-white/5 border-white/10'}`}>
                          <Text className="text-white text-center font-bold">{formData.transportRequired ? 'YES' : 'NO'}</Text>
                        </TouchableOpacity>
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-400 text-xs mb-2">Hostel Required?</Text>
                        <TouchableOpacity onPress={() => setFormData({...formData, hostelRequired: !formData.hostelRequired})} className={`p-3 rounded-xl border ${formData.hostelRequired ? 'bg-green-600 border-green-500' : 'bg-white/5 border-white/10'}`}>
                          <Text className="text-white text-center font-bold">{formData.hostelRequired ? 'YES' : 'NO'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity onPress={() => handleFinalSubmit('StudentParent')} className="bg-blue-600 p-6 rounded-3xl items-center shadow-lg shadow-blue-500/30">
                  <Text className="text-white font-bold text-lg">Process Enrollment</Text>
                </TouchableOpacity>
                <View className="h-10" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reassign Modal */}
      <Modal animationType="fade" transparent={true} visible={reassignModalVisible} onRequestClose={() => setReassignModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-[#1E293B] w-full max-w-lg p-10 rounded-[40px] border border-white/10">
            <Text className="text-white text-2xl font-bold mb-8">Reassign</Text>
            <ScrollView className="max-h-80 mb-6">
              {users.filter(u => u.role === 'Staff' && u.id !== selectedAbsentStaff?.id).map((sub) => (
                <TouchableOpacity key={sub.id} onPress={() => confirmReassignment(sub)} className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-3 flex-row items-center justify-between">
                  <Text className="text-white font-bold">{sub.name}</Text>
                  <CheckCircle color="#34d399" size={20} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setReassignModalVisible(false)} className="bg-white/5 p-4 rounded-2xl items-center">
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mobile Menu Modal */}
      <Modal animationType="fade" transparent={true} visible={mobileMenuVisible} onRequestClose={() => setMobileMenuVisible(false)}>
        <View className="flex-1 bg-black/80 flex-row">
          <View className="w-72 bg-[#0F172A] p-8">
            <View className="flex-row justify-between items-center mb-10">
              <Text className="text-2xl font-bold text-white">Menu</Text>
              <TouchableOpacity onPress={() => setMobileMenuVisible(false)}>
                <CheckCircle color="white" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View className="space-y-2">
                {[
                  { id: 'Overview', icon: Activity, label: 'Overview' },
                  { id: 'Analytics', icon: TrendingUp, label: 'Analytics' },
                  { id: 'Surveys', icon: ClipboardList, label: 'Surveys' },
                  { id: 'Calendar', icon: Calendar, label: 'Calendar' },
                  { id: 'Users', icon: UserPlus, label: 'Registration' },
                  { id: 'Finance', icon: Wallet, label: 'Financials' },
                  { id: 'Inventory', icon: Database, label: 'Assets' },
                  { id: 'Payroll', icon: Briefcase, label: 'Payroll' },
                  { id: 'StaffMaster', icon: Users, label: 'Staff Master' },
                  { id: 'StudentsMaster', icon: GraduationCap, label: 'Student Master' },
                  { id: 'Timetable', icon: Calendar, label: 'Timetable' },
                  { id: 'BusTracking', icon: MapPin, label: 'Bus Route' },
                  { id: 'Logs', icon: ShieldCheck, label: 'Audit Logs' }
                ].map((tab) => (
                  <TouchableOpacity key={tab.id} onPress={() => { setActiveTab(tab.id as any); setMobileMenuVisible(false); }} className={`p-4 rounded-2xl flex-row items-center ${activeTab === tab.id ? 'bg-blue-600' : ''}`}>
                    <tab.icon color={activeTab === tab.id ? 'white' : '#64748b'} size={20} />
                    <Text className={`font-bold ml-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>{tab.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <TouchableOpacity className="flex-1" onPress={() => setMobileMenuVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};
