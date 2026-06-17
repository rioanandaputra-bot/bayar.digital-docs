---
sidebar_position: 12
---

# Webhook

Bayar Digital mengirim **HTTP POST** ke server kamu saat status payment berubah.

:::info
**Konteks:** Ini adalah cara utama untuk mendapat notifikasi real-time. Webhook lebih cepat dan andal daripada polling manual.
:::

---

## Setup

Webhook URL dikonfigurasi di Dashboard Tenant pada menu **Merchant**. Kamu bisa:

1. **Webhook URL default** di level Merchant — semua notifikasi dikirim ke URL ini
2. **Override per invoice** — kirim `payment_webhook_url` saat `POST /gateway/payments`

Selain URL, kamu juga bisa mengatur **Webhook Secret** untuk verifikasi signature.

---

## Event

Webhook dikirim pada event berikut:

| Event | Status Baru | Keterangan |
|-------|-------------|------------|
| Customer bayar | `PAID` | Terdeteksi otomatis oleh sistem |
| Manual match | `PAID` | Kamu cocokkan manual via API/Dashboard |
| Kedaluwarsa | `EXPIRED` | Melewati `payment_expired_at` |
| Dibatalkan | `CANCELLED` | Kamu batalkan via API/Dashboard |

---

## Payload

```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount": 50123,
  "paid_at": "2026-06-11T10:05:00Z"
}
```

### Field

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `payment_id` | uuid | ID invoice |
| `payment_code` | string | Kode invoice dari sistem kamu |
| `status` | string | `PAID` / `EXPIRED` / `CANCELLED` |
| `amount` | int64 | **Total** yang dibayar (original + nominal unik) |
| `paid_at` | datetime | Waktu bayar (ISO 8601). Ada hanya jika `PAID` |

### Contoh per Status

**PAID:**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount": 50123,
  "paid_at": "2026-06-11T10:05:00Z"
}
```

**EXPIRED:**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "EXPIRED",
  "amount": 50123
}
```

**CANCELLED:**
```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "CANCELLED",
  "amount": 50123
}
```

---

## Signature Verification

Jika kamu mengisi **Webhook Secret** di Dashboard, setiap request webhook akan menyertakan header:

```
X-Signature: <hex_hmac_sha256>
```

Signature dihitung sebagai **HMAC-SHA256** dari *raw JSON body* menggunakan Webhook Secret.

### Cara Verifikasi

```javascript
const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return expected === signature;
}
```

```php
function verifyWebhook($body, $signature, $secret) {
    $expected = hash_hmac('sha256', json_encode($body), $secret);
    return hash_equals($expected, $signature);
}
```

```python
import hmac, hashlib, json

def verify_webhook(body, signature, secret):
    expected = hmac.new(
        secret.encode(),
        json.dumps(body, separators=(',', ':')).encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## Handler Requirements

Endpoint webhook kamu harus:

1. **Verifikasi signature** — jika menggunakan Webhook Secret
2. **Validasi payment_code** — pastikan terdaftar di sistem kamu
3. **Validasi amount** — cocokkan dengan `payment_total` yang kamu simpan
4. **Idempotent** — aman dipanggil berkali-kali
5. **Balas 200 OK** — secepat mungkin

:::tip
Jika proses update order butuh waktu lama, simpan payload ke antrean dulu, balas `200 OK`, lalu proses async.
:::

### Contoh Lengkap (Node.js)

```javascript
app.post('/webhooks/bayar', express.json(), (req, res) => {
  // 1. Verifikasi signature
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

  // 2. Cari order di DB
  // 3. Validasi amount
  // 4. Update status (idempotent)

  res.json({ status: 'received' });
});
```

### Contoh Lengkap (PHP)

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
        'status' => 'required|in:PAID,EXPIRED,CANCELLED',
        'amount' => 'required|integer',
    ]);

    // Cari order, validasi amount, update status (idempotent)

    return response()->json(['status' => 'received']);
});
```

### Contoh Lengkap (Python)

```python
@app.post("/webhooks/bayar")
async def webhook(request: Request):
    body = await request.body()
    secret = os.environ.get("WEBHOOK_SECRET")

    if secret:
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, request.headers.get("x-signature", "")):
            raise HTTPException(401, "invalid signature")

    data = await request.json()
    # Cari order, validasi amount, update status (idempotent)

    return {"status": "received"}
```

---

## Retry Logic

Jika endpoint kamu tidak membalas `2xx`, sistem akan retry secara otomatis:

| Retry ke- | Jeda |
|-----------|------|
| 1 | 60 detik |
| 2 | 120 detik |
| 3 | 240 detik |
| 4 | 480 detik |
| 5 | 960 detik |

Setelah 5 kali gagal, webhook dianggap **FAILED** dan berhenti di-retry otomatis. Kamu bisa kirim ulang manual dari Dashboard.

---

## Idempotency

Webhook bisa terkirim lebih dari sekali. Pastikan handler kamu aman:

- Jika order sudah `PAID` → abaikan webhook `PAID` berikutnya
- Jangan ubah status `PAID` kembali ke `PENDING` atau status lain
- Log semua payload untuk audit
- Gunakan `payment_id` sebagai key idempotent

---

## Troubleshooting

### Webhook selalu gagal?

| Kemungkinan | Solusi |
|-------------|--------|
| URL tidak bisa diakses dari internet | Pastikan endpoint kamu publik |
| Response bukan 2xx | Balas `200 OK` setelah terima |
| Timeout > 15 detik | Simpan ke queue, balas cepat |
| SSL certificate tidak valid | Pastikan HTTPS valid |

### Cara cek riwayat webhook

Gunakan endpoint di Dashboard:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/tenant/callbacks` | Riwayat semua webhook |
| `GET` | `/tenant/callbacks/:id` | Detail webhook |
| `POST` | `/tenant/callbacks/:id/retry` | Kirim ulang webhook |

---

**Lanjutan:** Lihat [Status & Error Code](./status-code) untuk referensi lengkap kode error dan retry strategy.
