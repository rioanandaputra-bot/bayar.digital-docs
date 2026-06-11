---
sidebar_position: 5
---

# Payment Create

Gunakan endpoint ini untuk membuat payment dari order internal tenant.

## Endpoint

```http
POST /api/gateway/payments
X-Api-Key: pk_...
Content-Type: application/json
```

## Request Body

```json
{
  "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_code": "INV-2026-0001",
  "amount_original": 50000,
  "expired_at": 1791691200000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@example.com",
  "customer_phone": "081234567890",
  "callback_url": "https://tenant.example.com/webhooks/bayar-digital",
  "return_url": "https://tenant.example.com/orders/INV-2026-0001",
  "order_items": [
    {
      "sku": "SKU-001",
      "name": "Produk A",
      "price": 50000,
      "quantity": 1,
      "subtotal": 50000,
      "product_url": "https://tenant.example.com/products/sku-001",
      "image_url": "https://tenant.example.com/products/sku-001.jpg"
    }
  ]
}
```

## Field Request

| Field | Tipe | Required | Keterangan |
| --- | --- | --- | --- |
| `merchant_account_id` | UUID | Ya | ID dari `GET /api/gateway/accounts`. |
| `payment_code` | string | Ya | Kode unik dari sistem tenant, maksimal 100 karakter. |
| `amount_original` | integer | Ya | Nominal order sebelum nominal unik. |
| `expired_at` | integer | Ya | Waktu kedaluwarsa dalam epoch milliseconds dan harus di masa depan. |
| `customer_name` | string | Ya | Nama customer, maksimal 255 karakter. |
| `customer_email` | string | Tidak | Email customer. |
| `customer_phone` | string | Tidak | Nomor telepon customer, maksimal 50 karakter. |
| `callback_url` | string | Tidak | URL webhook tenant untuk menerima update payment. |
| `return_url` | string | Tidak | URL tujuan setelah customer selesai dari checkout. |
| `order_items` | array | Tidak | Detail item order. |

Minimal salah satu dari `customer_email` atau `customer_phone` wajib diisi.

## Order Item

| Field | Tipe | Required | Keterangan |
| --- | --- | --- | --- |
| `sku` | string | Tidak | SKU produk di sistem tenant. |
| `name` | string | Ya | Nama produk. |
| `price` | integer | Ya | Harga satuan. |
| `quantity` | integer | Ya | Jumlah item, minimal 1. |
| `subtotal` | integer | Ya | Total item. |
| `product_url` | string | Tidak | URL halaman produk. |
| `image_url` | string | Tidak | URL gambar produk. |

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
    "paid_at": null,
    "created_at": "2026-06-11T10:00:00Z",
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "customer_phone": "081234567890",
    "callback_url": "https://tenant.example.com/webhooks/bayar-digital",
    "return_url": "https://tenant.example.com/orders/INV-2026-0001",
    "checkout_url": "/checkout/660e8400-e29b-41d4-a716-446655440010",
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "bank_name": "Bank BCA",
    "bank_type": "TRANSFER"
  }
}
```

## Nominal Unik

Customer harus membayar sesuai `amount_total`.

```text
amount_total = amount_original + amount_unique
```

Jangan menampilkan `amount_original` sebagai nominal yang harus dibayar jika response memiliki `amount_total`.

## Contoh cURL

```bash
curl -X POST https://api.bayar.digital/api/gateway/payments \
  -H "X-Api-Key: pk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "expired_at": 1791691200000,
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "callback_url": "https://tenant.example.com/webhooks/bayar-digital",
    "return_url": "https://tenant.example.com/orders/INV-2026-0001"
  }'
```

## Penyimpanan Di Sistem Tenant

Setelah payment dibuat, simpan minimal field berikut:

1. `id`
2. `payment_code`
3. `merchant_account_id`
4. `amount_original`
5. `amount_unique`
6. `amount_total`
7. `status`
8. `expires_at`
9. `checkout_url`
