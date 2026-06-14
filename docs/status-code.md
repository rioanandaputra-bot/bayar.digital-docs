---
sidebar_position: 13
---

# Status & Error Code

---

## HTTP Status

| Status | Arti |
|--------|------|
| `200` | OK |
| `201` | Created (create payment) |
| `400` | Bad request / validation error |
| `401` | API Key kosong atau tidak valid |
| `403` | Tidak punya akses |
| `404` | Tidak ditemukan |
| `409` | Conflict (duplicate, cancel gagal) |
| `429` | Rate limit |
| `500` | Server error |

---

## Status Payment

| Status | Arti | Terminal |
|--------|------|----------|
| `PENDING` | Menunggu pembayaran | Tidak |
| `PAID` | Terkonfirmasi lunas | Ya |
| `EXPIRED` | Melewati batas waktu | Ya |
| `CANCELLED` | Dibatalkan merchant | Ya |

---

## Status Webhook

| Status | Arti |
|--------|------|
| `PENDING` | Menunggu dikirim |
| `RETRYING` | Gagal, akan di-retry |
| `SUCCESS` | Berhasil (response 2xx dari server kamu) |
| `FAILED` | Gagal total (melebihi maks retry) |

---

## Error Code

| Code | HTTP | Penyebab | Solusi |
|------|------|----------|--------|
| `unauthorized` | 401 | API Key kosong / tidak valid | Kirim `X-Api-Key` yang benar |
| `tenant_api_key_required` | 403 | API Key bukan merchant tenant | Gunakan API Key dari merchant |
| `bad_request` | 400 | JSON / body tidak valid | Perbaiki format request |
| `validation_error` | 400 | Field tidak valid | Cek `errors` di response |
| `invalid_expired_at` | 400 | Format `payment_expired_at` salah / sudah lewat | Kirim ISO 8601 di masa depan |
| `not_found` | 404 | Payment tidak ditemukan | Cek `payment_code` |
| `payment_not_cancellable` | 404 | Payment bukan `PENDING` | Cek status sebelum cancel |
| `account_not_owned` | 403 | `account_id` bukan milik merchant | Ambil dari `GET /gateway/accounts` |
| `no_active_quota` | 403 | Kuota akun habis | Top up di Dashboard |
| `totp_not_enabled` | 403 | 2FA belum diaktifkan | Setup 2FA di pengaturan profil |
| `payment_code_conflict` | 409 | `payment_code` sudah dipakai | Gunakan kode unik |
| `unique_amount_conflict` | 409 | Gagal buat nominal unik | Retry beberapa detik lagi |
| `rate_limited` | 429 | Terlalu banyak request | Tunggu sesuai `X-RateLimit-Reset` |
| `internal_error` | 500 | Server error | Retry dengan backoff |

---

## Error Handling

### Retry yang Aman

Hanya retry untuk error **sementara**: `429` (rate limit) dan `500` (server error).

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

### Error yang JANGAN di-retry otomatis

| Error | Alasan | Tindakan |
|-------|--------|----------|
| `payment_code_conflict` (409) | `payment_code` sudah dipakai | Gunakan kode baru |
| `validation_error` (400) | Field tidak valid | Perbaiki request |
| `account_not_owned` (403) | `account_id` salah | Ambil dari `GET /gateway/accounts` |
| `no_active_quota` (403) | Kuota habis | Top up di Dashboard |
| `payment_not_cancellable` (404) | Status bukan `PENDING` | Cek status dulu |
| `unique_amount_conflict` (409) | Nominal unik bentrok | Bisa retry setelah beberapa detik |

---

## Ringkasan

| Error | Retry? | Aksi |
|-------|--------|------|
| `429` Rate limit | Ya | Tunggu `X-RateLimit-Reset` |
| `500` Server error | Ya | Backoff |
| `400` Validation | Tidak | Perbaiki request |
| `409` Duplicate code | Tidak | Pakai kode baru |
| `409` Unique amount | Ya | Tunggu & retry |
| `404` Not cancellable | Tidak | Cek status dulu |
| `403` Account | Tidak | Ambil dari `GET /gateway/accounts` |
| `401` Unauthorized | Tidak | Periksa API Key |

