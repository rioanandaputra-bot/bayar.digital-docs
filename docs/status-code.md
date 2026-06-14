---
sidebar_position: 13
---

# Status & Error Code

Referensi lengkap mengenai status transaksi, *webhook*, serta kode respons yang digunakan oleh API Bayar Digital.

## HTTP Status

| Status | Keterangan |
| :--- | :--- |
| `200` | **OK** - Permintaan berhasil diproses. |
| `201` | **Created** - Pembuatan *invoice* berhasil. |
| `400` | **Bad Request** - Format data salah atau terdapat validasi yang gagal. |
| `401` | **Unauthorized** - API Key kosong atau tidak valid. |
| `403` | **Forbidden** - Akses ditolak atau kuota habis. |
| `404` | **Not Found** - Data atau *endpoint* tidak ditemukan. |
| `409` | **Conflict** - Duplikasi data atau status tidak sesuai untuk aksi tersebut. |
| `429` | **Too Many Requests** - Melebihi batas *rate limit*. |
| `500` | **Internal Server Error** - Terjadi kendala di server Bayar Digital. |

---

## Status Payment & Webhook

**Siklus Payment:**
| Status | Keterangan | Terminal (Final)? |
| :--- | :--- | :--- |
| `PENDING` | Menunggu pembayaran dari pelanggan. | Tidak |
| `PAID` | Pembayaran terkonfirmasi dan lunas. | Ya |
| `EXPIRED` | Melewati batas waktu pembayaran (`payment_expired_at`). | Ya |
| `CANCELLED` | Dibatalkan secara manual oleh *merchant*. | Ya |

**Siklus Webhook:**
| Status | Keterangan |
| :--- | :--- |
| `PENDING` | Masuk antrean, menunggu dikirim ke server Anda. |
| `RETRYING` | Gagal mengirim, sistem akan mencoba ulang secara berkala. |
| `SUCCESS` | Berhasil (menerima respons `2xx` dari server Anda). |
| `FAILED` | Gagal total karena telah melewati batas maksimal percobaan (*retry*). |

---

## Daftar Error Code & Panduan Retry

Untuk menghindari pemblokiran, **hanya lakukan sistem *retry* otomatis pada error yang bersifat sementara** (yang ditandai dengan "Ya" pada kolom Bisa Retry).

| Code | HTTP | Penyebab & Solusi | Bisa Retry? |
| :--- | :--- | :--- | :--- |
| `unauthorized` | 401 | API Key tidak valid. Periksa kembali *header* `X-Api-Key`. | Tidak |
| `tenant_api_key_required` | 403 | API Key bukan milik *merchant*. Gunakan akses kunci yang benar. | Tidak |
| `bad_request` | 400 | Format *request* rusak. Periksa kembali struktur JSON Anda. | Tidak |
| `validation_error` | 400 | Field tidak valid. Periksa array `errors` pada *response*. | Tidak |
| `invalid_expired_at` | 400 | Batas waktu sudah lewat/salah format. Kirim waktu di masa depan dengan format ISO 8601. | Tidak |
| `not_found` | 404 | *Payment* tidak ditemukan. Periksa kembali `payment_code`. | Tidak |
| `payment_not_cancellable` | 404 | *Payment* bukan `PENDING`. Tidak dapat dibatalkan. | Tidak |
| `account_not_owned` | 403 | `account_id` salah. Ambil ID yang sah melalui `GET /gateway/accounts`. | Tidak |
| `no_active_quota` | 403 | Kuota akun habis. Lakukan *top-up* melalui Dashboard. | Tidak |
| `totp_not_enabled` | 403 | 2FA belum aktif. Konfigurasi 2FA melalui pengaturan profil Anda. | Tidak |
| `payment_code_conflict` | 409 | `payment_code` duplikat. Gunakan kode yang unik untuk *invoice* baru. | Tidak |
| `unique_amount_conflict` | 409 | Sistem bentrok saat mengenerate nominal unik. Tunggu sejenak. | **Ya** |
| `rate_limited` | 429 | Melebihi batas *request*. Tunggu sesuai *header* `X-RateLimit-Reset`. | **Ya** |
| `internal_error` | 500 | Terjadi gangguan server dari sisi Bayar Digital. | **Ya** |

---

## Contoh Implementasi Retry Otomatis (Aman)

Implementasi ini hanya akan melakukan *retry* pada error `429` (Rate Limit) dan `500` (Internal Server Error) menggunakan *delay* yang direkomendasikan.

**Node.js**
```javascript
async function callAPI(request, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    const res = await request();
    if (res.status !== 429 && res.status < 500) return res;
    
    // Ambil jeda waktu dari header, atau gunakan progressive delay
    const wait = parseInt(res.headers.get('X-RateLimit-Reset') || i + 1, 10);
    await new Promise(r => setTimeout(r, wait * 1000));
  }
  throw new Error('Request gagal setelah mencapai batas retry');
}
```

**PHP**
```php
function callAPI(callable $request, int $maxRetries = 3): array {
    for ($i = 0; $i <= $maxRetries; $i++) {
        $res = $request();
        if ($res['status'] !== 429 && $res['status'] < 500) return $res;
        
        $wait = $res['headers']['X-RateLimit-Reset'] ?? ($i + 1);
        sleep((int) $wait);
    }
    throw new \RuntimeException('Request gagal setelah mencapai batas retry');
}
```

**Python**
```python
import time

def call_api(request, max_retries=3):
    for i in range(max_retries + 1):
        res = request()
        if res.status_code != 429 and res.status_code < 500:
            return res
            
        wait = int(res.headers.get('X-RateLimit-Reset', i + 1))
        time.sleep(wait)
    raise Exception('Request gagal setelah mencapai batas retry')
```