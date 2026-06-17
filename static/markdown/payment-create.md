---
sidebar_position: 5
---

# Payment Create

Membuat invoice pembayaran baru. Sistem otomatis menambahkan **nominal unik** (1-999) agar transfer customer bisa dideteksi.

:::info
Setelah mendapat `account_id` dari [Payment Account](./payment-account), langkah ini membuat invoice yang akan dibayar customer.

`payment_code` bersifat **idempotency key** — request dengan kode yang sama akan ditolak (409), mencegah duplikasi invoice.
:::

Sistem generate angka acak 1-999 sebagai nominal unik. Customer WAJIB membayar sebesar `payment_total` (`payment_amount + payment_unique`), bukan `payment_amount`.

```
payment_total = 50.000 + 123 = 50.123
```

Tampilkan di UI:
```
Total yang harus dibayar: Rp 50.123
(Rp 50.000 + kode unik Rp 123)
```

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `POST` | `/gateway/payments` |
      </TabItem>
      <TabItem value="param" label="Param">
        Tidak ada parameter URL.
      </TabItem>
      <TabItem value="header" label="Header">
        | Header | Wajib | Deskripsi |
        |--------|-------|-----------|
        | `X-Api-Key` | Ya | API Key merchant |
        | `Content-Type` | Ya | `application/json` |
      </TabItem>
      <TabItem value="body" label="Body">
        | Field | Tipe | Wajib | Deskripsi |
        |-------|------|-------|-----------|
        | `account_id` | uuid | Ya | ID akun tujuan (dari `GET /gateway/accounts`) |
        | `payment_code` | string | Ya | Idempotency key. Kode unik dari sistem kamu |
        | `payment_amount` | int64 | Ya | Nominal invoice sebelum nominal unik |
        | `payment_expired_at` | string | Ya | Batas waktu (ISO 8601, harus di masa depan) |
        | `customer_name` | string | Ya | Nama customer |
        | `customer_email` | string | Tidak | Email (maks 255). Minimal email atau phone |
        | `customer_phone` | string | Tidak | Telepon (maks 50). Minimal email atau phone |
        | `payment_webhook_url` | string | Tidak | Webhook endpoint khusus invoice ini |
        | `payment_return_url` | string | Tidak | Redirect setelah customer bayar |
        | `customer_orders` | array | Tidak | Daftar item pesanan |

        **Order Item:**

        | Field | Tipe | Wajib | Deskripsi |
        |-------|------|-------|-----------|
        | `sku` | string | Tidak | SKU produk |
        | `name` | string | Ya | Nama produk |
        | `price` | int64 | Ya | Harga satuan |
        | `quantity` | int | Ya | Jumlah |
        | `subtotal` | int64 | Ya | Akan di-override sistem = `price × quantity` |
        | `product_url` | string | Tidak | URL halaman produk |
        | `image_url` | string | Tidak | URL gambar produk |

        :::info
        Jika `customer_orders` diisi, total seluruh `subtotal` harus sama dengan `payment_amount`.
        :::
      </TabItem>
      <TabItem value="contoh" label="Contoh">
        ```bash
        curl -X POST https://api.bayar.digital/gateway/payments \
          -H "X-Api-Key: pk_..." \
          -H "Content-Type: application/json" \
          -d '{
            "account_id": "550e8400-e29b-41d4-a716-446655440000",
            "payment_code": "INV-2026-0001",
            "payment_amount": 50000,
            "payment_expired_at": "2026-10-11T12:00:00Z",
            "customer_name": "Budi Santoso",
            "customer_email": "budi@example.com",
            "customer_phone": "081234567890"
          }'
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
          "payment_webhook_url": "https://yourserver.com/webhooks/bayar",
          "payment_return_url": "https://yourserver.com/orders/INV-2026-0001",
          "customer_orders": [
            {
              "sku": "SKU001",
              "name": "Produk A",
              "price": 50000,
              "quantity": 1,
              "subtotal": 50000,
              "product_url": "https://yourserver.com/products/produk-a",
              "image_url": "https://yourserver.com/images/produk-a.jpg"
            }
          ]
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="response" label="Response">
    <Tabs>
      <TabItem value="sukses" label="Sukses" default>
        **201 Created**

        ```json
        {
          "success": true,
          "message": "created",
          "data": {
            "payment_id": "660e8400-e29b-41d4-a716-446655440010",
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
                "sku": "SKU001",
                "name": "Produk A",
                "price": 50000,
                "quantity": 1,
                "subtotal": 50000,
                "product_url": "https://yourserver.com/products/produk-a",
                "image_url": "https://yourserver.com/images/produk-a.jpg"
              }
            ],
            "account_id": "550e8400-e29b-41d4-a716-446655440000",
            "account_number": "1234567890",
            "account_name": "PT Merchant Contoh",
            "channel_id": "660e8400-e29b-41d4-a716-446655440001",
            "channel_name": "Bank Central Asia",
            "channel_type": "TRANSFER",
            "channel_instructions": [],
            "is_manual_match": false,
            "manual_matched_mutation_id": null
          }
        }
        ```
      </TabItem>
      <TabItem value="gagal" label="Gagal">
        **Validation Error (400)**
        ```json
        {
          "success": false,
          "code": "validation_error",
          "message": "validation error",
          "errors": {
            "customer_name": "customer name is required"
          }
        }
        ```

        **Conflict (409)**
        ```json
        {
          "success": false,
          "code": "payment_code_conflict",
          "message": "payment code conflict"
        }
        ```

        **Conflict (409)**
        ```json
        {
          "success": false,
          "code": "unique_amount_conflict",
          "message": "unique amount conflict"
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

## Response Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `payment_id` | uuid | ID unik invoice |
| `payment_code` | string | Kode invoice dari sistem kamu |
| `payment_amount` | int64 | Nominal asli (tanpa nominal unik) |
| `payment_unique` | int64 | Nominal unik (1-999) |
| `payment_total` | int64 | **Total yang harus dibayar** = amount + unique |
| `payment_status` | string | `PENDING` |
| `payment_expired_at` | datetime | Batas waktu pembayaran |
| `payment_updated_at` | datetime | Waktu update terakhir |
| `payment_webhook_url` | string/null | Webhook endpoint invoice ini |
| `payment_checkout_url` | string | URL halaman checkout publik |
| `payment_return_url` | string/null | Redirect URL |
| `customer_name` | string | Nama customer |
| `customer_email` | string/null | Email customer |
| `customer_phone` | string/null | Telepon customer |
| `customer_orders` | array | Item pesanan |
| `account_id` | uuid | ID akun tujuan |
| `account_number` | string | Nomor rekening tujuan |
| `account_name` | string | Nama pemilik rekening |
| `channel_id` | uuid | ID channel bank |
| `channel_name` | string | Nama bank |
| `channel_type` | string | `TRANSFER` / `QRIS` |
| `channel_instructions` | array | Instruksi pembayaran |
| `is_manual_match` | bool | Dicocokkan manual? |
| `manual_matched_mutation_id` | uuid/null | ID mutasi terkait |

## Simpan di Sistem Kamu

Setelah create payment, simpan field berikut:

| Field | Gunakan Untuk |
|-------|---------------|
| `payment_id` | Referensi unik invoice |
| `payment_code` | Kode invoice kamu |
| `payment_total` | Nominal yang harus dibayar customer |
| `payment_status` | Status awal: `PENDING` |
| `payment_checkout_url` | Redirect customer (opsional) |
| `payment_webhook_url` | Webhook yang akan dikirimi notifikasi |
| `account_number` | Nomor rekening tujuan |
| `channel_instructions` | Instruksi pembayaran |

## Error

| Code | Status | Artinya |
|------|--------|---------|
| `invalid request body` | 400 | Format JSON salah |
| `validation_error` | 400 | Field tidak valid (cek `errors`) |
| `invalid_expired_at` | 400 | Format `payment_expired_at` salah |
| `account_not_owned` | 403 | `account_id` bukan milik Anda |
| `no_active_quota` | 403 | Kuota akun habis |
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `unique_amount_conflict` | 409 | Gagal generate nominal unik, coba lagi |
| `payment_code_conflict` | 409 | `payment_code` sudah dipakai (idempotency) |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Invoice sudah dibuat! Arahkan customer ke [Checkout](./checkout) atau tampilkan detail pembayaran di UI kamu.
