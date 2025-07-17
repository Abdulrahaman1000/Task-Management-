#  Task Manager App

A full-stack task manager built with **React**, **Supabase**, and **Edge Functions**. 
Users can create, update, delete, and filter tasks with real-time updates and analytics.


##  Setup Instructions

1. Clone the repo:
bash
git clone https://github.com/Abdulrahaman1000/Task-Management-.git
cd task-manager-app



2. Install dependencies
npm install

3. Setup environment variables:
 Create a .env file:

 4. Run the app
 -npm run dev


 Supabase Schema
 | Column | Type | Notes         |
| ------ | ---- | ------------- |
| id     | UUID | Primary key   |
| email  | Text | Supabase auth |


tasks

| Column      | Type      | Notes                                             |
| ----------- | --------- | ------------------------------------------------- |
| id          | UUID      | Primary key                                       |
| user\_id    | UUID      | Foreign key to `users.id`                         |
| title       | Text      | Task title                                        |
| description | Text      | Task description                                  |
| status      | Text      | `pending`, `in-progress`, `done`                  |
| created\_at | Timestamp | Auto-generated                                    |
| extras      | JSONB     | `{ "priority": "high", "dueDate": "2025-07-20" }` |



What I'd Build Next If I Had More Time:

1. Task sorting by due date or priority
2. Notifications for upcoming deadlines
3. Better error handling & loading states
4. arranging my codes into proper conponents 