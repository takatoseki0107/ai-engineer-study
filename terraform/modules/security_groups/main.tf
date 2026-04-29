# セキュリティグループ（Security Group）
# EC2 への通信を許可・拒否するファイアウォールルール。
# 「どこから・どのポートへの通信を許すか」を定義する。

# EC2 用 SG：自分の PC からの HTTP（80）と SSH（22）のみ許可
# ポート 8080（Spring Boot）は EC2 内の Nginx がローカルでプロキシするため、
# 外部に公開しない。
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "EC2: allow HTTP(80) and SSH(22) from my IP only"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
    description = "SSH from my IP only"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.my_ip_cidr]
    description = "HTTP (Nginx) from my IP only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound (for package install etc.)"
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# RDS 用 SG：EC2 セキュリティグループからの PostgreSQL（5432）のみ許可
# パブリックアクセスは一切許可しない
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS: allow PostgreSQL(5432) from EC2 SG only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
    description     = "PostgreSQL from EC2 only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}
