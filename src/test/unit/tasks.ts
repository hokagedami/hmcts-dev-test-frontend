describe('Task Routes Helper Functions', () => {
  // Test the helper functions logic

  describe('formatDate', () => {
    const formatDate = (dateString: string | undefined): string => {
      if (!dateString) {
        return 'Not set';
      }
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    it('should return "Not set" for undefined date', () => {
      expect(formatDate(undefined)).toBe('Not set');
    });

    it('should return "Not set" for empty string', () => {
      expect(formatDate('')).toBe('Not set');
    });

    it('should format a valid date string', () => {
      const result = formatDate('2024-12-25T10:30:00Z');
      expect(result).toContain('December');
      expect(result).toContain('2024');
    });

    it('should format date with time component', () => {
      const result = formatDate('2024-06-15T14:45:00Z');
      expect(result).toContain('June');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateForInput', () => {
    const formatDateForInput = (dateString: string | undefined): string => {
      if (!dateString) {
        return '';
      }
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    it('should return empty string for undefined date', () => {
      expect(formatDateForInput(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatDateForInput('')).toBe('');
    });

    it('should format date for datetime-local input', () => {
      const result = formatDateForInput('2024-12-25T10:30:00Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should preserve date and time values', () => {
      const result = formatDateForInput('2024-06-15T14:45:00.000Z');
      expect(result).toContain('2024-06-15');
      expect(result).toContain('14:45');
    });
  });

  describe('getStatusDisplay', () => {
    const getStatusDisplay = (status: string): string => {
      const statusMap: Record<string, string> = {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
      };
      return statusMap[status] || status;
    };

    it('should return "Pending" for PENDING status', () => {
      expect(getStatusDisplay('PENDING')).toBe('Pending');
    });

    it('should return "In Progress" for IN_PROGRESS status', () => {
      expect(getStatusDisplay('IN_PROGRESS')).toBe('In Progress');
    });

    it('should return "Completed" for COMPLETED status', () => {
      expect(getStatusDisplay('COMPLETED')).toBe('Completed');
    });

    it('should return "Cancelled" for CANCELLED status', () => {
      expect(getStatusDisplay('CANCELLED')).toBe('Cancelled');
    });

    it('should return the original value for unknown status', () => {
      expect(getStatusDisplay('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should handle empty string', () => {
      expect(getStatusDisplay('')).toBe('');
    });
  });

  describe('getPriorityDisplay', () => {
    const getPriorityDisplay = (priority: string): string => {
      const priorityMap: Record<string, string> = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        URGENT: 'Urgent',
      };
      return priorityMap[priority] || priority;
    };

    it('should return "Low" for LOW priority', () => {
      expect(getPriorityDisplay('LOW')).toBe('Low');
    });

    it('should return "Medium" for MEDIUM priority', () => {
      expect(getPriorityDisplay('MEDIUM')).toBe('Medium');
    });

    it('should return "High" for HIGH priority', () => {
      expect(getPriorityDisplay('HIGH')).toBe('High');
    });

    it('should return "Urgent" for URGENT priority', () => {
      expect(getPriorityDisplay('URGENT')).toBe('Urgent');
    });

    it('should return the original value for unknown priority', () => {
      expect(getPriorityDisplay('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should handle empty string', () => {
      expect(getPriorityDisplay('')).toBe('');
    });
  });

  describe('getStatusTagColor', () => {
    const getStatusTagColor = (status: string): string => {
      const colorMap: Record<string, string> = {
        PENDING: 'govuk-tag--grey',
        IN_PROGRESS: 'govuk-tag--blue',
        COMPLETED: 'govuk-tag--green',
        CANCELLED: 'govuk-tag--red',
      };
      return colorMap[status] || '';
    };

    it('should return grey tag for PENDING', () => {
      expect(getStatusTagColor('PENDING')).toBe('govuk-tag--grey');
    });

    it('should return blue tag for IN_PROGRESS', () => {
      expect(getStatusTagColor('IN_PROGRESS')).toBe('govuk-tag--blue');
    });

    it('should return green tag for COMPLETED', () => {
      expect(getStatusTagColor('COMPLETED')).toBe('govuk-tag--green');
    });

    it('should return red tag for CANCELLED', () => {
      expect(getStatusTagColor('CANCELLED')).toBe('govuk-tag--red');
    });

    it('should return empty string for unknown status', () => {
      expect(getStatusTagColor('UNKNOWN')).toBe('');
    });

    it('should return empty string for empty status', () => {
      expect(getStatusTagColor('')).toBe('');
    });
  });

  describe('getPriorityTagColor', () => {
    const getPriorityTagColor = (priority: string): string => {
      const colorMap: Record<string, string> = {
        LOW: 'govuk-tag--grey',
        MEDIUM: 'govuk-tag--yellow',
        HIGH: 'govuk-tag--orange',
        URGENT: 'govuk-tag--red',
      };
      return colorMap[priority] || '';
    };

    it('should return grey tag for LOW', () => {
      expect(getPriorityTagColor('LOW')).toBe('govuk-tag--grey');
    });

    it('should return yellow tag for MEDIUM', () => {
      expect(getPriorityTagColor('MEDIUM')).toBe('govuk-tag--yellow');
    });

    it('should return orange tag for HIGH', () => {
      expect(getPriorityTagColor('HIGH')).toBe('govuk-tag--orange');
    });

    it('should return red tag for URGENT', () => {
      expect(getPriorityTagColor('URGENT')).toBe('govuk-tag--red');
    });

    it('should return empty string for unknown priority', () => {
      expect(getPriorityTagColor('UNKNOWN')).toBe('');
    });

    it('should return empty string for empty priority', () => {
      expect(getPriorityTagColor('')).toBe('');
    });
  });
});
