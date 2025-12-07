import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

interface CrossColumnDraggableTaskProps {
  task: Task;
  onPress?: () => void;
  onDragStart?: (task: Task) => void;
  onDragEnd?: (task: Task, targetStatus?: TaskStatus) => void;
  currentStatus: TaskStatus;
  getColumnLayouts?: () => Map<TaskStatus, { x: number; width: number }>;
  scrollX?: number;
  onWithinColumnDrag?: () => void;
}


export function CrossColumnDraggableTask({
  task,
  onPress,
  onDragStart,
  onDragEnd,
  currentStatus,
  getColumnLayouts,
  scrollX = 0,
  onWithinColumnDrag,
}: CrossColumnDraggableTaskProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  
  // Store scrollX in a shared value so it can be accessed in worklets
  const scrollXValue = useSharedValue(scrollX);
  
  // Update scrollX shared value when prop changes
  useEffect(() => {
    scrollXValue.value = scrollX;
  }, [scrollX, scrollXValue]);

  const startDrag = () => {
    try {
      isDragging.value = true;
      onDragStart?.(task);
    } catch (error) {
      console.error('Error starting drag:', error);
    }
  };

  const endDrag = (targetStatus?: TaskStatus) => {
    try {
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      onDragEnd?.(task, targetStatus);
    } catch (error) {
      console.error('Error ending drag:', error);
      // Reset values even on error
      isDragging.value = false;
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 1;
    }
  };

  const determineTargetColumnAndEndDrag = (absoluteX: number, translationX: number) => {
    let targetStatus: TaskStatus | undefined;
    
    // Only treat as cross-column drag if there's significant horizontal movement
    const isHorizontalDrag = Math.abs(translationX) > 30;
    
    if (!isHorizontalDrag) {
      // Vertical drag - let DraggableFlatList handle it
      endDrag(undefined);
      return;
    }
    
    // Use actual layout measurements if available
    if (getColumnLayouts) {
      const layouts = getColumnLayouts();
      const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
      
      for (const status of statuses) {
        const layout = layouts.get(status);
        if (layout) {
          const { x, width } = layout;
          const columnStart = x;
          const columnEnd = x + width;
          
          if (absoluteX >= columnStart && absoluteX <= columnEnd) {
            targetStatus = status;
            break;
          }
        }
      }
    }
    
    // Fallback: use screen width calculation if layouts not available
    if (!targetStatus) {
      const screenWidth = Dimensions.get('window').width;
      const padding = 16;
      const gap = 16;
      const totalGaps = gap * 2; // gaps between 3 columns
      const availableWidth = screenWidth - (padding * 2) - totalGaps;
      const columnWidth = availableWidth / 3;
      
      const relativeX = absoluteX - padding;
      
      if (relativeX < columnWidth) {
        targetStatus = 'todo';
      } else if (relativeX < columnWidth * 2 + gap) {
        targetStatus = 'in_progress';
      } else {
        targetStatus = 'done';
      }
    }
    
    // Only move if dropped on a different column
    if (targetStatus && targetStatus !== currentStatus) {
      endDrag(targetStatus);
    } else {
      endDrag(undefined);
    }
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      try {
        runOnJS(startDrag)();
        scale.value = withSpring(1.05);
        opacity.value = withSpring(0.8);
      } catch (error) {
        console.error('Error in long press gesture:', error);
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Allow pan to start drag if not already dragging
      if (!isDragging.value) {
        runOnJS(startDrag)();
        scale.value = withSpring(1.05);
        opacity.value = withSpring(0.8);
      }
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (isDragging.value) {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      }
    })
    .onEnd((event) => {
      if (!isDragging.value) return;
      
      try {
        const finalX = event.absoluteX;
        const translationX = event.translationX;
        runOnJS(determineTargetColumnAndEndDrag)(finalX, translationX);
      } catch (error) {
        console.error('Error in pan gesture onEnd:', error);
        runOnJS(endDrag)(undefined);
      }
    });

  // Combine gestures: long press activates drag, pan handles movement
  // Use Simultaneous but pan only works when isDragging is true
  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isDragging.value ? 1000 : 1,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TaskCard task={task} onPress={onPress} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
});

