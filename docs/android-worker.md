---
sidebar_position: 3
---

# Android Worker

Android Worker adalah aplikasi yang berjalan di perangkat Android tenant untuk mendeteksi pembayaran masuk secara otomatis.

## Cara Kerja

Worker menggunakan **Notification Listener Service** — membaca notifikasi dari aplikasi mobile banking yang terpasang di perangkat yang sama. Saat notifikasi mutasi masuk terdeteksi, worker mengirim data ke Bayar Digital. Sistem backend mencocokkan mutasi tersebut dengan payment yang dibuat tenant.

Tanpa worker yang aktif dan online, payment tidak akan terdeteksi walaupun customer sudah membayar.

## Yang Perlu Tenant Lakukan

| Item | Keterangan |
| --- | --- |
| Perangkat khusus | Gunakan device khusus untuk worker, bukan device pribadi. |
| Akun pembayaran aktif | Payment account tenant harus aktif di sistem. |
| Koneksi internet stabil | Worker perlu mengirim data mutasi ke server. |
| Baterai & background access | Setel device agar worker tidak dihentikan oleh sistem. |
| Approval device | Device harus di-approve oleh operator setelah registrasi. |

## Install APK

[Download APK Worker v1.0](https://github.com/rioanandaputra-bot/bayar.digital-docs/releases/download/v1.0.0/bayar.digital-worker-android-v1.0.0-tenant.apk)

Setelah terpasang, buka aplikasi dan ikuti langkah berikut:

## Aktivasi

### 1. Masukkan API Key

Masukkan API Key tenant (`pk_...`) di layar login aplikasi. API Key disimpan di `EncryptedSharedPreferences` (AES-256 GCM).

### 2. Registrasi Device

Aplikasi akan:

1. Meminta **challenge** dari server (`GET /worker/tenant/devices/challenge`).
2. Membuat **RSA 2048-bit key pair** di Android Keystore.
3. Mengirim sertifikat attestasi ( jika device mendukung hardware-backed attestation) dan public key ke server.
4. Server menyimpan public key untuk verifikasi signature setiap request.

### 3. Approval

Device yang terdaftar dalam status **inactive** sampai di-approve operator Bayar Digital.

### 4. Grant Permission

Aplikasi membutuhkan 3 izin:

| Izin | Fungsi |
| --- | --- |
| **Notifikasi** (POST_NOTIFICATIONS) | Menampilkan notifikasi foreground service. |
| **Akses Notifikasi** (Notification Listener) | Membaca notifikasi dari aplikasi banking. |
| **Optimasi Baterai** (IGNORE_BATTERY_OPTIMIZATIONS) | Mencegah worker dihentikan saat background. |

### 5. Selesai

Setelah semua izin diberikan, worker mulai berjalan di foreground dan mendeteksi notifikasi mutasi.

## Cara Deteksi Mutasi

Worker tidak membaca SMS. Deteksi dilakukan melalui:

1. **Notification Listener Service** — menangkap setiap notifikasi yang muncul di perangkat.
2. **Verifikasi aplikasi** — mencocokkan `package_name` dan `signing_hash` (SHA-256 sertifikat APK) dengan konfigurasi server. Hanya aplikasi banking yang terdaftar yang diproses.
3. **Regex pattern** — body notifikasi dicocokkan dengan pola regex dari konfigurasi server.
4. **Deduplikasi** — notifikasi yang sama dalam 1,5 detik akan diabaikan.
5. **Pengiriman** — mutasi dikirim ke `POST /worker/tenant/mutations` dengan signature RSA.

## Request Mutation

```json
{
  "device_id": "uuid-v7",
  "package_name": "com.bca.mobile",
  "title": "BNI",
  "body": "Transfer dari Rekening 1234567890\nRp 500.000\nSaldo Rp 1.500.000",
  "posted_at": 1718000000000,
  "signing_hash": "sha256-signing-certificate",
  "app_name": "BCA Mobile",
  "app_version": "4.1.0",
  "client_mutation_id": "sha256-dedup-key"
}
```

## Jika Worker Bermasalah

Worker offline → payment tetap `PENDING` walau customer sudah bayar.

Tindakan:

1. Pastikan perangkat online dan tidak dalam mode hemat daya.
2. Cek apakah aplikasi worker berjalan (notifikasi foreground terlihat).
3. Cek apakah semua izin sudah diberikan (Notifikasi, Notification Listener, Battery).
4. Cek status payment via `GET /gateway/payments/{payment_code}`.
5. Hubungi operator jika mutasi sudah masuk tapi status belum berubah.

## Praktik Operasional

1. Gunakan perangkat khusus untuk worker (bukan device pribadi).
2. Monitor payment yang mendekati `expires_at` tetapi belum terbayar.
3. Gunakan webhook dan get payment untuk rekonsiliasi status order.
