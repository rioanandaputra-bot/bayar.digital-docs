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
    "payment_code": "INV-2026-0001",
    "amount_original": 50000,
    "amount_unique": 123,
    "amount_total": 50123,
    "status": "PAID",
    "expires_at": "2026-10-11T12:00:00Z",
    "paid_at": "2026-06-11T10:05:00Z",
    "created_at": "2026-06-11T10:00:00Z",
    "customer_name": "Budi Santoso",
    "checkout_url": "/checkout/660e8400-e29b-41d4-a716-446655440010",
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "bank_name": "Bank BCA",
    "bank_type": "TRANSFER"
  }
}
```

## List Payments

```bash
curl "https://api.bayar.digital/gateway/payments?page=1&per_page=20&status=PAID" \
  -H "X-Api-Key: pk_..."
```

### Query Parameter

| Parameter | Tipe | Keterangan |
| --- | --- | --- |
| `page` | integer | Default `1` |
| `limit` | integer | Maks `100` |
| `status` | string | `PENDING`, `PAID`, `EXPIRED`, `CANCELLED` |
| `merchant_account_id` | UUID | Filter by account |
| `start_date` | ISO 8601 | Dari tanggal (inklusif) |
| `end_date` | ISO 8601 | Sampai tanggal (inklusif) |
| `sort` | string | Field untuk sorting |
| `order` | string | `asc` atau `desc` |

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
