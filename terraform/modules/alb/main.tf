# ALB（Application Load Balancer）
# 受信トラフィックを EC2 に転送するロードバランサー。
# HTTPS 終端（SSL 証明書の管理）も担えるが、今回は HTTP のみの構成。

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false # インターネット向け（external）
  load_balancer_type = "application"
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids # ALB はマルチ AZ 必須

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# ターゲットグループ：ALB がリクエストを転送する先の定義
resource "aws_lb_target_group" "backend" {
  name     = "${var.project_name}-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  # ヘルスチェック：EC2 が正常に動いているかを定期確認
  # /actuator/health は Spring Boot Actuator が提供するエンドポイント
  health_check {
    enabled             = true
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg"
  }
}

# リスナー：ALB がポート 80 (HTTP) で受け付けた通信をターゲットグループに転送
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# EC2 インスタンスをターゲットグループに登録
resource "aws_lb_target_group_attachment" "ec2" {
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = var.ec2_instance_id
  port             = 8080
}
