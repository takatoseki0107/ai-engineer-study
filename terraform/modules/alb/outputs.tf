output "alb_dns_name" {
  description = "ALB の DNS 名（API エンドポイントとして使用）"
  value       = aws_lb.main.dns_name
}
