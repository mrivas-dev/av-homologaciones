# MySQL Database Setup

This directory contains the Docker configuration for the MySQL database used in the AV project.

## Prerequisites

- Docker and Docker Compose installed on your system

## Starting the Database

1. Navigate to the `db` directory:
   ```bash
   cd /path/to/av/db
   ```

2. Start the database:
   ```bash
   docker-compose up -d
   ```

3. To stop the database:
   ```bash
   docker-compose down
   ```

## Connecting from Deno

Here's a sample connection snippet using `mysql2` from JSR:

```typescript
import mysql from "npm:mysql2@^3.6.0/promise";

const connection = await mysql.createConnection({
  host: "localhost",
  user: "av_user",
  password: "av_pass",
  database: "av_db",
  port: 3306
});

try {
  // Example query
  const [rows] = await connection.execute(
    "SELECT * FROM message_queue WHERE status = ?",
    ['pending']
  );
  
  console.log(rows);
} finally {
  // Close the connection when done
  await connection.end();
}
```

## Database Information

- **Host**: localhost
- **Port**: 3306
- **Database**: av_db
- **Username**: av_user
- **Password**: av_pass
- **Root Password**: rootpass (for admin access)

## Volumes

Database data is persisted in a Docker volume named `av_mysql_data`. To completely remove the database (including all data), run:

```bash
docker-compose down -v
```
