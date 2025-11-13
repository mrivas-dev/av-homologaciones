# Backend Setup Guide

## Prerequisites
- Deno 1.30.0 or higher
- PostgreSQL 13+
- (Optional) Docker

## Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. Set up environment variables
   Create a `.env` file in the backend directory with the following variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=postgres
   ```

## Database Setup

1. Create a new PostgreSQL database
   ```bash
   createdb your_database_name
   ```

2. Create the messages table
   ```sql
   CREATE TABLE IF NOT EXISTS messages (
     id SERIAL PRIMARY KEY,
     text TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Running the Application

### Development Mode
```bash
# Navigate to backend directory
cd backend

# Start the server
deno run --allow-net --allow-env --allow-read main.ts
```

### Using Docker (Optional)
1. Make sure Docker is installed and running
2. Update the `.env` file with your database configuration
3. Run the application:
   ```bash
   docker build -t deno-backend .
   docker run -p 4000:4000 --env-file .env deno-backend
   ```

## Testing

### Run Tests
```bash
deno test --allow-net --allow-env --allow-read
```

## Environment Variables

| Variable     | Description                     | Default     |
|--------------|---------------------------------|-------------|
| DB_HOST      | Database host                   | localhost   |
| DB_PORT      | Database port                   | 5432        |
| DB_USER      | Database user                   | postgres    |
| DB_PASSWORD  | Database password               | (required)  |
| DB_NAME      | Database name                   | postgres    |

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
   ```bash
   pg_isready
   ```
2. Check connection details in `.env`
3. Ensure the database and user exist

### Port Already in Use
If port 4000 is in use, either:
- Stop the process using the port
- Change the port in `main.ts`

### Permission Denied
Ensure you have the necessary permissions to:
- Access the database
- Read/write to the project directory
- Bind to the required ports
