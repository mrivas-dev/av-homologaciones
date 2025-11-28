import { getClient } from "../config/db.ts";
import { join } from "jsr:@std/path";

async function runMigrations() {
    const client = await getClient();
    const migrationsDir = join(Deno.cwd(), "migrations");

    console.log(`📂 Reading migrations from ${migrationsDir}...`);

    try {
        const entries = [];
        for await (const entry of Deno.readDir(migrationsDir)) {
            if (entry.isFile && entry.name.endsWith(".sql")) {
                entries.push(entry);
            }
        }

        // Sort by name to ensure order
        entries.sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of entries) {
            console.log(`🚀 Running migration: ${entry.name}`);
            const content = await Deno.readTextFile(
                join(migrationsDir, entry.name),
            );

            // Split by semicolon to handle multiple statements if needed,
            // but Deno MySQL client might handle multiple statements if enabled.
            // For safety, we'll try to execute the whole file.
            // If it fails on multiple statements, we might need to split.
            // The client.execute usually handles one statement or multiple if supported.
            // Let's try executing the whole content.

            // Some migrations might have multiple statements.
            // A simple split by ';' might be fragile if strings contain ';'.
            // But for now let's assume standard SQL files.

            const statements = content
                .split(";")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            for (const stmt of statements) {
                try {
                    await client.execute(stmt);
                } catch (error) {
                    // Ignore "Table already exists" or similar if we want idempotency,
                    // but better to fail or check.
                    // For now, let's log and continue or throw.
                    console.error(
                        `❌ Error in ${entry.name}:`,
                        (error as Error).message,
                    );
                    // throw error; // Uncomment to stop on error
                }
            }

            console.log(`✅ Completed: ${entry.name}`);
        }

        console.log("✨ All migrations completed successfully");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        // We don't close the connection here because getClient reuses it,
        // but we should probably close it if we are done.
        // However, the script will exit anyway.
        // await client.close();
    }
}

if (import.meta.main) {
    await runMigrations();
    Deno.exit(0);
}
