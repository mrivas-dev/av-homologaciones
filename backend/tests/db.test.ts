import { assertEquals } from "https://deno.land/std@0.200.0/assert/assert_equals.ts";
import {
  closeConnection,
  getClient,
  initializeDatabase,
} from "../config/db.ts";
import { Client } from "../deps.ts";

// Test user data
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password_hash: "hashedpassword",
  full_name: "Test User",
  role: "user" as const,
};

let client: Client;
let testUserId: string;

// Setup and teardown
Deno.test({
  name: "Database Connection",
  async fn() {
    // Initialize database and get client
    await initializeDatabase();
    client = await getClient();

    // Test connection by querying the database version
    const [result] = await client.query("SELECT VERSION() as version");
    console.log("✅ Connected to MySQL version:", result.version);

    // Clean up any existing test data
    await cleanupTestData();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Test CRUD operations on users table
Deno.test({
  name: "User CRUD Operations",
  async fn(t) {
    // Create
    await t.step("should create a new user", async () => {
      const result = await client.execute(
        `INSERT INTO users 
         (username, email, password_hash, full_name, role, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          testUser.username,
          testUser.email,
          testUser.password_hash,
          testUser.full_name,
          testUser.role,
          "00000000-0000-0000-0000-000000000000", // System user
          "00000000-0000-0000-0000-000000000000", // System user
        ],
      );

      testUserId = result.lastInsertId?.toString() || "";
      assertEquals(result.affectedRows, 1);
      console.log(`✅ Created test user with ID: ${testUserId}`);
    });

    // Read
    await t.step("should retrieve the created user", async () => {
      const [user] = await client.query(
        "SELECT * FROM users WHERE id = ?",
        [testUserId],
      );

      assertEquals(user?.username, testUser.username);
      assertEquals(user?.email, testUser.email);
      assertEquals(user?.role, testUser.role);
      console.log("✅ Retrieved test user:", user);
    });

    // Update
    await t.step("should update the user", async () => {
      const newName = "Updated Test User";
      const result = await client.execute(
        "UPDATE users SET full_name = ? WHERE id = ?",
        [newName, testUserId],
      );

      assertEquals(result.affectedRows, 1);

      // Verify update
      const [user] = await client.query(
        "SELECT full_name FROM users WHERE id = ?",
        [testUserId],
      );
      assertEquals(user?.full_name, newName);
      console.log(`✅ Updated test user name to: ${newName}`);
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Test foreign key constraints
Deno.test({
  name: "Foreign Key Constraints",
  async fn(t) {
    await t.step(
      "should enforce user foreign key in homologations",
      async () => {
        let errorThrown = false;
        try {
          // Try to create a homologation with a non-existent user ID
          await client.execute(
            `INSERT INTO homologations 
           (trailer_type, owner_full_name, owner_national_id, owner_phone, owner_email, status, created_by, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              "Trailer",
              "Test Owner",
              "12345678",
              "1234567890",
              "owner@example.com",
              "Draft",
              "non-existent-user-id", // This should fail
              "non-existent-user-id",
            ],
          );
        } catch (error) {
          errorThrown = true;
          console.log(
            "✅ Correctly caught foreign key violation:",
            (error as Error).message,
          );
        }

        assertEquals(
          errorThrown,
          true,
          "Should throw error for invalid foreign key",
        );
      },
    );
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Cleanup test data
Deno.test({
  name: "Cleanup",
  async fn() {
    await cleanupTestData();
    await closeConnection();
    console.log("✅ Cleanup complete");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

async function cleanupTestData() {
  if (!client) return;

  try {
    // Delete any test data
    await client.execute("DELETE FROM photos WHERE created_by = ?", [
      testUserId,
    ]);
    await client.execute("DELETE FROM homologations WHERE created_by = ?", [
      testUserId,
    ]);
    await client.execute("DELETE FROM users WHERE username = ?", [
      testUser.username,
    ]);
    console.log("🧹 Cleaned up test data");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}
