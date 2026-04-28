import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useStore } from '../store/useStore';
import { ShieldCheck, Lock, Send, Clock, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const SafeChat = () => {
  const navigation = useNavigation();
  const user = useStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Principal', content: 'Academic reports are ready for review.', time: '10:00 AM', encrypted: true },
    { id: '2', sender: 'Me', content: 'Thank you, I will check them.', time: '10:05 AM', encrypted: true },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: Date.now().toString(), sender: 'Me', content: message, time: 'Now', encrypted: true }]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-primary-950"
    >
      <View className="p-6 bg-primary-900 border-b border-primary-800 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-bold text-lg">Safe-Chat</Text>
            <View className="flex-row items-center">
              <ShieldCheck color="#10b981" size={12} />
              <Text className="text-success text-[10px] ml-1">E2E Encrypted</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity className="p-2 bg-primary-800 rounded-xl">
          <Clock color="#f59e0b" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <View className="bg-primary-900/50 px-4 py-2 rounded-full border border-primary-800">
            <Text className="text-slate-500 text-[10px]">Today • Messages are time-gated</Text>
          </View>
        </View>

        {messages.map((msg) => (
          <View 
            key={msg.id} 
            className={`mb-4 max-w-[80%] ${msg.sender === 'Me' ? 'self-end' : 'self-start'}`}
          >
            <View 
              className={`p-4 rounded-3xl ${
                msg.sender === 'Me' 
                  ? 'bg-accent-600 rounded-tr-none' 
                  : 'bg-primary-900 border border-primary-800 rounded-tl-none'
              }`}
            >
              <Text className={`text-sm ${msg.sender === 'Me' ? 'text-white' : 'text-slate-200'}`}>
                {msg.content}
              </Text>
              <View className="flex-row items-center mt-2 justify-end">
                <Text className="text-[9px] text-white/50 mr-1">{msg.time}</Text>
                <Lock color={msg.sender === 'Me' ? 'rgba(255,255,255,0.5)' : '#64748b'} size={8} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="p-4 bg-primary-900 border-t border-primary-800">
        <View className="flex-row items-center bg-primary-950 rounded-2xl border border-primary-800 px-4 py-1">
          <TextInput
            placeholder="Type a secure message..."
            placeholderTextColor="#64748b"
            value={message}
            onChangeText={setMessage}
            className="flex-1 text-white py-3 h-12"
          />
          <TouchableOpacity onPress={handleSend} className="bg-accent-600 p-2 rounded-xl">
            <Send color="white" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
