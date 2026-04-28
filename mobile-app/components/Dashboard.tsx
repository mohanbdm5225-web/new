import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';
import { projects, tasks } from '../lib/mock-data';
import { Project, Task } from '../lib/types';

export const Dashboard: React.FC = () => {
  // Field team stats
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const myTasks = tasks.filter(t => t.assigneeId === 'u2').length; // Assuming current user is u2
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent').length;

  const myProjects = projects.filter(p => p.teamIds.includes('u2'));

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Field Dashboard</Text>
          <Text className="text-gray-600 mt-1">Welcome back, Arvind Kumar</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-4 mb-6">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={<MaterialIcons name="map" size={24} color="#3b82f6" />}
            className="w-1/2"
          />
          <StatCard
            title="My Tasks"
            value={myTasks}
            icon={<Feather name="clipboard" size={24} color="#10b981" />}
            className="w-1/2"
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<Ionicons name="checkmark-circle" size={24} color="#f59e0b" />}
            className="w-1/2"
          />
          <StatCard
            title="Urgent Tasks"
            value={urgentTasks}
            icon={<MaterialIcons name="priority-high" size={24} color="#ef4444" />}
            className="w-1/2"
          />
        </View>

        {/* My Projects */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">My Projects</Text>
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={16} color="#3b82f6" />
              <Text className="text-blue-600 ml-1">New</Text>
            </TouchableOpacity>
          </View>
          {myProjects.map((project) => (
            <TouchableOpacity key={project.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-medium text-gray-900 flex-1">{project.name}</Text>
                <StatusBadge status={project.status} />
              </View>
              <Text className="text-gray-600 text-sm mb-2">{project.client}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500">{project.location}</Text>
                <Text className="text-sm font-medium text-blue-600">{project.progress}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Tasks */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Recent Tasks</Text>
            <TouchableOpacity className="flex-row items-center">
              <Feather name="search" size={16} color="#3b82f6" />
              <Text className="text-blue-600 ml-1">View All</Text>
            </TouchableOpacity>
          </View>
          {tasks.slice(0, 5).map((task) => (
            <TouchableOpacity key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-base font-medium text-gray-900 flex-1">{task.title}</Text>
                <StatusBadge status={task.status} />
              </View>
              <Text className="text-gray-600 text-sm mb-2">{task.description}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500">Due: {task.dueDate}</Text>
                <Text className="text-sm font-medium text-orange-600">{task.priority}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between gap-4">
            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg items-center w-1/2">
              <Feather name="phone" size={24} color="white" />
              <Text className="text-white font-medium mt-2">Call Team</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-green-600 p-4 rounded-lg items-center w-1/2">
              <MaterialIcons name="group" size={24} color="white" />
              <Text className="text-white font-medium mt-2">Team Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};