import { preview } from "linkpeek";

export default {
	async fetch(request: Request): Promise<Response> {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");

		if (!url) {
			return Response.json(
				{ error: "Missing ?url= parameter" },
				{ status: 400 },
			);
		}

		try {
			const result = await preview(url);
			return Response.json(result, {
				headers: { "Cache-Control": "public, max-age=3600" },
			});
		} catch (err) {
			return Response.json(
				{
					error: err instanceof Error ? err.message : "Failed to fetch preview",
				},
				{ status: 422 },
			);
		}
	},
};
