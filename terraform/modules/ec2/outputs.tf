output "instance_id" {
  description = "EC2 インスタンス ID"
  value       = aws_instance.main.id
}

output "public_ip" {
  description = "EC2 パブリック IP アドレス"
  value       = aws_instance.main.public_ip
}
