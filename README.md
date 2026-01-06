# HMCTS Task Management Frontend

A GOV.UK Design System compliant frontend application for managing tasks. Built with Express.js, Nunjucks templating, and TypeScript.

## Features

- **Task Management**: Create, view, edit, and delete tasks
- **Status Tracking**: Track tasks through Pending, In Progress, Completed, and Cancelled states
- **Priority Levels**: Assign Low, Medium, High, or Urgent priority to tasks
- **Filtering**: Filter tasks by status and priority
- **Pagination**: Navigate through large task lists
- **Quick Actions**: Update task status directly from the detail page
- **GOV.UK Styling**: Fully compliant with GOV.UK Design System

## Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on `http://localhost:4000` (see [hmcts-dev-test-backend](https://github.com/hokagedami/hmcts-dev-test-backend))

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run start:dev
```

The application will be available at `http://localhost:3100`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── main/
│   ├── routes/           # Express route handlers
│   │   ├── home.ts       # Home page route
│   │   └── tasks.ts      # Task CRUD routes
│   ├── views/            # Nunjucks templates
│   │   ├── tasks/        # Task-related views
│   │   │   ├── list.njk          # Task list page
│   │   │   ├── detail.njk        # Task detail page
│   │   │   ├── form.njk          # Create/Edit form
│   │   │   └── delete-confirm.njk # Delete confirmation
│   │   ├── home.njk      # Home page
│   │   └── template.njk  # Base template
│   ├── app.ts            # Express application setup
│   └── server.ts         # Server entry point
├── test/
│   ├── unit/             # Unit tests
│   ├── routes/           # Integration tests
│   ├── functional/       # E2E tests (CodeceptJS)
│   └── steps/            # Step definitions
└── config/               # Configuration files
```

## API Integration

The frontend connects to a backend API at `http://localhost:4000/api/v1/tasks`. The API base URL can be configured via:

- Environment variable: `API_BASE_URL`
- Config file: `config/default.json`

### API Endpoints Used

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/api/v1/tasks`            | List tasks with pagination and filters |
| POST   | `/api/v1/tasks`            | Create a new task                      |
| GET    | `/api/v1/tasks/:id`        | Get task details                       |
| PUT    | `/api/v1/tasks/:id`        | Update a task                          |
| PATCH  | `/api/v1/tasks/:id/status` | Update task status                     |
| DELETE | `/api/v1/tasks/:id`        | Delete a task                          |

## Testing

### Run All Tests

```bash
npm test
```

### Unit Tests

```bash
npm run test:unit
```

Tests helper functions for date formatting, status/priority display, and tag colors.

### Integration Tests

```bash
npm run test:routes
```

Tests all route handlers with mocked API responses.

### E2E Tests

```bash
npm run test:e2e
```

Runs end-to-end tests using CodeceptJS with Playwright. Requires the application and backend API to be running.

### Test Coverage

- **Unit Tests**: 33 tests covering all helper functions
- **Integration Tests**: 72 tests covering all routes and edge cases
- **E2E Tests**: 40 scenarios covering complete user journeys

## Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm start`           | Start production server                  |
| `npm run start:dev`   | Start development server with hot reload |
| `npm run build`       | Build for production                     |
| `npm test`            | Run all tests                            |
| `npm run test:unit`   | Run unit tests                           |
| `npm run test:routes` | Run integration tests                    |
| `npm run test:e2e`    | Run E2E tests                            |
| `npm run lint`        | Run ESLint                               |

## Configuration

### Environment Variables

| Variable       | Default                 | Description      |
| -------------- | ----------------------- | ---------------- |
| `PORT`         | `3100`                  | Server port      |
| `API_BASE_URL` | `http://localhost:4000` | Backend API URL  |
| `NODE_ENV`     | `development`           | Environment mode |

### Config Files

- `config/default.json` - Default configuration
- `config/production.json` - Production overrides
- `config/test.json` - Test environment configuration

## Task Statuses

| Status      | Description                    | Tag Color |
| ----------- | ------------------------------ | --------- |
| PENDING     | Task waiting to be started     | Grey      |
| IN_PROGRESS | Task currently being worked on | Blue      |
| COMPLETED   | Task finished                  | Green     |
| CANCELLED   | Task cancelled                 | Red       |

## Priority Levels

| Priority | Description                   | Tag Color |
| -------- | ----------------------------- | --------- |
| LOW      | Can be done when time permits | Grey      |
| MEDIUM   | Should be done soon           | Yellow    |
| HIGH     | Needs attention soon          | Orange    |
| URGENT   | Needs immediate attention     | Red       |

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Templating**: Nunjucks
- **Styling**: GOV.UK Frontend
- **HTTP Client**: Axios
- **Testing**: Jest, CodeceptJS, Playwright
- **Linting**: ESLint

## Browser Support

This application follows GOV.UK browser support guidelines and works in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11

## License

MIT
