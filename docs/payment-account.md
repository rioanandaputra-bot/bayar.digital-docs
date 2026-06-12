---
sidebar_position: 5
---

# Payment Account

Ambil daftar payment account untuk menentukan `merchant_account_id` saat create payment.

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "account_number": "1234567890",
      "account_name": "PT Tenant Contoh",
      "bank_name": "Bank BCA",
      "bank_type": "TRANSFER",
      "channel_code": "bca",
      "is_active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "qris_id": "QRIS-001",
      "qris_name": "PT Tenant Contoh",
      "qris_static": "00020101021126690012...",
      "bank_name": "QRIS",
      "bank_type": "QRIS",
      "channel_code": "qris",
      "is_active": true
    }
  ]
}
```

## Field

| Field | Keterangan |
| --- | --- |
| `id` | Gunakan sebagai `merchant_account_id` saat create payment |
| `bank_type` | `TRANSFER` (bank transfer) atau `QRIS` |
| `account_number` | Nomor rekening (untuk TRANSFER) |
| `account_name` | Nama pemilik rekening |
| `qris_static` | Payload QRIS statis (untuk QRIS) |
| `is_active` | Status aktif account |

## Memilih Account

- **Transfer bank** → pilih account dengan `bank_type: "TRANSFER"`
- **QRIS** → pilih account dengan `bank_type: "QRIS"`

Simpan `id` sebagai konfigurasi di sistem kamu, kirim sebagai `merchant_account_id` saat create payment.

:::info
Instruksi pembayaran (nomor rekening, QRIS dinamis) ada di response **create payment** dan **get payment**, bukan di endpoint ini.
:::
