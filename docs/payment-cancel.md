---
sidebar_position: 10
---

# Payment Cancel

Batalkan payment yang masih `PENDING`.

## Request

```bash
curl -X DELETE https://api.bayar.digital/gateway/payments/INV-2026-0001 \
  -H "X-Api-Key: pk_..."
```

## Response

```json
{
  "success": true,
  "code": "PAYMENT_CANCELLED",
  "message": "Payment cancelled successfully",
  "data": {
    "payment_code": "INV-2026-0001",
    "status": "CANCELLED",
    "cancelled_at": "2026-06-11T12:00:00Z"
  }
}
```

## Aturan

- Hanya payment `PENDING` yang bisa dicancel
- Payment `PAID` / `EXPIRED` / `CANCELLED` tidak bisa dicancel
- Jika order masih perlu dibayar, buat payment baru dengan `payment_code` baru

## Error

```json
{
  "success": false,
  "code": "PAYMENT_NOT_CANCELLABLE",
  "message": "payment not found or not cancellable"
}
```
