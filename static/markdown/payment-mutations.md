---
sidebar_position: 10
---

# Payment Mutations

Mendapatkan daftar mutasi/transaksi masuk yang terdeteksi oleh Android Worker dari rekening Anda.

:::info
Data mutasi berguna untuk rekonsiliasi dan mencocokkan payment secara manual jika otomatis gagal.

**Cara kerja:** Worker mendeteksi notifikasi transfer → kirim ke server → sistem otomatis cocokkan dengan invoice `PENDING` berdasarkan nominal. Jika cocok, invoice jadi `PAID`. Jika tidak, mutasi tetap `unmatched` dan bisa dicocokkan manual via [Payment Match](./payment-match).

Gunakan parameter `only_unmatched=true` untuk melihat mutasi yang belum otomatis cocok.
:::

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `GET` | `/gateway/mutations` |
      </TabItem>
      <TabItem value="param" label="Param">
        | Parameter | Tipe | Default | Deskripsi |
        |-----------|------|---------|-----------|
        | `page` | integer | 1 | Halaman |
        | `per_page` | integer | 20 | Data per halaman (max 100) |
        | `only_unmatched` | bool | `false` | Tampilkan hanya yang **belum** cocok |
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
        curl "https://api.bayar.digital/gateway/mutations?only_unmatched=true" \
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
              "id": "550e8400-e29b-41d4-a716-446655440020",
              "device_id": "660e8400-e29b-41d4-a716-446655440030",
              "title": "Transfer dari BUDI SANTOSO",
              "body": "BCA ke 1234567890 a/n PT Merchant Contoh",
              "posted_at": "2026-06-11T10:30:00Z",
              "amount_parsed": 50123,
              "sender_parsed": "BUDI SANTOSO",
              "type_parsed": "CREDIT",
              "currency_parsed": "IDR",
              "is_matched": false,
              "matched_payment_id": null,
              "matched_payment_code": null,
              "created_at": "2026-06-11T10:30:05Z",
              "device_name": "HP Kantor",
              "package_name": "com.bca",
              "app_name": "BCA Mobile",
              "app_version": "6.2.0",
              "account_number": "1234567890",
              "account_name": "PT Merchant Contoh",
              "bank_name": "Bank Central Asia",
              "bank_type": "TRANSFER"
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
      <TabItem value="gagal" label="Gagal">
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
| `id` | uuid | ID mutasi |
| `device_id` | uuid | ID Android Worker yang mendeteksi |
| `title` | string/null | Judul notifikasi transfer |
| `body` | string/null | Detail notifikasi |
| `posted_at` | datetime | Waktu transaksi |
| `amount_parsed` | int64 | Nominal transfer |
| `sender_parsed` | string/null | Nama pengirim (terdeteksi otomatis) |
| `type_parsed` | string/null | `CREDIT` (masuk) / `DEBIT` (keluar) |
| `currency_parsed` | string/null | Mata uang (contoh: `IDR`) |
| `is_matched` | bool | Apakah sudah dipasangkan ke invoice |
| `matched_payment_id` | uuid/null | ID invoice yang cocok |
| `matched_payment_code` | string/null | Kode invoice yang cocok |
| `created_at` | datetime | Waktu terdeteksi oleh sistem |
| `device_name` | string/null | Nama perangkat Worker |
| `package_name` | string/null | Package name aplikasi bank |
| `app_name` | string/null | Nama aplikasi bank |
| `app_version` | string/null | Versi aplikasi bank |
| `account_number` | string/null | Rekening tujuan |
| `account_name` | string/null | Nama pemilik rekening |
| `bank_name` | string/null | Nama bank |
| `bank_type` | string/null | `TRANSFER` / `QRIS` |

## Error

| Code | Status | Artinya |
|------|--------|---------|
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Setup [Webhook](./webhook) untuk notifikasi real-time saat status payment berubah.
