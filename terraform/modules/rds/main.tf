# DB サブネットグループ
# RDS はサブネットグループ経由でサブネットを選択する。
# Multi-AZ 対応のため 2AZ のプライベートサブネットを指定する。
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS インスタンス（PostgreSQL 16）
# - publicly_accessible = false：VPC 外からの直接アクセスを禁止
# - multi_az = false：学習用のため Single-AZ（コスト削減）
# - skip_final_snapshot = true：学習用のため削除時のスナップショットをスキップ
resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = var.db_instance_class
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids
  publicly_accessible    = false

  multi_az            = false
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "${var.project_name}-db"
  }
}
