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
  "message": "ok"
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
  "code": "payment_not_cancellable",
  "message": "payment not found or not cancellable"
}
```
