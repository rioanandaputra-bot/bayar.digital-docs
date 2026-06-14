---
sidebar_position: 2
---

# Persiapan

Setup awal yang harus dilakukan sebelum bisa menggunakan Payment Gateway.

---

## Prasyarat

| Langkah | Detail |
|---------|--------|
| 1. Daftar akun | Registrasi di [dashboard Bayar Digital](https://bayar.digital) |
| 2. Buat Merchant | Buat entitas bisnis → dapatkan **API Key** (`pk_...`) |
| 3. Setup Rekening | Tambah rekening bank atau QRIS di dashboard |
| 4. Setup Android Worker | Instal aplikasi Worker di HP khusus ([panduan](./android-worker)) |
| 5. Siapkan endpoint webhook | Buat endpoint di server kamu untuk terima notifikasi |

---

## Base URL

```
https://api.bayar.digital
```

Semua endpoint Gateway menggunakan prefix `/gateway/`.

---

## Autentikasi

Kirim API Key via header `X-Api-Key` di setiap request.

```
X-Api-Key: pk_550e8400e29b41d4a716446655440000...
```

API Key didapatkan dari Dashboard → menu Merchant → **Generate API Key**.

Simpan API Key di **environment variable** server backend kamu. Jangan pernah hardcode di frontend atau repository publik.

```bash
# .env
BAYAR_DIGITAL_API_KEY=pk_550e8400e29b41d4a716446655440000...
BAYAR_DIGITAL_BASE_URL=https://api.bayar.digital
```

Lihat [Status & Error Code](./status-code) untuk daftar lengkap error auth dan kode lainnya.

---

## Rate Limit

| Grup | Limit per Merchant |
|------|-------------------|
| **Read** (`GET` endpoints) | 3.000 request/menit |
| **Write** (`POST`, `DELETE`) | 600 request/menit |

Jika terlampaui:

```json
{
  "success": false,
  "code": "rate_limited",
  "message": "rate limited"
}
```

Response header `X-RateLimit-Reset` memberi tahu berapa detik hingga limit reset.

---

## Response Format

Semua response API mengikuti format berikut.

### Success (200)

```json
{
  "success": true,
  "message": "ok",
  "data": { ... }
}
```

### Created (201)

```json
{
  "success": true,
  "message": "created",
  "data": { ... }
}
```

### Paginated

```json
{
  "success": true,
  "message": "ok",
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "count": 20,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 5
  }
}
```

### Error

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error"
}
```

### Validation Error

```json
{
  "success": false,
  "code": "validation_error",
  "message": "validation error",
  "errors": {
    "field_name": "deskripsi error"
  }
}
```
