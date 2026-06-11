---
sidebar_position: 9
---

# Webhook

Webhook adalah callback HTTP dari Bayar Digital ke server tenant saat status payment berubah.

Gunakan webhook sebagai jalur utama untuk mengubah status order internal. Gunakan get payment sebagai fallback rekonsiliasi.

## Callback URL

Tenant mengirim `callback_url` saat create payment.

```json
{
  "callback_url": "https://tenant.example.com/webhooks/bayar-digital"
}
```

URL harus dapat diakses dari internet. Untuk production, gunakan HTTPS.

## Alur Webhook

1. Customer melakukan pembayaran.
2. Android Worker membaca mutasi pembayaran.
3. Bayar Digital mencocokkan mutasi dengan payment.
4. Status payment berubah, misalnya dari `PENDING` menjadi `PAID`.
5. Bayar Digital mengirim HTTP request ke `callback_url` tenant.
6. Tenant memvalidasi payload dan update order secara idempotent.
7. Tenant mengembalikan response `2xx` jika payload diterima.

## Contoh Payload

```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount": 50123,
  "paid_at": "2026-06-11T10:05:00Z"
}
```

Jika `callback_secret` merchant dikonfigurasi, webhook menyertakan header signature HMAC-SHA256 dari raw JSON body:

```http
X-Signature: <hex_hmac_sha256>
```

## Expected Response

Kembalikan response `2xx` setelah payload diterima.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"received"}
```

Jika proses update order membutuhkan waktu, simpan payload lebih dulu, balas `2xx`, lalu proses secara async.

## Idempotency

Webhook dapat dikirim lebih dari satu kali. Handler tenant harus aman dipanggil berulang.

Gunakan salah satu kunci berikut untuk idempotency:

1. `payment_id`
2. `payment_code`
3. Kombinasi `payment_code` dan `status`

Contoh aturan:

1. Jika order sudah `PAID`, abaikan webhook `PAID` berikutnya.
2. Jangan ubah order `PAID` menjadi `PENDING`.
3. Simpan log payload webhook untuk audit dan troubleshooting.

## Retry

Jika endpoint tenant gagal menerima webhook, Bayar Digital dapat mencoba mengirim ulang. Karena itu tenant harus membuat handler idempotent dan memberi response sukses hanya setelah payload diterima dengan benar.

## Keamanan

Praktik yang disarankan:

1. Gunakan HTTPS untuk `callback_url` production.
2. Validasi bahwa `payment_code` ada di sistem tenant.
3. Validasi nominal `amount` sesuai `amount_total` order tenant.
4. Jangan percaya status order dari browser customer.
5. Gunakan get payment untuk verifikasi tambahan jika payload mencurigakan.

## Code Examples

### Node.js (Express)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const CALLBACK_SECRET = process.env.CALLBACK_SECRET; // dari dashboard

app.post('/webhooks/bayar-digital', (req, res) => {
  // 1. Verifikasi signature (jika callback_secret dikonfigurasi)
  if (CALLBACK_SECRET) {
    const signature = req.headers['x-signature'];
    const payload = JSON.stringify(req.body);
    const expected = crypto
      .createHmac('sha256', CALLBACK_SECRET)
      .update(payload)
      .digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ status: 'invalid signature' });
    }
  }

  const { payment_code, status, amount } = req.body;

  // 2. Validasi payment_code ada di sistem tenant
  // 3. Validasi amount sesuai order
  // 4. Update status order

  // 5. Balas 200
  res.json({ status: 'received' });
});
```

### PHP (Laravel)

```php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

Route::post('webhooks/bayar-digital', function (Request $request) {
    $callbackSecret = config('services.bayar-digital.callback_secret');

    // 1. Verifikasi signature
    if ($callbackSecret) {
        $signature = $request->header('X-Signature');
        $payload = $request->getContent();
        $expected = hash_hmac('sha256', $payload, $callbackSecret);
        if (!hash_equals($expected, $signature)) {
            Log::warning('Invalid webhook signature', [
                'expected' => $expected,
                'received' => $signature,
            ]);
            return response()->json(['status' => 'invalid signature'], 401);
        }
    }

    $data = $request->validate([
        'payment_code' => 'required|string',
        'status' => 'required|string|in:PENDING,PAID,EXPIRED,CANCELLED',
        'amount' => 'required|integer',
    ]);

    // 2. Cari order berdasarkan payment_code
    // 3. Validasi amount
    // 4. Update status order secara idempotent

    return response()->json(['status' => 'received']);
});
```

### Python (FastAPI)

```python
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib

app = FastAPI()
CALLBACK_SECRET = "..."  # dari environment

@app.post("/webhooks/bayar-digital")
async def webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("x-signature")

    # 1. Verifikasi signature
    if CALLBACK_SECRET and signature:
        expected = hmac.new(
            CALLBACK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=401, detail="invalid signature")

    data = await request.json()
    payment_code = data["payment_code"]
    status = data["status"]
    amount = data["amount"]

    # 2. Cari order berdasarkan payment_code
    # 3. Validasi amount sesuai order
    # 4. Update status order secara idempotent

    return {"status": "received"}
```
