import type { NextApiRequest, NextApiResponse } from "next";
import { db, cells } from "../../lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "GET") {
		try {
			const result = await db.select().from(cells);
			res.status(200).json(result);
		} catch (error) {
			console.error("Error fetching cells:", error);
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
