import type { Config } from "drizzle-kit";

import { env } from "./src/env.js";

export default {
	schema: "./src/lib/db.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.POSTGRES_URL,
	},
	tablesFilter: ["interactive_grid_*"],
} satisfies Config;
