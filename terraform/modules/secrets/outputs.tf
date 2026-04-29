output "db_credentials_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt.arn
}
