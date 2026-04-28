import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useStore } from '../../store/useStore';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';
import { LineChart } from 'react-native-chart-kit';
import { MapPin, Bus, Clock, LogOut, ChevronRight, GraduationCap, Award, Book, Map } from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width - 80;

export const StudentDashboard = () => {
  const setUser = useStore((state) => state.setUser);
  const busRoute = useStore((state) => state.busRoute);

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Reports' | 'Library' | 'Bus'>('Dashboard');

  const renderReports = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100">
      <Text className="text-slate-900 text-xl font-bold mb-6">Academic Report Cards</Text>
      {[
        { term: 'Term 1 Final', grade: 'A+', average: '92%', status: 'Released' },
        { term: 'Midterm 1', grade: 'A', average: '88%', status: 'Released' },
      ].map((report, i) => (
        <View key={i} className="flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4">
          <View>
            <Text className="text-slate-900 font-semibold">{report.term}</Text>
            <Text className="text-slate-400 text-xs">Average: {report.average}</Text>
          </View>
          <View className="items-end">
            <Text className="text-blue-600 font-bold text-lg">{report.grade}</Text>
            <Text className="text-[10px] text-green-600 font-bold uppercase">{report.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLibrary = () => (
    <View className="bg-white rounded-3xl p-8 border border-slate-100">
      <Text className="text-slate-900 text-xl font-bold mb-6">Library Books (Issued)</Text>
      {[
        { title: 'The Great Gatsby', due: 'In 2 days', status: 'Near Due' },
        { title: 'Advanced Physics Vol 1', due: 'In 14 days', status: 'Borrowed' },
      ].map((book, i) => (
        <View key={i} className="flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4">
          <View>
            <Text className="text-slate-900 font-semibold">{book.title}</Text>
            <Text className="text-slate-400 text-xs">Due: {book.due}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${book.status === 'Near Due' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Text className={`text-[10px] font-bold ${book.status === 'Near Due' ? 'text-red-600' : 'text-blue-600'}`}>
              {book.status.toUpperCase()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMainDashboard = () => (
    <View>
      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <View className="bg-blue-600 p-6 rounded-[32px] shadow-lg shadow-blue-200 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-4 rounded-2xl mr-4">
                <Award color="white" size={32} />
              </View>
              <View>
                <Text className="text-white/80 text-xs font-bold uppercase tracking-wider">School Credits</Text>
                <Text className="text-white text-4xl font-bold">1,250</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-white font-bold">Rank: Gold</Text>
              <View className="w-24 h-1 bg-white/20 rounded-full mt-2">
                <View className="w-3/4 h-full bg-white rounded-full" />
              </View>
            </View>
          </View>
        </View>
        <View className="w-full lg:w-1/2 px-4 mb-4">
          <View className="bg-white border border-slate-100 p-6 rounded-3xl flex-row items-center shadow-sm h-full">
            <View className="bg-green-50 p-4 rounded-2xl mr-4">
              <Book color="#10b981" size={32} />
            </View>
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Upcoming Exam</Text>
              <Text className="text-slate-900 text-xl font-bold">Math Finals (Term 2)</Text>
              <Text className="text-slate-400 text-xs mt-1">Scheduled for May 15, 2024</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap -mx-4 mb-8">
        <View className="w-full lg:w-2/3 px-4">
          <ChartContainer title="Academic Progress" subtitle="GPA Trends over semesters">
            <LineChart
              data={{
                labels: ["S1", "S2", "S3", "S4", "S5", "S6"],
                datasets: [{ data: [3.2, 3.5, 3.4, 3.8, 3.7, 3.9] }]
              }}
              width={screenWidth * 0.6}
              height={220}
              chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})` }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </ChartContainer>
        </View>
        <View className="w-full lg:w-1/3 px-4">
          {renderBusRouteView()}
        </View>
      </View>
    </View>
  );

  const renderBusRouteView = () => (
    <View className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-900 font-bold text-lg">Live Bus Tracker</Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-600 text-[10px] font-bold">ACTIVE</Text>
        </View>
      </View>
      
      <View className="bg-slate-50 p-6 rounded-2xl mb-6 items-center">
        <Bus color="#3b82f6" size={48} className="opacity-20 mb-4" />
        <Text className="text-slate-900 font-bold text-xl">{busRoute.busNumber}</Text>
        <Text className="text-slate-400 text-xs">{busRoute.driverName}</Text>
      </View>

      <View className="space-y-4">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-blue-600 mr-3" />
          <View>
            <Text className="text-slate-400 text-[10px] uppercase">Current Stop</Text>
            <Text className="text-slate-900 font-semibold">{busRoute.stops[1].name}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
          <View>
            <Text className="text-slate-400 text-[10px] uppercase">ETA Home</Text>
            <Text className="text-slate-900 font-semibold">12 minutes</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="mt-6 bg-slate-900 p-4 rounded-xl items-center flex-row justify-center">
        <MapIcon color="white" size={18} />
        <Text className="text-white font-bold ml-2">Open Live Map</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 flex-row">
      <View className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex">
        <Text className="text-xl font-bold text-slate-900 mb-8">Student Hub</Text>
        <View className="space-y-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('Dashboard')}
            className={`p-3 rounded-xl ${activeTab === 'Dashboard' ? 'bg-blue-50' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === 'Dashboard' ? 'text-blue-600' : 'text-slate-600'}`}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Reports')} className={`p-3 rounded-xl ${activeTab === 'Reports' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Reports' ? 'text-blue-600' : 'text-slate-600'}`}>Report Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Library')} className={`p-3 rounded-xl ${activeTab === 'Library' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Library' ? 'text-blue-600' : 'text-slate-600'}`}>Library</Text>
          </TouchableOpacity>
          <Text className="text-slate-600 p-3">Leave App</Text>
          <TouchableOpacity onPress={() => setActiveTab('Bus')} className={`p-3 rounded-xl ${activeTab === 'Bus' ? 'bg-blue-50' : ''}`}>
            <Text className={`font-semibold ${activeTab === 'Bus' ? 'text-blue-600' : 'text-slate-600'}`}>Bus Route</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="bg-white p-6 flex-row justify-between items-center border-b border-slate-100">
          <View>
            <Text className="text-slate-900 text-3xl font-bold">Welcome, Alex!</Text>
            <Text className="text-slate-400">Class 10-A • Student ID: #5521</Text>
          </View>
          <TouchableOpacity onPress={() => setUser(null)} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <LogOut color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView className="p-8">
          {activeTab === 'Dashboard' && renderMainDashboard()}
          {activeTab === 'Reports' && renderReports()}
          {activeTab === 'Library' && renderLibrary()}
          {activeTab === 'Bus' && (
            <View className="max-w-md">
              {renderBusRouteView()}
            </View>
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
};
