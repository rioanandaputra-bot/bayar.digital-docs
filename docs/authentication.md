---
sidebar_position: 2
---

# Authentication

Semua endpoint gateway tenant wajib memakai API key melalui header `X-Api-Key`.

```http
X-Api-Key: pk_...
Content-Type: application/json
```

API key harus dikirim dari backend tenant. Jangan kirim API key dari browser, aplikasi mobile customer, atau source code frontend.

## Header Request

| Header | Required | Keterangan |
| --- | --- | --- |
| `X-Api-Key` | Ya | API key tenant untuk merchant yang mengakses gateway. |
| `Content-Type` | Ya untuk body JSON | Gunakan `application/json`. |

Contoh:

```bash
curl https://api.bayar.digital/gateway/accounts \
  -H "X-Api-Key: pk_..."
```

## Tenant API Key

Endpoint `/gateway/*` hanya menerima API key tenant. Jika API key bukan milik tenant atau tidak terkait merchant aktif, request akan ditolak.

Jika header API key kosong, API mengembalikan `401`:

```json
{
  "success": false,
  "code": "unauthorized",
  "message": "missing api key"
}
```

Jika API key diisi tetapi tidak terdaftar, API mengembalikan `401`:

```json
{
  "success": false,
  "code": "unauthorized",
  "message": "invalid api key"
}
```

Jika API key valid tetapi bukan API key tenant gateway, API mengembalikan `403`:

```json
{
  "success": false,
  "code": "tenant_api_key_required",
  "message": "tenant api key required"
}
```

## Penyimpanan API Key

Simpan API key di environment backend tenant.

```bash
BAYAR_DIGITAL_API_KEY=pk_...
BAYAR_DIGITAL_BASE_URL=https://api.bayar.digital
```

Praktik keamanan:

1. Jangan commit API key ke repository.
2. Jangan expose API key di response API tenant.
3. Jangan gunakan API key di JavaScript frontend.
4. Rotasi API key jika ada indikasi bocor.
5. Pisahkan API key production dan development.

## Rate Limit

Gateway menerapkan rate limit **100 request per menit** per IP.

Jika terkena rate limit, tenant harus melakukan retry dengan jeda dan tidak mengirim request berulang tanpa backoff.
