---
sidebar_position: 9
---

# Payment Get

Cek status payment atau rekonsiliasi order.

## Get by Payment Code

```bash
curl https://api.bayar.digital/gateway/payments/INV-2026-0001 \
  -H "X-Api-Key: pk_..."
```

### Response

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440010",
    "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "amount_unique": 123,
    "amount_total": 50123,
    "status": "PAID",
    "expires_at": "2026-10-11T12:00:00Z",
    "paid_at": "2026-06-11T10:05:00Z",
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

## List Payments

```bash
curl "https://api.bayar.digital/gateway/payments?page=1&per_page=20" \
  -H "X-Api-Key: pk_..."
```

### Query Parameter

| Parameter | Tipe | Keterangan |
| --- | --- | --- |
| `page` | integer | Default `1` |
| `per_page` | integer | Default `20`, maksimal `100` |

Endpoint list belum mendukung filter `status`, `merchant_account_id`, `start_date`, `end_date`, `sort`, atau `order`.

### Response List

```json
{
  "success": true,
  "message": "ok",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440010",
      "merchant_account_id": "550e8400-e29b-41d4-a716-446655440000",
      "payment_code": "INV-2026-0001",
      "amount_original": 50000,
      "amount_unique": 123,
      "amount_total": 50123,
      "status": "PAID",
      "expires_at": "2026-10-11T12:00:00Z",
      "paid_at": "2026-06-11T10:05:00Z",
      "created_at": "2026-06-11T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Status Payment

| Status | Arti | Terminal |
| --- | --- | --- |
| `PENDING` | Menunggu pembayaran | Tidak |
| `PAID` | Pembayaran terkonfirmasi | Ya |
| `EXPIRED` | Melewati batas waktu | Ya |
| `CANCELLED` | Dibatalkan | Ya |

:::tip
Gunakan webhook sebagai jalur utama update status. Gunakan get payment sebagai fallback rekonsiliasi.
:::
