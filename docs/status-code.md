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
| `402` | Quota habis |
| `403` | Tidak punya akses |
| `404` | Tidak ditemukan |
| `409` | Conflict (duplicate, cancel gagal) |
| `429` | Rate limit |
| `500` | Server error |

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
| `UNAUTHORIZED` | 401 | API key kosong/invalid | Kirim `X-Api-Key` yang benar |
| `FORBIDDEN` | 403 | API key bukan tenant | Gunakan API key tenant |
| `BAD_REQUEST` | 400 | JSON tidak valid | Perbaiki format JSON |
| `VALIDATION_ERROR` | 400 | Field tidak valid | Cek `errors` object di response |
| `INVALID_AMOUNT` | 400 | `amount_original` < 1000 | Naikkan nominal |
| `INVALID_EXPIRY_DATE` | 400 | `expired_at` bukan epoch ms atau sudah lewat | Kirim epoch ms di masa depan |
| `INVALID_EMAIL` | 400 | Format email salah | Perbaiki `customer_email` |
| `INVALID_CALLBACK_URL` | 400 | URL tidak valid/localhost | Gunakan URL publik |
| `MERCHANT_ACCOUNT_INACTIVE` | 400 | Account tidak aktif | Aktifkan di dashboard |
| `PAYMENT_NOT_FOUND` | 404 | Payment tidak ada | Cek `payment_code` |
| `account_not_owned` | 403 | Account bukan milik merchant | Ambil dari `GET /gateway/accounts` |
| `no_active_quota` | 402 | Quota habis | Top up quota di dashboard |
| `payment_code_conflict` | 409 | `payment_code` sudah dipakai | Gunakan kode unik |
| `unique_amount_conflict` | 409 | Gagal buat nominal unik | Retry setelah beberapa detik |
| `PAYMENT_NOT_CANCELLABLE` | 409 | Payment bukan PENDING | Cek status sebelum cancel |
| `RATE_LIMIT_EXCEEDED` | 429 | Terlalu banyak request | Tunggu `X-RateLimit-Reset` detik |
| `INTERNAL_ERROR` | 500 | Server error | Retry dengan backoff |

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
