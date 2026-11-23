# Ai

A Persian-first AI chat application built with Next.js.

## Provider connection

The server route at `/api/chat` is prepared for an OpenAI-compatible chat-completions API. Provider settings are read only on the server:

- `IVIRA_API_URL`: full HTTPS chat-completions endpoint.
- `IVIRA_API_KEY`: access token.
- `IVIRA_MODEL`: model identifier accepted by the provider.

**Important:** The public information currently available for IVIRA does not establish the exact endpoint, request format, or model identifier for the token shared in this project. Do not guess these values. Obtain the API documentation or integration details from IVIRA, then add the three values as private deployment environment variables. Never commit a real token to this repository or expose it in browser-side JavaScript.

The route currently expects an OpenAI-compatible response at `choices[0].message.content`. If IVIRA uses a different format, adapt the server route to its documented schema.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Create a local `.env.local` file with the three variables above. Do not commit that file.

## Privacy and limits

Messages are forwarded to the configured AI provider. Review that provider's privacy terms before sending personal or confidential information. The app limits each request to 30 messages and 12,000 characters per message; provider-side quotas and limits still apply.
