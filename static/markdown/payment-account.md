---
sidebar_position: 4
---

# Payment Account

Melihat daftar rekening aktif yang tersedia untuk digunakan sebagai tujuan pembayaran.

:::info
Sebelum membuat invoice, kamu perlu tahu rekening tujuan mana yang tersedia. Gunakan `account_id` dari response ini saat [Payment Create](./payment-create).
:::

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `GET` | `/gateway/accounts` |
      </TabItem>
      <TabItem value="param" label="Param">
        Tidak ada parameter.
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
        curl https://api.bayar.digital/gateway/accounts \
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
          "data": [
            {
              "account_id": "550e8400-e29b-41d4-a716-446655440000",
              "account_number": "1234567890",
              "account_name": "PT Merchant Contoh",
              "account_min_amount": 10000,
              "account_max_amount": 10000000,
              "account_active": true,
              "account_quota": 30,
              "channel_id": "660e8400-e29b-41d4-a716-446655440001",
              "channel_type": "TRANSFER",
              "channel_name": "Bank Central Asia",
              "app_id": "990e8400-e29b-41d4-a716-446655440002",
              "app_name": "BCA Mobile",
              "app_package": "com.bca"
            },
            {
              "account_id": "550e8400-e29b-41d4-a716-446655440003",
              "account_number": "QRIS-001",
              "account_name": "PT Merchant Contoh",
              "account_min_amount": 1000,
              "account_max_amount": 5000000,
              "account_active": true,
              "account_quota": 30,
              "channel_id": "660e8400-e29b-41d4-a716-446655440004",
              "channel_type": "QRIS",
              "channel_name": "QRIS",
              "app_id": null,
              "app_name": null,
              "app_package": null
            }
          ]
        }
        ```
      </TabItem>
      <TabItem value="gagal" label="Gagal">
        ```json
        {
          "success": false,
          "code": "tenant_api_key_required",
          "message": "tenant api key required"
        }
        ```
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

## Response Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `account_id` | uuid | **Gunakan ini** sebagai `account_id` saat create payment |
| `account_number` | string/null | Nomor rekening. QRIS: label/nama merchant |
| `account_name` | string/null | Nama pemilik rekening |
| `account_min_amount` | int64 | Minimal nominal pembayaran |
| `account_max_amount` | int64/null | Maksimal nominal (null = tak terbatas) |
| `account_active` | bool | Status aktif |
| `account_quota` | int | Sisa hari kuota |
| `channel_id` | uuid | ID channel bank |
| `channel_type` | string | `TRANSFER` (transfer bank) atau `QRIS` |
| `channel_name` | string/null | Nama bank |
| `app_id` | uuid/null | ID aplikasi mobile banking |
| `app_name` | string/null | Nama aplikasi mobile banking |
| `app_package` | string/null | Package name Android |

## Error

| Code | Status | Artinya |
|------|--------|---------|
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `internal_error` | 500 | Server error, coba lagi |

## Cara Memilih Account

- **Transfer bank** → pilih `channel_type: "TRANSFER"`
- **QRIS** → pilih `channel_type: "QRIS"`

Simpan `account_id` sebagai konfigurasi di sistem kamu, lalu kirim sebagai `account_id` saat create payment.

---

**Lanjutan:** Sudah tahu rekening tujuan? Lanjut ke [Payment Create](./payment-create) untuk membuat invoice.
