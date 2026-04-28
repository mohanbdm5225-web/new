import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { projects as defaultProjects, tasks as defaultTasks, team } from '../lib/mock-data';
import { Project, Task, TaskStatus } from '../lib/types';

type FieldStatus =
  | 'Not Started'
  | 'Travelling'
  | 'On Site'
  | 'Survey Done'
  | 'Data Uploaded'
  | 'Issue Found';

type FieldUpdate = {
  taskId: string;
  projectId: string;
  status: FieldStatus;
  chainageCovered: string;
  workDone: string;
  droneCompleted?: boolean;
  gcpCompleted?: boolean;
  issue: string;
  nextAction: string;
  attachmentName?: string;
  updatedAt: string;
  savedOffline?: boolean;
  syncState: 'Queued' | 'Synced';
};

type NhaiWorkspace = {
  projects?: Project[];
  tasks?: Task[];
  updates?: Partial<FieldUpdate>[];
};

const fieldStatuses: FieldStatus[] = [
  'Not Started',
  'Travelling',
  'On Site',
  'Survey Done',
  'Data Uploaded',
  'Issue Found',
];

const statusColors: Record<FieldStatus, { bg: string; text: string }> = {
  'Not Started': { bg: '#f1f5f9', text: '#475569' },
  Travelling: { bg: '#dbeafe', text: '#1d4ed8' },
  'On Site': { bg: '#dcfce7', text: '#15803d' },
  'Survey Done': { bg: '#e0e7ff', text: '#4338ca' },
  'Data Uploaded': { bg: '#ccfbf1', text: '#0f766e' },
  'Issue Found': { bg: '#fee2e2', text: '#b91c1c' },
};

function isNhaiProject(project: Project) {
  return project.client.toLowerCase() === 'nhai';
}

function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

function taskStatusFromFieldStatus(status: FieldStatus): TaskStatus {
  if (status === 'Data Uploaded') return 'Done';
  if (status === 'Survey Done') return 'Review';
  if (status === 'Travelling' || status === 'On Site' || status === 'Issue Found') {
    return 'In Progress';
  }

  return 'To Do';
}

function fieldStatusFromTask(task: Task, update?: FieldUpdate): FieldStatus {
  if (update) return update.status;
  if (task.status === 'Done') return 'Data Uploaded';
  if (task.status === 'Review') return 'Survey Done';
  if (task.status === 'In Progress') return 'On Site';
  return 'Not Started';
}

function taskType(task: Task) {
  const text = `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase();

  if (text.includes('drone') || text.includes('flight') || text.includes('lidar')) return 'Drone';
  if (text.includes('gcp') || text.includes('control') || text.includes('base')) return 'GCP';
  if (text.includes('dgps') || text.includes('topo') || text.includes('survey')) return 'DGPS';
  if (text.includes('upload') || text.includes('processing') || text.includes('qc')) return 'Processing';

  return 'Inspection';
}

function phoneNumber(value: string) {
  return value.replace(/[^\d+]/g, '');
}

function mapsUrl(project: Project) {
  if (typeof project.latitude === 'number' && typeof project.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location || project.name)}`;
}

const coordinatorApiUrl = process.env.EXPO_PUBLIC_COORDINATOR_API_URL ?? 'http://localhost:4001';

function normalizeUpdates(updates?: Partial<FieldUpdate>[]) {
  return (updates ?? [])
    .filter((update): update is Partial<FieldUpdate> & Pick<FieldUpdate, 'taskId' | 'projectId' | 'status'> =>
      Boolean(update.taskId && update.projectId && update.status)
    )
    .map(update => ({
      taskId: update.taskId,
      projectId: update.projectId,
      status: update.status,
      chainageCovered: update.chainageCovered ?? '',
      workDone: update.workDone ?? '',
      droneCompleted: update.droneCompleted ?? false,
      gcpCompleted: update.gcpCompleted ?? false,
      issue: update.issue ?? '',
      nextAction: update.nextAction ?? '',
      attachmentName: update.attachmentName ?? '',
      updatedAt: update.updatedAt ?? new Date().toISOString(),
      savedOffline: update.savedOffline ?? false,
      syncState: update.syncState ?? 'Synced',
    }));
}

export const FieldTeamView: React.FC = () => {
  const defaultNhaiProjects = useMemo(() => defaultProjects.filter(isNhaiProject), []);
  const [nhaiProjects, setNhaiProjects] = useState(defaultNhaiProjects);
  const nhaiProjectIds = useMemo(() => new Set(nhaiProjects.map(project => project.id)), [nhaiProjects]);
  const [mobileTasks, setMobileTasks] = useState(() =>
    defaultTasks.filter(task => defaultNhaiProjects.some(project => project.id === task.projectId))
  );
  const [fieldUpdates, setFieldUpdates] = useState<FieldUpdate[]>([]);
  const [connectionState, setConnectionState] = useState<'Live' | 'Queued'>('Queued');

  const fieldMembers = useMemo(() => {
    const assignedIds = new Set(mobileTasks.map(task => task.assigneeId));

    return team.filter(member =>
      assignedIds.has(member.id) ||
      member.department === 'Field Operations' ||
      member.role.toLowerCase().includes('surveyor') ||
      member.role.toLowerCase().includes('pilot')
    );
  }, [mobileTasks]);

  const defaultFieldMemberId = useMemo(
    () =>
      fieldMembers.find(member => mobileTasks.some(task => task.assigneeId === member.id))?.id ??
      fieldMembers[0]?.id ??
      team[0]?.id,
    [fieldMembers, mobileTasks]
  );
  const [selectedMemberId, setSelectedMemberId] = useState(defaultFieldMemberId);
  const selectedMember = team.find(member => member.id === selectedMemberId) ?? team[0];

  const assignedTasks = useMemo(
    () =>
      mobileTasks
        .filter(task => task.assigneeId === selectedMemberId)
        .sort((left, right) => daysUntil(left.dueDate) - daysUntil(right.dueDate)),
    [mobileTasks, selectedMemberId]
  );

  const openTasks = mobileTasks.filter(task => task.status !== 'Done').length;
  const issueCount = fieldUpdates.filter(update => update.status === 'Issue Found').length;
  const syncedCount = fieldUpdates.filter(update => update.syncState === 'Synced').length;
  const latestUpdates = fieldUpdates.slice(0, 4);

  useEffect(() => {
    let active = true;

    async function loadWorkspace() {
      try {
        const response = await fetch(`${coordinatorApiUrl.replace(/\/$/, '')}/api/nhai/workspace`);

        if (!response.ok) throw new Error('Workspace API unavailable');

        const workspace = (await response.json()) as NhaiWorkspace;

        if (!active) return;

        const projects = (workspace.projects ?? []).filter(isNhaiProject);
        const projectIds = new Set(projects.map(project => project.id));

        setNhaiProjects(projects.length ? projects : defaultNhaiProjects);
        setMobileTasks(
          Array.isArray(workspace.tasks) && workspace.tasks.length
            ? workspace.tasks.filter(task => projectIds.has(task.projectId))
            : defaultTasks.filter(task => defaultNhaiProjects.some(project => project.id === task.projectId))
        );
        setFieldUpdates(normalizeUpdates(workspace.updates));
        setConnectionState('Live');
      } catch {
        if (active) setConnectionState('Queued');
      }
    }

    void loadWorkspace();
    const timer = setInterval(loadWorkspace, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [defaultNhaiProjects]);

  async function pushToCoordinator(update: FieldUpdate) {
    if (!coordinatorApiUrl) return update;

    try {
      const response = await fetch(`${coordinatorApiUrl.replace(/\/$/, '')}/api/nhai/workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update }),
      });

      if (!response.ok) throw new Error('Workspace update failed');

      const workspace = (await response.json()) as NhaiWorkspace;
      const projects = (workspace.projects ?? []).filter(isNhaiProject);

      if (projects.length) setNhaiProjects(projects);
      if (Array.isArray(workspace.tasks)) setMobileTasks(workspace.tasks);
      setFieldUpdates(normalizeUpdates(workspace.updates));
      setConnectionState('Live');

      return { ...update, syncState: 'Synced' as const };
    } catch {
      setConnectionState('Queued');
      return update;
    }
  }

  function saveUpdate(task: Task, patch: Partial<FieldUpdate>) {
    const existing = fieldUpdates.find(update => update.taskId === task.id);
    const nextUpdate: FieldUpdate = {
      taskId: task.id,
      projectId: task.projectId,
      status: fieldStatusFromTask(task, existing),
      chainageCovered: '',
      workDone: '',
      issue: '',
      nextAction: '',
      ...existing,
      ...patch,
      syncState: 'Queued',
      updatedAt: new Date().toISOString(),
    };

    setFieldUpdates(current => [nextUpdate, ...current.filter(update => update.taskId !== task.id)]);

    void pushToCoordinator(nextUpdate).then(pushedUpdate => {
      setFieldUpdates(current =>
        current.map(update => (update.taskId === pushedUpdate.taskId ? pushedUpdate : update))
      );
    });
  }

  function updateFieldStatus(task: Task, status: FieldStatus) {
    setMobileTasks(current =>
      current.map(item =>
        item.id === task.id ? { ...item, status: taskStatusFromFieldStatus(status) } : item
      )
    );
    saveUpdate(task, { status });
  }

  function openMap(project: Project) {
    void Linking.openURL(mapsUrl(project));
  }

  function callMember() {
    const phone = phoneNumber(selectedMember?.phone ?? '');

    if (!phone) {
      Alert.alert('No phone number', 'This team member has no phone number saved.');
      return;
    }

    void Linking.openURL(`tel:${phone}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <MaterialIcons name="engineering" size={28} color="#ffffff" />
        </View>
        <Text style={styles.kicker}>Projects / NHAI</Text>
        <Text style={styles.title}>Field Team Mobile</Text>
        <Text style={styles.subtitle}>
          Send chainage, work progress, issues and completion status to the project coordinator.
        </Text>
      </View>

      <View style={styles.memberSelector}>
        {fieldMembers.map(member => (
          <TouchableOpacity
            key={member.id}
            onPress={() => setSelectedMemberId(member.id)}
            style={[
              styles.memberButton,
              selectedMemberId === member.id && styles.memberButtonActive,
            ]}
          >
            <Text
              style={[
                styles.memberButtonText,
                selectedMemberId === member.id && styles.memberButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {member.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsGrid}>
        <Stat label="NHAI Projects" value={nhaiProjects.length} />
        <Stat label="Open Tasks" value={openTasks} />
        <Stat label="Issues" value={issueCount} />
        <Stat label="Synced" value={syncedCount} />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Assigned Work</Text>
          <Text style={styles.sectionSubtitle}>{selectedMember?.role ?? 'Field user'}</Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={callMember}>
          <Feather name="phone" size={16} color="#0f172a" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>

      {assignedTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={28} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No NHAI task assigned</Text>
          <Text style={styles.emptyText}>
            Assign work from the coordinator dashboard, then this user will see the task here.
          </Text>
        </View>
      ) : (
        assignedTasks.map(task => {
          const project = nhaiProjects.find(item => item.id === task.projectId);
          const update = fieldUpdates.find(item => item.taskId === task.id);

          if (!project) return null;

          return (
            <TaskCard
              key={task.id}
              task={task}
              project={project}
              update={update}
              updateFieldStatus={updateFieldStatus}
              saveUpdate={saveUpdate}
              openMap={openMap}
            />
          );
        })
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Coordinator Live Feed</Text>
          <Text style={styles.sectionSubtitle}>
            {connectionState === 'Live' ? 'Connected to coordinator workspace' : 'Coordinator API unavailable, updates are queued'}
          </Text>
        </View>
      </View>

      <View style={styles.feed}>
        {latestUpdates.length === 0 ? (
          <Text style={styles.feedEmpty}>No field updates sent yet.</Text>
        ) : (
          latestUpdates.map(update => {
            const task = mobileTasks.find(item => item.id === update.taskId);
            const project = nhaiProjects.find(item => item.id === update.projectId);

            return (
              <View key={`${update.taskId}-${update.updatedAt}`} style={styles.feedItem}>
                <View style={styles.feedRow}>
                  <Text style={styles.feedTitle} numberOfLines={1}>
                    {project?.code ?? 'NHAI'} - {update.status}
                  </Text>
                  <Text style={styles.feedSync}>{update.syncState}</Text>
                </View>
                <Text style={styles.feedText} numberOfLines={2}>
                  {task?.title ?? 'Field update'} {update.chainageCovered ? `| ${update.chainageCovered}` : ''}
                </Text>
                {update.issue ? <Text style={styles.issueText}>Issue: {update.issue}</Text> : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TaskCard({
  task,
  project,
  update,
  updateFieldStatus,
  saveUpdate,
  openMap,
}: {
  task: Task;
  project: Project;
  update?: FieldUpdate;
  updateFieldStatus: (task: Task, status: FieldStatus) => void;
  saveUpdate: (task: Task, patch: Partial<FieldUpdate>) => void;
  openMap: (project: Project) => void;
}) {
  const status = fieldStatusFromTask(task, update);
  const colors = statusColors[status];
  const dueDays = daysUntil(task.dueDate);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleGroup}>
          <Text style={styles.taskType}>{taskType(task)}</Text>
          <Text style={styles.projectCode}>{project.code}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{project.name}</Text>
          <Text style={styles.cardText}>{project.location}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.cardText}>{task.description}</Text>

      <View style={styles.metaGrid}>
        <Meta label="Due" value={dueDays < 0 ? `${Math.abs(dueDays)}d late` : task.dueDate} />
        <Meta label="Priority" value={task.priority} />
        <Meta label="Chainage" value={update?.chainageCovered || 'Pending'} />
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.darkAction} onPress={() => openMap(project)}>
          <Feather name="map-pin" size={15} color="#fff" />
          <Text style={styles.darkActionText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lightAction} onPress={() => updateFieldStatus(task, 'Travelling')}>
          <Text style={styles.lightActionText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryAction} onPress={() => updateFieldStatus(task, 'Data Uploaded')}>
          <Text style={styles.primaryActionText}>Complete</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formBox}>
        <Text style={styles.formTitle}>Live Status Update</Text>
        <View style={styles.statusGrid}>
          {fieldStatuses.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => updateFieldStatus(task, item)}
              style={[styles.statusOption, status === item && styles.statusOptionActive]}
            >
              <Text style={[styles.statusOptionText, status === item && styles.statusOptionTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FieldInput
          label="Chainage covered"
          value={update?.chainageCovered ?? ''}
          placeholder="Example: 12+500 to 18+000"
          onChangeText={value => saveUpdate(task, { chainageCovered: value })}
        />
        <FieldInput
          label="Work done today"
          value={update?.workDone ?? ''}
          placeholder="Survey completed, data uploaded, inspection notes..."
          onChangeText={value => saveUpdate(task, { workDone: value })}
          multiline
        />
        <FieldInput
          label="Issue"
          value={update?.issue ?? ''}
          placeholder="No issue"
          onChangeText={value => saveUpdate(task, { issue: value })}
        />
        <FieldInput
          label="Next action"
          value={update?.nextAction ?? ''}
          placeholder="Coordinator follow-up or next field step"
          onChangeText={value => saveUpdate(task, { nextAction: value })}
        />

        <Text style={styles.savedText}>
          {update
            ? `${update.syncState} at ${new Date(update.updatedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Waiting for first update'}
        </Text>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function FieldInput({
  label,
  value,
  placeholder,
  multiline,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  kicker: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  memberSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  memberButton: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    maxWidth: '48%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memberButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  memberButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  memberButtonTextActive: {
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
    width: '48%',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  callButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  taskType: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  projectCode: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  cardTitle: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  cardText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  taskTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metaItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    flex: 1,
    padding: 10,
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  darkAction: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  darkActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  lightAction: {
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  lightActionText: {
    color: '#3730a3',
    fontSize: 13,
    fontWeight: '900',
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  formBox: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  formTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statusOption: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusOptionActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  statusOptionText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },
  statusOptionTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  savedText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 12,
  },
  feed: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  feedEmpty: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    padding: 8,
  },
  feedItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
  },
  feedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedTitle: {
    color: '#0f172a',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    paddingRight: 8,
  },
  feedSync: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '900',
  },
  feedText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  issueText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
});
