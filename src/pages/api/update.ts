import type { NextApiRequest, NextApiResponse } from "next";
import { dbPromise } from "../../lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "POST") {
		try {
			const { row, column, isActive } = req.body;
			const db = await dbPromise;
			const result = await db.run(
				"INSERT OR REPLACE INTO cells (row, column, isActive) VALUES (?, ?, ?)",
				[row, column, isActive],
			);
			res.status(200).json({ id: result.lastID, row, column, isActive });
		} catch (error) {
			console.error("Error updating cell:", error);
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
