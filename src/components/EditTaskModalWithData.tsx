import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput as RNTextInput, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Modal, Text, Portal } from 'react-native-paper';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useUIStore } from '@/store/uiStore';
import { Task, TaskStatus } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/utils/dateUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { scaleSize, scaleFont, scalePadding, scaleMargin, widthPercentage } from '@/utils/responsive';

interface EditTaskModalWithDataProps {
  task: Task;
}

export function EditTaskModalWithData({ task }: EditTaskModalWithDataProps) {
  const { closeEditTaskModal } = useUIStore();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [assigneeName, setAssigneeName] = useState<string>(task.assigneeId || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : undefined
  );
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [assigneeFocused, setAssigneeFocused] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setAssigneeName(task.assigneeId || '');
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
      if (assigneeName.trim()) {
        updateData.assigneeId = assigneeName.trim();
      } else {
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
    setAssigneeName(task.assigneeId || '');
    setDueDate(
      task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : undefined
    );
    setError('');
    closeEditTaskModal();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDueDate(selectedDate);
      }
    } else {
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }
  };

  const handleDatePickerOk = () => {
    setShowDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
  };


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
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <Text style={styles.title}>Edit Task</Text>

              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : null}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <View style={[
                  styles.inputWrapper,
                  titleFocused && styles.inputWrapperFocused
                ]}>
                  <RNTextInput
                    style={styles.input}
                    placeholder="Enter task title"
                    placeholderTextColor="#737373"
                    value={title}
                    onChangeText={setTitle}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => setTitleFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                  descriptionFocused && styles.inputWrapperFocused
                ]}>
                  <RNTextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#737373"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    onFocus={() => setDescriptionFocused(true)}
                    onBlur={() => setDescriptionFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Status</Text>
                <TouchableOpacity
                  onPress={() => setStatusMenuVisible(!statusMenuVisible)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>{statusLabels[status]}</Text>
                  </View>
                </TouchableOpacity>
                {statusMenuVisible && (
                  <View style={styles.menuContainer}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setStatus('todo');
                        setStatusMenuVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>To Do</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setStatus('in_progress');
                        setStatusMenuVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setStatus('done');
                        setStatusMenuVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Assignee</Text>
                <View style={[
                  styles.inputWrapper,
                  assigneeFocused && styles.inputWrapperFocused
                ]}>
                  <RNTextInput
                    style={styles.input}
                    placeholder="Enter assignee name"
                    placeholderTextColor="#737373"
                    value={assigneeName}
                    onChangeText={setAssigneeName}
                    onFocus={() => setAssigneeFocused(true)}
                    onBlur={() => setAssigneeFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chipContainer}>
                    <MaterialIcons name="calendar-today" size={16} color="#FFFFFF" style={styles.chipIcon} />
                    <Text style={styles.chipText} numberOfLines={1}>
                      {dueDate ? formatDate(dueDate) : 'No due date'}
                    </Text>
                    {dueDate && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setDueDate(undefined);
                        }}
                        style={styles.chipClose}
                      >
                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                {showDatePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    themeVariant="dark"
                  />
                )}
                {showDatePicker && Platform.OS === 'ios' && (
                  <Modal
                    visible={showDatePicker}
                    onDismiss={() => setShowDatePicker(false)}
                    contentContainerStyle={styles.datePickerModalContainer}
                    transparent
                  >
                    <View style={styles.datePickerModal}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerYear}>
                          {dueDate ? dueDate.getFullYear() : new Date().getFullYear()}
                        </Text>
                        <Text style={styles.datePickerSelectedDate}>
                          {dueDate 
                            ? format(dueDate, 'EEE, MMM d')
                            : format(new Date(), 'EEE, MMM d')}
                        </Text>
                      </View>
                      <View style={styles.datePickerContent}>
                        <DateTimePicker
                          value={dueDate || new Date()}
                          mode="date"
                          display="spinner"
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                          textColor="#FFFFFF"
                          themeVariant="dark"
                        />
                      </View>
                      <View style={styles.datePickerButtons}>
                        <TouchableOpacity
                          style={styles.datePickerCancelButton}
                          onPress={handleDatePickerCancel}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.datePickerCancelText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.datePickerOkButton}
                          onPress={handleDatePickerOk}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.datePickerOkText}>OK</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.deleteButton, deleteTask.isPending && styles.buttonDisabled]}
                  onPress={handleDelete}
                  disabled={deleteTask.isPending}
                  activeOpacity={0.8}
                >
                  {deleteTask.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.rightButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, updateTask.isPending && styles.buttonDisabled]}
                    onPress={handleUpdate}
                    disabled={updateTask.isPending}
                    activeOpacity={0.9}
                  >
                    {updateTask.isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardView: {
    width: '100%',
    maxWidth: widthPercentage(90),
    margin: scaleMargin(20),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: scalePadding(24),
    paddingTop: scalePadding(24),
    paddingBottom: scalePadding(24),
    borderRadius: scaleSize(12),
    width: '100%',
    overflow: 'hidden',
  },
  title: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#E3E3E3',
    marginBottom: scaleMargin(24),
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: scaleMargin(20),
  },
  inputLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#E3E3E3',
    marginBottom: scaleMargin(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: '#171717',
    minHeight: scaleSize(56),
    paddingHorizontal: scalePadding(16),
    paddingVertical: 0,
  },
  inputWrapperFocused: {
    borderColor: '#0A84FF',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: scaleSize(56),
    fontSize: scaleFont(16),
    fontWeight: '400',
    color: '#FFFFFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textAreaWrapper: {
    minHeight: scaleSize(100),
    alignItems: 'flex-start',
    paddingVertical: scalePadding(8),
  },
  textArea: {
    height: scaleSize(100),
    paddingTop: scalePadding(8),
    paddingBottom: scalePadding(8),
    minHeight: scaleSize(100),
  },
  fieldContainer: {
    marginBottom: scaleMargin(20),
  },
  label: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#E3E3E3',
    marginBottom: scaleMargin(8),
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: scaleSize(20),
    paddingHorizontal: scalePadding(12),
    paddingVertical: scalePadding(8),
    alignSelf: 'flex-start',
    gap: scaleSize(8),
  },
  chipIcon: {
    marginRight: 0,
  },
  chipText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  chipClose: {
    marginLeft: scaleMargin(4),
    padding: scalePadding(2),
  },
  menuContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: scaleSize(12),
    marginTop: scaleMargin(8),
    borderWidth: 1,
    borderColor: '#404040',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(12),
    elevation: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  menuItem: {
    paddingHorizontal: scalePadding(16),
    paddingVertical: scalePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  menuItemText: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#E3E3E3',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scaleSize(12),
    marginTop: scaleMargin(8),
    width: '100%',
    flexShrink: 1,
  },
  deleteButton: {
    paddingHorizontal: scalePadding(20),
    paddingVertical: scalePadding(14),
    borderRadius: scaleSize(12),
    backgroundColor: '#EF4444',
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  deleteButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: scaleSize(12),
  },
  cancelButton: {
    paddingHorizontal: scalePadding(20),
    paddingVertical: scalePadding(14),
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: 'transparent',
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
  },
  cancelButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingHorizontal: scalePadding(20),
    paddingVertical: scalePadding(14),
    borderRadius: scaleSize(12),
    backgroundColor: '#0A84FF',
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
  },
  saveButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    color: '#EF4444',
    fontSize: scaleFont(14),
    marginBottom: scaleMargin(16),
    textAlign: 'left',
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  datePickerModal: {
    backgroundColor: '#000000',
    borderRadius: scaleSize(16),
    width: '90%',
    maxWidth: widthPercentage(90),
    overflow: 'hidden',
  },
  datePickerHeader: {
    backgroundColor: '#007AFF',
    paddingVertical: scalePadding(20),
    paddingHorizontal: scalePadding(24),
    alignItems: 'flex-start',
  },
  datePickerYear: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: scaleMargin(4),
  },
  datePickerSelectedDate: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  datePickerContent: {
    backgroundColor: '#000000',
    paddingVertical: scalePadding(16),
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingVertical: scalePadding(16),
    paddingHorizontal: scalePadding(24),
  },
  datePickerCancelButton: {
    paddingVertical: scalePadding(12),
    paddingHorizontal: scalePadding(24),
  },
  datePickerCancelText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  datePickerOkButton: {
    paddingVertical: scalePadding(12),
    paddingHorizontal: scalePadding(24),
  },
  datePickerOkText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
});

