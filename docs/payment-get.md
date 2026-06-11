---
sidebar_position: 6
---

# Payment Get

Gunakan endpoint get payment untuk melihat status payment dan melakukan rekonsiliasi order tenant.

## Get Payment By Code

```http
GET /gateway/payments/{payment_code}
X-Api-Key: pk_...
```

`payment_code` adalah kode unik yang tenant kirim saat create payment.

## Contoh Request

```bash
curl https://api.bayar.digital/gateway/payments/INV-2026-0001 \
  -H "X-Api-Key: pk_..."
```

## Response 200

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
    "checkout_url": "/checkout/660e8400-e29b-41d4-a716-446655440010",
    "account_number": "1234567890",
    "account_name": "PT Tenant Contoh",
    "bank_name": "Bank BCA",
    "bank_type": "TRANSFER"
  }
}
```

## List Payments

```http
GET /gateway/payments?page=1&per_page=20
X-Api-Key: pk_...
```

## Query Parameter

| Parameter | Tipe | Keterangan |
| --- | --- | --- |
| `page` | integer | Nomor halaman. Default `1`. |
| `limit` | integer | Jumlah data per halaman. Maksimal `100`. |
| `status` | string | Filter status payment (`PENDING`, `PAID`, `EXPIRED`, `CANCELLED`). |
| `merchant_account_id` | UUID | Filter berdasarkan account. |
| `start_date` | string (ISO 8601) | Filter dari tanggal ini (inklusif). |
| `end_date` | string (ISO 8601) | Filter sampai tanggal ini (inklusif). |
| `sort` | string | Field untuk sorting. |
| `order` | string | `asc` atau `desc`. |

## Response List

```json
{
  "success": true,
  "message": "ok",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440010",
      "payment_code": "INV-2026-0001",
      "amount_original": 50000,
      "amount_unique": 123,
      "amount_total": 50123,
      "status": "PAID",
      "expires_at": "2026-10-11T12:00:00Z",
      "paid_at": "2026-06-11T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Status Payment

| Status | Arti | Aksi Tenant |
| --- | --- | --- |
| `PENDING` | Payment dibuat dan menunggu pembayaran. | Tampilkan instruksi bayar atau checkout. |
| `PAID` | Pembayaran valid sudah terdeteksi. | Tandai order sebagai paid/settled. |
| `EXPIRED` | Payment melewati `expires_at`. | Jangan terima pembayaran untuk payment ini. Buat payment baru jika perlu. |
| `CANCELLED` | Payment dibatalkan. | Jangan gunakan lagi payment ini untuk order aktif. |

## Rekomendasi Rekonsiliasi

Gunakan webhook sebagai jalur utama update status. Gunakan get payment untuk fallback saat webhook gagal, retry, atau tenant membutuhkan pengecekan manual.
