# PostgreSQL Database Setup

This directory contains the Docker configuration for the PostgreSQL database used in the AV project.

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

Here's a sample connection snippet using `deno-postgres` from JSR:

```typescript
import { Client } from "jsr:@libsql/client@0.1.0";

const client = new Client({
  user: "av_user",
  password: "av_pass",
  database: "av_db",
  hostname: "localhost",
  port: 5432,
});

// Example query
const result = await client.queryObject`
  SELECT * FROM message_queue WHERE status = 'pending';
`;

console.log(result.rows);

// Don't forget to close the connection when done
await client.end();
```

## Database Information

- **Host**: localhost
- **Port**: 5432
- **Database**: av_db
- **Username**: av_user
- **Password**: av_pass

## Volumes

Database data is persisted in a Docker volume named `av_postgres_data`. To completely remove the database (including all data), run:

```bash
docker-compose down -v
```
