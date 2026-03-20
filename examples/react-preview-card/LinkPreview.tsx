import { useEffect, useState } from "react";

interface PreviewData {
	title: string | null;
	description: string | null;
	image: string | null;
	siteName: string;
	favicon: string | null;
	url: string;
}

export function LinkPreview({ url }: { url: string }) {
	const [data, setData] = useState<PreviewData | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setData(null);
		setError(null);
		fetch(`/api/preview?url=${encodeURIComponent(url)}`)
			.then((res) =>
				res.ok ? res.json() : Promise.reject(new Error("Fetch failed")),
			)
			.then(setData)
			.catch((err) => setError(err.message));
	}, [url]);

	if (error) return <div>Failed to load preview</div>;
	if (!data) return <div>Loading...</div>;

	return (
		<a
			href={data.url}
			target="_blank"
			rel="noopener noreferrer"
			style={{
				display: "block",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				overflow: "hidden",
				textDecoration: "none",
				color: "inherit",
				maxWidth: 480,
			}}
		>
			{data.image && (
				<img
					src={data.image}
					alt={data.title ?? ""}
					style={{ width: "100%", height: 200, objectFit: "cover" }}
				/>
			)}
			<div style={{ padding: 16 }}>
				<div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
					{data.favicon && (
						<img
							src={data.favicon}
							alt=""
							style={{
								width: 14,
								height: 14,
								marginRight: 6,
								verticalAlign: "middle",
							}}
						/>
					)}
					{data.siteName}
				</div>
				{data.title && (
					<div style={{ fontWeight: 600, marginBottom: 4 }}>{data.title}</div>
				)}
				{data.description && (
					<div style={{ fontSize: 14, color: "#475569" }}>
						{data.description.length > 120
							? `${data.description.slice(0, 120)}...`
							: data.description}
					</div>
				)}
			</div>
		</a>
	);
}
