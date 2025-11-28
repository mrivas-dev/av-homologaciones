import { assertEquals, assertExists } from "@std/assert";
import { UserRepository } from "../repositories/userRepository.ts";
import { UserRole } from "../types/user.types.ts";
import { getClient } from "../config/db.ts";

Deno.test("UserRepository Integration Test", async (t) => {
    const repo = new UserRepository();
    const testEmail = `test-${crypto.randomUUID()}@example.com`;
    let userId: string;

    await t.step("create user", async () => {
        const user = await repo.create({
            email: testEmail,
            passwordHash: "hashed_secret",
            fullName: "Test User",
            role: UserRole.USER,
        });

        assertExists(user.id);
        assertEquals(user.email, testEmail);
        assertEquals(user.role, UserRole.USER);
        userId = user.id;
    });

    await t.step("find by email", async () => {
        const user = await repo.findByEmail(testEmail);
        assertExists(user);
        assertEquals(user?.id, userId);
    });

    await t.step("find by id", async () => {
        const user = await repo.findById(userId);
        assertExists(user);
        assertEquals(user?.email, testEmail);
    });

    // Cleanup
    const client = await getClient();
    await client.execute("DELETE FROM users WHERE id = ?", [userId!]);
});
