---
sidebar_position: 11
---

# Status & Error Code

## HTTP Status

| Status | Arti |
| --- | --- |
| `200` | OK |
| `201` | Created (create payment) |
| `400` | Bad request / validation error |
| `401` | API key kosong atau tidak valid |
| `403` | Tidak punya akses |
| `404` | Tidak ditemukan |
| `409` | Conflict (duplicate, cancel gagal) |
| `429` | Rate limit |
| `500` | Server error |
| `503` | Dependency sementara tidak tersedia |

## Status Payment

| Status | Arti | Terminal |
| --- | --- | --- |
| `PENDING` | Menunggu pembayaran | Tidak |
| `PAID` | Terkonfirmasi | Ya |
| `EXPIRED` | Melewati batas waktu | Ya |
| `CANCELLED` | Dibatalkan | Ya |

## Error Code

| Code | HTTP | Penyebab | Solusi |
| --- | --- | --- | --- |
| `unauthorized` | 401 | API key kosong/invalid | Kirim `X-Api-Key` yang benar |
| `tenant_api_key_required` | 403 | API key bukan tenant gateway | Gunakan API key merchant tenant |
| `bad_request` | 400 | JSON/body tidak valid | Perbaiki format request |
| `validation_error` | 400 | Field tidak valid | Cek `errors` object di response |
| `invalid_expired_at` | 400 | `expired_at` bukan epoch ms valid atau sudah lewat | Kirim epoch ms di masa depan |
| `invalid_request` | 400 | Request tidak lolos validasi bisnis | Cek email/phone, order items, total, callback URL |
| `not_found` | 404 | Payment/checkout tidak ditemukan | Cek ID atau `payment_code` |
| `account_not_owned` | 403 | Account bukan milik merchant | Ambil account dari `GET /gateway/accounts` |
| `no_active_quota` | 403 | Quota habis/tidak aktif | Top up quota di dashboard |
| `payment_code_conflict` | 409 | `payment_code` sudah dipakai | Gunakan kode unik |
| `unique_amount_conflict` | 409 | Gagal buat nominal unik | Retry setelah beberapa detik |
| `payment_not_cancellable` | 404 | Payment bukan `PENDING` atau tidak ditemukan | Cek status sebelum cancel |
| `rate_limited` | 429 | Terlalu banyak request | Tunggu `X-RateLimit-Reset` detik |
| `internal_error` | 500 | Server error | Retry dengan backoff |
| `error` | 503 | Redis/dependency rate limiter tidak tersedia | Retry beberapa saat kemudian |

## Error Handling

Retry hanya untuk error sementara: `429` (rate limit) dan `500` (server error).

```javascript
async function callAPI(request, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    const res = await request();
    if (res.status !== 429 && res.status < 500) return res;
    const wait = parseInt(res.headers.get('X-RateLimit-Reset') || i + 1, 10);
    await new Promise(r => setTimeout(r, wait * 1000));
  }
  throw new Error('request failed after retries');
}
```

```php
function callAPI(callable $request, int $maxRetries = 3): array {
    for ($i = 0; $i <= $maxRetries; $i++) {
        $res = $request();
        if ($res['status'] !== 429 && $res['status'] < 500) return $res;
        $wait = $res['headers']['X-RateLimit-Reset'] ?? ($i + 1);
        sleep((int) $wait);
    }
    throw new \RuntimeException('request failed after retries');
}
```

```python
import time

def call_api(request, max_retries=3):
    for i in range(max_retries + 1):
        res = request()
        if res.status_code != 429 and res.status_code < 500:
            return res
        wait = int(res.headers.get('X-RateLimit-Reset', i + 1))
        time.sleep(wait)
    raise Exception('request failed after retries')
```

### Error Spesifik

- **`payment_code_conflict` (409):** `payment_code` sudah dipakai. **Jangan retry.** Gunakan kode baru atau cek status via `GET /gateway/payments/{payment_code}`.
- **`unique_amount_conflict` (409):** Gagal buat nominal unik. Retry setelah beberapa detik.
- **Webhook gagal:** Bayar Digital retry otomatis. Pastikan handler idempotent, balas `2xx` setelah payload disimpan. Gunakan `GET /gateway/payments/{payment_code}` sebagai fallback.

### Ringkasan

| Error | Retry? | Aksi |
| --- | --- | --- |
| `429` Rate limit | Ya | Tunggu `X-RateLimit-Reset` |
| `500` Server error | Ya | Backoff |
| `400` Validation | Tidak | Perbaiki request |
| `409` Duplicate code | Tidak | Pakai kode baru |
| `409` Unique amount | Ya | Tunggu & retry |
| `409` Not cancellable | Tidak | Cek status dulu |
| `403` Account | Tidak | Ambil dari `GET /gateway/accounts` |
