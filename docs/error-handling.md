---
sidebar_position: 12
---

# Error Handling

Panduan menangani error dari Bayar Digital API secara konsisten dan idempotent.

## Idempotency

Webhook dan beberapa error membutuhkan handler yang idempotent — aman dipanggil berulang kali.

**Kunci idempotency yang bisa dipakai:**

- `payment_id` — unik per payment
- `payment_code` — unik per order tenant
- Kombinasi `payment_code` + `status`

**Aturan dasar:**

1. Jika order sudah `PAID`, abaikan webhook `PAID` berikutnya.
2. Jangan ubah order `PAID` menjadi status sebelumnya.
3. Simpan log payload webhook untuk audit.

## Retry dengan Backoff

Untuk error sementara (`429`, `500`, timeout), lakukan retry dengan **exponential backoff**.

```javascript
// Node.js
async function requestWithBackoff(sendRequest, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await sendRequest();
    if (response.status !== 429 && response.status < 500) {
      return response;
    }
    const retryAfter = parseInt(response.headers.get('X-RateLimit-Reset') || `${1000 * (attempt + 1)}`, 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
  }
  throw new Error('request failed after retries');
}
```

```php
// PHP
function requestWithBackoff(callable $sendRequest, int $maxRetries = 3): array {
    for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
        $response = $sendRequest();
        $statusCode = $response['status'] ?? 0;
        if ($statusCode !== 429 && $statusCode < 500) {
            return $response;
        }
        $retryAfter = $response['headers']['X-RateLimit-Reset'] ?? ($attempt + 1);
        sleep((int) $retryAfter);
    }
    throw new \RuntimeException('request failed after retries');
}
```

```python
# Python
import time

def request_with_backoff(send_request, max_retries=3):
    for attempt in range(max_retries + 1):
        response = send_request()
        if response.status_code not in (429,) and response.status_code < 500:
            return response
        retry_after = int(response.headers.get('X-RateLimit-Reset', attempt + 1))
        time.sleep(retry_after)
    raise Exception('request failed after retries')
```

## Rate Limit

| Status | Arti | Aksi |
| --- | --- | --- |
| `429` | Terlalu banyak request | Baca header `X-RateLimit-Reset`, tunggu sebelum retry |

**Header rate limit:**

| Header | Contoh | Arti |
| --- | --- | --- |
| `X-RateLimit-Limit` | `3000` | Batas maksimum |
| `X-RateLimit-Remaining` | `2834` | Sisa request |
| `X-RateLimit-Reset` | `42` | Detik hingga window reset |

Read (`GET`) dan write (`POST`/`DELETE`) punya limit terpisah. Lihat [Status Code](./status-code#rate-limit) untuk detail.

## Duplicate payment_code

Jika create payment mengembalikan `409` dengan `payment_code_conflict`:

- **Jangan retry dengan `payment_code` yang sama.**
- Gunakan `payment_code` baru untuk order yang benar-benar baru.
- Jika hanya ingin cek status payment yang sudah ada, gunakan `GET /gateway/payments/{payment_code}`.

## unique_amount_conflict

Error `409` dengan `unique_amount_conflict` terjadi saat sistem tidak bisa membuat nominal unik tanpa konflik.

- Retry create payment dengan jeda beberapa detik.
- Gunakan order baru dengan `payment_code` baru jika konflik terus terjadi.

## Webhook Gagal

Jika endpoint tenant gagal menerima webhook:

1. Bayar Digital akan mencoba mengirim ulang (retry internal).
2. Pastikan handler idempotent — menerima payload yang sama berulang kali tidak boleh mengubah data.
3. Balas `2xx` hanya setelah payload berhasil divalidasi dan disimpan.
4. Jika proses update order berat, simpan payload dulu, balas `2xx`, lalu proses async.

## Ringkasan Error Code

| Code | HTTP | Retry? | Aksi |
| --- | --- | --- | --- |
| `rate_limited` | `429` | Ya, dengan backoff | Baca `X-RateLimit-Reset` |
| `internal_error` | `500` | Ya, dengan backoff | Hubungi operator jika persisten |
| `validation_error` | `400` | Tidak | Perbaiki payload |
| `payment_code_conflict` | `409` | Tidak | Gunakan kode baru |
| `unique_amount_conflict` | `409` | Ya, dengan jeda | Retry atau gunakan order baru |
| `payment_not_cancellable` | `404` | Tidak | Cek status payment |
| `account_not_owned` | `403` | Tidak | Ambil account dari `GET /gateway/accounts` |

Lihat [Status Code](./status-code) untuk daftar lengkap.
