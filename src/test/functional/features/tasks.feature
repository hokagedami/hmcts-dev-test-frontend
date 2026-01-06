@tasks
Feature: Task Management
  As a user
  I want to manage tasks
  So that I can track my work

  # =====================
  # HOME PAGE SCENARIOS
  # =====================

  @home
  Scenario: View home page
    Given I go to "/"
    Then the page should include "Task Management Service"

  @home
  Scenario: Home page shows features list
    Given I go to "/"
    Then the page should include "What you can do"
    And the page should include "Create new tasks"

  @home
  Scenario: Home page shows task statuses
    Given I go to "/"
    Then the page should include "Task statuses"
    And the page should include "Pending"
    And the page should include "In Progress"
    And the page should include "Completed"
    And the page should include "Cancelled"

  @home
  Scenario: Home page shows priority levels
    Given I go to "/"
    Then the page should include "Priority levels"
    And the page should include "Low"
    And the page should include "Medium"
    And the page should include "High"
    And the page should include "Urgent"

  # =====================
  # TASK LIST SCENARIOS
  # =====================

  @task-list
  Scenario: View task list page
    Given I go to "/tasks"
    Then the page should include "Tasks"

  @task-list @filters
  Scenario: Filter options are available
    Given I go to "/tasks"
    Then I should see filter option "All statuses"
    And I should see filter option "All priorities"

  @task-list
  Scenario: Create task button is visible
    Given I go to "/tasks"
    Then the page should include "Create task"

  @task-list
  Scenario: Status filter shows all options
    Given I go to "/tasks"
    Then I should see filter option "Pending"
    And I should see filter option "In Progress"
    And I should see filter option "Completed"
    And I should see filter option "Cancelled"

  @task-list
  Scenario: Priority filter shows all options
    Given I go to "/tasks"
    Then I should see filter option "Low"
    And I should see filter option "Medium"
    And I should see filter option "High"
    And I should see filter option "Urgent"

  # =====================
  # CREATE TASK SCENARIOS
  # =====================

  @task-create
  Scenario: View create task form
    Given I go to "/tasks/create"
    Then the page should include "Create Task"
    And I should see form option "Title"
    And I should see form option "Description"
    And I should see form option "Priority"

  @task-create
  Scenario: Create task form shows priority options
    Given I go to "/tasks/create"
    Then I should see form option "Low"
    And I should see form option "Medium"
    And I should see form option "High"
    And I should see form option "Urgent"

  @task-create
  Scenario: Create a new task successfully
    Given I go to "/tasks/create"
    When I fill the title field with "E2E Test Task"
    And I fill the description field with "This is a test task created by e2e tests"
    And I fill datetime "dueDateTime" with future date
    And I select priority "HIGH"
    And I click "Create task"
    Then the page URL should include "/tasks"

  @task-create
  Scenario: Create task with minimum required fields
    Given I go to "/tasks/create"
    When I fill the title field with "Minimal Task"
    And I fill datetime "dueDateTime" with future date
    And I click "Create task"
    Then the page URL should include "/tasks"

  @task-create @validation
  Scenario: Cannot create task without title
    Given I go to "/tasks/create"
    When I fill the description field with "Description only"
    And I fill datetime "dueDateTime" with future date
    And I click "Create task"
    Then the page should include "Title is required"

  @task-create @validation
  Scenario: Cannot create task without due date
    Given I go to "/tasks/create"
    When I fill the title field with "Task without due date"
    And I click "Create task"
    Then the page should include "Due date and time is required"

  # =====================
  # VIEW TASK SCENARIOS
  # =====================

  @task-view
  Scenario: View task details
    Given a task exists
    When I view the task detail page
    Then the page should include "Quick status update"

  @task-view
  Scenario: Task detail shows action buttons
    Given a task exists
    When I view the task detail page
    Then the page should include "Edit task"
    And the page should include "Delete task"

  @task-view
  Scenario: Task detail shows status update buttons
    Given a task exists
    When I view the task detail page
    Then the page should include "Start Task"
    And the page should include "Mark Complete"
    And the page should include "Cancel Task"

  @task-view
  Scenario: Task detail shows task information
    Given a task exists
    When I view the task detail page
    Then the page should include "Status"
    And the page should include "Priority"
    And the page should include "Due Date"
    And the page should include "Created"

  # =====================
  # EDIT TASK SCENARIOS
  # =====================

  @task-edit
  Scenario: View edit task form
    Given a task exists
    When I view the task edit page
    Then the page should include "Edit Task"
    And the page should include "Status"

  @task-edit
  Scenario: Edit form shows status options
    Given a task exists
    When I view the task edit page
    Then I should see form option "Pending"
    And I should see form option "In Progress"
    And I should see form option "Completed"
    And I should see form option "Cancelled"

  @task-edit
  Scenario: Edit task successfully
    Given a task exists
    When I view the task edit page
    And I fill the title field with "Updated Task Title"
    And I click "Update task"
    Then the page URL should include "/tasks/"
    And the page should include "Task updated successfully"

  @task-edit @validation
  Scenario: Cannot update task without title
    Given a task exists
    When I view the task edit page
    And I clear and fill the title field with ""
    And I click "Update task"
    Then the page should include "Title is required"

  # =====================
  # STATUS UPDATE SCENARIOS
  # =====================

  @task-status
  Scenario: Start a pending task
    Given a task exists with status "PENDING"
    When I view the task detail page
    And I click "Start Task"
    Then the page should include "In Progress"

  @task-status
  Scenario: Complete an in-progress task
    Given a task exists with status "IN_PROGRESS"
    When I view the task detail page
    And I click "Mark Complete"
    Then the page should include "Completed"

  @task-status
  Scenario: Cancel a task
    Given a task exists with status "PENDING"
    When I view the task detail page
    And I click "Cancel Task"
    Then the page should include "Cancelled"

  @task-status
  Scenario: Mark completed task as pending
    Given a task exists with status "COMPLETED"
    When I view the task detail page
    And I click "Mark as Pending"
    Then the page should include "Pending"

  # =====================
  # DELETE TASK SCENARIOS
  # =====================

  @task-delete
  Scenario: View delete confirmation page
    Given a task exists with title "Task To Delete"
    When I go to "/tasks"
    And I click the delete link for the first task
    Then the page should include "Are you sure you want to delete this task?"
    And the page should include "Task To Delete"

  @task-delete
  Scenario: Delete confirmation shows warning
    Given a task exists
    When I view the task delete confirmation page
    Then the page should include "cannot be undone"

  @task-delete
  Scenario: Cancel delete returns to task
    Given a task exists
    When I view the task delete confirmation page
    And I click "Cancel"
    Then the page URL should include "/tasks/"

  @task-delete
  Scenario: Confirm delete removes task
    Given a task exists with title "Task To Delete Now"
    When I view the task delete confirmation page
    And I click "Delete task"
    Then the page should include "Task deleted successfully"

  # =====================
  # NAVIGATION SCENARIOS
  # =====================

  @navigation
  Scenario: Navigate from home to tasks
    Given I go to "/"
    When I click "View all tasks"
    Then the page URL should include "/tasks"

  @navigation
  Scenario: Navigate from home to create task
    Given I go to "/"
    When I click "Create a new task"
    Then the page URL should include "/tasks/create"

  @navigation
  Scenario: Navigate back from task detail
    Given a task exists
    When I view the task detail page
    And I click "Back to tasks"
    Then the page URL should be "/tasks"

  @navigation
  Scenario: Navigate back from create task
    Given I go to "/tasks/create"
    And I click "Back"
    Then the page URL should include "/tasks"

  @navigation
  Scenario: Navigate from task detail to edit
    Given a task exists
    When I view the task detail page
    And I click "Edit task"
    Then the page should include "Edit Task"

  # =====================
  # FILTER SCENARIOS
  # =====================

  @task-filter
  Scenario: Filter tasks by status
    Given a task exists with status "PENDING"
    When I go to "/tasks"
    And I select "Pending" from "status"
    And I click "Filter"
    Then the page URL should include "status=PENDING"

  @task-filter
  Scenario: Filter tasks by priority
    Given a task exists
    When I go to "/tasks"
    And I select "High" from "priority"
    And I click "Filter"
    Then the page URL should include "priority=HIGH"

  @task-filter
  Scenario: Filter by cancelled status
    Given I go to "/tasks"
    When I select "Cancelled" from "status"
    And I click "Filter"
    Then the page URL should include "status=CANCELLED"

  @task-filter
  Scenario: Filter by urgent priority
    Given I go to "/tasks"
    When I select "Urgent" from "priority"
    And I click "Filter"
    Then the page URL should include "priority=URGENT"

  @task-filter
  Scenario: Clear filters shows all tasks
    Given I go to "/tasks?status=PENDING"
    When I select "All statuses" from "status"
    And I click "Filter"
    Then the page URL should not include "status=PENDING"
