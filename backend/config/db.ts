import { Client } from "../deps.ts";

// Load environment variables
const env = await Deno.env.toObject();

const dbConfig = {
  hostname: env.DB_HOST || "localhost",
  port: parseInt(env.DB_PORT || "3306"),
  username: env.DB_USER || "root",
  password: env.DB_PASSWORD || "",
  db: env.DB_NAME || "av_db",
};

// Create a database connection
const client = await new Client().connect({
  ...dbConfig,
  poolSize: 3, // connection pool size
});

export { client };

// Initialize the database
async function initializeDatabase() {
  try {
    await client.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.db}`);
    await client.execute(`USE ${dbConfig.db}`);
    
    // Create message_queue table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS message_queue (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        payload JSON,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

export { initializeDatabase };
