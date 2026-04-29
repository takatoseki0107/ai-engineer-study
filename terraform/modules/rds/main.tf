# RDS（Relational Database Service）
# AWS が管理するマネージド DB サービス。
# バックアップ・パッチ適用・フェイルオーバーが自動化される。
# プライベートサブネットに配置し、インターネットから直接アクセスできないようにする。

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_parameter_group" "postgres16" {
  name   = "${var.project_name}-postgres16"
  family = "postgres16"

  parameter {
    name  = "timezone"
    value = "Asia/Tokyo"
  }

  tags = {
    Name = "${var.project_name}-postgres16"
  }
}

resource "aws_db_instance" "main" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "taskmanagement"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids
  parameter_group_name   = aws_db_parameter_group.postgres16.name

  publicly_accessible     = false # インターネットから直接接続不可
  multi_az                = false # コスト削減（本番では true を推奨）
  skip_final_snapshot     = true  # 学習用：削除時のスナップショット不要
  backup_retention_period = 1

  tags = {
    Name = "${var.project_name}-db"
  }
}
