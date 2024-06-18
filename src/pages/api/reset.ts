// src/pages/api/reset.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";
import { cells } from "../../lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "POST") {
		try {
			await db
				.update(cells)
				.set({ isActive: false, clickedOrder: 0 })
				.execute();
			res.status(200).json({ message: "Cells reset successfully" });
		} catch (error) {
			console.error("Error resetting cells:", error);
			res
				.status(500)
				.json({
					message:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				});
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
}
