---
sidebar_position: 6
---

# Payment Create

Buat payment dari order internal kamu.

## Request

```http
POST /gateway/payments
X-Api-Key: pk_...
Content-Type: application/json
```

```json
{
  "account_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_code": "INV-2026-0001",
  "payment_amount": 50000,
  "payment_expired_at": "2026-10-11T12:00:00Z",
  "customer_name": "Budi Santoso",
  "customer_email": "budi@example.com",
  "customer_phone": "081234567890",
  "payment_return_url": "https://yourserver.com/orders/INV-2026-0001",
  "customer_orders": [
    {
      "name": "Produk A",
      "price": 50000,
      "quantity": 1,
      "subtotal": 50000
    }
  ]
}
```

## Field Request

| Field | Tipe | Required | Keterangan |
| --- | --- | --- | --- |
| `account_id` | UUID | Ya | ID dari `GET /gateway/accounts` |
| `payment_code` | string | Ya | Kode unik dari sistem kamu (maks 100 char) |
| `payment_amount` | integer | Ya | Nominal order, harus lebih dari 0 |
| `payment_expired_at` | string | Ya | Format ISO 8601 (contoh: `"2026-10-11T12:00:00Z"`), harus di masa depan |
| `customer_name` | string | Ya | Nama customer (maks 255 char) |
| `customer_email` | string | Kondisional | Minimal salah satu email/phone wajib diisi |
| `customer_phone` | string | Kondisional | Minimal salah satu email/phone wajib diisi |
| `payment_return_url` | string | Tidak | URL redirect setelah customer bayar |
| `customer_orders` | array | Tidak | Detail item order |

*Note*: Webhook URL tidak lagi dikirim di dalam request body. Semua notifikasi webhook dikirim secara global ke URL yang terkonfigurasi di Dashboard Tenant Anda demi alasan keamanan.

### Customer Orders (Order Item)

| Field | Tipe | Required |
| --- | --- | --- |
| `name` | string | Ya |
| `price` | integer | Ya |
| `quantity` | integer | Ya |
| `subtotal` | integer | Ya, dihitung ulang sebagai `price * quantity` |
| `sku` | string | Tidak |
| `product_url` | string | Tidak |
| `image_url` | string | Tidak |

## Response 201

```json
{
  "success": true,
  "message": "created",
  "data": {
    "payment_id": "660e8400-e29b-41d4-a716-446655440010",
    "account_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_code": "INV-2026-0001",
    "payment_amount": 50000,
    "payment_unique": 123,
    "payment_total": 50123,
    "payment_status": "PENDING",
    "payment_expired_at": "2026-10-11T12:00:00Z",
    "payment_updated_at": "2026-06-11T10:00:00Z",
    "payment_webhook_url": "https://yourserver.com/webhooks/bayar",
    "payment_checkout_url": "https://bayar.digital/checkout/660e8400-e29b-41d4-a716-446655440010",
    "payment_return_url": "https://yourserver.com/orders/INV-2026-0001",
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "customer_phone": "081234567890",
    "customer_orders": [
      {
        "name": "Produk A",
        "price": 50000,
        "quantity": 1,
        "subtotal": 50000
      }
    ],
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "channel_id": "330e8400-e29b-41d4-a716-446655440000",
    "channel_name": "Bank Central Asia",
    "channel_type": "TRANSFER",
    "channel_instructions": []
  }
}
```

## Nominal Unik

Sistem menambahkan `payment_unique` ke `payment_amount` secara otomatis.

```
payment_total = payment_amount + payment_unique
```

**Customer harus bayar sesuai `payment_total`.** Tampilkan `payment_total` di UI kamu, bukan `payment_amount`.

## Simpan di Sistem Kamu

Setelah create payment, simpan minimal:

- `payment_id`, `payment_code`, `payment_total`, `payment_status`, `payment_expired_at`, `payment_checkout_url`
