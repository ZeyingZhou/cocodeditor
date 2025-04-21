# Real-Time Collaoboration Code Editor Final Report
Name: Zeying Zhou Student#: 1005172732
zeying.zhou@mail.utoronto.ca
Name: Yuyu Ren Student#: 1005521204


## Video Demo

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

## Objectives
Build a full-featured online code collaboration platform supporting real-time code editing, workspace and team management, syntax highlighting, and cloud-based storage, leveraging modern web technologies and real-time communication protocols.
## Technical Stack
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
- [GitHub](https://github.com/): Version control and collaboration platform for source code management.
- [Postman](https://www.postman.com/): Tool for API testing and debugging.
## Features

### 1. User Authentication

* Users can register and log in with a email and password including a email verification during registration
* Passwords are hashed and stored securely in the supabase.
* Third party sign in also supported (Google and Github)

### 2. Team and project Management
* Users can create team and projects in the dashbaord
* Each team has a access code that comes with the team invite link. Other users can use the link and access code to join the team.
* Users can delete the projects in the team

### 3. Real-Time Collaboration Editor
* Socket.IO integration enables instant two-way communication between the client and server.
* Users can collaborate it at the same editor with real time updates


### 4. Role-based Access Control

- **Owner/Admin**: Can delete or manage projects.
- **Member**: Can edit files but cannot delete projects.








## User Guide


This section explains how users interact with the Real-Time Collaboration Code Editor. The app is fully web-based—no installation required. Users can authenticate, create or join teams, manage projects, and collaborate in real time on code with others.

---

### 1. Registration and Login

- Visit the application URL.
- Choose **Sign Up** to register with email and password.
- A **verification email** will be sent—click the link to activate your account.
- You can also log in using **Google** or **GitHub**.


---

### 2. Dashboard Overview

After login, you'll be redirected to the **TeamCheckPage**. If you have teams already, you will be redirected to **DashboardPage**. If you don't have any teams, a create team modal will pop out and ask you to create a team first.

Here you can:
- View your teams and projects
- Create a **new team**
- Create a **new project**


---

### 3. Joining a Team
- By opening the invite team modal. you’ll get a **team invite link** and **access code**.
- In order to let others join the team, send the invite link and access code to them. They can use it to join the team

---

### 4. Project Management

Within each team:
- Click **New Project** to start a collaborative workspace.
- You can name your project and begin editing immediately.
- Only **owners** or **admins** can delete a project.


---

### 5. Real-Time Code Editor

- Click on a project to enter the editor.
- You will see a Monaco-based editor (similar to VS Code).
- All edits are synchronized in real time across users in the same project.
- The editor supports multiple languages (JavaScript, Python, C++ and much more).
- Chat with teammates in the side panel for quick communication.
- Teammates shown with status


---

### 6. Role-Based Access Control

Each team member has one of the following roles:
- **Owner**: Full access, including team and project deletion
- **Admin**: Can manage projects
- **Member**: Can collaborate but cannot delete projects


---

### 7. Profile Management

- Click your profile icon to view your account information.
- Update personal details or log out.


---

### 8. Logging Out

- Click the user avatar in the left corner.
- Select **Logout** from the dropdown menu.

---




## Development Guide
### Database initialization
1. Visit [Supabase](https://supabase.com/) https://supabase.com/ 
2. Create a new project and note

3. Enable Authentication for Google and Github

4. Open the SQL Editor, copy and paste frontend/user_profile_function.sql and run it
```
-- Function to create a profile with auth id, name, and email when a new user is created
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- Insert a row into profiles with auth.users data
  insert into public."Profile" (
    id,
    name,
    email,
    "createdAt",
    "updatedAt"
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', ''), -- Get `username` from metadata
    new.email,
    now(),
    now()
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
 ```
### Environment setup and configuration
1. **Install dependencies**  
```bash
cd frontend
npm install
```
   
create a env.local file in frontend folder copy        supabase key by use connect in the dashbaord
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
```
   
```bash
cd backend
npm install
```
create a env file in backend folder copy   supabase key by use connect in the dashbaord
```
DATABASE_URL=your_supabase_url
DIRECT_URL=your_supabase_direct_url
```
Go to rapidapi.com register account, and then subscribe to the API Judge0-ce, and update api url and key in the same env file
```
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_Judge0_api_key
```
In the command line run
```
npx prisma db push
```
### Cloud storage configuration
### Local development and testing
```bash
cd frontend
npm run dev
```
```bash
cd backend
npm run dev
```
## Individual Contributions 

| Team Member     | Contributions                                                                                   |
|-----------------|-------------------------------------------------------------------------------------------------|
| **Zeying Zhou** |  Lead full stack development on user authentication, user dashboard, email verification, user join page, ui design, and database scheme design, Final Report
| **Yuyu Ren** | Lead full stack development on real time code editor page, user profile page, ui design,  Socket.IO client and server set up         |

    
## Lessons Learned and Concluding Remarks:

Due to time constraints, the development period lasted about one and a half weeks. Despite this tight schedule, we were able to implement a functional prototype of a real-time collaboration coding platform. This project gave us valuable experience in full-stack development, real-time communication, and team-based project coordination.

Key Learnings:
	•	Frontend & Backend Integration: Connecting React, Supabase, and Socket.IO taught us a lot about full-stack interoperability.
	•	Authentication & Access Control: We implemented secure, scalable user authentication and permission management using Supabase.
	•	Database Design: Designing and managing a relational schema with Prisma and PostgreSQL strengthened our backend development skills.
	•	Real-Time Systems: Working with Socket.IO improved our understanding of event-driven architecture and collaborative syncing.
	•	Project Coordination: Effective use of GitHub and task division helped streamline our efforts and stay organized.
    
> ⚠️ **Warning:** IPv4 may be not compatible with supabase free plan for direct connection


Conclusion:

We successfully built a cloud-based collaborative coding editor with key features like real-time editing, team/project management, and user authentication. With more time, we would implement file systems within projects, code execution, version history, and offline support. This platform lays the foundation for a modern and efficient tool for developers, educators, and students alike.
