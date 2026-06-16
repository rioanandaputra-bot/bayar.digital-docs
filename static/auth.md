# auth.md — Bayar Digital Agent Authentication

## Overview

Bayar Digital provides a payment gateway API for Indonesian merchants. This document describes how AI agents can authenticate to access the API.

## Authentication Methods

### API Key (Recommended for Agents)

1. Register at https://bayar.digital
2. Generate an API key from the dashboard
3. Include it in requests: `X-Api-Key: your-api-key`

### JWT Token

1. POST to `https://api.bayar.digital/auth/tenant/login` with email and password
2. Use the returned `access_token` in the `Authorization: Bearer` header

## Endpoints

- **API Base:** `https://api.bayar.digital`
- **Documentation:** `https://docs.bayar.digital`
- **Health:** `https://api.bayar.digital/health`

## Scopes

- `read` — View payments, accounts, and mutations
- `write` — Create payments and manage resources
- `admin` — Full administrative access
