import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import {
	serial,
	integer,
	boolean,
	pgTableCreator,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const db = drizzle(sql);

export const createTable = pgTableCreator((name) => `interactive_grid_${name}`);

export const cells = createTable(
	"cells",
	{
		id: serial("id").primaryKey(),
		row: integer("row").notNull(),
		column: integer("column").notNull(),
		isActive: boolean("isActive").notNull(),
		clickedOrder: integer("clickedOrder").default(0).notNull(),
	},
	(table) => ({
		uniqueRowColumn: uniqueIndex("unique_row_column").on(
			table.row,
			table.column,
		),
	}),
);
