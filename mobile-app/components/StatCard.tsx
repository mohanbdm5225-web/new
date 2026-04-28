import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className = '' }) => {
  return (
    <View className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-600 text-sm font-medium">{title}</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-1">{value}</Text>
        </View>
        {icon && <View className="ml-2">{icon}</View>}
      </View>
    </View>
  );
};