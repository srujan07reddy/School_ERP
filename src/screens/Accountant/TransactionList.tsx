import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useStore } from '../../store/useStore';
import { MOCK_TRANSACTIONS } from '../../utils/mockData';
import { CreditCard, FileText, Filter, LogOut, Search, TrendingUp, DollarSign } from 'lucide-react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartContainer, chartConfig } from '../../components/Dashboard/ChartContainer';

const screenWidth = Dimensions.get("window").width - 80;

export const TransactionList = () => {
  const setUser = useStore((state) => state.setUser);

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 flex-row justify-between items-center shadow-sm">
      <View className="flex-row items-center">
        <View className={`p-2 rounded-xl mr-3 ${item.status === 'Paid' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <DollarSign color={item.status === 'Paid' ? '#10b981' : '#f59e0b'} size={18} />
        </View>
        <View>
          <Text className="text-slate-900 font-semibold">{item.description}</Text>
          <Text className="text-slate-400 text-xs mt-1">{item.date}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-slate-900 font-bold text-lg">${item.amount}</Text>
        <Text className={`text-[10px] font-bold ${item.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 flex-row">
      {/* Sidebar - Visible on Desktop/Web layout */}
      <View className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex">
        <Text className="text-xl font-bold text-slate-900 mb-8">Ledger Portal</Text>
        <View className="space-y-4">
          <View className="bg-blue-50 p-3 rounded-xl">
            <Text className="text-blue-600 font-semibold">Transactions</Text>
          </View>
          <Text className="text-slate-600 p-3">Fee Structures</Text>
          <Text className="text-slate-600 p-3">Payroll</Text>
          <Text className="text-slate-600 p-3">Discounts</Text>
          <Text className="text-slate-600 p-3">Audit Logs</Text>
        </View>
      </View>

      <View className="flex-1">
        {/* Header */}
        <View className="bg-white p-6 flex-row justify-between items-center border-b border-slate-100">
          <Text className="text-slate-900 text-3xl font-bold">Financial Ledger</Text>
          <TouchableOpacity onPress={() => setUser(null)} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <LogOut color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView className="p-8">
          <View className="flex-row flex-wrap -mx-4 mb-8">
            <View className="w-full lg:w-1/2 px-4">
              <ChartContainer title="Collection Overview" subtitle="Paid vs Pending targets">
                <PieChart
                  data={[
                    { name: 'Paid', population: 85, color: '#10b981', legendFontColor: '#64748b', legendFontSize: 12 },
                    { name: 'Pending', population: 15, color: '#f59e0b', legendFontColor: '#64748b', legendFontSize: 12 },
                  ]}
                  width={screenWidth / 2}
                  height={180}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute
                />
              </ChartContainer>
            </View>
            <View className="w-full lg:w-1/2 px-4">
              <View className="bg-blue-600 p-6 rounded-[32px] shadow-lg shadow-blue-200 h-full justify-between">
                <View>
                  <Text className="text-white/80 text-sm font-medium">Monthly Collection Target</Text>
                  <Text className="text-white text-4xl font-bold mt-1">$124,500</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">82% Achieved</Text>
                  </View>
                  <TrendingUp color="white" size={24} />
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-3xl border border-slate-100 p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 font-bold text-lg">Recent Transactions</Text>
              <TouchableOpacity onPress={() => alert('Exporting CSV...')} className="flex-row items-center bg-slate-50 px-4 py-2 rounded-xl">
                <FileText color="#3b82f6" size={16} />
                <Text className="text-blue-600 ml-2 text-sm font-semibold">Export CSV</Text>
              </TouchableOpacity>
            </View>

            {MOCK_TRANSACTIONS.map((item) => (
              <View key={item.id}>
                {renderItem({ item })}
              </View>
            ))}
          </View>

          <View className="h-20" />
        </ScrollView>
      </View>
    </View>
  );
};
