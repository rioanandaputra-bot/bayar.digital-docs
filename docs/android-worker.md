---
sidebar_position: 3
---

# Android Worker

Android Worker adalah aplikasi perangkat tenant yang membantu Bayar Digital membaca mutasi pembayaran dari akun pembayaran tenant.

Dokumen ini hanya membahas peran worker dari sudut pandang integrasi tenant. Detail build, signing, atau konfigurasi internal Android tidak diperlukan untuk integrasi API payment gateway.

## Fungsi Worker

Worker bertugas untuk:

1. Terhubung ke akun pembayaran tenant yang sudah disetujui.
2. Membaca notifikasi atau mutasi pembayaran dari perangkat.
3. Mengirim data mutasi ke Bayar Digital.
4. Membantu sistem mencocokkan mutasi dengan payment yang dibuat tenant.
5. Memicu perubahan status payment jika pembayaran valid ditemukan.

## Hubungan Dengan Payment

Saat tenant membuat payment, Bayar Digital menghasilkan nominal final pada `amount_total`.

```text
amount_total = amount_original + amount_unique
```

Nilai unik ini membantu pencocokan mutasi. Customer harus membayar sesuai `amount_total`, bukan hanya `amount_original`.

## Yang Perlu Dipastikan Tenant

| Item | Keterangan |
| --- | --- |
| Device aktif | Worker harus online selama tenant menerima pembayaran. |
| Akun pembayaran aktif | Payment account harus tersedia pada endpoint `GET /api/gateway/accounts`. |
| Notifikasi/mutasi terbaca | Worker harus dapat membaca data mutasi yang dibutuhkan. |
| Koneksi internet stabil | Worker perlu mengirim data mutasi ke Bayar Digital. |
| Baterai dan background access | Perangkat harus diatur agar aplikasi worker tidak dihentikan sistem. |

## Unduh APK

Versi terbaru Android Worker tenant: **1.2**.

[Unduh APK Android Worker Tenant](https://docs.bayar.digital/apk/bayar-digital-worker-tenant.apk)

:::info
Jika link download belum tersedia di environment dokumentasi yang kamu pakai, gunakan APK release yang diberikan oleh operator Bayar Digital. Jangan build APK sendiri untuk production kecuali diminta oleh operator.
:::

Setelah APK terpasang:

1. Pastikan perangkat memakai akun/payment account tenant yang benar.
2. Berikan permission yang dibutuhkan agar worker dapat berjalan di background.
3. Pastikan perangkat tetap online dan tidak dibatasi oleh battery saver.
4. Hubungi operator Bayar Digital untuk proses approval device jika worker belum aktif.

## Changelog

### v1.2

Ringkasan perubahan worker tenant:

1. Mendukung sinkronisasi mutasi untuk payment tenant.
2. Menjalankan background worker untuk menjaga proses baca mutasi tetap aktif.
3. Mendukung notifikasi Firebase Cloud Messaging untuk event worker.
4. Menyimpan konfigurasi lokal dengan encrypted storage.
5. Mendukung build domain `tenant` dan `platform` sesuai konfigurasi release.

## Dampak Jika Worker Bermasalah

Jika worker offline atau tidak membaca mutasi, payment bisa tetap berada pada status `PENDING` walaupun customer sudah membayar.

Tindakan tenant:

1. Pastikan perangkat worker online.
2. Pastikan akun pembayaran masih aktif.
3. Cek status payment melalui `GET /api/gateway/payments/{payment_code}`.
4. Hubungi operator Bayar Digital jika mutasi sudah ada tetapi status belum berubah.

## Praktik Operasional

1. Gunakan perangkat khusus untuk worker.
2. Jangan sering mengganti akun pembayaran tanpa koordinasi operasional.
3. Monitor payment yang mendekati `expired_at` tetapi belum terbayar.
4. Selalu gunakan webhook dan get payment untuk rekonsiliasi status order.
