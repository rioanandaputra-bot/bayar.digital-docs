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

Create payment memakai `code: "PAYMENT_CREATED"` dan HTTP status `201`.

## Error Response

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error"
}
```

Validation error dapat menyertakan detail field:

```json
{
  "success": false,
  "code": "INVALID_EXPIRY_DATE",
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
| `404` | Not Found | Payment tidak ditemukan. |
| `402` | Payment Required | Quota tenant habis. |
| `409` | Conflict | `payment_code` duplicate atau nominal unik konflik. Payment tidak bisa dicancel. |
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
| `UNAUTHORIZED` | `401` | API key kosong atau tidak valid. | Kirim header `X-Api-Key` yang benar. |
| `FORBIDDEN` | `403` | API key bukan tenant atau tidak punya akses. | Gunakan API key tenant yang benar. |
| `BAD_REQUEST` | `400` | Body JSON tidak valid. | Periksa format JSON request. |
| `VALIDATION_ERROR` | `400` | Field request tidak memenuhi validasi. | Perbaiki payload sesuai `errors` object. |
| `INVALID_AMOUNT` | `400` | `amount_original` < 1000. | Perbaiki nominal. |
| `INVALID_MERCHANT_ACCOUNT_ID` | `400` | `merchant_account_id` bukan UUID valid. | Perbaiki format ID. |
| `INVALID_EXPIRY_DATE` | `400` | `expired_at` bukan epoch milliseconds atau sudah lewat. | Kirim epoch milliseconds di masa depan. |
| `INVALID_EMAIL` | `400` | Format email tidak valid. | Perbaiki `customer_email`. |
| `INVALID_CALLBACK_URL` | `400` | `callback_url` tidak valid atau menuju localhost. | Gunakan URL publik. |
| `MERCHANT_ACCOUNT_INACTIVE` | `400` | Account pembayaran tidak aktif. | Aktifkan di dashboard. |
| `NOT_FOUND` | `404` | Payment tidak ditemukan. | Pastikan `payment_code` benar. |
| `PAYMENT_NOT_FOUND` | `404` | Payment tidak ditemukan. | Gunakan `payment_code` yang valid. |
| `account_not_owned` | `403` | `merchant_account_id` bukan milik merchant. | Ambil account dari `GET /gateway/accounts`. |
| `no_active_quota` | `403` | Quota tenant habis. | Hubungi operator. |
| `unique_amount_conflict` | `409` | Tidak bisa membuat nominal unik tanpa konflik. | Retry dengan jeda atau order baru. |
| `payment_code_conflict` | `409` | `payment_code` sudah dipakai merchant yang sama. | Gunakan `payment_code` unik. |
| `PAYMENT_NOT_CANCELLABLE` | `409` | Payment bukan `PENDING` atau tidak ditemukan. | Cek status sebelum cancel. |
| `RATE_LIMIT_EXCEEDED` | `429` | Rate limit terlampaui. | Retry dengan backoff. |
| `INTERNAL_ERROR` | `500` | Gangguan internal server. | Retry dengan backoff, hubungi operator jika persisten. |

## Rate Limit

Setiap endpoint gateway dibatasi per **merchant** menggunakan sliding window:

| Endpoint | Limit Default | Key |
| --- | --- | --- |
| Gateway API (`/gateway/*`) | **100 request per menit** per merchant | Merchant ID |
| Checkout (`/checkout/:id`) | **60 request per menit** per IP | IP Address |

Setiap response menyertakan header rate limit:

| Header | Contoh | Arti |
| --- | --- | --- |
| `X-RateLimit-Limit` | `100` | Batas maksimum request dalam window. |
| `X-RateLimit-Remaining` | `83` | Sisa request yang tersisa. |
| `X-RateLimit-Reset` | `42` | Detik hingga window reset. |

Jika limit terlampaui, API mengembalikan `429` dengan `"code": "RATE_LIMIT_EXCEEDED"`. Tenant harus melakukan retry dengan backoff dan membaca `X-RateLimit-Reset` untuk jeda yang tepat.

```javascript
async function requestWithBackoff(sendRequest, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await sendRequest();
    if (response.status !== 429) {
      return response;
    }
    const retryAfter = parseInt(response.headers.get('X-RateLimit-Reset') || `${1000 * (attempt + 1)}`, 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
  }

  throw new Error('rate limit exceeded');
}
```

## Handling Rekomendasi

1. Treat `PAID`, `EXPIRED`, dan `CANCELLED` sebagai status final.
2. Retry hanya untuk error sementara seperti `RATE_LIMIT_EXCEEDED` (`429`) dan `INTERNAL_ERROR` (`500`).
3. Jangan retry payload yang sama untuk `payment_code_conflict`; buat kode order/payment baru jika memang order baru.
4. Log semua error response untuk audit integrasi.
