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
    <View className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 mx-2 relative overflow-hidden">
      {/* Decorative shape from screenshot */}
      <View 
        style={{ backgroundColor: `${color}15` }} 
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full" 
      />
      
      <View className="relative z-10">
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-slate-500 text-sm font-medium">{title}</Text>
          {trend && (
            <View className={`px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-slate-900 text-3xl font-bold">{value}</Text>
      </View>
    </View>
  );
};
