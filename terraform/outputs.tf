output "alb_dns_name" {
  description = "ALB の DNS 名（バックエンド API エンドポイント）"
  value       = module.alb.alb_dns_name
}

output "cloudfront_url" {
  description = "CloudFront の URL（フロントエンドアクセス先）"
  value       = module.frontend.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューション ID（キャッシュ無効化に使用）"
  value       = module.frontend.cloudfront_distribution_id
}

output "s3_bucket_name" {
  description = "フロントエンド静的ファイルを置く S3 バケット名"
  value       = module.frontend.s3_bucket_name
}

output "ec2_public_ip" {
  description = "EC2 インスタンスのパブリック IP（JAR デプロイ・SSH 接続に使用）"
  value       = module.ec2.public_ip
}

output "rds_endpoint" {
  description = "RDS エンドポイント（DB_URL 環境変数に設定する）"
  value       = module.rds.endpoint
  sensitive   = true
}

output "db_username" {
  description = "DB ユーザー名"
  value       = var.db_username
  sensitive   = true
}

output "db_password" {
  description = "DB パスワード"
  value       = var.db_password
  sensitive   = true
}

output "jwt_secret" {
  description = "JWT 署名鍵"
  value       = var.jwt_secret
  sensitive   = true
}
