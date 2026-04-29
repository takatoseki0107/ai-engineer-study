# セキュリティグループ（Security Group）
# EC2 や RDS への通信を許可・拒否するファイアウォールルール。
# 「どこから・どのポートへの通信を許すか」を定義する。

# ALB 用 SG：インターネットからの HTTP を受け付ける
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB: allow HTTP from internet"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# EC2 用 SG：ALB からの 8080 と自分の IP からの SSH のみ許可
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "EC2: allow 8080 from ALB, SSH from my IP"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Spring Boot from ALB only"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
    description = "SSH from my IP only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound (for package install, Secrets Manager access, etc.)"
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# RDS 用 SG：EC2 からの PostgreSQL 接続のみ許可
# インターネットから RDS に直接接続することはできない
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS: allow 5432 from EC2 only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
    description     = "PostgreSQL from EC2 only"
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}
