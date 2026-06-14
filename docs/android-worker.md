---
sidebar_position: 3
---

# Android Worker

Aplikasi Android yang dipasang di perangkat khusus milik Anda untuk **mendeteksi pembayaran masuk** secara otomatis. Tanpa Worker aktif, sistem tidak bisa mendeteksi transfer customer secara otomatis.

Setelah [Persiapan](./persiapan) selesai, langkah selanjutnya adalah setup Android Worker sebagai "mata" sistem untuk mendeteksi transfer masuk.

---

## Cara Kerja

Worker dipasang di HP khusus yang **juga terinstall aplikasi mobile banking** (BCA Mobile, Livin' Mandiri, dll).

Ketika ada notifikasi transfer masuk, Worker langsung:
1. Membaca notifikasi dari aplikasi bank
2. Mengekstrak nominal dan pengirim
3. Mengirim data ke server Bayar Digital
4. Sistem mencocokkan dengan invoice yang PENDING

---

## Persiapan

| Item | Keterangan |
|------|------------|
| Perangkat Android khusus | **Jangan pakai HP pribadi.** Sediakan device khusus yang selalu online |
| Koneksi internet stabil | Worker perlu kirim data ke server secara real-time |
| Aplikasi banking terpasang | Install aplikasi bank di perangkat yang **sama** |
| API Key | Siapkan API Key Merchant dari Dashboard |

Worker harus berjalan 24 jam. Gunakan perangkat yang selalu terhubung listrik dan internet.

---

## Instalasi

### 1. Download APK

Download APK Worker dari Dashboard Bayar Digital atau link berikut:

[Download Worker APK](https://bayar.digital/downloads/app-worker-latest.apk)

### 2. Install APK

Kirim file APK ke perangkat Android, lalu buka dan install.

### 3. Masukkan API Key

Buka aplikasi Worker, masukkan **API Key** (`pk_...`) yang didapat dari Dashboard.

### 4. Registrasi Perangkat

Setelah masukkan API Key, aplikasi akan otomatis mendaftarkan perangkat ke server. Status perangkat menjadi **PENDING**.

### 5. Approve Device di Dashboard

Login ke Dashboard Bayar Digital → menu **Pairing Device** → klik **Setujui** pada perangkat yang baru mendaftar.

### 6. Berikan Izin

Aplikasi akan meminta 3 izin. Semua **wajib** diberikan agar Worker berfungsi:

| Izin | Cara Memberikan |
|------|-----------------|
| **Notifikasi** | Pop-up akan muncul → tap **Izinkan** |
| **Akses Notifikasi** | Masuk ke *Settings → Notification Access* → aktifkan **bayar.digital Worker** |
| **Optimasi Baterai** | Pop-up akan muncul → tap **Izinkan** / **Nonaktifkan** |

### 7. Selesai

Worker mulai berjalan. Status di Dashboard berubah menjadi **Aktif**. Aplikasi akan menampilkan notifikasi *"Listening for bank notifications"* sebagai tanda sedang berjalan.

---

## Troubleshooting

### Payment tetap PENDING padahal customer sudah transfer

| Kemungkinan | Solusi |
|-------------|--------|
| HP mati / offline | Cek koneksi internet perangkat |
| Baterai hemat daya aktif | Nonaktifkan optimasi baterai di settings |
| Izin akses notifikasi hilang | Cek Settings → Notification Access |
| Worker tidak terlihat | Cek notifikasi foreground "Listening for bank notifications" |
| Aplikasi bank tidak terinstall | Install aplikasi bank di device yang **sama** |

### Cara Verifikasi

1. Cek status device di Dashboard → **Pairing Device** → pastikan **Aktif**
2. Cek status payment via API: `GET /gateway/payments/{payment_code}`
3. Cek apakah mutasi masuk: `GET /gateway/mutations?only_unmatched=true`

Jika masalah berlanjut, hubungi tim support Bayar Digital.

