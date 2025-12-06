import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const isOverdue = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isPast(dateObj) && !isToday(dateObj);
};

export const getDueDateLabel = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Due today';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Due tomorrow';
  }
  
  if (isPast(dateObj)) {
    const daysOverdue = differenceInDays(new Date(), dateObj);
    return `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
  }
  
  const daysUntil = differenceInDays(dateObj, new Date());
  return `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
};

