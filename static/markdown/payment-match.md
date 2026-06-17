---
sidebar_position: 9
---

# Payment Match

Mencocokkan invoice `PENDING` menjadi `PAID` secara manual.

:::info
Gunakan jika customer sudah transfer tapi Worker tidak mendeteksi otomatis.

Fitur ini memerlukan **2FA (TOTP)** yang diaktifkan di Dashboard → **Akun Saya** → **2FA**. Scan QR code dengan Google Authenticator, lalu gunakan kode 6 digit yang muncul.
:::

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `POST` | `/gateway/payments/{payment_code}/match` |
      </TabItem>
      <TabItem value="param" label="Param">
        | Parameter | Tipe | Wajib | Deskripsi |
        |-----------|------|-------|-----------|
        | `payment_code` | string | Ya | Kode invoice yang akan dicocokkan |
      </TabItem>
      <TabItem value="header" label="Header">
        | Header | Wajib | Deskripsi |
        |--------|-------|-----------|
        | `X-Api-Key` | Ya | API Key merchant |
        | `X-Totp-Code` | Ya | Kode 6 digit dari Google Authenticator |
      </TabItem>
      <TabItem value="body" label="Body">
        | Field | Tipe | Wajib | Deskripsi |
        |-------|------|-------|-----------|
        | `mutation_id` | uuid | Tidak | ID mutasi yang ingin dikaitkan (jika ada) |
      </TabItem>
      <TabItem value="contoh" label="Contoh">
        ```bash
        curl -X POST https://api.bayar.digital/gateway/payments/INV-2026-0001/match \
          -H "X-Api-Key: pk_..." \
          -H "X-Totp-Code: 123456" \
          -H "Content-Type: application/json" \
          -d '{
            "mutation_id": "550e8400-e29b-41d4-a716-446655440020"
          }'
        ```

        ```json
        {
          "mutation_id": "550e8400-e29b-41d4-a716-446655440020"
        }
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
          "data": null
        }
        ```
      </TabItem>
      <TabItem value="gagal" label="Gagal">
        ```json
        {
          "success": false,
          "code": "invalid totp code",
          "message": "invalid totp code"
        }
        ```
        ```json
        {
          "success": false,
          "code": "totp_not_enabled",
          "message": "totp not enabled"
        }
        ```
      </TabItem>
    </Tabs>
  </TabItem>
</Tabs>

## Response Fields

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `success` | bool | `true` |
| `message` | string | `"ok"` |
| `data` | null | Selalu `null` |

## Error

| Code | Status | Artinya |
|------|--------|---------|
| `X-Totp-Code header is required` | 400 | Header TOTP tidak disertakan |
| `invalid totp code` | 400 | Kode TOTP salah |
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `totp_not_enabled` | 403 | 2FA belum diaktifkan di akun Anda |
| `not_found` | 404 | Invoice tidak ditemukan atau bukan `PENDING` |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Untuk melihat mutasi transfer yang terdeteksi, lihat [Payment Mutations](./payment-mutations).
