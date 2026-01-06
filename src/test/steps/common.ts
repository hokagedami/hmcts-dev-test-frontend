import { config as testConfig } from '../config';

const { I } = inject();

// =====================
// NAVIGATION STEPS
// =====================

export const iAmOnPage = (text: string): void => {
  const url = new URL(text, testConfig.TEST_URL);
  if (!url.searchParams.has('lng')) {
    url.searchParams.set('lng', 'en');
  }
  I.amOnPage(url.toString());
};
Given('I go to {string}', iAmOnPage);

Then('the page URL should be {string}', (url: string) => {
  I.waitInUrl(url);
});

Then('the page URL should include {string}', (text: string) => {
  I.waitInUrl(text);
});

Then('the page URL should not include {string}', async (text: string) => {
  I.wait(1);
  const currentUrl = await I.grabCurrentUrl();
  if (currentUrl.includes(text)) {
    throw new Error(`URL should not include "${text}" but got "${currentUrl}"`);
  }
});

Then('the page should include {string}', (text: string) => {
  I.waitForText(text);
});

// =====================
// CLICK STEPS
// =====================

When('I click {string}', (text: string) => {
  I.click(text);
});

When('I click the delete link for the first task', () => {
  I.click('table.govuk-table tbody tr:first-child td:last-child a:last-child');
});

// =====================
// FORM STEPS
// =====================

When('I fill {string} with {string}', (field: string, value: string) => {
  I.fillField(field, value);
});

When('I fill the title field with {string}', (value: string) => {
  I.fillField('title', value);
});

When('I clear and fill the title field with {string}', (value: string) => {
  I.clearField('title');
  if (value) {
    I.fillField('title', value);
  }
});

When('I fill the description field with {string}', (value: string) => {
  I.fillField('description', value);
});

When('I fill datetime {string} with future date', (field: string) => {
  // Generate a future date (7 days from now)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const formattedDate = futureDate.toISOString().slice(0, 16);
  I.fillField(field, formattedDate);
});

When('I select {string} from {string}', (value: string, field: string) => {
  I.selectOption(field, value);
});

When('I select status {string}', (status: string) => {
  I.selectOption('status', status);
});

When('I select priority {string}', (priority: string) => {
  I.selectOption('priority', priority);
});

// =====================
// VISIBILITY STEPS
// =====================

Then('I should see task {string}', (title: string) => {
  I.see(title);
});

Then('I should not see task {string}', (title: string) => {
  I.dontSee(title);
});

Then('I should see filter option {string}', (option: string) => {
  I.see(option);
});

Then('I should see form option {string}', (option: string) => {
  I.see(option);
});

Then('I should see input value {string}', (value: string) => {
  I.seeInField('title', value);
});

Then('the page should include {string} if no tasks exist', async (text: string) => {
  // This is a conditional check - if no tasks, we should see the message
  // We use tryTo to handle both cases gracefully
  const hasNoTasks = await tryTo(() => I.see('No tasks found'));
  if (hasNoTasks) {
    I.see(text);
  }
});

// =====================
// TASK CRUD STEPS
// =====================

Given('a task exists', async () => {
  // Navigate to create task and create one for testing
  I.amOnPage(testConfig.TEST_URL + '/tasks/create?lng=en');
  I.fillField('title', 'E2E Test Task - ' + Date.now());
  I.fillField('description', 'Task created for e2e testing');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  I.fillField('dueDateTime', futureDate.toISOString().slice(0, 16));
  I.selectOption('priority', 'MEDIUM');
  I.click('Create task');
  I.waitInUrl('/tasks');
  // Store the task for later use - get it from the first link
  I.waitForElement('table.govuk-table a');
});

Given('a task exists with status {string}', async (status: string) => {
  // Create a task first
  I.amOnPage(testConfig.TEST_URL + '/tasks/create?lng=en');
  I.fillField('title', 'E2E Test Task - ' + Date.now());
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  I.fillField('dueDateTime', futureDate.toISOString().slice(0, 16));
  I.selectOption('priority', 'MEDIUM');
  I.click('Create task');
  I.waitInUrl('/tasks');

  // If status is not PENDING, we need to update it
  if (status !== 'PENDING') {
    // Click on the first task to go to detail
    I.click('table.govuk-table tbody tr:first-child a');
    I.waitForText('Quick status update');

    if (status === 'IN_PROGRESS') {
      I.click('Start Task');
      I.waitForText('In Progress');
    } else if (status === 'COMPLETED') {
      I.click('Start Task');
      I.waitForText('In Progress');
      I.click('Mark Complete');
      I.waitForText('Completed');
    } else if (status === 'CANCELLED') {
      I.click('Cancel Task');
      I.waitForText('Cancelled');
    }
  }
});

Given('a task exists with title {string}', async (title: string) => {
  I.amOnPage(testConfig.TEST_URL + '/tasks/create?lng=en');
  I.fillField('title', title);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  I.fillField('dueDateTime', futureDate.toISOString().slice(0, 16));
  I.selectOption('priority', 'MEDIUM');
  I.click('Create task');
  I.waitInUrl('/tasks');
});

When('I view the task detail page', () => {
  I.amOnPage(testConfig.TEST_URL + '/tasks?lng=en');
  I.waitForElement('table.govuk-table a');
  I.click('table.govuk-table tbody tr:first-child a');
  I.waitForText('Quick status update');
});

When('I view the task edit page', () => {
  I.amOnPage(testConfig.TEST_URL + '/tasks?lng=en');
  I.waitForElement('table.govuk-table a');
  I.click('table.govuk-table tbody tr:first-child td:last-child a:nth-child(2)');
  I.waitForText('Edit Task');
});

When('I view the task delete confirmation page', () => {
  I.amOnPage(testConfig.TEST_URL + '/tasks?lng=en');
  I.waitForElement('table.govuk-table a');
  // Click the Delete link (last link in actions column)
  I.click('table.govuk-table tbody tr:first-child td:last-child a:last-child');
  I.waitForText('Are you sure you want to delete this task?');
});

When('I delete the task', () => {
  // Click delete link in the first row to go to confirmation page
  I.click('table.govuk-table tbody tr:first-child td:last-child a:last-child');
  I.waitForText('Are you sure you want to delete this task?');
  // Confirm deletion
  I.click('Delete task');
});
