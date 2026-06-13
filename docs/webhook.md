---
sidebar_position: 8
---

# Webhook

Bayar Digital mengirim HTTP POST ke **Webhook URL** Anda saat status payment berubah.

## Setup

Webhook URL dan Webhook Secret dikonfigurasi secara terpusat (global) melalui Dashboard Tenant pada pengaturan Merchant Anda demi alasan keamanan. Sistem tidak menerima parameter webhook dinamis di request body saat pembuatan payment.

Setiap perubahan status pembayaran akan secara otomatis memicu pengiriman notifikasi webhook ke URL tersebut.

## Payload

Sistem mengirimkan payload dengan struktur JSON berikut:

```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount": 50123,
  "paid_at": "2026-06-11T10:05:00Z"
}
```

## Signature Verification

Jika **Webhook Secret** (HMAC Secret) dikonfigurasi di dashboard, setiap request webhook menyertakan header:

```
X-Signature: <hex_hmac_sha256>
```

Signature dihitung sebagai HMAC-SHA256 dari *raw JSON body* menggunakan Webhook Secret Anda.

## Handler Anda Harus

1. Verifikasi signature (jika menggunakan Webhook Secret)
2. Validasi `payment_code` terdaftar di sistem internal Anda
3. Validasi `amount` sesuai dengan `payment_total` pada order Anda
4. Perbarui status order secara **idempotent**
5. Kembalikan response `200 OK`

:::tip
Jika proses update order di sistem Anda membutuhkan waktu lama, simpan payload terlebih dahulu ke antrean, kembalikan respon `200 OK`, lalu proses secara asinkron.
:::

## Idempotency

Webhook bisa dikirim lebih dari sekali oleh sistem retry Bayar Digital. Pastikan handler Anda aman dipanggil berulang kali:

- Jika order sudah `PAID` → abaikan notifikasi `PAID` berikutnya
- Jangan ubah status order yang sudah `PAID` kembali ke status lain
- Log semua payload webhook yang masuk untuk keperluan audit

## Contoh Handler

### Node.js (Express)

```javascript
const crypto = require('crypto');

app.post('/webhooks/bayar', express.json(), (req, res) => {
  // Verifikasi signature
  if (process.env.WEBHOOK_SECRET) {
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (req.headers['x-signature'] !== expected) {
      return res.status(401).json({ status: 'invalid signature' });
    }
  }

  const { payment_id, payment_code, status, amount } = req.body;

  // Cari order, validasi amount, update status idempotent

  res.json({ status: 'received' });
});
```

### PHP (Laravel)

```php
Route::post('webhooks/bayar', function (Request $request) {
    $secret = config('services.bayar.webhook_secret');

    if ($secret) {
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        if (!hash_equals($expected, $request->header('X-Signature', ''))) {
            return response()->json(['status' => 'invalid signature'], 401);
        }
    }

    $data = $request->validate([
        'payment_code' => 'required|string',
        'status' => 'required|in:PENDING,PAID,EXPIRED,CANCELLED',
        'amount' => 'required|integer',
    ]);

    // Cari order, validasi amount, update status idempotent

    return response()->json(['status' => 'received']);
});
```

### Python (FastAPI)

```python
import os
import hmac, hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/bayar")
async def webhook(request: Request):
    body = await request.body()
    secret = os.environ.get("WEBHOOK_SECRET")

    if secret:
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, request.headers.get("x-signature", "")):
            raise HTTPException(401, "invalid signature")

    data = await request.json()

    # Cari order, validasi amount, update status idempotent

    return {"status": "received"}
```
