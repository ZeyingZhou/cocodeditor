# Project Proposal
Name: Zeying Zhou Student#: 1005172732
Name: Yuyu Ren    Student#: 1005521204


## Technologies

- [React](https://react.dev/): Frontend framework for building interactive and responsive user interfaces.
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework for styling the frontend.
- [ShadCN UI](https://ui.shadcn.com/): Component library built on Radix UI and Tailwind CSS for consistent UI components.
- [Express.js](https://expressjs.com/): Backend framework for building RESTful APIs.
- [Prisma](https://www.prisma.io/): ORM for managing database access and schema in PostgreSQL.
- [Supabase](https://supabase.com/): Backend-as-a-service providing PostgreSQL database, authentication, and cloud storage.
- [Socket.IO](https://socket.io/): Real-time communication library for bidirectional event-based communication (used for code sync & chat).
- [PostgreSQL](https://www.postgresql.org/): Relational database for storing users, projects, teams, files metadata.
- [Supabase Storage](https://supabase.com/docs/guides/storage): Cloud storage service for code files and user-uploaded assets.
- [Monaco Editor](https://microsoft.github.io/monaco-editor/): Code editor component for syntax highlighting and editing.
- [Redux Toolkit](https://redux-toolkit.js.org/): Modern, official, batteries-included toolset for efficient Redux development.
- [GitHub](https://github.com/): Version control and collaboration platform for source code management.
- [Postman](https://www.postman.com/): Tool for API testing and debugging.

## Motivation

With the increasing need of remote work and distributed development teams, real-time collaboration in coding has been considered as a powerful tool for development. Traditionally, most teams would choose git-based version control systems like GitHub to share code. For instance, a team member would push the updated code to GitHub.The changes would be managed through branches, commits, and pull requests. While Git is a powerful tool for asynchronous collaboration, it could reduce effiency and create technical barriers for collaboration. The process to update code, which was mentioned above, is always time consuming and lacks real-time feedback. And some users like students may struggle with setting up local environments. That's why we need a real-time coding collaboration platform for synchronous editing and debugging.

Developers such as software engineers and open-source contributors, they need to collaborate on code and review the changes in real time, and execute code without setup barriers. However, the existing popular tools such as:
:x: **Visual Studio Code Live Share**:  requires installation, is not web-based and lacks execution in cloud.
:x: **Google Colab**: lacks true real-time synchronization and multi-language support.
This project aims to build a cloud-based, real time collaboration coding platform that:

:white_check_mark: Provides real-time synchronization without delays or version conflicts.
:white_check_mark: Supports multi-language (JS, Python, C++).
:white_check_mark: Includes structured project management.
:white_check_mark: Reduce technical barriers.
:white_check_mark: Offers team communication through chat.

Compared to the traditional version control systems and existing coding collaboration tools, this platform will improve effiency and productivity, simplify process for users.

This platform is designed for the developers who need real-time collaboration. And the cloud-based application is friendly to users in all level. For example:
* **Open-source Contributors**
    * Collaborate without seperate branchs and version conflicts.
    * Work together in real-time environment, improving productivity.
* **Software Developement Teams**
    * Share and update code with clients instantly, achieving the requirements.
    * Simplify the test and debugging steps, improving efficiency.
* **Students**
    * Reduce technical barriers (environment setting up), allowing students to focus on learning.
    * Provide immediate feedback for classes and exercises.
    
In conclusion, this project is motivated by the growing demand for real-time and efficient coding collaboration. By combining cloud-based real-time reviewing and editing, chat function, and structured project management, this platform removes the challenges like inefficiency associated with traditional version control systems and existing coding collaboration tools, while enhancing team productivity. Developers can focus on coding and work rather than issues involving version conflicts and pull requests, making this platform be a powerful tool for software development.

## Objective and key features

Build a full-featured online code collaboration platform supporting real-time code editing, workspace and team management, syntax highlighting, and cloud-based storage, leveraging modern web technologies and real-time communication protocols.

---

### Core Features and Technical Implementation

| Feature                             | Technical Approach                                                                 |
|------------------------------------|------------------------------------------------------------------------------------|
| **User Authentication**            | Supabase Auth for sign-up/login, role-based access control                          |
| **Workspace Management**           | PostgreSQL (via Prisma) for storing projects, folders, files                        |
| **Real-time Code Editing**         | WebSockets using Socket.io for broadcasting code changes                            |
| **Syntax Highlighting**            | Monaco Editor or Prism.js with language support for JS, Python, C++                 |
| **Project Organization**           | Folder/file hierarchy in PostgreSQL; metadata stored in DB, files in Supabase Storage |
| **Team/Group Management**          | PostgreSQL relationships; role-based permissions (admin/member)                     |
| **Chat Functionality**             | WebSockets-based real-time chat per workspace                                       |
| **Code Snippet Saving/Sharing**    | CRUD APIs with shareable links to snippets or projects                              |
| **Theme Settings**                 | Redux Toolkit for frontend state, persisted in Supabase for user preferences              |

---

### Architecture Approach
- **Frontend:** React + Tailwind CSS + ShadCN UI
- **Backend:** Express.js REST API  
  - RESTful endpoints for all CRUD operations
  - WebSocket server for real-time code updates and chat
- **Database:** Supabase PostgreSQL accessed via Prisma ORM
- **Cloud Storage:** Supabase Storage for storing user code files

---

### Database Schema Overview
### Database Relational Schema Overview

| Table/Model   | Field         | Type        | Constraints / Relationship                                          |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **User**     | id           | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | email        | String     | Unique, Not Null                                                   |
|              | password     | String     | Not Null                                                           |
|              | name         | String     | Not Null                                                           |
|              | theme        | String     | Default: \"light\"                                                  |
|              | teams        | Relation   | One-to-Many relation to **TeamMember**                             |
|              | projects     | Relation   | One-to-Many relation to **Project**                                |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **Team**     | id           | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | name         | String     | Not Null                                                           |
|              | members      | Relation   | One-to-Many relation to **TeamMember**                             |
|              | projects     | Relation   | One-to-Many relation to **Project**                                |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **TeamMember**| id          | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | teamId       | UUID       | Foreign Key → Team(id)                                             |
|              | userId       | UUID       | Foreign Key → User(id)                                             |
|              | role         | String     | e.g., admin, member                                                |
|              | team         | Relation   | Many-to-One relation to **Team**                                   |
|              | user         | Relation   | Many-to-One relation to **User**                                   |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **Project**  | id           | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | name         | String     | Not Null                                                           |
|              | userId       | UUID       | Foreign Key → User(id)                                             |
|              | teamId       | UUID       | Optional Foreign Key → Team(id)                                    |
|              | folders      | Relation   | One-to-Many relation to **Folder**                                 |
|              | user         | Relation   | Many-to-One relation to **User**                                   |
|              | team         | Relation   | Many-to-One relation to **Team**                                   |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **Folder**   | id           | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | name         | String     | Not Null                                                           |
|              | projectId    | UUID       | Foreign Key → Project(id)                                          |
|              | files        | Relation   | One-to-Many relation to **File**                                   |
|              | project      | Relation   | Many-to-One relation to **Project**                                |
|--------------|--------------|------------|--------------------------------------------------------------------|
| **File**     | id           | UUID       | Primary Key, Auto-generated (`uuid()`)                             |
|              | name         | String     | Not Null                                                           |
|              | content      | String     | Stores code content                                                |
|              | folderId     | UUID       | Foreign Key → Folder(id)                                           |
|              | folder       | Relation   | Many-to-One relation to **Folder**                                 |


## Tentative plan
Our team plans to approach the project in sequential phases, with responsibilities divided as follows:

### 1. Frontend Development with React  
**Frontend Developer**: Zeying Zhou
- Set up React project with Tailwind CSS and ShadCN UI.
- Build UI components: authentication screens, project dashboard, code editor, sidebar navigation.
- Integrate WebSocket client for real-time code editing and chat functionality.
- Implement theme settings and user preferences.

### 2. Backend Development with Express  
**Backend Developer**: Zeying Zhou
- Set up Express.js server with RESTful APIs for user, project, folder, file, and team management.
- Implement Prisma schema connected to Supabase PostgreSQL database.
- Handle file storage integration with Supabase Storage.
- Set up WebSocket server using Socket.io to manage real-time code updates and chat.

### 3. Full stack development   
**Full-Stack Support & DevOps**: Zeying Zhou
- Assist in connecting frontend and backend API endpoints and WebSocket connections.
- Manage environment configurations (Supabase keys, DB URL, etc.).
- Deploy backend and frontend to platforms like Vercel, Render, or Fly.io.
- Ensure database migrations and cloud storage configurations are stable.


### 4. Testing and Optimization  
**Quality Assurance**: Yuyu Ren

- Use Postman to test the APIs
- Conduct manual testing of user authentication, WebSocket connections, and real-time messaging functionality.

### 5. Documentation and Coordination  
**Project Manager**: Zeying Zhou

- Manage team tasks, maintain documentation, and oversee the final code handoff.
- Use GitHub for version control, issue tracking, and code reviews to ensure smooth collaboration and code integration among team members.

### 6. Task Distribution

To streamline development, we will break down the project workload into specific tickets and assign responsibilities as follows:

| Ticket                               | Description                                                                                   | Assigned To      |
|-------------------------------------|-----------------------------------------------------------------------------------------------|------------------|
| **Database Schema Design**          | Design and implement PostgreSQL database schema using Prisma ORM                             | Zeying Zhou      |
| **Supabase Configuration**          | Set up Supabase PostgreSQL, Storage buckets, and Authentication settings                      | Zeying Zhou      |
| **User Authentication API**         | Implement Sign-Up, Login, and role-based authorization APIs                                   | Zeying Zhou      |
| **Team & Workspace Management API** | Develop backend APIs for creating teams, projects, folders, and files                         | Yuyu Ren    |
| **WebSocket Server Integration**    | Set up WebSocket server (Socket.io) for real-time code editing and chat functionality         | Zeying Zhou       |
| **File Storage Integration**        | Connect Supabase Storage for code files and user assets                                       | Yuyu Ren     |
| **Frontend Authentication UI**      | Build Sign-Up, Login, and user settings UI components                                         | Zeying Zhou      |
| **Workspace Dashboard UI**          | Design UI for team and project management, folder and file navigation                         | Yuyu Ren    |
| **Code Editor Integration**         | Integrate Monaco Editor with real-time synchronization via WebSockets                         | Yuyu Ren    |
| **Chat Functionality (Frontend)**   | Implement in-app chat interface synced with WebSocket backend                                 | Yuyu Ren       |
| **Theme & Preferences UI**          | Implement dark/light mode toggle and persist user preferences                                 |  Yuyu Ren   |
| **Manual Testing**                  | Test authentication flow, real-time code editing, chat functionality, and storage integration | All Team Members |
### Timeline
The tasks outlined above are expected to be completed in the next **four weeks**, focusing on core functionality. An additional **one week** will be allocated for improving the user interface and conducting thorough testing to ensure stability and usability.


---

