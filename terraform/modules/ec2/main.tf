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

# EC2 インスタンス（t2.micro: AWS 無料枠対象）
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t2.micro"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  key_name               = var.key_pair_name

  # user_data：EC2 起動時に一度だけ実行されるシェルスクリプト
  # Java・Nginx のインストールと systemd サービスの設定を行う
  user_data = templatefile("${path.module}/user_data.sh", {
    project_name = var.project_name
    aws_region   = var.aws_region
  })

  tags = {
    Name = "${var.project_name}-server"
  }
}
