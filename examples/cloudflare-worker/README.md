# Cloudflare Worker — Link Preview at the Edge

Deploy a link preview API to Cloudflare's edge network.

## Setup

```bash
npm install linkpeek
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```

## Usage

```bash
curl "https://link-preview-worker.<your-subdomain>.workers.dev/?url=https://github.com"
```
