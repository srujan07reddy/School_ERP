import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { MOCK_USERS } from '../utils/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, ShieldCheck, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const LoginScreen = () => {
  const setUser = useStore((state) => state.setUser);
  const [role, setRole] = useState<'Admin' | 'Staff' | 'StudentParent' | 'Accountant'>('Admin');
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let user;
    if (role === 'Admin') {
      user = MOCK_USERS.find(u => u.email === email && u.role === 'Admin');
    } else {
      // For demo, any phone number works if we find a user with that role
      user = MOCK_USERS.find(u => u.role === role);
    }

    if (user) {
      setUser(user, 'mock-jwt-token');
    } else {
      alert('Invalid credentials for this role');
    }
    setLoading(false);
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    setShowOtp(true);
    alert('OTP sent to ' + phone);
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient colors={['#3b82f6', '#1e40af']} className="absolute inset-0" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
        <View className="bg-white rounded-[40px] p-8 shadow-2xl">
          <View className="items-center mb-8">
            <View className="bg-blue-50 p-4 rounded-3xl mb-4">
              <ShieldCheck color="#3b82f6" size={40} />
            </View>
            <Text className="text-slate-900 text-3xl font-bold">School ERP</Text>
            <Text className="text-slate-400 mt-2 font-medium">Modern Campus Management</Text>
          </View>

          <View className="flex-row bg-slate-50 p-2 rounded-2xl mb-8">
            {(['Admin', 'Staff', 'Accountant', 'StudentParent'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => { setRole(r); setShowOtp(false); }}
                className={`flex-1 py-3 rounded-xl items-center ${role === r ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-bold ${role === r ? 'text-blue-600' : 'text-slate-400'}`}>
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="space-y-4">
            {role === 'Admin' ? (
              <>
                <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                  <Mail color="#64748b" size={20} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-3 text-slate-900 font-medium"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                  <Lock color="#64748b" size={20} />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    className="flex-1 ml-3 text-slate-900 font-medium"
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </>
            ) : (
              <>
                <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                  <Phone color="#64748b" size={20} />
                  <TextInput
                    placeholder="Phone Number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="flex-1 ml-3 text-slate-900 font-medium"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                {showOtp && (
                  <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center border border-slate-100">
                    <Lock color="#64748b" size={20} />
                    <TextInput
                      placeholder="Enter 4-digit OTP"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      maxLength={4}
                      className="flex-1 ml-3 text-slate-900 font-medium"
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              onPress={role === 'Admin' || showOtp ? handleLogin : handleSendOtp}
              disabled={loading}
              className="bg-blue-600 p-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-200 mt-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    {role === 'Admin' ? 'Login' : (showOtp ? 'Verify & Login' : 'Send OTP')}
                  </Text>
                  <ChevronRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

        </View>

        <Text className="text-slate-400 text-center mt-10 text-xs">
          System Version 4.0.0-beta • Enterprise Multi-tenant
        </Text>
      </ScrollView>
    </View>
  );
};
