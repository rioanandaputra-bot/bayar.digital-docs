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
      "channel_id": "660e8400-e29b-41d4-a716-446655440000",
      "account_number": "1234567890",
      "account_name": "PT Tenant Contoh",
      "bank_name": "BCA",
      "bank_type": "TRANSFER"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "channel_id": "660e8400-e29b-41d4-a716-446655440001",
      "qris_id": "QRIS-001",
      "qris_name": "PT Tenant Contoh",
      "qris_city": "JAKARTA",
      "qris_postal_code": "12345",
      "qris_static": "00020101021126690012...",
      "bank_name": "QRIS",
      "bank_type": "QRIS"
    }
  ]
}
```

## Field

| Field | Keterangan |
| --- | --- |
| `id` | Gunakan sebagai `merchant_account_id` saat create payment |
| `channel_id` | ID channel pembayaran |
| `bank_type` | `TRANSFER` (bank transfer) atau `QRIS` |
| `account_number` | Nomor rekening (untuk TRANSFER) |
| `account_name` | Nama pemilik rekening |
| `qris_id` | ID/NMID QRIS |
| `qris_name` | Nama merchant QRIS |
| `qris_city` | Kota merchant QRIS |
| `qris_postal_code` | Kode pos QRIS |
| `qris_static` | Payload QRIS statis (untuk QRIS) |

## Memilih Account

- **Transfer bank** → pilih account dengan `bank_type: "TRANSFER"`
- **QRIS** → pilih account dengan `bank_type: "QRIS"`

Simpan `id` sebagai konfigurasi di sistem kamu, kirim sebagai `merchant_account_id` saat create payment.

:::info
Instruksi pembayaran (nomor rekening, QRIS dinamis) ada di response **create payment** dan **get payment**, bukan di endpoint ini.
:::
