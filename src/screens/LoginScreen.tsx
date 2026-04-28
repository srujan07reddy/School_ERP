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
    <View className="flex-1">
      <LinearGradient 
        colors={['#0F172A', '#1E293B']} 
        className="absolute inset-0"
      />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} 
        className="px-6"
      >
        <View 
          style={{ 
            maxWidth: 450, 
            width: '100%', 
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 20 }, 
            shadowOpacity: 0.4, 
            shadowRadius: 40, 
            elevation: 25 
          }}
          className="rounded-[40px] p-10 overflow-hidden"
        >
          <View className="items-center mb-8">
            <View className="bg-blue-600/10 p-5 rounded-[24px] mb-4 border border-blue-500/20">
              <ShieldCheck color="#2563eb" size={44} />
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight">School ERP</Text>
            <Text className="text-slate-400 mt-2 font-medium">Modern Campus Management</Text>
          </View>

          <View className="bg-white/5 p-1.5 rounded-2xl mb-10 flex-row border border-white/5">
            {(['Admin', 'Staff', 'Accountant', 'StudentParent'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => { setRole(r); setShowOtp(false); }}
                className={`flex-1 py-3.5 rounded-xl items-center ${role === r ? 'bg-blue-600 shadow-lg' : ''}`}
              >
                <Text className={`text-[11px] font-bold tracking-tight ${role === r ? 'text-white' : 'text-slate-400'}`}>
                  {r === 'StudentParent' ? 'STUDENT' : r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="space-y-6">
            {role === 'Admin' ? (
              <>
                <View>
                  <Text className="text-slate-300 font-bold text-[10px] mb-2 ml-1 tracking-wider uppercase">Email Address</Text>
                  <View className="bg-white/5 p-4 rounded-2xl flex-row items-center border border-white/10">
                    <Mail color="#64748b" size={20} />
                    <TextInput
                      placeholder="e.g. admin@school.com"
                      placeholderTextColor="#475569"
                      className="flex-1 ml-3 text-white font-medium"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between items-center mb-2 px-1">
                    <Text className="text-slate-300 font-bold text-[10px] tracking-wider uppercase">Password</Text>
                    <TouchableOpacity>
                      <Text className="text-blue-500 text-[11px] font-bold">Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="bg-white/5 p-4 rounded-2xl flex-row items-center border border-white/10">
                    <Lock color="#64748b" size={20} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      className="flex-1 ml-3 text-white font-medium"
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text className="text-slate-300 font-bold text-[10px] mb-2 ml-1 tracking-wider uppercase">Phone Number</Text>
                  <View className="bg-white/5 p-4 rounded-2xl flex-row items-center border border-white/10">
                    <Phone color="#64748b" size={20} />
                    <TextInput
                      placeholder="Enter mobile number"
                      placeholderTextColor="#475569"
                      keyboardType="phone-pad"
                      className="flex-1 ml-3 text-white font-medium"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>
                {showOtp && (
                  <View>
                    <Text className="text-slate-300 font-bold text-[10px] mb-2 ml-1 tracking-wider uppercase">OTP Verification</Text>
                    <View className="bg-white/5 p-4 rounded-2xl flex-row items-center border border-white/10">
                      <Lock color="#64748b" size={20} />
                      <TextInput
                        placeholder="4-digit code"
                        placeholderTextColor="#475569"
                        keyboardType="number-pad"
                        maxLength={4}
                        className="flex-1 ml-3 text-white font-medium"
                        value={otp}
                        onChangeText={setOtp}
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            <View className="items-center">
              <TouchableOpacity
                onPress={role === 'Admin' || showOtp ? handleLogin : handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
                style={{ width: 320 }}
                className="bg-blue-600 p-5 rounded-2xl flex-row items-center justify-center shadow-xl shadow-blue-900/40 mt-6"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">
                      {role === 'Admin' ? 'Sign In' : (showOtp ? 'Verify & Continue' : 'Send OTP')}
                    </Text>
                    <ChevronRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity className="mt-6">
                <Text className="text-slate-500 text-xs font-medium">Terms of Service & Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-white/40 text-sm font-medium">
            System Version 4.2.0-stable
          </Text>
          <Text className="text-white/40 text-[10px] mt-1 tracking-widest">
            ENTERPRISE INFRASTRUCTURE • SECURE NODE
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
