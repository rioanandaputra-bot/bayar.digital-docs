---
sidebar_position: 2
---

# Quickstart

Payment pertama terverifikasi dalam 30 menit.

## Persiapan

1. Daftar dan login ke [dashboard](https://bayar.digital)
2. Buat merchant → salin **API Key** (`pk_...`)
3. Setup Android Worker di perangkat khusus ([detail](./android-worker))

## Step 1 — Ambil Payment Account

```bash
curl https://api.bayar.digital/gateway/accounts \
  -H "X-Api-Key: pk_..."
```

Catat `id` dari account yang ingin dipakai sebagai `merchant_account_id`.

## Step 2 — Buat Payment

```bash
curl -X POST https://api.bayar.digital/gateway/payments \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: pk_..." \
  -d '{
    "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "expired_at": 1791691200000,
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "customer_phone": "081234567890",
    "callback_url": "https://yourserver.com/webhooks/bayar",
    "return_url": "https://yourserver.com/orders/INV-2026-0001"
  }'
```

Response berisi `checkout_url` dan `amount_total`.

## Step 3 — Redirect Customer

Arahkan customer ke `checkout_url`. Halaman checkout menampilkan instruksi pembayaran (transfer bank atau QRIS).

## Step 4 — Terima Webhook

Saat pembayaran terdeteksi, server kamu menerima POST ke `callback_url`:

```json
{
  "payment_code": "INV-2026-0001",
  "status": "PAID",
  "amount_total": 50123,
  "paid_at": 1749643500000,
  "event": "payment.status_changed"
}
```

Balas `200 OK` dan update order kamu sebagai lunas.

## Step 5 — Verifikasi (Opsional)

Jika webhook belum diterima, cek manual:

```bash
curl https://api.bayar.digital/gateway/payments/INV-2026-0001 \
  -H "X-Api-Key: pk_..."
```

## Selanjutnya

| Halaman | Isi |
| --- | --- |
| [Authentication](./authentication) | Setup API key |
| [Payment Create](./payment-create) | Detail lengkap field request & response |
| [Webhook](./webhook) | Implementasi webhook handler |
| [Error Handling](./error-handling) | Retry, backoff, error code |
