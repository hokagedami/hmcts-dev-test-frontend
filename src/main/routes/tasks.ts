import axios, { isAxiosError } from 'axios';
import config from 'config';
import { Application, Request, Response } from 'express';

const API_BASE_URL = config.has('api.baseUrl') ? config.get<string>('api.baseUrl') : 'http://localhost:4000';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDateTime: string;
  createdAt: string;
  updatedAt: string;
  overdue: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface PaginatedData {
  items: Task[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Helper function to format date for display
function formatDate(dateString: string | undefined): string {
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
}

// Helper function to format date for datetime-local input
function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
}

// Helper function to get status display text
function getStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return statusMap[status] || status;
}

// Helper function to get priority display text
function getPriorityDisplay(priority: string): string {
  const priorityMap: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return priorityMap[priority] || priority;
}

// Helper function to get status tag color
function getStatusTagColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: 'govuk-tag--grey',
    IN_PROGRESS: 'govuk-tag--blue',
    COMPLETED: 'govuk-tag--green',
    CANCELLED: 'govuk-tag--red',
  };
  return colorMap[status] || '';
}

// Helper function to get priority tag color
function getPriorityTagColor(priority: string): string {
  const colorMap: Record<string, string> = {
    LOW: 'govuk-tag--grey',
    MEDIUM: 'govuk-tag--yellow',
    HIGH: 'govuk-tag--orange',
    URGENT: 'govuk-tag--red',
  };
  return colorMap[priority] || '';
}

export default function (app: Application): void {
  // Task list page
  app.get('/tasks', async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 10;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const search = req.query.search as string;

      let url = `${API_BASE_URL}/api/v1/tasks?page=${page}&size=${size}`;
      if (status) {
        url += `&status=${status}`;
      }
      if (priority) {
        url += `&priority=${priority}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get<ApiResponse<PaginatedData>>(url);
      const apiData = response.data.data;

      const tasks = apiData.items.map(task => ({
        ...task,
        formattedDueDate: formatDate(task.dueDateTime),
        formattedCreatedAt: formatDate(task.createdAt),
        statusDisplay: getStatusDisplay(task.status),
        priorityDisplay: getPriorityDisplay(task.priority),
        statusTagColor: getStatusTagColor(task.status),
        priorityTagColor: getPriorityTagColor(task.priority),
      }));

      res.render('tasks/list', {
        tasks,
        pagination: {
          currentPage: apiData.page,
          totalPages: apiData.totalPages,
          totalElements: apiData.totalElements,
          size: apiData.size,
          hasNext: apiData.hasNext,
          hasPrevious: apiData.hasPrevious,
        },
        filters: {
          status: status || '',
          priority: priority || '',
          search: search || '',
        },
        success: req.query.success,
        error: req.query.error,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.render('tasks/list', {
        tasks: [],
        pagination: { currentPage: 0, totalPages: 0, totalElements: 0, size: 10, hasNext: false, hasPrevious: false },
        filters: { status: '', priority: '', search: '' },
        error: 'Failed to load tasks. Please try again later.',
      });
    }
  });

  // Create task page
  app.get('/tasks/create', (req: Request, res: Response) => {
    res.render('tasks/form', {
      task: null,
      isEdit: false,
      error: req.query.error,
    });
  });

  // Create task handler
  app.post('/tasks/create', async (req: Request, res: Response) => {
    try {
      const { title, description, dueDateTime, priority } = req.body;

      if (!title || !title.trim()) {
        return res.render('tasks/form', {
          task: req.body,
          isEdit: false,
          error: 'Title is required',
        });
      }

      if (!dueDateTime) {
        return res.render('tasks/form', {
          task: req.body,
          isEdit: false,
          error: 'Due date and time is required',
        });
      }

      const taskData = {
        title: title.trim(),
        description: description?.trim() || null,
        dueDateTime,
        priority: priority || 'MEDIUM',
      };

      await axios.post(`${API_BASE_URL}/api/v1/tasks`, taskData);
      res.redirect('/tasks?success=created');
    } catch (error: unknown) {
      console.error('Error creating task:', error);
      let errorMessage = 'Failed to create task. Please try again.';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      res.render('tasks/form', {
        task: req.body,
        isEdit: false,
        error: errorMessage,
      });
    }
  });

  // Task detail page
  app.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await axios.get<ApiResponse<Task>>(`${API_BASE_URL}/api/v1/tasks/${id}`);
      const taskData = response.data.data;

      const task = {
        ...taskData,
        formattedDueDate: formatDate(taskData.dueDateTime),
        formattedCreatedAt: formatDate(taskData.createdAt),
        formattedUpdatedAt: formatDate(taskData.updatedAt),
        statusDisplay: getStatusDisplay(taskData.status),
        priorityDisplay: getPriorityDisplay(taskData.priority),
        statusTagColor: getStatusTagColor(taskData.status),
        priorityTagColor: getPriorityTagColor(taskData.priority),
      };

      res.render('tasks/detail', {
        task,
        success: req.query.success,
        error: req.query.error,
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.redirect('/tasks?error=not-found');
    }
  });

  // Edit task page
  app.get('/tasks/:id/edit', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await axios.get<ApiResponse<Task>>(`${API_BASE_URL}/api/v1/tasks/${id}`);
      const taskData = response.data.data;

      const task = {
        ...taskData,
        dueDateTimeForInput: formatDateForInput(taskData.dueDateTime),
      };

      res.render('tasks/form', {
        task,
        isEdit: true,
        error: req.query.error,
      });
    } catch (error) {
      console.error('Error fetching task for edit:', error);
      res.redirect('/tasks?error=not-found');
    }
  });

  // Update task handler
  app.post('/tasks/:id/edit', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, dueDateTime, priority, status } = req.body;

      if (!title || !title.trim()) {
        return res.render('tasks/form', {
          task: { ...req.body, id },
          isEdit: true,
          error: 'Title is required',
        });
      }

      if (!dueDateTime) {
        return res.render('tasks/form', {
          task: { ...req.body, id },
          isEdit: true,
          error: 'Due date and time is required',
        });
      }

      const taskData = {
        title: title.trim(),
        description: description?.trim() || null,
        dueDateTime,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
      };

      await axios.put(`${API_BASE_URL}/api/v1/tasks/${id}`, taskData);
      res.redirect(`/tasks/${id}?success=updated`);
    } catch (error: unknown) {
      console.error('Error updating task:', error);
      let errorMessage = 'Failed to update task. Please try again.';
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      res.render('tasks/form', {
        task: { ...req.body, id: req.params.id },
        isEdit: true,
        error: errorMessage,
      });
    }
  });

  // Update task status (quick action)
  app.post('/tasks/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await axios.patch(`${API_BASE_URL}/api/v1/tasks/${id}/status`, { status });
      res.redirect(`/tasks/${id}?success=status-updated`);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.redirect(`/tasks/${req.params.id}?error=status-update-failed`);
    }
  });

  // Delete task confirmation page
  app.get('/tasks/:id/delete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await axios.get<ApiResponse<Task>>(`${API_BASE_URL}/api/v1/tasks/${id}`);
      const taskData = response.data.data;

      const task = {
        ...taskData,
        statusDisplay: getStatusDisplay(taskData.status),
        priorityDisplay: getPriorityDisplay(taskData.priority),
      };

      res.render('tasks/delete-confirm', { task });
    } catch (error) {
      console.error('Error fetching task for delete:', error);
      res.redirect('/tasks?error=not-found');
    }
  });

  // Delete task handler
  app.post('/tasks/:id/delete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await axios.delete(`${API_BASE_URL}/api/v1/tasks/${id}`);
      res.redirect('/tasks?success=deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      res.redirect('/tasks?error=delete-failed');
    }
  });
}
