---
sidebar_position: 8
---

# Payment Cancel

Membatalkan invoice yang masih `PENDING`. Status berubah menjadi `CANCELLED`.

:::info
Hanya invoice dengan status `PENDING` yang bisa dibatalkan. Invoice `PAID` / `EXPIRED` / `CANCELLED` tidak bisa dibatalkan.

Jika customer masih perlu bayar, buat invoice baru dengan `payment_code` baru.
:::

<Tabs>
  <TabItem value="request" label="Request" default>
    <Tabs>
      <TabItem value="endpoint" label="Endpoint" default>
        | Method | URL |
        |--------|-----|
        | `DELETE` | `/gateway/payments/{payment_code}` |
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
        Tidak ada request body (DELETE).
      </TabItem>
      <TabItem value="contoh" label="Contoh">
        ```bash
        curl -X DELETE https://api.bayar.digital/gateway/payments/INV-2026-0001 \
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
          "data": null
        }
        ```
      </TabItem>
      <TabItem value="gagal" label="Gagal">
        ```json
        {
          "success": false,
          "code": "payment_not_cancellable",
          "message": "payment not found or not pending"
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
| `tenant_api_key_required` | 403 | API Key tidak valid |
| `payment_not_cancellable` | 404 | Invoice tidak ditemukan atau bukan `PENDING` |
| `internal_error` | 500 | Server error, coba lagi |

---

**Lanjutan:** Jika customer sudah transfer tapi tidak terdeteksi otomatis, lihat [Payment Match](./payment-match) untuk mencocokkan manual.
