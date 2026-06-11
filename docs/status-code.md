---
sidebar_position: 10
---

# Status Code

Halaman ini merangkum format response, HTTP status, status payment, dan error code yang perlu ditangani sistem tenant.

## Success Response

```json
{
  "success": true,
  "message": "ok",
  "data": {}
}
```

Create payment memakai message `created` dan HTTP status `201`.

## Error Response

```json
{
  "success": false,
  "code": "error_code",
  "message": "Pesan error"
}
```

Validation error dapat menyertakan detail field:

```json
{
  "success": false,
  "code": "invalid_request",
  "message": "validation error",
  "errors": {
    "expired_at": "invalid value, use epoch milliseconds"
  }
}
```

## HTTP Status

| Status | Arti | Contoh Kondisi |
| --- | --- | --- |
| `200` | OK | Get account, get payment, cancel payment sukses. |
| `201` | Created | Create payment sukses. |
| `400` | Bad Request | Body JSON tidak valid. |
| `401` | Unauthorized | API key tidak ada atau tidak valid. |
| `403` | Forbidden | API key bukan tenant atau account bukan milik merchant. |
| `404` | Not Found | Payment tidak ditemukan atau tidak bisa dicancel. |
| `409` | Conflict | `payment_code` duplicate atau nominal unik konflik. |
| `429` | Too Many Requests | Rate limit terlampaui. |
| `503` | Service Unavailable | Redis atau dependency penting tidak tersedia. |
| `500` | Internal Server Error | Gangguan internal API. |

## Status Payment

| Status | Keterangan | Terminal |
| --- | --- | --- |
| `PENDING` | Menunggu pembayaran. | Tidak |
| `PAID` | Pembayaran sudah terkonfirmasi. | Ya |
| `EXPIRED` | Payment melewati batas waktu. | Ya |
| `CANCELLED` | Payment dibatalkan. | Ya |

## Gateway Error Code

| Code | HTTP | Kapan Terjadi | Aksi Tenant |
| --- | --- | --- | --- |
| `unauthorized` | `401` | API key kosong atau tidak valid. | Kirim header `X-Api-Key` yang benar. |
| `tenant_api_key_required` | `403` | API key bukan tenant atau tidak punya merchant context. | Gunakan API key tenant yang benar. |
| `bad_request` | `400` | Body JSON tidak valid. | Periksa format JSON request. |
| `not_found` | `404` | Payment tidak ditemukan. | Pastikan `payment_code` benar dan milik merchant. |
| `validation_error` | `400` | Field request tidak memenuhi validasi awal. | Perbaiki payload sesuai field error. |
| `invalid_expired_at` | `400` | `expired_at` bukan epoch milliseconds valid atau tidak di masa depan. | Kirim epoch milliseconds yang benar. |
| `invalid_request` | `400` | Request tidak memenuhi aturan bisnis, termasuk customer contact kosong atau total item tidak sesuai. | Perbaiki payload sesuai message. |
| `account_not_owned` | `403` | `merchant_account_id` bukan milik merchant tenant. | Ambil account dari `GET /api/gateway/accounts`. |
| `no_active_quota` | `403` | Tenant tidak memiliki quota aktif. | Hubungi operator atau aktifkan quota. |
| `unique_amount_conflict` | `409` | Sistem tidak bisa membuat nominal unik tanpa konflik. | Retry create payment dengan jeda atau gunakan order baru. |
| `payment_code_conflict` | `409` | `payment_code` sudah dipakai merchant yang sama. | Gunakan `payment_code` unik per order. |
| `payment_not_cancellable` | `404` | Payment tidak ditemukan atau status tidak bisa dicancel. | Cek status payment sebelum cancel. |

## Rate Limit

Gateway membatasi request tenant pada **100 request per menit** per API key.

Jika menerima `429`, lakukan retry dengan backoff.

```javascript
async function requestWithBackoff(sendRequest, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await sendRequest();
    if (response.status !== 429) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }

  throw new Error('rate limit exceeded');
}
```

## Handling Rekomendasi

1. Treat `PAID`, `EXPIRED`, dan `CANCELLED` sebagai status final.
2. Retry hanya untuk error sementara seperti `429` dan `500`.
3. Jangan retry payload yang sama untuk `payment_code_conflict`; buat kode order/payment baru jika memang order baru.
4. Log semua error response untuk audit integrasi.
