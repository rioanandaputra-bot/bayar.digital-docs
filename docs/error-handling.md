---
sidebar_position: 12
---

# Error Handling

## Retry Strategy

Retry hanya untuk error sementara: `429` (rate limit) dan `500` (server error).

```javascript
// Node.js
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
// PHP
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
# Python
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

## Error Spesifik

### `payment_code_conflict` (409)

`payment_code` sudah dipakai. **Jangan retry.** Gunakan kode baru untuk order baru, atau cek status payment yang sudah ada via `GET /gateway/payments/{payment_code}`.

### `unique_amount_conflict` (409)

Gagal buat nominal unik tanpa konflik. Retry setelah beberapa detik. Jika masih gagal, buat order baru dengan `payment_code` baru.

### Webhook gagal diterima

1. Bayar Digital akan retry otomatis
2. Pastikan handler idempotent
3. Balas `2xx` setelah payload disimpan
4. Gunakan `GET /gateway/payments/{payment_code}` sebagai fallback

## Ringkasan

| Error | Retry? | Aksi |
| --- | --- | --- |
| `429` Rate limit | Ya | Tunggu `X-RateLimit-Reset` |
| `500` Server error | Ya | Backoff |
| `400` Validation | Tidak | Perbaiki request |
| `409` Duplicate code | Tidak | Pakai kode baru |
| `409` Unique amount | Ya | Tunggu & retry |
| `409` Not cancellable | Tidak | Cek status dulu |
| `403` Account | Tidak | Ambil dari `GET /gateway/accounts` |
