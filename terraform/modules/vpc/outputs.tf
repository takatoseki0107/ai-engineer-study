output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "EC2 を配置するパブリックサブネット ID"
  value       = aws_subnet.public_a.id
}
