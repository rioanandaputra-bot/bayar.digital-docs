---
sidebar_position: 5
---

# Payment Account

Ambil daftar payment account untuk menentukan `account_id` saat create payment.

## Request

```bash
curl https://api.bayar.digital/gateway/accounts \
  -H "X-Api-Key: pk_..."
```

## Response

```json
{
  "success": true,
  "message": "ok",
  "data": [
    {
      "account_id": "550e8400-e29b-41d4-a716-446655440000",
      "channel_id": "660e8400-e29b-41d4-a716-446655440000",
      "channel_type": "TRANSFER",
      "channel_name": "Bank Central Asia",
      "account_number": "1234567890",
      "account_name": "PT Tenant Contoh",
      "account_min_amount": 10000,
      "account_max_amount": 10000000,
      "account_active": true,
      "account_quota": 30,
      "app_id": "990e8400-e29b-41d4-a716-446655440000",
      "app_name": "BCA Mobile",
      "app_package": "com.bca"
    },
    {
      "account_id": "550e8400-e29b-41d4-a716-446655440001",
      "channel_id": "660e8400-e29b-41d4-a716-446655440001",
      "channel_type": "QRIS",
      "channel_name": "QRIS",
      "account_number": "QRIS-001",
      "account_name": "PT Tenant Contoh",
      "account_min_amount": 1000,
      "account_max_amount": 5000000,
      "account_active": true,
      "account_quota": 30,
      "app_id": "990e8400-e29b-41d4-a716-446655440001",
      "app_name": "QRIS App",
      "app_package": "com.qris"
    }
  ]
}
```

## Field

| Field | Keterangan |
| --- | --- |
| `account_id` | Gunakan sebagai `account_id` saat create payment |
| `channel_id` | ID channel pembayaran |
| `channel_type` | `TRANSFER` (bank transfer) atau `QRIS` |
| `channel_name` | Nama bank/metode pembayaran (contoh: Bank Central Asia) |
| `account_number` | Nomor rekening atau ID merchant pembayaran |
| `account_name` | Nama pemilik rekening / merchant |
| `account_min_amount` | Nominal minimum pembayaran yang diizinkan |
| `account_max_amount` | Nominal maksimum pembayaran yang diizinkan (jika ada) |
| `account_active` | Status keaktifan akun pembayaran |
| `account_quota` | Sisa kuota masa aktif perangkat dalam hari |
| `app_id` | ID aplikasi mobile banking yang terhubung |
| `app_name` | Nama aplikasi mobile banking |
| `app_package` | Package name aplikasi mobile banking Android |

## Memilih Account

- **Transfer bank** → pilih account dengan `channel_type: "TRANSFER"`
- **QRIS** → pilih account dengan `channel_type: "QRIS"`

Simpan `account_id` sebagai konfigurasi di sistem kamu, kirim sebagai `account_id` saat create payment.

:::info
Instruksi pembayaran (nomor rekening, QRIS dinamis) ada di response **create payment** dan **get payment**, bukan di endpoint ini.
:::

