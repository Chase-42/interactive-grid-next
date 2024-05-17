import type { NextApiRequest, NextApiResponse } from "next";
import { dbPromise } from "../../lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "GET") {
		try {
			const db = await dbPromise;
			const cells = await db.all("SELECT * FROM cells");
			res.send(cells);
		} catch (error) {
			res.status(500).send(error.message);
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
