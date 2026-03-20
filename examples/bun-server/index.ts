import { preview } from "linkpeek";

Bun.serve({
	port: 3000,
	async fetch(req) {
		const { searchParams } = new URL(req.url);
		const url = searchParams.get("url");

		if (!url) {
			return Response.json(
				{ error: "Missing ?url= parameter" },
				{ status: 400 },
			);
		}

		try {
			const result = await preview(url);
			return Response.json(result);
		} catch (err) {
			return Response.json(
				{
					error: err instanceof Error ? err.message : "Failed to fetch preview",
				},
				{ status: 422 },
			);
		}
	},
});

console.log("Listening on http://localhost:3000");
console.log("Try: http://localhost:3000?url=https://github.com");
