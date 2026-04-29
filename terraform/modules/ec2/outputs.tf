output "instance_id" {
  value = aws_instance.main.id
}

output "public_ip" {
  description = "EC2 パブリック IP（JAR デプロイ・SSH 接続用）"
  value       = aws_instance.main.public_ip
}
