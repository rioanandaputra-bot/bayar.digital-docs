---
sidebar_position: 11
---

# Channel Instructions

Mendapatkan panduan/langkah-langkah pembayaran untuk channel bank tertentu. Informasi ini bisa kamu tampilkan ke customer.

:::info
Setiap channel bank bisa punya instruksi berbeda. Gunakan `channel_id` dari response [Payment Account](./payment-account) atau [Payment Create](./payment-create) untuk mengambil panduan langkah demi langkah.
:::

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `GET` | `/gateway/channels/{channel_id}/instructions` |
      </TabItem>
      <TabItem value="param" label="Param">
        | Parameter | Tipe | Wajib | Deskripsi |
        |-----------|------|-------|-----------|
        | `channel_id` | uuid | Ya | ID channel (dari response `GET /gateway/accounts`) |
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
        curl https://api.bayar.digital/gateway/channels/660e8400-e29b-41d4-a716-446655440001/instructions \
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
            "channel_id": "660e8400-e29b-41d4-a716-446655440001",
            "instructions": [
              {
                "step": 1,
                "title": "Buka aplikasi BCA Mobile",
                "content": "Login ke aplikasi BCA Mobile Anda"
              },
              {
                "step": 2,
                "title": "Pilih m-Transfer",
                "content": "Pilih menu m-Transfer > ke Rekening BCA Virtual Account"
              },
              {
                "step": 3,
                "title": "Masukkan nominal",
                "content": "Transfer sesuai total yang tertera"
              }
            ]
          }
        }
        ```
      </TabItem>
      <TabItem value="gagal" label="Gagal">
        ```json
        {
          "success": false,
          "code": "channel_id is required",
          "message": "channel id is required"
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

## Response Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `channel_id` | uuid | ID channel |
| `instructions` | array | Daftar langkah pembayaran |

### Instruction Item

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `step` | int | Urutan langkah |
| `title` | string | Judul langkah |
| `content` | string | Penjelasan langkah |

## Error

| Code | Status | Artinya |
|------|--------|---------|
| `channel_id is required` | 400 | Parameter `channel_id` kosong |
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Setup [Webhook](./webhook) untuk notifikasi otomatis saat payment berubah status.
