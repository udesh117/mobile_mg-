import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';

interface DraggableTaskCardProps {
  task: Task;
  onPress?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (targetStatus?: string) => void;
  onLongPress?: () => void;
}

export function DraggableTaskCard({
  task,
  onPress,
  onDragStart,
  onDragEnd,
  onLongPress,
}: DraggableTaskCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = () => {
    setIsDragging(true);
    onDragStart?.();
  };

  const endDrag = (targetStatus?: string) => {
    setIsDragging(false);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
    onDragEnd?.(targetStatus);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      runOnJS(startDrag)();
      scale.value = withSpring(1.05);
      opacity.value = withSpring(0.8);
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(isDragging)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Determine target column based on X position
      // Column widths are approximately: 300px each with 8px margins
      // To Do: 0-308, In Progress: 308-616, Done: 616+
      const columnWidth = 308;
      const targetColumn = Math.floor((event.absoluteX - 16) / columnWidth);
      
      let targetStatus: string | undefined;
      if (targetColumn === 0) targetStatus = 'todo';
      else if (targetColumn === 1) targetStatus = 'in_progress';
      else if (targetColumn === 2) targetStatus = 'done';
      
      runOnJS(endDrag)(targetStatus);
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isDragging ? 1000 : 1,
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

