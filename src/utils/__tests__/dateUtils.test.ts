import { formatDate, isOverdue, getDueDateLabel } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a date correctly', () => {
      const date = new Date('2024-02-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Feb 15, 2024/);
    });

    it('should format a date string', () => {
      const formatted = formatDate('2024-02-15');
      expect(formatted).toMatch(/Feb 15, 2024/);
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isOverdue(yesterday)).toBe(true);
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isOverdue(tomorrow)).toBe(false);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isOverdue(today)).toBe(false);
    });
  });

  describe('getDueDateLabel', () => {
    it('should return "Due today" for today', () => {
      const today = new Date();
      expect(getDueDateLabel(today)).toBe('Due today');
    });

    it('should return "Due tomorrow" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getDueDateLabel(tomorrow)).toBe('Due tomorrow');
    });

    it('should return overdue message for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const label = getDueDateLabel(yesterday);
      expect(label).toContain('overdue');
    });
  });
});

