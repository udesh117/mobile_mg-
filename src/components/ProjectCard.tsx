import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Project } from '@/types';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { scaleSize, scaleFont, scalePadding, scaleMargin } from '@/utils/responsive';
import { useProjectTaskCount } from '@/hooks/useProjectTaskCount';
import { useDeleteProject } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
}

// Icon mapping based on project name or type - all icons are blue
// Matching the icons from the image: web page, megaphone, mobile app, wrench/hammer
const getProjectIcon = (projectName: string): keyof typeof MaterialIcons.glyphMap => {
  const name = projectName.toLowerCase();
  const icons = [
    // Website & Web Design - web page icon (squares/rectangles)
    { keywords: ['website', 'web', 'design', 'redesign'], icon: 'web' },
    // Marketing & Campaigns - megaphone icon
    { keywords: ['marketing', 'campaign', 'promotion', 'plan', 'q1', 'q2', 'q3', 'q4', 'quarter'], icon: 'campaign' },
    // Mobile Apps - mobile/phone icon
    { keywords: ['app', 'ios', 'android', 'mobile', 'launch'], icon: 'phone-iphone' },
    // Construction & Renovation - build/wrench icon
    { keywords: ['renovation', 'construction', 'office', 'building', 'repair'], icon: 'build' },
    // Social Media
    { keywords: ['social', 'media'], icon: 'campaign' },
    // Development & Coding
    { keywords: ['development', 'code', 'programming', 'software'], icon: 'code' },
    // Strategy & Growth
    { keywords: ['growth', 'strategy', 'planning', 'business'], icon: 'trending-up' },
    // Ideas & Innovation
    { keywords: ['feature', 'ideas', 'feedback', 'innovation', 'brainstorm', 'concept'], icon: 'lightbulb' },
    // Analytics & Data
    { keywords: ['analytics', 'data', 'report', 'metrics', 'dashboard'], icon: 'bar-chart' },
    // Content & Writing
    { keywords: ['content', 'blog', 'article', 'writing', 'copy'], icon: 'article' },
    // E-commerce & Sales
    { keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'sales', 'product'], icon: 'shopping-cart' },
    // Support & Help
    { keywords: ['support', 'help', 'customer', 'service'], icon: 'headset-mic' },
    // Security & Infrastructure
    { keywords: ['security', 'infrastructure', 'server', 'cloud', 'devops'], icon: 'security' },
    // Testing & QA
    { keywords: ['test', 'testing', 'qa', 'quality'], icon: 'bug-report' },
    // Documentation
    { keywords: ['documentation', 'docs', 'guide', 'manual'], icon: 'description' },
    // UI/UX
    { keywords: ['ui', 'ux', 'interface'], icon: 'web' },
  ];

  // Check for exact matches first (more specific)
  for (const { keywords, icon } of icons) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return icon as keyof typeof MaterialIcons.glyphMap;
    }
  }

  // Default icon
  return 'folder';
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { data: taskCount } = useProjectTaskCount(project.id);
  const deleteProject = useDeleteProject();
  const iconName = getProjectIcon(project.name);

  const handlePress = () => {
    router.push(`/project/${project.id}`);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject.mutateAsync(project.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const totalTasks = taskCount?.total || 0;
  const doneTasks = taskCount?.done || 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={iconName} size={scaleSize(28)} color="#007AFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.taskCount}>
          {doneTasks}/{totalTasks} tasks
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleDelete}
        activeOpacity={0.7}
        style={styles.deleteButton}
        disabled={deleteProject.isPending}
      >
        <MaterialIcons name="delete-outline" size={scaleSize(20)} color="#EF4444" />
      </TouchableOpacity>
      <MaterialIcons name="chevron-right" size={scaleSize(24)} color="#A0A0A0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(16),
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    padding: scalePadding(16),
    marginBottom: scaleMargin(16),
    backgroundColor: '#1C1C1E',
  },
  iconContainer: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(8),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: scaleSize(20),
    marginBottom: scaleMargin(4),
  },
  taskCount: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#A0A0A0',
  },
  deleteButton: {
    padding: scalePadding(8),
    marginRight: scaleMargin(8),
  },
});
