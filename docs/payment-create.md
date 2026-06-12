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
  "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_code": "INV-2026-0001",
  "amount_original": 50000,
  "expired_at": 1791691200000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@example.com",
  "customer_phone": "081234567890",
  "callback_url": "https://yourserver.com/webhooks/bayar",
  "return_url": "https://yourserver.com/orders/INV-2026-0001",
  "order_items": [
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
| `merchant_account_id` | UUID | Ya | ID dari `GET /gateway/accounts` |
| `payment_code` | string | Ya | Kode unik dari sistem kamu (maks 100 char) |
| `amount_original` | integer | Ya | Nominal order, harus lebih dari 0 |
| `expired_at` | integer | Ya | Epoch milliseconds, harus di masa depan |
| `customer_name` | string | Ya | Nama customer (maks 255 char) |
| `customer_email` | string | Kondisional | Minimal salah satu email/phone wajib diisi |
| `customer_phone` | string | Kondisional | Minimal salah satu email/phone wajib diisi |
| `callback_url` | string | Tidak | URL webhook untuk notifikasi status |
| `return_url` | string | Tidak | URL redirect setelah customer bayar |
| `order_items` | array | Tidak | Detail item order |

Jika `callback_url` tidak dikirim, sistem memakai default callback URL merchant dari dashboard.

### Order Item

| Field | Tipe | Required |
| --- | --- | --- |
| `name` | string | Ya |
| `price` | integer | Ya |
| `quantity` | integer | Ya |
| `subtotal` | integer | Ya, akan dihitung ulang sebagai `price * quantity` |
| `sku` | string | Tidak |
| `product_url` | string | Tidak |
| `image_url` | string | Tidak |

## Response 201

```json
{
  "success": true,
  "message": "created",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440010",
    "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "amount_unique": 123,
    "amount_total": 50123,
    "status": "PENDING",
    "expires_at": "2026-10-11T12:00:00Z",
    "created_at": "2026-06-11T10:00:00Z",
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "customer_phone": "081234567890",
    "callback_url": "https://yourserver.com/webhooks/bayar",
    "return_url": "https://yourserver.com/orders/INV-2026-0001",
    "checkout_url": "/checkout/660e8400-e29b-41d4-a716-446655440010",
    "order_items": "[{\"name\":\"Produk A\",\"price\":50000,\"quantity\":1,\"subtotal\":50000}]",
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "bank_name": "BCA",
    "bank_type": "TRANSFER"
  }
}
```

## Nominal Unik

Sistem menambahkan `amount_unique` ke `amount_original` secara otomatis.

```
amount_total = amount_original + amount_unique
```

**Customer harus bayar sesuai `amount_total`.** Tampilkan `amount_total` di UI kamu, bukan `amount_original`.

## Simpan di Sistem Kamu

Setelah create payment, simpan minimal:

- `id`, `payment_code`, `amount_total`, `status`, `expires_at`, `checkout_url`

:::info
Di response payment, `order_items` dikembalikan sebagai string JSON.
:::
