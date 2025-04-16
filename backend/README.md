# Backend

This is the backend service for the application, built with Express.js and Prisma.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/your_database_name"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Teams

- `POST /api/teams` - Create a new team
- `GET /api/teams` - Get all teams for the current user
- `GET /api/teams/:teamId` - Get a specific team
- `POST /api/teams/join` - Join a team using a join code

## Development

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm run start` - Start the production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations 