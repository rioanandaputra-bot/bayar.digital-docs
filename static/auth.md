# auth.md

You are an agent. Bayar Digital supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation.

- **Resource Server:** https://api.bayar.digital (the payment gateway API)
- **Authorization Server:** https://api.bayar.digital (handles registration and tokens)
- **Documentation:** https://docs.bayar.digital/llms-full.txt

## Step 1 — Discover

Discovery starts at `/.well-known/oauth-protected-resource`:

```http
GET /.well-known/oauth-protected-resource
```

```json
{
  "resource": "https://api.bayar.digital",
  "resource_name": "Bayar Digital Payment Gateway API",
  "authorization_servers": ["https://api.bayar.digital"],
  "scopes_supported": ["read", "write", "admin"],
  "bearer_methods_supported": ["header"]
}
```

Then fetch authorization server metadata at `https://api.bayar.digital/.well-known/oauth-authorization-server` to get the `agent_auth` block.

## Authentication Methods

### API Key (Recommended for Agents)

1. Register at https://bayar.digital
2. Generate an API key from the dashboard
3. Include it in requests: `X-Api-Key: your-api-key`

### JWT Token

1. POST to `https://api.bayar.digital/auth/tenant/login` with email and password
2. Use the returned `access_token` in the `Authorization: Bearer` header

## Scopes

- `read` — View payments, accounts, and mutations
- `write` — Create payments and manage resources
- `admin` — Full administrative access

## Endpoints

- **API Base:** `https://api.bayar.digital`
- **Health:** `https://api.bayar.digital/health`
- **Revocation:** `https://api.bayar.digital/auth/platform/revoke`
