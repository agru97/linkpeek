// app/api/preview/route.ts
import { preview } from "linkpeek";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const url = req.nextUrl.searchParams.get("url");
	if (!url) {
		return NextResponse.json(
			{ error: "Missing ?url= parameter" },
			{ status: 400 },
		);
	}

	try {
		const result = await preview(url);
		return NextResponse.json(result);
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "Failed to fetch preview" },
			{ status: 422 },
		);
	}
}
