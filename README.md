# AV Homologaciones

A modern web application with a Next.js frontend and Deno backend.

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later) or yarn
- Deno (v1.36.0 or later)

## Getting Started

### Backend Setup

The backend is built with Deno and Oak.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the backend server:
   ```bash
   deno task dev
   ```
   The backend will be available at `http://localhost:4000`

### Frontend Setup

The frontend is built with Next.js.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://localhost:3000`

## Development

### Running Both Frontend and Backend

From the root directory, you can start both the frontend and backend with a single command:

```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:4000`

## Project Structure

- `/backend` - Deno backend application
  - `main.ts` - Main application entry point
  - `deps.ts` - Dependencies
  - `deno.json` - Deno configuration

- `/frontend` - Next.js frontend application
  - `app/` - Next.js app directory
  - `public/` - Static files
  - `package.json` - Frontend dependencies

## API Endpoints

- `GET /api/hello` - Returns a welcome message
- `GET /api/messages` - Returns a list of messages

## License

This project is licensed under the MIT License.
