---
sidebar_position: 3
---

# Authentication

Semua endpoint `/gateway/*` membutuhkan API key via header.

```bash
curl https://api.bayar.digital/gateway/accounts \
  -H "X-Api-Key: pk_..."
```

## Setup

Simpan API key di environment variable backend kamu:

```bash
BAYAR_DIGITAL_API_KEY=pk_...
BAYAR_DIGITAL_BASE_URL=https://api.bayar.digital
```

:::warning
API key hanya boleh dipakai dari backend. Jangan expose di frontend, mobile app, atau repository.
:::

## Error Response

| Kondisi | HTTP | Code |
| --- | --- | --- |
| Header `X-Api-Key` kosong | `401` | `unauthorized` |
| API key tidak valid | `401` | `unauthorized` |
| API key bukan milik tenant | `403` | `tenant_api_key_required` |

## Rate Limit

**100 request/menit** per merchant untuk semua endpoint `/gateway/*`.

Header response:

| Header | Keterangan |
| --- | --- |
| `X-RateLimit-Limit` | Batas maksimum |
| `X-RateLimit-Remaining` | Sisa request |
| `X-RateLimit-Reset` | Detik sampai reset |

Jika limit terlampaui → HTTP `429` dengan code `RATE_LIMIT_EXCEEDED`. Tunggu sesuai `X-RateLimit-Reset` sebelum retry.
