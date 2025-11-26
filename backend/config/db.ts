import { Client } from "../deps.ts";

// Database configuration
const dbConfig = {
  hostname: "localhost",
  port: 3306,
  username: "root",  // Using root for now, but should be a dedicated user in production
  password: "root",
  db: "av_db",
  poolSize: 3,
};

// Create a single client instance
let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (!client) {
    client = new Client();
    try {
      console.log(`🔌 Attempting to connect to MySQL at ${dbConfig.hostname}:${dbConfig.port}...`);
      await client.connect({
        hostname: dbConfig.hostname,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        db: dbConfig.db,
        poolSize: dbConfig.poolSize,
      });
      console.log("✅ Successfully connected to MySQL database");
    } catch (error) {
      console.error("❌ Failed to connect to MySQL database:", error.message);
      console.log("Connection details:", {
        hostname: dbConfig.hostname,
        port: dbConfig.port,
        username: dbConfig.username,
        database: dbConfig.db
      });
      client = null;
      throw error;
    }
  }
  return client;
}

// Initialize the database
async function initializeDatabase() {
  try {
    const client = await getClient();
    
    // Create database if it doesn't exist
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
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

// Close the database connection
async function closeConnection() {
  if (client) {
    try {
      await client.close();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("❌ Error closing database connection:", error);
    } finally {
      client = null;
    }
  }
}

// Handle process termination
if (typeof Deno !== 'undefined') {
  Deno.addSignalListener("SIGINT", async () => {
    console.log("\nClosing database connection...");
    await closeConnection();
    Deno.exit(0);
  });
}

export { initializeDatabase, closeConnection, getClient };
