---
sidebar_position: 4
---

# Android Worker

Aplikasi Android yang berjalan di perangkat tenant untuk mendeteksi pembayaran masuk secara otomatis. Tanpa worker aktif, payment tidak akan terdeteksi.

## Yang Perlu Disiapkan

| Item | Keterangan |
| --- | --- |
| Perangkat Android khusus | Jangan pakai device pribadi |
| Koneksi internet stabil | Worker perlu kirim data ke server |
| Aplikasi banking terpasang | Di perangkat yang sama dengan worker |

## Install & Aktivasi

[Download APK Worker v1.0](https://github.com/rioanandaputra-bot/bayar.digital-docs/releases/download/v1.0.1/bayar.digital-worker-android-v1.0.1.apk)

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
