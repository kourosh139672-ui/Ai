# PixAI

A Persian-first, responsive AI chat prototype with a white-and-purple interface.

## Current integration

- Provider: [Vireonix](https://vireonix.ai/docs)
- Endpoint: `https://vireonix.ai/v1/chat/completions`
- Public model route: `auto`
- No user API key or account is required by the upstream service.
- Requests are sent through a Next.js server route at `/api/chat`.

Vireonix publishes hourly per-IP fair-use budgets. This is **not unlimited service**; requests can receive HTTP 429 when the budget is exhausted. Its public model route and capacity may change.

## Privacy notice

Messages sent through PixAI are forwarded to Vireonix. Its terms say prompts, outputs, and related chat traces may be retained and used for service improvement and model training. Do not send passwords, private identifiers, confidential files, or other sensitive information. Show this disclosure to users before public launch and review Vireonix's current privacy policy and terms.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

No `.env` file or API key is required for the current Vireonix integration.

## Deploy

Deploy as a Next.js app (for example, on Vercel) by importing this repository. No provider secret is needed for the current keyless endpoint.

## Important production notes

- The current UI uses the single public Vireonix route, `auto`; it is not a true multi-provider model selector yet.
- The API route validates message roles and caps the forwarded conversation size, but it does not yet provide user accounts, per-user quotas, abuse protection, or persistent chat history.
- Before opening the app publicly, add application-level rate limiting and abuse controls. Do not try to evade Vireonix's per-IP limits.
- Vireonix is an external third-party service. Availability, routing, model pool, and fair-use limits can change.
