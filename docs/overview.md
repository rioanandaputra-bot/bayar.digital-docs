---
sidebar_position: 1
---

# Overview

Dokumentasi integrasi **Payment Gateway Bayar Digital** untuk developer Tenant.

Dengan API ini, sistem kamu bisa:
- Membuat invoice pembayaran untuk customer
- Mendapatkan notifikasi real-time via webhook saat customer bayar
- Mengecek status pembayaran
- Membatalkan invoice

---

## Cara Kerja

```mermaid
sequenceDiagram
    participant S as Server Kamu
    participant API as Bayar Digital API
    participant W as Android Worker
    participant C as Customer

    S->>API: 1. GET /gateway/accounts
    API-->>S: Daftar payment account
    S->>API: 2. POST /gateway/payments
    API-->>S: Payment detail + checkout_url
    S->>C: 3. Tampilkan instruksi bayar
    C->>C: 4. Transfer / QRIS sesuai nominal
    W->>API: 5. Deteksi pembayaran masuk
    API->>S: 6. Webhook POST → status PAID
```

**Singkatnya:**

1. **Ambil akun** → `GET /gateway/accounts` untuk lihat rekening tujuan
2. **Buat invoice** → `POST /gateway/payments`, sistem generate nominal unik
3. **Customer bayar** → Tampilkan instruksi via `checkout_url` atau UI kamu
4. **Deteksi otomatis** → Android Worker di perangkatmu mendeteksi transfer masuk
5. **Notifikasi** → Kamu terima webhook `PAID`, update status order

---

## Yang Perlu Kamu Siapkan

| Komponen | Fungsi |
|----------|--------|
| Backend server | Simpan API Key, panggil Gateway API |
| Database order | Simpan `payment_code`, `payment_total`, `status` |
| Webhook endpoint | Terima notifikasi perubahan status |
| Android device khusus | Install Worker untuk deteksi otomatis |
| Cron job (opsional) | Rekonsiliasi berkala sebagai fallback |

---

## Alur Dokumen

Baca dokumentasi sesuai urutan berikut:

| # | Topik | Deskripsi |
|---|-------|-----------|
| 1 | [Persiapan](./persiapan) | Setup API Key, base URL, rate limit |
| 2 | [Android Worker](./android-worker) | Install aplikasi deteksi pembayaran |
| 3 | [Payment Account](./payment-account) | Lihat daftar rekening tujuan |
| 4 | [Payment Create](./payment-create) | Buat invoice pembayaran |
| 5 | [Checkout](./checkout) | Halaman bayar untuk customer |
| 6 | [Payment Detail](./payment-detail) | Detail satu invoice |
| 7 | [Payment List](./payment-list) | Daftar invoice |
| 8 | [Payment Cancel](./payment-cancel) | Batalkan invoice |
| 9 | [Payment Match](./payment-match) | Cocokkan pembayaran manual |
| 10 | [Payment Mutations](./payment-mutations) | Lihat mutasi terdeteksi |
| 11 | [Webhook](./webhook) | Setup notifikasi real-time |
| 12 | [Status & Error Code](./status-code) | Referensi kode error |

---

## Daftar Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/gateway/accounts` | Daftar rekening aktif |
| `POST` | `/gateway/payments` | Buat invoice baru |
| `GET` | `/gateway/payments` | Daftar invoice |
| `GET` | `/gateway/payments/:code` | Detail invoice |
| `DELETE` | `/gateway/payments/:code` | Batalkan invoice |
| `POST` | `/gateway/payments/:code/match` | Cocokkan manual (butuh 2FA) |
| `GET` | `/gateway/channels/:id/instructions` | Instruksi pembayaran |
| `GET` | `/gateway/mutations` | Mutasi bank terdeteksi |
