import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import request from 'supertest';

import { app } from '../../main/app';

const mock = new MockAdapter(axios);

const mockTask = {
  id: 123,
  title: 'Test Task',
  description: 'Test Description',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDateTime: '2024-12-25T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  overdue: false,
};

const mockTaskCompleted = {
  ...mockTask,
  id: 456,
  status: 'COMPLETED',
};

const mockTaskInProgress = {
  ...mockTask,
  id: 789,
  status: 'IN_PROGRESS',
};

// Wrapped API response for single task
const mockTaskResponse = {
  success: true,
  message: 'Task retrieved successfully',
  data: mockTask,
  timestamp: '2024-01-01T00:00:00Z',
};

// Wrapped API response for paginated tasks
const mockTasksResponse = {
  success: true,
  message: 'Tasks retrieved successfully',
  data: {
    items: [mockTask],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  },
  timestamp: '2024-01-01T00:00:00Z',
};

// Empty tasks response
const mockEmptyTasksResponse = {
  success: true,
  message: 'Tasks retrieved successfully',
  data: {
    items: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  },
  timestamp: '2024-01-01T00:00:00Z',
};

// Multi-page tasks response
const mockMultiPageTasksResponse = {
  success: true,
  message: 'Tasks retrieved successfully',
  data: {
    items: [mockTask, mockTaskCompleted, mockTaskInProgress],
    page: 0,
    size: 10,
    totalElements: 25,
    totalPages: 3,
    first: true,
    last: false,
    hasNext: true,
    hasPrevious: false,
  },
  timestamp: '2024-01-01T00:00:00Z',
};

describe('Task Routes', () => {
  beforeEach(() => {
    mock.reset();
  });

  // =====================
  // TASK LIST TESTS
  // =====================

  describe('GET /tasks', () => {
    it('should render task list page', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Tasks');
    });

    it('should display tasks in the list', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Task');
    });

    it('should handle empty task list', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockEmptyTasksResponse);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.text).toContain('No tasks found');
    });

    it('should handle API error gracefully', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(500);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Tasks');
    });

    it('should pass status filter parameter to API', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*status=PENDING/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?status=PENDING');

      expect(response.status).toBe(200);
    });

    it('should pass priority filter parameter to API', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*priority=HIGH/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?priority=HIGH');

      expect(response.status).toBe(200);
    });

    it('should pass search parameter to API', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*search=test/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?search=test');

      expect(response.status).toBe(200);
    });

    it('should pass page parameter to API', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*page=1/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?page=1');

      expect(response.status).toBe(200);
    });

    it('should pass size parameter to API', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*size=20/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?size=20');

      expect(response.status).toBe(200);
    });

    it('should display success message for created task', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?success=created');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task created successfully');
    });

    it('should display success message for deleted task', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?success=deleted');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task deleted successfully');
    });

    it('should display pagination for multiple pages', async () => {
      mock.onGet(/\/api\/v1\/tasks\?/).reply(200, mockMultiPageTasksResponse);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Next');
    });

    it('should combine multiple filter parameters', async () => {
      mock.onGet(/\/api\/v1\/tasks\?.*status=PENDING.*priority=HIGH/).reply(200, mockTasksResponse);

      const response = await request(app).get('/tasks?status=PENDING&priority=HIGH');

      expect(response.status).toBe(200);
    });
  });

  // =====================
  // CREATE TASK TESTS
  // =====================

  describe('GET /tasks/create', () => {
    it('should render create task form', async () => {
      const response = await request(app).get('/tasks/create');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Create Task');
    });

    it('should display form fields', async () => {
      const response = await request(app).get('/tasks/create');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Title');
      expect(response.text).toContain('Description');
      expect(response.text).toContain('Priority');
    });

    it('should display priority options', async () => {
      const response = await request(app).get('/tasks/create');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Low');
      expect(response.text).toContain('Medium');
      expect(response.text).toContain('High');
      expect(response.text).toContain('Urgent');
    });
  });

  describe('POST /tasks/create', () => {
    it('should create a new task and redirect', async () => {
      mock.onPost(/\/api\/v1\/tasks$/).reply(201, mockTaskResponse);

      const response = await request(app).post('/tasks/create').send({
        title: 'New Task',
        description: 'Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?success=created');
    });

    it('should create task with default priority', async () => {
      mock.onPost(/\/api\/v1\/tasks$/).reply(201, mockTaskResponse);

      const response = await request(app).post('/tasks/create').send({
        title: 'New Task',
        dueDateTime: '2024-12-25T10:00',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?success=created');
    });

    it('should show error when title is missing', async () => {
      const response = await request(app).post('/tasks/create').send({
        description: 'Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Title is required');
    });

    it('should show error when title is empty', async () => {
      const response = await request(app).post('/tasks/create').send({
        title: '   ',
        description: 'Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Title is required');
    });

    it('should show error when dueDateTime is missing', async () => {
      const response = await request(app).post('/tasks/create').send({
        title: 'New Task',
        description: 'Description',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Due date and time is required');
    });

    it('should handle API error on create', async () => {
      mock.onPost(/\/api\/v1\/tasks$/).reply(500);

      const response = await request(app).post('/tasks/create').send({
        title: 'New Task',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to create task');
    });

    it('should display API error message when provided', async () => {
      mock.onPost(/\/api\/v1\/tasks$/).reply(400, {
        success: false,
        message: 'Due date must be in the future',
      });

      const response = await request(app).post('/tasks/create').send({
        title: 'New Task',
        dueDateTime: '2020-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Due date must be in the future');
    });

    it('should preserve form data on error', async () => {
      const response = await request(app).post('/tasks/create').send({
        title: '',
        description: 'Test Description',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Description');
    });
  });

  // =====================
  // VIEW TASK TESTS
  // =====================

  describe('GET /tasks/:id', () => {
    it('should render task detail page', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Task');
    });

    it('should display task description', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Description');
    });

    it('should display formatted status', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Pending');
    });

    it('should display formatted priority', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Medium');
    });

    it('should display quick status update buttons', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Quick status update');
    });

    it('should redirect on task not found', async () => {
      mock.onGet(/\/api\/v1\/tasks\/999$/).reply(404);

      const response = await request(app).get('/tasks/999');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?error=not-found');
    });

    it('should display success message after update', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123?success=updated');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task updated successfully');
    });

    it('should display success message after status update', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123?success=status-updated');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task status updated successfully');
    });

    it('should display error message for failed status update', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123?error=status-update-failed');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to update task status');
    });
  });

  // =====================
  // EDIT TASK TESTS
  // =====================

  describe('GET /tasks/:id/edit', () => {
    it('should render edit task form', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/edit');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Edit Task');
      expect(response.text).toContain('Test Task');
    });

    it('should display status field in edit form', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/edit');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Status');
    });

    it('should display all status options', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/edit');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Pending');
      expect(response.text).toContain('In Progress');
      expect(response.text).toContain('Completed');
      expect(response.text).toContain('Cancelled');
    });

    it('should redirect on task not found', async () => {
      mock.onGet(/\/api\/v1\/tasks\/999$/).reply(404);

      const response = await request(app).get('/tasks/999/edit');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?error=not-found');
    });
  });

  describe('POST /tasks/:id/edit', () => {
    it('should update task and redirect', async () => {
      mock.onPut(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).post('/tasks/123/edit').send({
        title: 'Updated Task',
        description: 'Updated Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=updated');
    });

    it('should update task with default status', async () => {
      mock.onPut(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).post('/tasks/123/edit').send({
        title: 'Updated Task',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=updated');
    });

    it('should show error when title is missing on update', async () => {
      const response = await request(app).post('/tasks/123/edit').send({
        description: 'Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Title is required');
    });

    it('should show error when title is empty on update', async () => {
      const response = await request(app).post('/tasks/123/edit').send({
        title: '   ',
        description: 'Description',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Title is required');
    });

    it('should show error when dueDateTime is missing on update', async () => {
      const response = await request(app).post('/tasks/123/edit').send({
        title: 'Updated Task',
        description: 'Description',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Due date and time is required');
    });

    it('should handle API error on update', async () => {
      mock.onPut(/\/api\/v1\/tasks\/123$/).reply(500);

      const response = await request(app).post('/tasks/123/edit').send({
        title: 'Updated Task',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to update task');
    });

    it('should display API error message when provided on update', async () => {
      mock.onPut(/\/api\/v1\/tasks\/123$/).reply(400, {
        success: false,
        message: 'Invalid status transition',
      });

      const response = await request(app).post('/tasks/123/edit').send({
        title: 'Updated Task',
        dueDateTime: '2024-12-25T10:00',
        priority: 'HIGH',
        status: 'COMPLETED',
      });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Invalid status transition');
    });
  });

  // =====================
  // STATUS UPDATE TESTS
  // =====================

  describe('POST /tasks/:id/status', () => {
    it('should update task status to COMPLETED and redirect', async () => {
      mock.onPatch(/\/api\/v1\/tasks\/123\/status$/).reply(200, {
        ...mockTaskResponse,
        data: { ...mockTask, status: 'COMPLETED' },
      });

      const response = await request(app).post('/tasks/123/status').send({
        status: 'COMPLETED',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=status-updated');
    });

    it('should update task status to IN_PROGRESS', async () => {
      mock.onPatch(/\/api\/v1\/tasks\/123\/status$/).reply(200, {
        ...mockTaskResponse,
        data: { ...mockTask, status: 'IN_PROGRESS' },
      });

      const response = await request(app).post('/tasks/123/status').send({
        status: 'IN_PROGRESS',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=status-updated');
    });

    it('should update task status to CANCELLED', async () => {
      mock.onPatch(/\/api\/v1\/tasks\/123\/status$/).reply(200, {
        ...mockTaskResponse,
        data: { ...mockTask, status: 'CANCELLED' },
      });

      const response = await request(app).post('/tasks/123/status').send({
        status: 'CANCELLED',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=status-updated');
    });

    it('should update task status to PENDING', async () => {
      mock.onPatch(/\/api\/v1\/tasks\/123\/status$/).reply(200, {
        ...mockTaskResponse,
        data: { ...mockTask, status: 'PENDING' },
      });

      const response = await request(app).post('/tasks/123/status').send({
        status: 'PENDING',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?success=status-updated');
    });

    it('should handle error on status update', async () => {
      mock.onPatch(/\/api\/v1\/tasks\/123\/status$/).reply(500);

      const response = await request(app).post('/tasks/123/status').send({
        status: 'COMPLETED',
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks/123?error=status-update-failed');
    });
  });

  // =====================
  // DELETE CONFIRMATION TESTS
  // =====================

  describe('GET /tasks/:id/delete', () => {
    it('should render delete confirmation page', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/delete');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Are you sure you want to delete this task?');
      expect(response.text).toContain('Test Task');
    });

    it('should display warning message', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/delete');

      expect(response.status).toBe(200);
      expect(response.text).toContain('cannot be undone');
    });

    it('should display task details on confirmation page', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/delete');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task details');
      expect(response.text).toContain('Pending');
      expect(response.text).toContain('Medium');
    });

    it('should display cancel button', async () => {
      mock.onGet(/\/api\/v1\/tasks\/123$/).reply(200, mockTaskResponse);

      const response = await request(app).get('/tasks/123/delete');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Cancel');
    });

    it('should redirect on task not found', async () => {
      mock.onGet(/\/api\/v1\/tasks\/999$/).reply(404);

      const response = await request(app).get('/tasks/999/delete');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?error=not-found');
    });
  });

  // =====================
  // DELETE TASK TESTS
  // =====================

  describe('POST /tasks/:id/delete', () => {
    it('should delete task and redirect', async () => {
      mock.onDelete(/\/api\/v1\/tasks\/123$/).reply(204);

      const response = await request(app).post('/tasks/123/delete');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?success=deleted');
    });

    it('should handle error on delete', async () => {
      mock.onDelete(/\/api\/v1\/tasks\/123$/).reply(500);

      const response = await request(app).post('/tasks/123/delete');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?error=delete-failed');
    });

    it('should handle 404 on delete', async () => {
      mock.onDelete(/\/api\/v1\/tasks\/999$/).reply(404);

      const response = await request(app).post('/tasks/999/delete');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/tasks?error=delete-failed');
    });
  });
});
