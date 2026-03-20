# linkpeek

Fast link preview metadata from any URL. One dependency.

[![npm](https://img.shields.io/npm/v/linkpeek)](https://www.npmjs.com/package/linkpeek)
[![license](https://img.shields.io/npm/l/linkpeek)](LICENSE)
[![node](https://img.shields.io/node/v/linkpeek)](package.json)

> **Server-side only.** linkpeek makes outbound HTTP requests and cannot run in browsers due to CORS restrictions. Use it in a server-side API handler and return the result to the client.

## Install

```bash
# Node.js
npm install linkpeek

# Bun
bun add linkpeek

# Deno
import { preview } from "npm:linkpeek";
```

## Features

- Streaming fetch with early abort (30 KB by default — most OG tags live in the first 10–30 KB)
- SAX parsing via htmlparser2 — no DOM construction, ~2 ms parse time
- Full Open Graph, Twitter Card, JSON-LD, Dublin Core, and HTML fallback chain
- 19-field structured result with TypeScript types
- SSRF protection — private/internal IPs blocked by default
- Meta-refresh redirect handling (Cloudflare challenge pages)
- Charset auto-detection from Content-Type header
- ESM + CJS dual package, single runtime dependency

## Quick Start

```typescript
import { preview } from 'linkpeek';

const result = await preview('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
console.log(result.title);    // "Rick Astley - Never Gonna Give You Up"
console.log(result.image);    // "https://i.ytimg.com/vi/..."
console.log(result.siteName); // "YouTube"
```

Use the `quality` preset for better coverage (body JSON-LD, image fallback, meta-refresh):

```typescript
import { preview, presets } from 'linkpeek';

const result = await preview(url, presets.quality);
```

## API

### `preview(url, options?)`

Fetches a URL and extracts link preview metadata. Uses streaming download with a byte limit and SAX parsing for maximum speed. Handles HTTP redirects and meta-refresh redirects automatically.

Returns `Promise<PreviewResult>`.

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `timeout` | `number` | `8000` | Request timeout in milliseconds |
| `maxBytes` | `number` | `30_000` | Max bytes to stream |
| `userAgent` | `string` | `"Twitterbot/1.0"` | User-Agent sent with requests. Twitterbot gets pre-rendered HTML from most platforms |
| `followRedirects` | `boolean` | `true` | Follow HTTP 3xx redirects |
| `headers` | `Record<string, string>` | `{}` | Extra request headers (e.g. cookies, auth tokens) |
| `allowPrivateIPs` | `boolean` | `false` | Allow fetching private/internal IPs. Keep `false` in production to prevent SSRF attacks |
| `followMetaRefresh` | `boolean` | `false` | Follow `<meta http-equiv="refresh">` redirects when no title is found. Enable to handle Cloudflare-challenged pages at the cost of an extra HTTP round-trip |
| `includeBodyContent` | `boolean` | `false` | Continue scanning `<body>` for JSON-LD scripts and `<img>` fallbacks after `</head>`. Enable together with a higher `maxBytes` for best quality |

#### Result Fields

| Field | Type | Description |
|---|---|---|
| `url` | `string` | Final resolved URL |
| `title` | `string \| null` | Page title (`og:title` → `twitter:title` → JSON-LD → `<title>`) |
| `description` | `string \| null` | Description (`og:description` → `twitter:description` → `meta[name=description]` → JSON-LD) |
| `image` | `string \| null` | Preview image (`og:image` → `twitter:image` → JSON-LD → `itemprop=image` → first `<img>`) |
| `imageWidth` | `number \| null` | Image width from `og:image:width` |
| `imageHeight` | `number \| null` | Image height from `og:image:height` |
| `siteName` | `string` | Site name (`og:site_name` → JSON-LD publisher → hostname fallback) |
| `favicon` | `string \| null` | Favicon URL (largest `apple-touch-icon` → `link[rel=icon]` → `/favicon.ico`) |
| `mediaType` | `string` | Content type from `og:type`, defaults to `"website"` |
| `author` | `string \| null` | Author name (JSON-LD author → `meta[name=author]` → Dublin Core) |
| `canonicalUrl` | `string` | Canonical URL (`link[rel=canonical]` → `og:url` → request URL) |
| `locale` | `string \| null` | Locale from `og:locale` |
| `publishedDate` | `string \| null` | Published date (`article:published_time` → JSON-LD `datePublished` → Dublin Core) |
| `video` | `string \| null` | Video URL from `og:video` |
| `twitterCard` | `string \| null` | Twitter card type (`summary`, `player`, `summary_large_image`) |
| `twitterSite` | `string \| null` | Twitter @handle from `twitter:site` |
| `themeColor` | `string \| null` | Theme color from `meta[name=theme-color]` |
| `keywords` | `string[] \| null` | Keywords from `meta[name=keywords]` |
| `oEmbedUrl` | `string \| null` | Discovered oEmbed endpoint URL from `<link rel="alternate" type="application/json+oembed">`. Not fetched — returned for the caller to resolve if needed |

### `parseHTML(html, baseUrl, options?)`

Parses an HTML string and extracts preview metadata. Use this when you already have the HTML content and don't need to fetch it.

```typescript
import { parseHTML } from 'linkpeek';

const result = parseHTML(
  '<html><head><title>Hello</title></head></html>',
  'https://example.com'
);
console.log(result.title); // "Hello"
```

**Parameters:**

- `html` (`string`) — The HTML content to parse
- `baseUrl` (`string`) — Base URL for resolving relative URLs
- `options?` (`{ includeBodyContent?: boolean }`) — Pass `{ includeBodyContent: true }` to scan `<body>` for JSON-LD and image fallbacks

Returns `PreviewResult`.

## Presets

Two pre-built configs cover the common cases. Presets are plain objects — spread them to override any individual option.

```typescript
import { preview, presets } from 'linkpeek';

// Default: fast preset (30KB, no body scan, no meta-refresh)
const result = await preview(url);

// Quality: body JSON-LD + image fallback + meta-refresh support
const result = await preview(url, presets.quality);

// Custom: spread a preset and override individual options
const result = await preview(url, { ...presets.quality, timeout: 3000 });
```

| Preset | What it enables |
|---|---|
| `presets.fast` | Default behavior — explicit version of `{}` |
| `presets.quality` | Body JSON-LD, image fallback, meta-refresh |

## How it works

1. **Twitterbot User-Agent** — gets pre-rendered HTML from most platforms, skipping client-side rendering entirely
2. **Streaming download with byte limit** — aborts after 30 KB (default). OG tags live in the first 10–30 KB; YouTube pages are 2 MB+ but we never download more than needed
3. **SAX parsing** — processes HTML as a character stream with no DOM construction. ~2 ms parse time
4. **Head-first parsing** — all standard metadata is in `<head>`. Body scanning for JSON-LD and `<img>` fallbacks is opt-in via `includeBodyContent: true` (or `presets.quality`)
5. **Zero extra HTTP calls** — no favicon fetching from Google APIs, no oEmbed resolution by default

## License

MIT

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before opening a pull request.

## Security

If you discover a vulnerability, please follow the reporting process in `SECURITY.md`.
