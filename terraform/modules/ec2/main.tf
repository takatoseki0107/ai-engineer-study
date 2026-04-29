# Amazon Linux 2023 の最新 AMI を動的に取得
# AMI ID はリージョンやアップデートで変わるため、ハードコードせず data source で取得する
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 に Secrets Manager 読み取り権限を付与する IAM ロール
# IAM ロール：EC2 がどの AWS サービスにアクセスできるかを定義する「権限セット」
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "secrets_manager_read" {
  name = "${var.project_name}-secrets-read"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 インスタンス
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  key_name               = var.key_pair_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  # user_data：EC2 起動時に一度だけ実行されるシェルスクリプト
  # Java のインストールと systemd サービスの設定を行う
  user_data = templatefile("${path.module}/user_data.sh", {
    project_name = var.project_name
    aws_region   = var.aws_region
  })

  tags = {
    Name = "${var.project_name}-server"
  }
}
