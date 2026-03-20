# Supabase Edge Function — Link Preview

A Supabase Edge Function (Deno) that returns link preview metadata.

## Setup

1. Copy `index.ts` to `supabase/functions/preview/index.ts` in your Supabase project.

2. Deploy:

```bash
supabase functions deploy preview
```

## Usage

```bash
curl "https://<your-project>.supabase.co/functions/v1/preview?url=https://github.com"
```
