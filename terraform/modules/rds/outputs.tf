output "endpoint" {
  description = "RDS エンドポイント（ポート番号なし）"
  value       = aws_db_instance.main.address
  sensitive   = true
}
