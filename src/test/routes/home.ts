import { expect } from 'chai';
import request from 'supertest';

import { app } from '../../main/app';

/* eslint-disable jest/expect-expect */
describe('Home page', () => {
  describe('on GET /', () => {
    test('should return home page with 200 status', async () => {
      await request(app)
        .get('/')
        .expect(res => expect(res.status).to.equal(200));
    });

    test('should display service title', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Task Management Service');
    });

    test('should display service description', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('task management application');
    });

    test('should display "What you can do" section', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('What you can do');
    });

    test('should list task creation feature', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Create new tasks');
    });

    test('should list filtering by status feature', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Filter tasks by status');
      expect(response.text).to.contain('Cancelled');
    });

    test('should list filtering by priority feature', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Filter tasks by priority');
      expect(response.text).to.contain('Urgent');
    });

    test('should display "Get started" section', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Get started');
    });

    test('should display "View all tasks" button', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('View all tasks');
    });

    test('should display "Create a new task" button', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Create a new task');
    });

    test('should link to tasks page', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('href="/tasks"');
    });

    test('should link to create task page', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('href="/tasks/create"');
    });

    test('should display task statuses sidebar', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Task statuses');
      expect(response.text).to.contain('Pending');
      expect(response.text).to.contain('In Progress');
      expect(response.text).to.contain('Completed');
      expect(response.text).to.contain('Cancelled');
    });

    test('should display priority levels sidebar', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('Priority levels');
      expect(response.text).to.contain('Low');
      expect(response.text).to.contain('Medium');
      expect(response.text).to.contain('High');
      expect(response.text).to.contain('Urgent');
    });

    test('should use GOV.UK Design System components', async () => {
      const response = await request(app).get('/');
      expect(response.text).to.contain('govuk-');
    });
  });
});
