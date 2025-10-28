# konfig untuk provider AWS
provider "aws" {
  region = "ap-southeast-1"
}

# S3 bucket untuk menyimpan Docker images or artefak
resource "aws_s3_bucket" "artifacts" {
  bucket = "99group-voting-app-artifacts-${random_id.suffix.hex}"
  
  tags = {
    Name        = "Voting App Artifacts"
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}

# mengaktifkan versi untuk bucket S3
resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# suffiks acak untuk menamai bucket yang unik
resource "random_id" "suffix" {
  byte_length = 4
}

# EC2 instance untuk meng-host Docker (opsional)
resource "aws_instance" "docker_host" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2
  instance_type = "t2.micro"
  
  # Security group allowing SSH and app ports
  vpc_security_group_ids = [aws_security_group.docker_host.id]
  
  # User data to install Docker
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              service docker start
              usermod -a -G docker ec2-user
              EOF
  
  tags = {
    Name        = "Docker Host for Voting App"
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}

# Grup security untuk Docker host
resource "aws_security_group" "docker_host" {
  name        = "docker-host-sg"
  description = "Security group for Docker host"
  
  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  # Vote app access
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Vote app port"
  }
  
  # Result app access
  ingress {
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Result app port"
  }
  
  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = {
    Name = "Docker Host Security Group"
  }
}

# Outputs
output "s3_bucket_name" {
  value       = aws_s3_bucket.artifacts.id
  description = "Name of the S3 bucket for artifacts"
}

output "docker_host_public_ip" {
  value       = aws_instance.docker_host.public_ip
  description = "Public IP of the Docker host"
}
