---
sidebar_position: 8
---

# Webhook

Bayar Digital mengirim HTTP POST ke `callback_url` kamu saat status payment berubah.

## Setup

Kirim `callback_url` saat create payment:

```json
{
  "callback_url": "https://yourserver.com/webhooks/bayar"
}
```

## Payload

```json
{
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount_total": 50123,
  "paid_at": 1749643500000,
  "event": "payment.status_changed"
}
```

## Signature Verification

Jika `callback_secret` dikonfigurasi di dashboard, webhook menyertakan header:

```
X-Signature: <hex_hmac_sha256>
```

Signature = HMAC-SHA256 dari raw JSON body menggunakan `callback_secret`.

## Handler Kamu Harus

1. Verifikasi signature (jika pakai `callback_secret`)
2. Validasi `payment_code` ada di sistem kamu
3. Validasi `amount_total` sesuai order
4. Update status order secara **idempotent**
5. Balas `200 OK`

:::tip
Jika proses update order berat, simpan payload dulu, balas `200`, proses async.
:::

## Idempotency

Webhook bisa dikirim lebih dari sekali. Pastikan handler aman dipanggil berulang:

- Order sudah `PAID` → abaikan webhook `PAID` berikutnya
- Jangan ubah order `PAID` ke status lain
- Log semua payload untuk audit

## Contoh Handler

### Node.js (Express)

```javascript
const crypto = require('crypto');

app.post('/webhooks/bayar', express.json(), (req, res) => {
  // Verifikasi signature
  if (process.env.CALLBACK_SECRET) {
    const expected = crypto
      .createHmac('sha256', process.env.CALLBACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (req.headers['x-signature'] !== expected) {
      return res.status(401).json({ status: 'invalid signature' });
    }
  }

  const { payment_code, status, amount_total } = req.body;

  // Cari order, validasi amount, update status idempotent

  res.json({ status: 'received' });
});
```

### PHP (Laravel)

```php
Route::post('webhooks/bayar', function (Request $request) {
    $secret = config('services.bayar.callback_secret');

    if ($secret) {
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        if (!hash_equals($expected, $request->header('X-Signature', ''))) {
            return response()->json(['status' => 'invalid signature'], 401);
        }
    }

    $data = $request->validate([
        'payment_code' => 'required|string',
        'status' => 'required|in:PENDING,PAID,EXPIRED,CANCELLED',
        'amount_total' => 'required|integer',
    ]);

    // Cari order, validasi amount, update status idempotent

    return response()->json(['status' => 'received']);
});
```

### Python (FastAPI)

```python
import hmac, hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/bayar")
async def webhook(request: Request):
    body = await request.body()
    secret = os.environ.get("CALLBACK_SECRET")

    if secret:
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, request.headers.get("x-signature", "")):
            raise HTTPException(401, "invalid signature")

    data = await request.json()

    # Cari order, validasi amount, update status idempotent

    return {"status": "received"}
```
