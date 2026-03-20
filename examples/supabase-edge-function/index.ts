// supabase/functions/preview/index.ts
import { preview } from "npm:linkpeek";

Deno.serve(async (req) => {
	const { searchParams } = new URL(req.url);
	const url = searchParams.get("url");

	if (!url) {
		return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const result = await preview(url);
		return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : "Failed to fetch preview",
			}),
			{ status: 422, headers: { "Content-Type": "application/json" } },
		);
	}
});
