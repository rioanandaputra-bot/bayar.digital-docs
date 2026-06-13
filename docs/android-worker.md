---
sidebar_position: 4
---

# Android Worker

Aplikasi Android yang berjalan di perangkat khusus milik Anda (sebagai Tenant/Merchant) untuk mendeteksi pembayaran masuk ke rekening Anda secara otomatis. Tanpa worker aktif di perangkat Anda, pembayaran customer tidak akan dapat dideteksi secara otomatis.

## Yang Perlu Disiapkan

| Item | Keterangan |
| --- | --- |
| Perangkat Android khusus | Jangan pakai device pribadi |
| Koneksi internet stabil | Worker perlu kirim data ke server |
| Aplikasi banking terpasang | Di perangkat yang sama dengan worker |

## Install & Aktivasi

[Download APK Worker](https://bayar.digital/downloads/app-worker-latest.apk)

1. Install APK di perangkat khusus
2. Buka app → masukkan API Key (`pk_...`)
3. Approve device di dashboard
4. Berikan 3 izin yang diminta:
   - **Notifikasi** — foreground service
   - **Akses Notifikasi** — baca notifikasi banking
   - **Optimasi Baterai** — cegah worker dihentikan sistem
5. Worker mulai berjalan dan mendeteksi mutasi

## Troubleshooting

Jika payment tetap `PENDING` padahal customer sudah bayar:

1. Pastikan perangkat online dan tidak mode hemat daya
2. Cek notifikasi foreground worker masih terlihat
3. Cek semua izin sudah diberikan
4. Verifikasi status payment via `GET /gateway/payments/{payment_code}`
5. Cek status device di dashboard jika masalah berlanjut
