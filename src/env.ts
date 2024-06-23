import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		DATABASE_USER: z.string(),
		DATABASE_PASSWORD: z.string(),
		NODE_ENV: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		NEXTAUTH_SECRET: z.string().min(1),
		STRIPE_API_KEY: z.string().min(1),
		STRIPE_WEBHOOK_SECRET: z.string().min(1),
		PRICE_ID: z.string().min(1),
		HOSTNAME: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_STRIPE_KEY: z.string().min(1),
		NEXT_PUBLIC_PROJECT_PLANNER_ID: z.string().min(1),
		NEXT_PUBLIC_SKIP_EVENTS: z.string().optional(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		DATABASE_USER: process.env.DATABASE_USER,
		DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		STRIPE_API_KEY: process.env.STRIPE_API_KEY,
		STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		PRICE_ID: process.env.PRICE_ID,
		NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
		HOSTNAME: process.env.HOSTNAME,
		NEXT_PUBLIC_PROJECT_PLANNER_ID: process.env.NEXT_PUBLIC_PROJECT_PLANNER_ID,
		NEXT_PUBLIC_SKIP_EVENTS: process.env.NEXT_PUBLIC_SKIP_EVENTS,
	},
});
