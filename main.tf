# --- Konfigurasi Provider AWS ---
# Memberitahu Terraform bahwa kita akan menggunakan provider AWS
# untuk membuat resource di cloud Amazon
# Region bisa diubah sesuai kebutuhan, saya menggunakan jakarta 
provider "aws" {
  region = "ap-southeast-3" # Contoh: region Asia Pasific (Jakarta)
}

# --- Definisi Resource: S3 Bucket ---
# Blok ini adalah "resep" yang dimana untuk membuat satu resource,
# dalam hal ini sebuah S3 bucket (tempat penyimpanan file).
resource "aws_s3_bucket" "app_bucket" {
  bucket = "99group-challenge-bucket-ryan-54321"

  # 'tags' adalah label untuk mengorganisir dan mengidentifikasi resource
  tags = {
    Name        = "DevOps Challenge Bucket"
    Environment = "Development"
    Owner       = "Ryan"
  }
}

# --- Output: Menampilkan Nama Bucket ---
# Blok ini digunakan untuk menampilkan nilai tertentu (seperti nama bucket)
# setelah Terraform berhasil membuat resource, akan sangat berguna untuk verifikasi
output "bucket_name" {
  value       = aws_s3_bucket.app_bucket.bucket
  description = "The name of the S3 bucket created."
}