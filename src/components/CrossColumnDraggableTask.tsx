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
}

const COLUMN_WIDTH = 300;
const COLUMN_MARGIN = 8;

export function CrossColumnDraggableTask({
  task,
  onPress,
  onDragStart,
  onDragEnd,
  currentStatus,
  getColumnLayouts,
  scrollX = 0,
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

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      try {
        runOnJS(startDrag)();
        scale.value = withSpring(1.1);
        opacity.value = withSpring(0.7);
      } catch (error) {
        console.error('Error in long press gesture:', error);
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isDragging.value) {
        startX.value = translateX.value;
        startY.value = translateY.value;
      }
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
        // Use layout measurements if available, otherwise fall back to calculation
        let targetStatus: TaskStatus | undefined;
        
        // Always use fallback calculation for now (more reliable)
        // Layout measurements can cause issues in worklets
        const finalX = event.absoluteX;
        const columnWidth = COLUMN_WIDTH + (COLUMN_MARGIN * 2); // 316px
        const scrollOffset = 16; // Padding
        const currentScrollX = scrollXValue.value;
        const relativeX = finalX - scrollOffset + currentScrollX;
          
        const columnIndex = Math.floor(relativeX / columnWidth);
        
        if (columnIndex === 0) {
          targetStatus = 'todo';
        } else if (columnIndex === 1) {
          targetStatus = 'in_progress';
        } else if (columnIndex >= 2) {
          // Done column - use >= 2 to catch edge cases
          targetStatus = 'done';
        }
        
        // Only move if dropped on a different column
        if (targetStatus && targetStatus !== currentStatus) {
          runOnJS(endDrag)(targetStatus);
        } else {
          runOnJS(endDrag)(undefined);
        }
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
    marginBottom: 8,
  },
});

