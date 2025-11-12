# How to Run the Project

This guide will walk you through setting up and running the AV Homologaciones project locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **pnpm** 8.10.0 or higher (recommended package manager)
- **Supabase CLI** (for local development)
- **Git** (for version control)

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

### Installing Supabase CLI

```bash
npm install -g supabase
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd av-homologaciones
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
pnpm install
```

This will install dependencies for all packages and apps in the workspace.

### 3. Environment Setup

Copy the environment example file:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AV Homologaciones
NEXT_PUBLIC_APP_ENV=development

# Admin Configuration
ADMIN_EMAIL=admin@avhomologaciones.com
```

### 4. Start Development Servers

Run all services in development mode:

```bash
pnpm dev
```

This will start:
- **Frontend (Next.js)**: http://localhost:3000
- **API (Supabase Edge Functions)**: http://localhost:54321

## 📚 Available Scripts

### Root Level Scripts

These scripts run across the entire monorepo:

```bash
# Development
pnpm dev              # Start all services in development mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all files in the monorepo
pnpm type-check       # Type check all TypeScript files
pnpm clean            # Clean build artifacts
pnpm format           # Format code with Prettier
```

### Individual App Scripts

You can also run specific apps individually:

#### Frontend (Web App)

```bash
# From root directory
pnpm --filter @av/web dev          # Start web app only
pnpm --filter @av/web build        # Build web app only
pnpm --filter @av/web start        # Start production server
pnpm --filter @av/web lint         # Lint web app
pnpm --filter @av/web type-check   # Type check web app

# Or navigate to the app directory
cd apps/web
pnpm dev
pnpm build
pnpm start
```

#### API (Supabase Functions)

```bash
# From root directory
pnpm --filter @av/api dev          # Start API functions only
pnpm --filter @av/api build        # Build API functions
pnpm --filter @av/api deploy       # Deploy to Supabase
pnpm --filter @av/api lint         # Lint API functions
pnpm --filter @av/api type-check   # Type check API functions

# Or navigate to the app directory
cd apps/api
pnpm dev
pnpm build
pnpm deploy
```

## 🏗️ Project Structure

```
av-homologaciones/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/            # Source code
│   │   ├── package.json    # Web app dependencies
│   │   └── next.config.js  # Next.js configuration
│   └── api/                 # Supabase Edge Functions
│       ├── functions/      # Function definitions
│       ├── package.json    # API dependencies
│       └── supabase/       # Supabase configuration
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configurations
├── docs/                    # Documentation
├── .env.example            # Environment variables template
├── package.json            # Root package configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── turbo.json              # Turborepo configuration
```

## 🔧 Development Workflow

### 1. Making Changes

- **Frontend changes**: Edit files in `apps/web/src/`
- **API changes**: Edit files in `apps/api/functions/`
- **Shared components**: Edit files in `packages/ui/src/`
- **Shared types**: Edit files in `packages/types/src/`

### 2. Running Tests

```bash
# Run linting for all packages
pnpm lint

# Run type checking for all packages
pnpm type-check
```

### 3. Building for Production

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter @av/web build
pnpm --filter @av/api build
```

## 🌐 Local Development URLs

When running `pnpm dev`, you can access:

- **Main Application**: http://localhost:3000
- **API Functions**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323 (if using local Supabase)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 54321
   lsof -ti:3000 | xargs kill -9
   lsof -ti:54321 | xargs kill -9
   ```

2. **Dependency issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules
   rm -rf apps/*/node_modules
   rm -rf packages/*/node_modules
   pnpm install
   ```

3. **Environment variables not working**
   - Ensure `.env` file is in the root directory
   - Restart the development server after changing environment variables
   - Check that all required variables are set

4. **Supabase functions not starting**
   ```bash
   # Ensure Supabase CLI is authenticated
   supabase login
   
   # Check if functions are properly configured
   cd apps/api
   supabase functions list
   ```

### Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Ensure all prerequisites are installed correctly
3. Verify environment variables are set properly
4. Check the [GitHub Issues](https://github.com/your-org/av-homologaciones/issues) for known problems

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main` branch

### Backend Deployment (Supabase)

```bash
# Deploy all functions
cd apps/api
pnpm deploy

# Or deploy specific function
supabase functions deploy function-name
```

## 📝 Additional Notes

- The project uses **Turborepo** for efficient monorepo management
- **pnpm** is used as the package manager for better disk space efficiency
- All TypeScript configurations use strict mode for better type safety
- The project supports internationalization (Spanish/English)
- Hot reload is enabled for both frontend and backend during development
