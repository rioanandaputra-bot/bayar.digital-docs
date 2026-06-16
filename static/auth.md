# auth.md

You are an agent. Bayar Digital supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation.

- **Resource Server:** https://api.bayar.digital (the payment gateway API)
- **Authorization Server:** https://api.bayar.digital (handles registration and tokens)
- **Documentation:** https://docs.bayar.digital/llms-full.txt

## Step 1 — Discover

Fetch the Protected Resource Metadata:

```http
GET /.well-known/oauth-protected-resource
```

```json
{
  "resource": "https://docs.bayar.digital",
  "resource_name": "Bayar Digital Payment Gateway API",
  "authorization_servers": ["https://api.bayar.digital"],
  "scopes_supported": ["read", "write", "admin"],
  "bearer_methods_supported": ["header"]
}
```

Then fetch the Authorization Server metadata to get the `agent_auth` block:

```http
GET /.well-known/oauth-authorization-server
```

```json
{
  "issuer": "https://api.bayar.digital",
  "agent_auth": {
    "skill": "/auth.md",
    "register_uri": "https://bayar.digital/auth/register",
    "identity_endpoint": "https://api.bayar.digital/agent/identity",
    "claim_endpoint": "https://api.bayar.digital/agent/identity/claim",
    "events_endpoint": "https://api.bayar.digital/agent/event/notify",
    "identity_types_supported": ["anonymous", "identity_assertion", "service_auth"],
    "supported_credential_types": ["access_token"]
  }
}
```

## Step 2 — Register

Decide which identity type fits your capabilities:

| Identity Type | When To Use |
|---|---|
| **anonymous** | No pre-existing identity; register instantly |
| **identity_assertion** | You hold a JWT assertion from another issuer |
| **service_auth** | You have a pre-provisioned service credential |

### Anonymous Registration

```http
POST https://api.bayar.digital/agent/identity
Content-Type: application/json

{
  "identity_type": "anonymous",
  "client_name": "my-agent"
}
```

### Identity Assertion Registration

If you hold an `id_jag` token from an upstream issuer:

```http
POST https://api.bayar.digital/agent/identity
Content-Type: application/jose+json

{
  "identity_type": "identity_assertion",
  "assertion": "<id_jag token>",
  "client_name": "my-agent"
}
```

## Step 3 — Claim a Client Credential

If the identity response includes a `claim_uri`, POST to it to finalise registration:

```http
POST https://api.bayar.digital/agent/identity/claim
Content-Type: application/json

{
  "identity_id": "<identity_id from Step 2>"
}
```

Response:

```json
{
  "client_id": "agent_abc123",
  "client_secret": "secret_xyz789"
}
```

## Step 4 — Exchange for Access Token

```http
POST https://api.bayar.digital/auth/platform/login
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=agent_abc123&client_secret=secret_xyz789&scope=read+write
```

Response:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "scope": "read write",
  "expires_in": 3600
}
```

## Step 5 — Call the API

Include the access token in all requests:

```http
GET https://api.bayar.digital/health
Authorization: Bearer eyJhbGciOi...
```

## Step 6 — Handle Revocation

If you receive a revocation event (via the `events_endpoint` webhook or a 401 response), re-register starting from Step 2.

## Scopes

- `read` — View payments, accounts, and mutations
- `write` — Create payments and manage resources
- `admin` — Full administrative access

## Endpoints

- **API Base:** `https://api.bayar.digital`
- **Health:** `https://api.bayar.digital/health`
- **Revocation:** `https://api.bayar.digital/auth/platform/revoke`
