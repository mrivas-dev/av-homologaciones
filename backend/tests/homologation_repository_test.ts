import { assertEquals, assertExists } from "@std/assert";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import { UserRole } from "../types/user.types.ts";
import { HomologationStatus } from "../types/homologation.types.ts";
import { getClient } from "../config/db.ts";

Deno.test("HomologationRepository Integration Test", async (t) => {
    const userRepo = new UserRepository();
    const homologationRepo = new HomologationRepository();

    const testEmail = `test-h-${crypto.randomUUID()}@example.com`;
    let userId: string;
    let homologationId: string;

    // Setup: Create a user
    const user = await userRepo.create({
        email: testEmail,
        passwordHash: "hashed_secret",
        fullName: "Test User for Homologation",
        role: UserRole.USER,
    });
    userId = user.id;

    await t.step("create homologation", async () => {
        const homologation = await homologationRepo.create({
            ownerFullName: "John Doe",
            ownerNationalId: "123456789",
            ownerPhone: "1234567890",
            ownerEmail: "john@example.com",
            status: HomologationStatus.DRAFT,
        }, userId);

        assertExists(homologation.id);
        assertEquals(homologation.ownerFullName, "John Doe");
        assertEquals(homologation.createdBy, userId);
        homologationId = homologation.id;
    });

    await t.step("find by id", async () => {
        const found = await homologationRepo.findById(homologationId);
        assertExists(found);
        assertEquals(found?.ownerFullName, "John Doe");
    });

    await t.step("find all", async () => {
        const list = await homologationRepo.findAll({ userId });
        assertEquals(list.length, 1);
        assertEquals(list[0].id, homologationId);
    });

    // Cleanup
    const client = await getClient();
    await client.execute("DELETE FROM homologations WHERE id = ?", [
        homologationId!,
    ]);
    await client.execute("DELETE FROM users WHERE id = ?", [userId!]);
});
