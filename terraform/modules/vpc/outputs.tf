output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "EC2 を配置するパブリックサブネット ID"
  value       = aws_subnet.public_a.id
}

output "private_subnet_ids" {
  description = "RDS を配置するプライベートサブネット ID 一覧（2AZ）"
  value       = [aws_subnet.private_a.id, aws_subnet.private_c.id]
}
