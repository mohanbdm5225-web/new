import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planning':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'on hold':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className={`px-2 py-1 rounded-full ${getStatusColor(status)} ${className}`}>
      <Text className="text-xs font-medium">{status}</Text>
    </View>
  );
};