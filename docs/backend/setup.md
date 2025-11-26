# Backend Setup Guide

## Prerequisites
- Deno 1.30.0 or higher
- MySQL 8.0 or higher (or Docker)
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
   DB_PORT=3306
   DB_USER=av_user
   DB_PASSWORD=av_pass
   DB_NAME=av_db
   ```

## Database Setup

1. Make sure the MySQL server is running (or use the provided Docker Compose setup)

2. The database and tables will be automatically created when you start the application with the MySQL connection details in your `.env` file.

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
| DB_PORT      | Database port                   | 3306        |
| DB_USER      | Database user                   | av_user     |
| DB_PASSWORD  | Database password               | av_pass     |
| DB_NAME      | Database name                   | av_db       |

## Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
   ```bash
   # If using the Docker setup
   docker ps | grep mysql
   
   # Or if running MySQL locally
   mysqladmin ping -h localhost -u av_user -p
   ```
2. Check connection details in `.env`
3. Ensure the database and user exist
4. Check MySQL logs for any errors:
   ```bash
   docker logs av_mysql
   ```

### Port Already in Use
If port 4000 is in use, either:
- Stop the process using the port
- Change the port in `main.ts`

### Permission Denied
Ensure you have the necessary permissions to:
- Access the database
- Read/write to the project directory
- Bind to the required ports
