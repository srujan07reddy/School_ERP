import React from 'react';
import { View, Text, Dimensions } from 'react-native';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartContainer = ({ title, subtitle, children }: ChartContainerProps) => {
  return (
    <View className="bg-card p-6 rounded-3xl border border-primary-200 mt-6">
      <View className="mb-6">
        <Text className="text-text text-lg font-semibold">{title}</Text>
        {subtitle && <Text className="text-muted text-xs mt-1">{subtitle}</Text>}
      </View>
      <View className="items-center justify-center">
        {children}
      </View>
    </View>
  );
};

export const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#3b82f6"
  }
};
