import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
	filename: "./database.db",
	driver: sqlite3.Database,
});

dbPromise.then((db) => {
	db.run(
		"CREATE TABLE IF NOT EXISTS cells (id INTEGER PRIMARY KEY AUTOINCREMENT, row INT, column INT, isActive BOOLEAN, UNIQUE(row, column))",
	);
});
