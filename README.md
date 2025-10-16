# Solusi dan Tantangan DevOps Internship - Ryan Hanif Dwihandoyo


## 1. Penjelasan Keputusan Desain & Teknologi

Setiap pilihan teknologi dibuat berdasarkan praktik terbaik industri untuk mencapai tujuan spesifik dari setiap tugas

* **CI/CD (GitHub Actions)**: Saya menggunakan GitHub Actions karena terintegrasi langsung dengan repositori. Pipeline `ci.yml` dirancang untuk menjalankan tes dasar pada aplikasi `vote` secara otomatis, memastikan kualitas kode sebelum digabung ke branch `main`

* **Containerization (Docker & Docker Compose)**:
* **Dockerfile**: Saya mengoptimalkan `Dockerfile` untuk layanan `vote` dengan menggunakan **multi-stage build**. Pendekatan ini secara signifikan mengurangi ukuran image akhir dengan memisahkan lingkungan *build* dari lingkungan *runtime*, yang merupakan sebuah praktik yang terbaik untuk keamanan dan efisiensi
* **Docker Compose**: Saya menyederhanakan file `docker-compose.yml` untuk fokus pada pengembangan lokal. Semua layanan ditempatkan dalam satu jaringan (`vote-net`) untuk mempermudah komunikasi, dan *volume* digunakan untuk persistensi dari data database

* **Infrastructure as Code (Terraform)**:
* Saya memilih **Terraform** karena merupakan standar industri untuk *provisioning* infrastruktur secara deklaratif
* Sebagai contoh, saya membuat **S3 Bucket** di region AWS Jakarta (`ap-southeast-3`). Pilihan ini strategis karena mempertimbangkan latensi yang lebih rendah untuk pengguna di Indonesia, di mana 99Group memiliki operasi yang signifikan

---

## 2. Cara Menjalankan Proyek Secara Lokal

Pastikan Anda sudah menginstall **Docker** dan **Docker Compose** di komputer Anda.

1. **Clone Repositori Ini**:
    ```bash
    git clone https://github.com/Rayen142/example-voting-app.git
    cd example-voting-app
    ```

2. **Jalankan Aplikasi**:
    Gunakan Docker Compose untuk membangun dan menjalankan semua container dengan satu perintah.
    ```bash
    docker-compose up --build
    ```

3. **Akses Aplikasi**:
    * Buka **Aplikasi Voting** di browser: `http://localhost:5000`
    * Lihat **Hasil Voting** di browser: `http://localhost:5001`

4. **Hentikan Aplikasi**:
    Tekan `Ctrl + C` di terminal, lalu jalankan perintah berikut untuk membersihkan container dan network.
    ```bash
    docker-compose down
    ```

---

## 3. Peningkatan yang Akan Dilakukan Jika Ada Waktu Lebih

* **Pipeline CI/CD Lanjutan**: Menambahkan langkah untuk *linting* (analisis kualitas kode), *security scanning* pada image Docker (misalnya dengan Trivy), dan menyimpan image ke *registry* seperti Docker Hub atau AWS ECR
* **Deployment Otomatis (CD)**: Membuat *workflow* terpisah untuk melakukan *deployment* otomatis ke lingkungan *staging* atau produksi (misalnya ke Kubernetes di AWS EKS) setelah tes CI berhasil
* **Implementasi Monitoring**: Menerapkan tumpukan monitoring (Prometheus, Grafana, Loki) secara nyata menggunakan Docker Compose agar bisa langsung diuji dan dilihat hasilnya
* **Manajemen Rahasia (Secrets)**: Menggunakan alat seperti HashiCorp Vault atau AWS Secrets Manager untuk mengelola kredensial database

**[Tonton Video Penjelasan di Google Drive](https://drive.google.com/file/d/1x33fz4TJ9i-fSgA2QyV70XDVj9yshVQU/view?usp=drivesdk)**
