---
sidebar_position: 4
---

# Payment Account

Payment account adalah akun pembayaran tenant yang bisa dipakai untuk menerima pembayaran. Tenant perlu mengambil daftar account sebelum membuat payment.

## Endpoint

```http
GET /gateway/accounts
X-Api-Key: pk_...
```

## Contoh Request

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
      "channel_id": "bank-bca",
      "account_number": "1234567890",
      "account_name": "PT Tenant Contoh",
      "bank_name": "Bank BCA",
      "bank_type": "TRANSFER"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "channel_id": "qris",
      "qris_id": "QRIS-001",
      "qris_name": "PT Tenant Contoh",
      "qris_city": "Jakarta",
      "qris_postal_code": "10110",
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
| `id` | Account ID. Gunakan sebagai `merchant_account_id` saat create payment. |
| `channel_id` | ID channel pembayaran. |
| `account_number` | Nomor rekening untuk channel transfer. |
| `account_name` | Nama pemilik rekening. |
| `qris_id` | ID QRIS jika account memakai QRIS. |
| `qris_name` | Nama merchant pada QRIS. |
| `qris_city` | Kota merchant QRIS. |
| `qris_postal_code` | Kode pos merchant QRIS. |
| `qris_static` | Payload QRIS statis. |
| `bank_name` | Nama bank atau channel pembayaran. |
| `bank_type` | Jenis channel, misalnya `TRANSFER` atau `QRIS`. |

## Memilih Account

Gunakan account yang sesuai dengan metode bayar yang ingin ditampilkan ke customer.

1. Untuk transfer bank, gunakan account dengan `bank_type` `TRANSFER`.
2. Untuk QRIS, gunakan account dengan `bank_type` `QRIS`.
3. Simpan `id` account sebagai konfigurasi metode pembayaran di sistem tenant.
4. Kirim `id` tersebut sebagai `merchant_account_id` saat create payment.

## Payment Account Instruction

Instruksi pembayaran tidak diambil dari endpoint list account. Endpoint `GET /gateway/accounts` hanya dipakai untuk memilih `merchant_account_id` dan data rekening/QRIS dasar.

Untuk menampilkan instruksi pembayaran, gunakan field payment yang dikembalikan setelah tenant membuat payment atau mengambil detail payment:

```http
POST /gateway/payments
GET /gateway/payments/{payment_code}
```

Gunakan response payment untuk menampilkan instruksi ke customer, karena instruksi membutuhkan konteks payment seperti `amount_total`, batas waktu, dan account yang dipakai.

Contoh field yang tersedia dari response payment gateway:

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "amount_unique": 123,
    "amount_total": 50123,
    "status": "PENDING",
    "expires_at": "2026-10-11T12:00:00Z",
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "bank_name": "Bank BCA",
    "bank_type": "TRANSFER",
    "qris_static": null
  }
}
```

Gateway tenant saat ini tidak mengembalikan field `instructions` terstruktur. Jika tenant menampilkan instruksi sendiri, susun instruksi dari field payment di atas dan pastikan nominal yang ditampilkan adalah `amount_total`, bukan `amount_original`.
