import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";
import { cells } from "../../lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "POST") {
		try {
			const { row, column, isActive } = req.body;

			await db
				.insert(cells)
				.values({ row, column, isActive })
				.onConflictDoUpdate({
					target: [cells.row, cells.column],
					set: { isActive },
				});

			res.status(200).json({ row, column, isActive });
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
