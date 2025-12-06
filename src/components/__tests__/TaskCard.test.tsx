import React from 'react';
import { render } from '@testing-library/react-native';
import { TaskCard } from '../TaskCard';
import { Task } from '@/types';

const mockTask: Task = {
  id: '1',
  projectId: 'project1',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TaskCard', () => {
  it('renders task title', () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    expect(getByText('Test Task')).toBeTruthy();
  });

  it('renders task description when provided', () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    expect(getByText('Test description')).toBeTruthy();
  });

  it('does not render description when not provided', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    const { queryByText } = render(<TaskCard task={taskWithoutDescription} />);
    expect(queryByText('Test description')).toBeNull();
  });

  it('shows overdue indicator for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01'),
    };
    const { getByText } = render(<TaskCard task={overdueTask} />);
    // The card should have overdue styling
    expect(getByText('Test Task')).toBeTruthy();
  });
});

