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
			res.send({ id: result.lastID, row, column, isActive });
		} catch (error) {
			res.status(500).send(error.message);
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
