---
sidebar_position: 1
---

# Overview

Dokumentasi integrasi payment gateway Bayar Digital untuk developer tenant.

## Base URL

```
https://api.bayar.digital
```

Semua endpoint gateway menggunakan prefix `/gateway/`.

## Persiapan

1. Daftar dan login ke [dashboard](https://bayar.digital)
2. Buat merchant → salin **API Key** (`pk_...`)
3. Setup Android Worker di perangkat khusus ([detail](./android-worker))

## Authentication

Kirim API key via header `X-Api-Key` di setiap request. Simpan di environment variable backend, jangan expose di frontend atau repository.

```bash
BAYAR_DIGITAL_API_KEY=pk_...
BAYAR_DIGITAL_BASE_URL=https://api.bayar.digital
```

| Kondisi | HTTP | Code |
| --- | --- | --- |
| Header kosong | `401` | `unauthorized` |
| API key tidak valid | `401` | `unauthorized` |
| API key bukan milik tenant | `403` | `tenant_api_key_required` |

**Rate limit:** 100 request/menit per merchant untuk semua endpoint `/gateway/*`. Jika limit terlampaui → `429` dengan code `rate_limited`. Tunggu sesuai header `X-RateLimit-Reset`.

## Cara Kerja

```mermaid
sequenceDiagram
    participant T as Server Kamu
    participant API as Bayar Digital
    participant W as Android Worker
    participant C as Customer

    T->>API: 1. GET /gateway/accounts
    API-->>T: Daftar payment account
    T->>API: 2. POST /gateway/payments
    API-->>T: Payment detail + checkout_url
    T->>C: 3. Tampilkan instruksi bayar / redirect opsional
    C->>C: 4. Bayar (transfer / QRIS)
    W->>API: 5. Deteksi pembayaran
    API->>T: 6. Webhook → status PAID
```

**Singkatnya:**

1. Ambil daftar payment account → pilih `merchant_account_id`
2. Buat payment → dapat `amount_total` + detail pembayaran
3. Tampilkan instruksi bayar di UI kamu sendiri (**atau** redirect ke `checkout_url` jika mau)
4. Customer bayar
5. Android Worker otomatis deteksi pembayaran
6. Kamu terima webhook → update order

## Yang Perlu Kamu Siapkan

| Komponen | Fungsi |
| --- | --- |
| Backend server | Simpan API key, panggil API gateway |
| Tabel order/payment | Simpan `payment_code`, `amount_total`, `status` |
| Webhook endpoint | Terima notifikasi perubahan status payment |
| Reconciliation job | Cek status payment berkala sebagai fallback |

## Response Format

**Sukses:**

```json
{
  "success": true,
  "message": "ok",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error"
}
```

**Paginated:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```
