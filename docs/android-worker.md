---
sidebar_position: 3
---

# Android Worker

Android Worker adalah aplikasi yang berjalan di perangkat tenant untuk membantu Bayar Digital mendeteksi pembayaran masuk.

## Cara Kerja

Worker membaca notifikasi atau mutasi dari akun pembayaran tenant yang terdaftar, lalu mengirim data mutasi ke Bayar Digital. Sistem Bayar Digital mencocokkan mutasi tersebut dengan payment yang dibuat tenant.

Tanpa worker yang aktif dan online, payment tidak akan terdeteksi walaupun customer sudah membayar.

## Yang Perlu Tenant Lakukan

| Item | Keterangan |
| --- | --- |
| Device aktif | Worker harus online dan berjalan. |
| Akun pembayaran aktif | Payment account tenant harus aktif di sistem. |
| Koneksi internet stabil | Worker perlu mengirim data mutasi ke server. |
| Baterai & background access | Setel device agar worker tidak dihentikan oleh sistem. |
| Approval device | Hubungi operator Bayar Digital untuk approve device baru. |

## Install APK

Dapatkan APK versi terbaru dari operator Bayar Digital.

Setelah terpasang:

1. Pastikan perangkat memakai akun pembayaran tenant yang sesuai.
2. Berikan permission yang dibutuhkan (notifikasi, latar belakang).
3. Pastikan perangkat tetap online dan tidak dibatasi battery saver.
4. Hubungi operator Bayar Digital untuk approval device jika worker belum aktif.

## Jika Worker Bermasalah

Worker offline → payment tetap `PENDING` walau customer sudah bayar.

Tindakan:

1. Pastikan perangkat online dan tidak dalam mode hemat daya.
2. Pastikan akun pembayaran masih aktif.
3. Cek status payment via `GET /gateway/payments/{payment_code}`.
4. Hubungi operator jika mutasi sudah masuk tapi status belum berubah.

## Praktik Operasional

1. Gunakan perangkat khusus untuk worker (bukan device pribadi).
2. Monitor payment yang mendekati `expired_at` tetapi belum terbayar.
3. Gunakan webhook dan get payment untuk rekonsiliasi status order.
