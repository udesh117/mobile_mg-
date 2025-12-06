import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Modal, TextInput, Button, Text, Portal, Menu, Chip } from 'react-native-paper';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useUIStore } from '@/store/uiStore';
import { Task, TaskStatus } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/dateUtils';

interface EditTaskModalWithDataProps {
  task: Task;
}

export function EditTaskModalWithData({ task }: EditTaskModalWithDataProps) {
  const { closeEditTaskModal } = useUIStore();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: members } = useProjectMembers(task.projectId);
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(task.assigneeId);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : undefined
  );
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [assigneeMenuVisible, setAssigneeMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setAssigneeId(task.assigneeId);
    setDueDate(
      task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : undefined
    );
  }, [task]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setError('');
    try {
      // Build update data, only including fields with values
      const updateData: any = {
        title: title.trim(),
        status,
      };

      // Only include optional fields if they have values
      if (description.trim()) {
        updateData.description = description.trim();
      }
      if (assigneeId) {
        updateData.assigneeId = assigneeId;
      } else if (assigneeId === null) {
        // Explicitly set to null to clear the field
        updateData.assigneeId = null;
      }
      if (dueDate) {
        updateData.dueDate = dueDate;
      } else if (dueDate === null) {
        // Explicitly set to null to clear the field
        updateData.dueDate = null;
      }

      await updateTask.mutateAsync({
        taskId: task.id,
        data: updateData,
      });
      closeEditTaskModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({
        taskId: task.id,
        projectId: task.projectId,
      });
      closeEditTaskModal();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleClose = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setAssigneeId(task.assigneeId);
    setDueDate(
      task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : undefined
    );
    setError('');
    closeEditTaskModal();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const selectedAssignee = members?.find((m) => m.userId === assigneeId);

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Edit Task
          </Text>

          {error ? (
            <Text style={styles.error} variant="bodyMedium">
              {error}
            </Text>
          ) : null}

          <TextInput
            label="Task Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <View style={styles.statusContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Status
            </Text>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.chip}
                >
                  {statusLabels[status]}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => {
                  setStatus('todo');
                  setStatusMenuVisible(false);
                }}
                title="To Do"
              />
              <Menu.Item
                onPress={() => {
                  setStatus('in_progress');
                  setStatusMenuVisible(false);
                }}
                title="In Progress"
              />
              <Menu.Item
                onPress={() => {
                  setStatus('done');
                  setStatusMenuVisible(false);
                }}
                title="Done"
              />
            </Menu>
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Assignee
            </Text>
            <Menu
              visible={assigneeMenuVisible}
              onDismiss={() => setAssigneeMenuVisible(false)}
              anchor={
                <Chip
                  onPress={() => setAssigneeMenuVisible(true)}
                  style={styles.chip}
                  onClose={assigneeId ? () => setAssigneeId(undefined) : undefined}
                >
                  {selectedAssignee ? selectedAssignee.userId.substring(0, 8) : 'Unassigned'}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => {
                  setAssigneeId(undefined);
                  setAssigneeMenuVisible(false);
                }}
                title="Unassigned"
              />
              {members?.map((member) => (
                <Menu.Item
                  key={member.id}
                  onPress={() => {
                    setAssigneeId(member.userId);
                    setAssigneeMenuVisible(false);
                  }}
                  title={member.userId.substring(0, 8)}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodyMedium" style={styles.label}>
              Due Date
            </Text>
            <View style={styles.dateContainer}>
              <Chip
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                onClose={dueDate ? () => setDueDate(undefined) : undefined}
                style={styles.chip}
              >
                {dueDate ? formatDate(dueDate) : 'No due date'}
              </Chip>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={handleDelete}
              loading={deleteTask.isPending}
              disabled={deleteTask.isPending}
              buttonColor="#d32f2f"
              textColor="#d32f2f"
              style={styles.button}
            >
              Delete
            </Button>
            <View style={styles.rightButtons}>
              <Button mode="outlined" onPress={handleClose} style={styles.button}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={updateTask.isPending}
                disabled={updateTask.isPending}
                style={styles.button}
              >
                Save
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

