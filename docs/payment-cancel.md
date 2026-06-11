---
sidebar_position: 7
---

# Payment Cancel

Gunakan cancel payment untuk membatalkan payment yang tidak lagi dipakai oleh order tenant.

## Endpoint

```http
DELETE /api/gateway/payments/{payment_code}
X-Api-Key: pk_...
```

## Path Parameter

| Parameter | Keterangan |
| --- | --- |
| `payment_code` | Kode payment dari sistem tenant. |

## Contoh Request

```bash
curl -X DELETE https://api.bayar.digital/api/gateway/payments/INV-2026-0001 \
  -H "X-Api-Key: pk_..."
```

## Response 200

```json
{
  "success": true,
  "message": "ok",
  "data": null
}
```

## Aturan Cancel

1. Cancel ditujukan untuk payment yang masih `PENDING`.
2. Payment yang sudah `PAID` tidak boleh dianggap batal oleh sistem tenant.
3. Payment yang sudah `EXPIRED` atau `CANCELLED` tidak perlu dicancel ulang.
4. Jika order masih perlu dibayar setelah cancel, buat payment baru dengan `payment_code` baru.

## Error Umum

Jika payment tidak bisa dibatalkan, API dapat mengembalikan:

```json
{
  "success": false,
  "code": "payment_not_cancellable",
  "message": "payment not found or not cancellable"
}
```

## Rekomendasi Sistem Tenant

Setelah cancel sukses, tandai order internal sebagai payment cancelled atau menunggu payment baru. Jangan memakai `checkout_url` lama setelah payment dibatalkan.
