---
sidebar_position: 12
---

# Webhook

Bayar Digital akan mengirimkan *request HTTP POST* ke server Anda setiap kali terjadi perubahan status pembayaran.

Webhook merupakan metode utama untuk mendapatkan notifikasi secara *real-time*. Metode ini jauh lebih cepat, efisien, dan andal dibandingkan dengan melakukan pengecekan status ( *polling* ) secara manual.

---

## Setup

Anda dapat mengonfigurasi *Webhook URL* melalui Dashboard pada menu **Merchant**. Terdapat dua metode penentuan URL yang bisa Anda gunakan:

1. **Webhook URL Default (Level Merchant):** Semua notifikasi pembayaran akan dikirimkan secara terpusat ke URL ini.
2. **Override per Invoice:** Anda dapat mengirimkan *webhook* ke URL spesifik untuk setiap transaksi dengan menyertakan parameter `payment_webhook_url` pada saat memanggil *endpoint* `POST /gateway/payments`.

Selain mengatur URL, Anda juga sangat disarankan untuk mengatur **Webhook Secret** guna keperluan verifikasi keamanan ( *signature* ).

---

## Event

Webhook akan dikirimkan secara otomatis pada kondisi/ *event* berikut:

| Event | Status Baru | Keterangan |
| :--- | :--- | :--- |
| Pelanggan Membayar | `PAID` | Pembayaran terdeteksi secara otomatis oleh sistem (Android Worker) |
| Pencocokan Manual | `PAID` | Anda mencocokkan mutasi pembayaran secara manual via API atau Dashboard |
| Kedaluwarsa | `EXPIRED` | Waktu pembayaran telah melewati batas `payment_expired_at` |
| Dibatalkan | `CANCELLED` | *Invoice* dibatalkan secara manual via API atau Dashboard |

---

## Payload

Berikut adalah contoh bentuk *payload* (data JSON) yang akan dikirimkan ke server Anda:

```json
{
  "payment_id": "660e8400-e29b-41d4-a716-446655440010",
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount": 50123,
  "paid_at": "2026-06-11T10:05:00Z"
}
```

### Detail Field

| Field | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `payment_id` | uuid | ID unik *invoice* di sistem Bayar Digital |
| `payment_code` | string | Kode *invoice* internal dari sistem Anda |
| `status` | string | Status pembayaran saat ini: `PAID` / `EXPIRED` / `CANCELLED` |
| `amount` | int64 | **Total akhir** yang harus dibayar (nominal asli + kode unik) |
| `paid_at` | datetime | Waktu pembayaran sukses (ISO 8601). Hanya muncul jika status `PAID` |

### Contoh Berdasarkan Status

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

Apabila Anda telah mengatur **Webhook Secret** di Dashboard, setiap *request webhook* dari Bayar Digital akan menyertakan *header* keamanan tambahan:

```text
X-Signature: <hex_hmac_sha256>
```

*Signature* ini dihitung menggunakan metode **HMAC-SHA256** dari *raw JSON body* menggunakan Webhook Secret Anda. Hal ini berfungsi untuk memastikan bahwa *request* benar-benar berasal dari Bayar Digital.

### Cara Melakukan Verifikasi

**Contoh (Node.js)**
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

**Contoh (PHP)**
```php
function verifyWebhook($body, $signature, $secret) {
    $expected = hash_hmac('sha256', json_encode($body), $secret);
    return hash_equals($expected, $signature);
}
```

**Contoh (Python)**
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

Agar proses pengiriman *webhook* berjalan lancar, *endpoint* di server Anda **wajib** memenuhi kriteria berikut:

1. **Verifikasi Signature:** Lakukan verifikasi keamanan jika menggunakan Webhook Secret.
2. **Validasi `payment_code`:** Pastikan kode tersebut benar-benar terdaftar di dalam sistem Anda.
3. **Validasi `amount`:** Cocokkan nominal `amount` dari *webhook* dengan total tagihan (`payment_total`) yang tercatat di *database* Anda.
4. **Bersifat Idempotent:** Sistem harus aman meskipun menerima *webhook* yang sama berkali-kali.
5. **Balas dengan `200 OK` Secepat Mungkin:** Jangan menahan koneksi. Jika proses pembaruan data di sistem Anda memakan waktu lama, simpan *payload webhook* ke dalam *queue* (antrean), berikan respons `200 OK` ke Bayar Digital, lalu jalankan proses pembaruan secara *asynchronous*.

### Contoh Lengkap (Node.js / Express)

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

  // 2. Cari order di database
  // 3. Validasi amount
  // 4. Update status (pastikan penanganan bersifat idempotent)

  res.json({ status: 'received' });
});
```

### Contoh Lengkap (PHP / Laravel)

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

    // Cari order di database, validasi amount, dan update status (idempotent)

    return response()->json(['status' => 'received']);
});
```

### Contoh Lengkap (Python / FastAPI)

```python
@app.post("/webhooks/bayar")
async def webhook(request: Request):
    body = await request.body()
    secret = os.environ.get("WEBHOOK_SECRET")

    if secret:
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, request.headers.get("x-signature", "")):
            raise HTTPException(status_code=401, detail="invalid signature")

    data = await request.json()
    
    # Cari order di database, validasi amount, dan update status (idempotent)

    return {"status": "received"}
```

---

## Retry Logic

Jika *endpoint* Anda gagal memberikan respons `2xx` (misal: RTO, *error 500*), sistem Bayar Digital akan mencoba mengirim ulang ( *retry* ) *webhook* secara bertahap:

| Upaya (Retry) | Jeda Waktu Tunggu |
| :--- | :--- |
| Ke-1 | 60 detik |
| Ke-2 | 120 detik |
| Ke-3 | 240 detik |
| Ke-4 | 480 detik |
| Ke-5 | 960 detik |

Setelah mengalami 5 kali kegagalan, *webhook* tersebut akan ditandai dengan status **FAILED** dan sistem akan menghentikan proses *retry* otomatis. Namun, Anda tetap dapat memicu pengiriman ulang secara manual melalui Dashboard.

---

## Idempotency

*Webhook* memiliki kemungkinan terkirim lebih dari satu kali untuk transaksi yang sama. Pastikan penanganan (*handler*) di sistem Anda sudah dirancang dengan aman:

* Apabila pesanan sudah berstatus `PAID` di *database* Anda, abaikan *request webhook* `PAID` berikutnya untuk pesanan tersebut.
* Jangan pernah mengubah status dari `PAID` kembali menjadi `PENDING`.
* Selalu simpan log seluruh *payload webhook* yang masuk untuk keperluan audit data.
* Gunakan `payment_id` atau `payment_code` sebagai kunci ( *key* ) untuk menjaga idempotensi sistem Anda.

---

## Troubleshooting

### Webhook selalu berstatus GAGAL (FAILED)?

| Kemungkinan Penyebab | Solusi |
| :--- | :--- |
| URL tidak dapat diakses dari internet | Pastikan *endpoint* Anda bersifat publik dan tidak terhalang *firewall* atau VPN lokal |
| Respons bukan 2xx | Pastikan sistem Anda segera membalas dengan HTTP Status `200 OK` setelah menerima *request* |
| Terjadi Timeout (> 15 detik) | Jangan memproses logika kompleks di dalam siklus *request*. Simpan data ke *queue*, lalu balas `200 OK` dengan cepat |
| Sertifikat SSL tidak valid | Pastikan server Anda menggunakan sertifikat SSL (HTTPS) yang sah dan aktif |

### Cara Memeriksa Riwayat Webhook

Masuk ke **Dashboard** → Menu **Payment** → Buka tab **Paid**. 
Apabila pembayaran telah berhasil diproses (*PAID*) dan *webhook* telah sukses terkirim ke server Anda, transaksi tersebut akan berpindah dan dapat dilihat di tab **Completed**.