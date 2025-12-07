import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useProjects } from '@/hooks/useProjects';
import { useProjectAnalytics } from '@/hooks/useAnalytics';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleSize, scaleFont, scalePadding, scaleMargin, widthPercentage } from '@/utils/responsive';

type TimePeriod = 'week' | 'month' | 'all';

// Generate avatar initials from name
function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Generate avatar color from name
function getAvatarColor(name: string): string {
  const colors = [
    '#71B6FF', '#2E89E6', '#0F3A78', '#FF9500', '#34C759', 
    '#EF4444', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export default function AnalyticsScreen() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [projectMenuVisible, setProjectMenuVisible] = useState(false);
  const { data: analytics, isLoading: analyticsLoading } = useProjectAnalytics(selectedProjectId);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate bottom padding to account for tab bar
  const bottomPadding = scaleSize(100) + insets.bottom;

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  if (projectsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No projects yet</Text>
        <Text style={styles.emptyText}>
          Create a project to see analytics
        </Text>
      </View>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + scalePadding(20) }]}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.projectSelectorButton}
            onPress={() => setProjectMenuVisible(!projectMenuVisible)}
            activeOpacity={0.7}
          >
            <Text 
              style={styles.projectSelectorButtonText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedProject?.name || 'Select Project'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={scaleSize(18)} color="#1C1C1E" />
          </TouchableOpacity>
          {projectMenuVisible && (
            <View style={[styles.projectMenu, { 
              maxWidth: screenWidth - scalePadding(40)
            }]}>
              <ScrollView 
                style={styles.projectMenuScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.projectMenuItem}
                    onPress={() => {
                      setSelectedProjectId(project.id);
                      setProjectMenuVisible(false);
                    }}
                  >
                    <Text style={styles.projectMenuItemText} numberOfLines={1} ellipsizeMode="tail">
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Time Period Selector */}
        <View style={styles.timePeriodContainer}>
          <TouchableOpacity 
            onPress={() => setTimePeriod('week')} 
            activeOpacity={0.8}
            style={[styles.timePeriodButton, timePeriod === 'week' && styles.timePeriodButtonActive]}
          >
            <Text style={[styles.timePeriodText, timePeriod === 'week' && styles.timePeriodTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setTimePeriod('month')} 
            activeOpacity={0.8}
            style={[styles.timePeriodButton, timePeriod === 'month' && styles.timePeriodButtonActive]}
          >
            <Text style={[styles.timePeriodText, timePeriod === 'month' && styles.timePeriodTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setTimePeriod('all')} 
            activeOpacity={0.8}
            style={[styles.timePeriodButton, timePeriod === 'all' && styles.timePeriodButtonActive]}
          >
            <Text style={[styles.timePeriodText, timePeriod === 'all' && styles.timePeriodTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {analyticsLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : analytics ? (
          <>
            {/* Total Tasks Card - Full Width Top */}
            <View style={styles.totalTasksCard}>
              <Text style={styles.totalTasksLabel}>Total Tasks</Text>
              <Text style={styles.totalTasksNumber}>{analytics.totalTasks}</Text>
            </View>

            {/* To Do and In Progress - Side by Side */}
            <View style={styles.statusRow}>
              <View style={styles.statusCardSmall}>
                <View style={styles.statusCardHeader}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#FF9500' }]} />
                  <Text style={styles.statusLabel}>To Do</Text>
                </View>
                <Text style={styles.statusNumber}>{analytics.tasksByStatus.todo}</Text>
              </View>
              <View style={styles.statusCardSmall}>
                <View style={styles.statusCardHeader}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#007AFF' }]} />
                  <Text style={styles.statusLabel}>In Progress</Text>
                </View>
                <Text style={styles.statusNumber}>{analytics.tasksByStatus.in_progress}</Text>
              </View>
            </View>

            {/* Done Card - Full Width Bottom */}
            <View style={styles.doneCard}>
              <View style={styles.statusCardHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: '#34C759' }]} />
                <Text style={styles.statusLabel}>Done</Text>
              </View>
              <Text style={styles.statusNumber}>{analytics.tasksByStatus.done}</Text>
            </View>

            {/* Tasks by Assignee Section */}
            {analytics.tasksByAssignee.length > 0 && (
              <View style={styles.assigneeSection}>
                <Text style={styles.assigneeSectionTitle}>Tasks by Assignee</Text>
                <View style={styles.assigneeList}>
                  {analytics.tasksByAssignee.map((item) => {
                    const initials = getInitials(item.assigneeName || item.assigneeId);
                    const avatarColor = getAvatarColor(item.assigneeName || item.assigneeId);
                    return (
                      <View key={item.assigneeId} style={styles.assigneeItem}>
                        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.assigneeInfo}>
                          <Text style={styles.assigneeName}>{item.assigneeName || item.assigneeId.substring(0, 8)}</Text>
                          <Text style={styles.assigneeTasksText}>{item.count} Open Tasks</Text>
                        </View>
                        <View style={styles.assigneeBadge}>
                          <Text style={styles.assigneeBadgeText}>{item.count}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scalePadding(20),
    paddingBottom: scalePadding(20),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 2,
    borderBottomColor: '#404040',
    zIndex: 10,
    minHeight: scaleSize(80),
    position: 'relative',
  },
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  dropdownContainer: {
    alignItems: 'flex-start',
    position: 'relative',
  },
  projectSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    backgroundColor: '#E5E5E5',
    borderRadius: scaleSize(10),
    paddingHorizontal: scalePadding(14),
    paddingVertical: scalePadding(10),
    minWidth: scaleSize(120),
    alignSelf: 'flex-start',
  },
  projectSelectorButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1C1C1E',
    flexShrink: 1,
    textAlign: 'center',
  },
  projectMenu: {
    position: 'absolute',
    top: scaleSize(50),
    right: 0,
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    minWidth: scaleSize(200),
    maxWidth: '90%',
    maxHeight: scaleSize(300),
    borderWidth: 1,
    borderColor: '#404040',
    overflow: 'hidden',
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  projectMenuScroll: {
    maxHeight: scaleSize(300),
  },
  projectMenuItem: {
    paddingHorizontal: scalePadding(16),
    paddingVertical: scalePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    alignItems: 'flex-start',
    minWidth: scaleSize(200),
  },
  projectMenuItemText: {
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'left',
    flexShrink: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: scalePadding(20),
  },
  timePeriodContainer: {
    flexDirection: 'row',
    gap: scaleSize(12),
    marginBottom: scaleMargin(24),
    paddingHorizontal: scalePadding(4),
  },
  timePeriodButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(9999),
    paddingVertical: scalePadding(8),
    paddingHorizontal: scalePadding(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleSize(36),
  },
  timePeriodButtonActive: {
    backgroundColor: '#007AFF',
  },
  timePeriodText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#A0A0A0',
  },
  timePeriodTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loader: {
    marginVertical: scaleMargin(32),
  },
  // Total Tasks Card
  totalTasksCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    padding: scalePadding(16),
    marginBottom: scaleMargin(16),
    width: '100%',
  },
  totalTasksLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#A0A0A0',
    marginBottom: scaleMargin(8),
  },
  totalTasksNumber: {
    fontSize: scaleFont(32),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Status Cards Row
  statusRow: {
    flexDirection: 'row',
    gap: scaleSize(12),
    marginBottom: scaleMargin(16),
  },
  statusCardSmall: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    padding: scalePadding(16),
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: scaleSize(8),
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    marginBottom: scaleMargin(8),
  },
  statusIndicator: {
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(6),
  },
  statusLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  statusNumber: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Done Card
  doneCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(12),
    padding: scalePadding(16),
    marginBottom: scaleMargin(24),
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  // Assignee Section
  assigneeSection: {
    marginTop: scaleMargin(8),
  },
  assigneeSectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: scaleMargin(16),
  },
  assigneeList: {
    gap: scaleSize(12),
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: scaleSize(16),
    padding: scalePadding(16),
    gap: scaleSize(12),
  },
  avatar: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: scaleMargin(4),
  },
  assigneeTasksText: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#A0A0A0',
  },
  assigneeBadge: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(16),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeBadgeText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: scaleMargin(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: scaleFont(16),
    color: '#A0A0A0',
    textAlign: 'center',
    padding: scalePadding(16),
  },
});
