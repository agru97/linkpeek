import express from "express";
import { preview } from "linkpeek";

const app = express();

app.get("/api/preview", async (req, res) => {
	const url = req.query.url as string;
	if (!url) {
		res.status(400).json({ error: "Missing ?url= parameter" });
		return;
	}

	try {
		const result = await preview(url);
		res.json(result);
	} catch (err) {
		res.status(422).json({
			error: err instanceof Error ? err.message : "Failed to fetch preview",
		});
	}
});

app.listen(3000, () => {
	console.log("Listening on http://localhost:3000");
	console.log("Try: http://localhost:3000/api/preview?url=https://github.com");
});
