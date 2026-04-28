import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useStore } from '../../store/useStore';
import { CalendarEvent } from '../../types';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Tag } from 'lucide-react-native';

export const CalendarModule = () => {
  const { user, calendarEvents, addCalendarEvent } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Event' as 'Holiday' | 'Event' | 'Meeting',
    description: '',
    visibility: 'All' as 'All' | 'Staff' | 'Admins'
  });

  const isAdmin = user?.role === 'Admin';
  
  const filteredEvents = calendarEvents.filter((event: CalendarEvent) => {
    if (isAdmin) return true;
    if (user?.role === 'Staff') return event.visibility !== 'Admins';
    return event.visibility === 'All';
  });

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) return;
    const newEvent = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9)
    };
    addCalendarEvent(newEvent);
    setModalVisible(false);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], type: 'Event', description: '', visibility: 'All' });
    Alert.alert('Success', 'Calendar updated successfully.');
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Holiday': return 'bg-red-500/20 text-red-400';
      case 'Meeting': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <View className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm">
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center">
          <CalendarIcon color="#60a5fa" size={24} />
          <Text className="text-white text-2xl font-bold ml-3">Academic Calendar</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center"
          >
            <Plus color="white" size={20} />
            <Text className="text-white font-bold ml-2">Add Schedule</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="space-y-4 max-h-[600px]">
        {filteredEvents.sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event: CalendarEvent) => (
          <View key={event.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex-row items-start">
            <View className="bg-blue-600/10 p-4 rounded-2xl items-center justify-center mr-6 w-20">
              <Text className="text-blue-400 font-bold text-xl">{new Date(event.date).getDate()}</Text>
              <Text className="text-blue-300/60 text-[10px] font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-white font-bold text-lg mr-3">{event.title}</Text>
                <View className={`px-3 py-1 rounded-full ${getBadgeColor(event.type)}`}>
                  <Text className="text-[10px] font-bold">{event.type.toUpperCase()}</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-sm mb-3">{event.description}</Text>
              <View className="flex-row gap-4">
                <View className="flex-row items-center">
                  <Clock color="#64748b" size={12} />
                  <Text className="text-slate-500 text-xs ml-1">Full Day</Text>
                </View>
                <View className="flex-row items-center">
                  <Tag color="#64748b" size={12} />
                  <Text className="text-slate-500 text-xs ml-1">Visible to: {event.visibility}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/60 backdrop-blur-sm p-4">
          <View className="bg-[#1E293B] w-full max-w-lg p-10 rounded-[40px] border border-white/10 shadow-2xl">
            <Text className="text-white text-3xl font-bold mb-6">Schedule New Item</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-slate-400 text-xs font-bold mb-2 uppercase">Event Title</Text>
                <TextInput 
                  placeholder="e.g. Annual Sports Day" 
                  placeholderTextColor="#64748b" 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white" 
                  value={formData.title} 
                  onChangeText={(t) => setFormData({...formData, title: t})} 
                />
              </View>

              <View>
                <Text className="text-slate-400 text-xs font-bold mb-2 uppercase">Date (YYYY-MM-DD)</Text>
                <TextInput 
                  placeholder="2024-05-20" 
                  placeholderTextColor="#64748b" 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white" 
                  value={formData.date} 
                  onChangeText={(t) => setFormData({...formData, date: t})} 
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs font-bold mb-2 uppercase">Type</Text>
                  <View className="flex-row gap-2">
                    {['Holiday', 'Event', 'Meeting'].map((type) => (
                      <TouchableOpacity 
                        key={type} 
                        onPress={() => setFormData({...formData, type: type as any})}
                        className={`px-3 py-2 rounded-xl border ${formData.type === type ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
                      >
                        <Text className={`text-[10px] font-bold ${formData.type === type ? 'text-white' : 'text-slate-400'}`}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-slate-400 text-xs font-bold mb-2 uppercase">Description</Text>
                <TextInput 
                  placeholder="Brief details..." 
                  placeholderTextColor="#64748b" 
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 text-white h-24" 
                  multiline 
                  value={formData.description} 
                  onChangeText={(t) => setFormData({...formData, description: t})} 
                />
              </View>

              <View>
                <Text className="text-slate-400 text-xs font-bold mb-2 uppercase">Visibility</Text>
                <View className="flex-row gap-2">
                  {['All', 'Staff', 'Admins'].map((v) => (
                    <TouchableOpacity 
                      key={v} 
                      onPress={() => setFormData({...formData, visibility: v as any})}
                      className={`px-4 py-2 rounded-xl border ${formData.visibility === v ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
                    >
                      <Text className={`text-[10px] font-bold ${formData.visibility === v ? 'text-white' : 'text-slate-400'}`}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity onPress={handleAddEvent} className="bg-blue-600 p-5 rounded-2xl items-center mt-6">
                <Text className="text-white font-bold text-lg">Save to Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-4 items-center">
                <Text className="text-slate-400 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
