import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { projects, tasks } from '../lib/mock-data';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export const SurveyFieldView: React.FC = () => {
  // Survey team tasks (field operations)
  const fieldTasks = tasks.filter(t => 
    t.tags?.includes('field') || 
    t.description?.toLowerCase().includes('survey') ||
    t.description?.toLowerCase().includes('site')
  );
  
  const activeSurveys = projects.filter(p => 
    p.status === 'Active' && 
    (p.type === 'DGPS Survey' || p.type === 'Drone Survey' || p.type === 'LiDAR')
  );

  const urgentField = fieldTasks.filter(t => t.priority === 'Urgent').length;
  const inProgressField = fieldTasks.filter(t => t.status === 'In Progress').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Survey Field Operations</Text>
          <Text style={styles.subtitle}>Mobile field team dashboard</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Surveys</Text>
            <Text style={styles.statValue}>{activeSurveys.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Field Tasks</Text>
            <Text style={styles.statValue}>{fieldTasks.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>{inProgressField}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Urgent</Text>
            <Text style={styles.statValue}>{urgentField}</Text>
          </View>
        </View>

        {/* Active Survey Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Surveys</Text>
          </View>
          {activeSurveys.map(project => (
            <View key={project.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{project.name}</Text>
                  <Text style={styles.cardText}>{project.client}</Text>
                  <Text style={[styles.cardText, { marginTop: 8 }]}>
                    📍 {project.location}
                  </Text>
                  <Text style={[styles.cardText, { marginTop: 4 }]}>
                    Progress: {project.progress}%
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{project.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Field Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Field Tasks</Text>
          </View>
          {fieldTasks.slice(0, 6).map(task => (
            <View key={task.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardText}>{task.description}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                    <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                      <Text style={styles.badgeText}>{task.status}</Text>
                    </View>
                    <View style={[styles.badge, { 
                      backgroundColor: task.priority === 'Urgent' ? '#fee2e2' : '#e0e7ff'
                    }]}>
                      <Text style={[styles.badgeText, { 
                        color: task.priority === 'Urgent' ? '#dc2626' : '#4f46e5'
                      }]}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardText, { marginTop: 8 }]}>
                    Due: {task.dueDate}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialIcons name="gps-fixed" size={16} color="#fff" />
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>GPS Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="camera" size={16} color="#fff" />
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>Capture Photo</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#10b981' }]}>
              <Feather name="upload" size={16} color="#fff" />
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>Upload Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f59e0b' }]}>
              <Feather name="phone" size={16} color="#fff" />
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>Call Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
};