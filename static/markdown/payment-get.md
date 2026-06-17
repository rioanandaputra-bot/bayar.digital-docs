---
sidebar_position: 7
---

# Payment Get

Mengecek status pembayaran atau rekonsiliasi order.

:::info
Gunakan endpoint ini untuk mengecek status invoice kapan saja. Untuk update status real-time, setup [Webhook](./webhook).

Lihat [Status & Error Code](./status-code) untuk daftar lengkap status payment.
:::

---

## Get by Payment Code

Ambil detail satu invoice berdasarkan `payment_code` dari sistem kamu.

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `GET` | `/gateway/payments/{payment_code}` |
      </TabItem>
      <TabItem value="param" label="Param">
        | Parameter | Tipe | Wajib | Deskripsi |
        |-----------|------|-------|-----------|
        | `payment_code` | string | Ya | Kode invoice dari sistem kamu |
      </TabItem>
      <TabItem value="header" label="Header">
        | Header | Wajib | Deskripsi |
        |--------|-------|-----------|
        | `X-Api-Key` | Ya | API Key merchant |
      </TabItem>
      <TabItem value="body" label="Body">
        Tidak ada request body (GET).
      </TabItem>
      <TabItem value="contoh" label="Contoh">
        ```bash
        curl https://api.bayar.digital/gateway/payments/INV-2026-0001 \
          -H "X-Api-Key: pk_..."
        ```
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="response" label="Response">
    <Tabs>
      <TabItem value="sukses" label="Sukses" default>
        ```json
        {
          "success": true,
          "message": "ok",
          "data": {
            "payment_id": "660e8400-e29b-41d4-a716-446655440010",
            "payment_code": "INV-2026-0001",
            "payment_amount": 50000,
            "payment_unique": 123,
            "payment_total": 50123,
            "payment_status": "PAID",
            "payment_expired_at": "2026-10-11T12:00:00Z",
            "payment_updated_at": "2026-06-11T10:05:00Z",
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
        ```json
        {
          "success": false,
          "code": "not_found",
          "message": "payment not found"
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

### Response Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `payment_id` | uuid | ID unik invoice |
| `payment_code` | string | Kode invoice dari sistem kamu |
| `payment_amount` | int64 | Nominal asli (tanpa nominal unik) |
| `payment_unique` | int64 | Nominal unik (1-999) |
| `payment_total` | int64 | **Total yang harus dibayar** = amount + unique |
| `payment_status` | string | `PENDING` / `PAID` / `EXPIRED` / `CANCELLED` |
| `payment_expired_at` | datetime | Batas waktu pembayaran |
| `payment_updated_at` | datetime | Waktu update terakhir |
| `payment_webhook_url` | string/null | Webhook endpoint invoice ini |
| `payment_checkout_url` | string | URL halaman checkout publik |
| `payment_return_url` | string/null | Redirect URL |
| `customer_name` | string/null | Nama customer |
| `customer_email` | string/null | Email customer |
| `customer_phone` | string/null | Telepon customer |
| `customer_orders` | array/null | Item pesanan |
| `account_id` | uuid | ID akun tujuan |
| `account_number` | string/null | Nomor rekening / QRIS URL |
| `account_name` | string/null | Nama pemilik rekening |
| `channel_id` | uuid/null | ID channel |
| `channel_name` | string/null | Nama bank |
| `channel_type` | string/null | `TRANSFER` / `QRIS` |
| `channel_instructions` | array | Instruksi pembayaran |
| `is_manual_match` | bool | Dicocokkan manual? |
| `manual_matched_mutation_id` | uuid/null | ID mutasi terkait (jika manual match) |

### Error

| Code | Status | Artinya |
|------|--------|---------|
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `not_found` | 404 | `payment_code` tidak ditemukan |
| `internal_error` | 500 | Server error, coba lagi |

---

## List Payments

Ambil daftar invoice, diurutkan dari terbaru.

<Tabs>
  <TabItem value="request2" label="Request" default>
    <Tabs>
      <TabItem value="endpoint2" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `GET` | `/gateway/payments` |
      </TabItem>
      <TabItem value="param2" label="Param">
        | Parameter | Tipe | Default | Maks | Deskripsi |
        |-----------|------|---------|------|-----------|
        | `page` | integer | 1 | — | Halaman |
        | `per_page` | integer | 20 | 100 | Data per halaman |
      </TabItem>
      <TabItem value="header2" label="Header">
        | Header | Wajib | Deskripsi |
        |--------|-------|-----------|
        | `X-Api-Key` | Ya | API Key merchant |
      </TabItem>
      <TabItem value="body2" label="Body">
        Tidak ada request body (GET).
      </TabItem>
      <TabItem value="contoh2" label="Contoh">
        ```bash
        curl "https://api.bayar.digital/gateway/payments?page=1&per_page=20" \
          -H "X-Api-Key: pk_..."
        ```
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="response2" label="Response">
    <Tabs>
      <TabItem value="sukses2" label="Sukses" default>
        ```json
        {
          "success": true,
          "message": "ok",
          "data": [
            {
              "payment_id": "660e8400-e29b-41d4-a716-446655440010",
              "payment_code": "INV-2026-0001",
              "payment_amount": 50000,
              "payment_unique": 123,
              "payment_total": 50123,
              "payment_status": "PAID",
              "payment_expired_at": "2026-10-11T12:00:00Z",
              "payment_updated_at": "2026-06-11T10:05:00Z",
              "payment_webhook_url": "https://yourserver.com/webhooks/bayar",
              "payment_checkout_url": "https://bayar.digital/checkout/660e8400-e29b-41d4-a716-446655440010",
              "payment_return_url": "https://yourserver.com/orders/INV-2026-0001",
              "customer_name": "Budi Santoso",
              "customer_email": "budi@example.com",
              "customer_phone": "081234567890",
              "customer_orders": [],
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
          ],
          "pagination": {
            "total": 50,
            "count": 1,
            "per_page": 20,
            "current_page": 1,
            "total_pages": 3
          }
        }
        ```
      </TabItem>
      <TabItem value="gagal2" label="Gagal">
        ```json
        {
          "success": false,
          "code": "internal_error",
          "message": "internal server error"
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

### Response Fields

Sama dengan [Get by Payment Code](#response-fields) — data dalam bentuk array + objek `pagination`.

| Field Pagination | Tipe | Deskripsi |
|-----------------|------|-----------|
| `total` | int | Total data |
| `count` | int | Data di halaman ini |
| `per_page` | int | Data per halaman |
| `current_page` | int | Halaman saat ini |
| `total_pages` | int | Total halaman |

### Error

| Code | Status | Artinya |
|------|--------|---------|
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Untuk operasi lain, lihat [Payment Cancel](./payment-cancel) atau [Payment Match](./payment-match).
