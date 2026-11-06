# BeratSehat

Panduan kebiasaan sehat untuk membantu pengguna dewasa memahami estimasi kalori, memilih program turun/naik berat badan, mencatat checklist, dan melihat tren berat badan. Hasil kalkulator bersifat edukatif, bukan diagnosis medis.

## Menjalankan aplikasi

```sh
npm ci
npm run dev
```

Untuk memeriksa TypeScript dan membuat build produksi:

```sh
npm run build
```

## Firebase

1. Buat project Firebase dan daftarkan aplikasi Web di **Project settings → Your apps**.
2. Di **Authentication → Sign-in method**, aktifkan **Anonymous** untuk sesi awal dan **Email/Password** agar pengguna dapat memakai akun yang sama di beberapa perangkat.
3. Buat database **Cloud Firestore** pada project yang sama.
4. Salin `.env.example` menjadi `.env.local`. Isi `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, dan `VITE_FIREBASE_APP_ID` dari konfigurasi aplikasi Web Firebase. `VITE_FIREBASE_STORAGE_BUCKET` dan `VITE_FIREBASE_MESSAGING_SENDER_ID` opsional untuk aplikasi ini. Jangan commit `.env.local`.
5. Terapkan aturan dari `firestore.rules` pada project milikmu: `firebase deploy --only firestore:rules --project <PROJECT_ID>`.
6. Jalankan ulang Vite setelah mengubah `.env.local`.

Profil, checklist, catatan berat, menu favorit, dan preferensi bahan/anggaran disimpan di `users/{uid}`. Dokumen lama yang belum memiliki `favorites` atau `preferences` dibaca dengan nilai default; penyimpanan berikutnya menulis skema lengkap. Aturan Firestore membatasi baca/tulis ke UID yang sedang terautentikasi serta memvalidasi profil dan batas ukuran preferensi. Program terpandu dan pilihan alternatif hari aktif tetap disimpan di `localStorage` browser. Lencana dan evaluasi mingguan dihitung dari riwayat checklist serta berat, sehingga tidak menyimpan salinan data terpisah. Aplikasi membuat sesi Firebase anonim sebagai sesi awal. Menautkan sesi itu ke akun email mempertahankan UID; masuk ke akun email yang sama di perangkat lain memakai UID yang sama dan menggabungkan checklist, berat, favorit, serta preferensi. Katalog Explore masih berasal dari data lokal di `src/data/contents.ts`, bukan koleksi Firestore.

Jika Firebase belum dikonfigurasi atau sementara tidak dapat dijangkau, profil, checklist, catatan berat, favorit, dan preferensi tetap dapat dipakai melalui fallback `localStorage` pada browser. Data lokal ditandai di Beranda dan tidak tersinkron ke perangkat lain sampai Firebase tersedia. Perubahan offline dicatat sebagai mutasi dan diputar ulang dalam transaksi Firestore ketika sinkronisasi berhasil. Untuk lintas perangkat, masuk dengan email yang sama; sesi anonim saja menghasilkan UID berbeda di tiap browser. Data anonim yang sudah ada dapat ditautkan saat membuat akun email dari perangkat tersebut.

Variabel opsional `VITE_WHATSAPP_NUMBER` dan `VITE_WHATSAPP_COMMUNITY_URL` mengaktifkan tautan bantuan/komunitas.
