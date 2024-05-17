// lib/db.ts
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
	pgTable,
	serial,
	integer,
	boolean,
	pgTableCreator,
	uniqueIndex,
} from "drizzle-orm/pg-core";

// Initialize drizzle with Vercel PostgreSQL
export const db = drizzle(sql);

export const createTable = pgTableCreator((name) => `interactive_grid_${name}`);
// Define the cells table

export const cells = createTable(
	"cells",
	{
		id: serial("id").primaryKey(),
		row: integer("row").notNull(),
		column: integer("column").notNull(),
		isActive: boolean("isActive").notNull(),
	},
	(table) => ({
		uniqueRowColumn: uniqueIndex("unique_row_column").on(
			table.row,
			table.column,
		),
	}),
);
