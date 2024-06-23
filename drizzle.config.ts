import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	driver: "pg",
	dbCredentials: {
		connectionString: env.DATABASE_URL,
		user: env.DATABASE_USER,
		password: env.DATABASE_PASSWORD,
	},
	verbose: true,
	strict: true,
});
