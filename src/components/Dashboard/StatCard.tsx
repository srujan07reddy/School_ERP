import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, color = '#3b82f6' }: StatCardProps) => {
  return (
    <View className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-sm flex-1 mx-2 relative overflow-hidden">
      {/* Decorative shape from screenshot */}
      <View 
        style={{ backgroundColor: `${color}20` }} 
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-xl" 
      />
      
      <View className="relative z-10">
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-slate-400 text-sm font-medium tracking-tight">{title}</Text>
          {trend && (
            <View className={`px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Text className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {trend}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-white text-3xl font-bold">{value}</Text>
      </View>
    </View>
  );
};
