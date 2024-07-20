
# Task Management Dashboard

This is a task management dashboard built using React, Node.js, Express.js, MongoDB, and Socket.io. The dashboard allows users to create, update, delete, and manage tasks with real-time updates.
## Tech Stack

**Client:** React, Clerk , Socket.io, TailwindCSS

**Server:** Node, Express, MongoDB, Socket.io


## Features

- Real-time task updates using Socket.io

- Authentication with Clerk
- Role-based permissions (viewer, collaborator, creator)
- Task priority and status management
- Search and filter tasks by name, description, status, priority, due date, or collaborators

## Table of Contents

- Installation
- Usage
- Features
- Project Structure
- Contributing
- License

# Installation

Follow these steps to set up the project locally.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Clerk account for authentication
- Git


## Clone the Repository

To deploy this project run

```bash
  git clone https://github.com/praharshsharma/task-manager.git
  cd task-manager
```

## For Server
```bash
  cd backend
  npm i
```

## MongoDB Url
Add your mongodb cluster link in database/db.js
or in env file 

```makefile
  mongoose.connect("YOUR_URL");
```

## Start the Backend Server
```bash
npm run dev
```

## For Client
```bash
  cd frontend
  npm i
```

## Environment Variables
Create a .env.local file in the root directory and add the following environment variables:

```makefile
  VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

## Update API Endpoint
Ensure that your frontend code points to the local backend server for development. Update the API endpoint in your frontend code as follows:

## Replace all:

```javascript
"https://tasks-backend-host.onrender.com/";

```

## With 

```javascript
"http://localhost:3000/";

```

## Start the Frontend Server
```bash
npm run dev
```

# Usage
## Authentication
The dashboard uses Clerk for authentication. Users need to sign up or log in to access the dashboard.

## Task Management
- **Add Task:** Click on the "Add Task" button to open the task creation form. Fill in the details and assign the task to users. Multiple users can be selected for assignment.
- **View Tasks:** Tasks are displayed in a grid format, sorted by priority. Users can see tasks assigned to them and tasks they have created.
- **Update Task:** Change the priority and status of tasks using the dropdown menus.
- **Delete Task:** Click the "Delete" button to remove a task.
- **Search and Filters:** Use the search bar and filters to find tasks by name, description, status, priority, due date, or collaborators.
# Tasks-Management-System
# Tasks-Management-System
