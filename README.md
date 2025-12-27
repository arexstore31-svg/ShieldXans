# Roblox Script Obfuscator dengan Key System HWID

Platform lengkap untuk mengamankan script Roblox Anda dengan obfuscation yang kuat dan sistem key berbasis HWID dengan expiration.

## Fitur Utama

- **Obfuscation Script**: Mengaburkan kode Lua untuk melindungi dari reverse engineering
- **Key System HWID**: Mengikat key ke perangkat spesifik menggunakan Hardware ID
- **Expiration Management**: Atur masa berlaku untuk setiap key
- **Activation Limits**: Batasi jumlah aktivasi per key
- **User-Friendly Interface**: Dashboard yang mudah digunakan
- **Public Key Page**: Halaman publik untuk user mendapatkan key mereka

## Teknologi yang Digunakan

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Database**: PostgreSQL (Supabase)
- **Icons**: Lucide React

## Cara Menggunakan

### 1. Setup Awal

Database sudah dikonfigurasi dengan tabel:
- `scripts`: Menyimpan script original dan obfuscated
- `script_keys`: Menyimpan konfigurasi key dengan HWID dan expiration
- `key_activations`: Tracking aktivasi key

### 2. Membuat Script Terproteksi

1. Buka dashboard utama
2. Paste script Lua Anda di form "Obfuscate Script Baru"
3. Isi nama dan deskripsi (opsional)
4. Klik "Obfuscate Script"
5. Script akan otomatis di-obfuscate dan disimpan

### 3. Membuat Key System

1. Klik tombol Key (ikon kunci) pada script yang sudah dibuat
2. Klik "Buat Key Baru"
3. Konfigurasi key:
   - **HWID**: Kosongkan untuk auto-bind saat pertama kali digunakan
   - **Maksimal Aktivasi**: Jumlah perangkat yang bisa menggunakan key ini
   - **Masa Berlaku**: Berapa hari key akan valid
4. Klik "Generate Key"
5. Copy link "Get Key" untuk dibagikan ke user

### 4. User Mendapatkan Key

1. User mengakses link "Get Key" yang Anda bagikan
2. User akan melihat halaman dengan key yang sudah di-generate
3. User copy key tersebut

### 5. Menggunakan di Roblox

User menggunakan Roblox Loader Script yang tersedia di dashboard:

1. Copy script loader dari bagian "Roblox Loader Script"
2. Ganti placeholder:
   - `YOUR_SUPABASE_URL` dengan URL Supabase Anda
   - `YOUR_WEBSITE_URL` dengan URL website Anda
   - `YOUR_KEY_VALUE` dengan key value spesifik
3. Execute script di Roblox
4. UI key system akan muncul
5. User paste key yang didapat dari website
6. Klik Submit
7. Script terproteksi akan otomatis dijalankan setelah validasi berhasil

## Struktur Database

### Table: scripts
- `id`: UUID primary key
- `name`: Nama script
- `description`: Deskripsi script
- `original_script`: Script asli
- `obfuscated_script`: Script yang sudah di-obfuscate
- `created_at`, `updated_at`: Timestamp

### Table: script_keys
- `id`: UUID primary key
- `script_id`: Foreign key ke scripts
- `key_value`: Nilai key (format: XXXXX-XXXXX-XXXXX-XXXXX)
- `hwid`: Hardware ID yang terikat
- `expires_at`: Tanggal expiration
- `max_activations`: Maksimal jumlah aktivasi
- `current_activations`: Jumlah aktivasi saat ini
- `is_active`: Status aktif/nonaktif

### Table: key_activations
- `id`: UUID primary key
- `key_id`: Foreign key ke script_keys
- `hwid`: Hardware ID yang mengaktivasi
- `ip_address`: IP address aktivasi
- `activated_at`: Timestamp aktivasi
- `last_validated_at`: Timestamp validasi terakhir

## Edge Functions

### 1. obfuscate-script
Mengobfuscate script Lua dan menyimpannya ke database.

**Endpoint**: `/functions/v1/obfuscate-script`

**Method**: POST

**Body**:
```json
{
  "name": "Script Name",
  "description": "Description",
  "script": "-- Your Lua code here"
}
```

### 2. generate-key
Membuat key baru untuk script dengan konfigurasi HWID dan expiration.

**Endpoint**: `/functions/v1/generate-key`

**Method**: POST

**Body**:
```json
{
  "scriptId": "uuid",
  "hwid": "optional-hwid",
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxActivations": 1
}
```

### 3. validate-key
Memvalidasi key dengan HWID dan mengembalikan script jika valid.

**Endpoint**: `/functions/v1/validate-key`

**Method**: POST

**Body**:
```json
{
  "key": "XXXXX-XXXXX-XXXXX-XXXXX",
  "hwid": "user-hardware-id"
}
```

**Response** (jika valid):
```json
{
  "valid": true,
  "script": "obfuscated script code",
  "scriptName": "Script Name",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

## Keamanan

- **Row Level Security (RLS)** diaktifkan pada semua tabel
- Script di-obfuscate untuk mempersulit reverse engineering
- Key terikat ke HWID untuk mencegah sharing
- Expiration time untuk membatasi masa berlaku
- Tracking aktivasi untuk monitoring penggunaan
- Validasi server-side melalui Edge Functions

## Cara Kerja Obfuscation

1. **String Encoding**: Semua string di-encode dan disimpan dalam array
2. **Variable Renaming**: Variable di-rename dengan nama yang sulit dibaca
3. **Code Compression**: Menghapus whitespace dan comment yang tidak perlu
4. **Code Wrapping**: Membungkus kode dalam loader yang di-encode
5. **Dynamic Loading**: Menggunakan loadstring untuk eksekusi runtime

## Alur Key System

1. Admin membuat script dan generate key
2. Key disimpan di database dengan konfigurasi (HWID, expiration, max activations)
3. User mendapatkan key melalui website public
4. User menjalankan loader script di Roblox
5. Loader script mengirim key dan HWID ke server
6. Server memvalidasi:
   - Key valid dan aktif?
   - Belum expired?
   - HWID match atau belum terikat?
   - Limit aktivasi belum tercapai?
7. Jika valid, server mengembalikan obfuscated script
8. Script dijalankan di Roblox menggunakan loadstring
9. Aktivasi dicatat di database untuk tracking

## Troubleshooting

### Script tidak berjalan di Roblox
- Pastikan HttpService enabled di Roblox
- Pastikan executor mendukung loadstring
- Check console untuk error messages

### Key tidak valid
- Pastikan key di-copy dengan benar (tanpa spasi)
- Check expiration date di dashboard
- Pastikan key masih aktif (status: Aktif)

### HWID tidak match
- Key sudah terikat ke perangkat lain
- Generate key baru atau reset HWID binding di database

## Support & Updates

Sistem ini menggunakan Supabase untuk hosting dan database. Untuk update atau modifikasi:

1. Database migration: Gunakan tool `mcp__supabase__apply_migration`
2. Edge Functions: Deploy melalui tool `mcp__supabase__deploy_edge_function`
3. Frontend: Build menggunakan `npm run build`

## Catatan Penting

- Selalu backup database sebelum melakukan perubahan besar
- Monitor aktivasi key untuk mendeteksi penyalahgunaan
- Update obfuscation logic secara berkala untuk keamanan maksimal
- Jangan share Supabase service role key dengan user
- Gunakan HTTPS untuk semua komunikasi

---

Dibuat dengan React, Supabase, dan Tailwind CSS
