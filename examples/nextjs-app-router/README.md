# Next.js App Router — Link Preview API Route

A Next.js route handler that returns link preview metadata as JSON.

## Setup

1. Install linkpeek in your Next.js project:

```bash
npm install linkpeek
```

2. Copy `route.ts` to `app/api/preview/route.ts` in your project.

3. Fetch previews from your frontend:

```typescript
const res = await fetch(`/api/preview?url=${encodeURIComponent("https://github.com")}`);
const data = await res.json();
// { title, description, image, siteName, ... }
```
