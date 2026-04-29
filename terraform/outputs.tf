output "ec2_public_ip" {
  description = "EC2 のパブリック IP（SSH 接続・アクセス先）"
  value       = module.ec2.public_ip
}

output "app_url" {
  description = "アプリ URL（Nginx 経由、ブラウザでアクセス）"
  value       = "http://${module.ec2.public_ip}"
}

output "api_health_url" {
  description = "Spring Boot ヘルスチェック URL（動作確認用）"
  value       = "http://${module.ec2.public_ip}/actuator/health"
}

output "rds_endpoint" {
  description = "RDS エンドポイント（EC2 から接続する際のホスト:ポート）"
  value       = module.rds.db_endpoint
}

output "rds_host" {
  description = "RDS ホスト名（Spring Boot datasource url 用）"
  value       = module.rds.db_host
}

output "rds_connection_hint" {
  description = "EC2 から psql で接続するコマンド例"
  value       = "psql -h ${module.rds.db_host} -U postgres -d taskmanagement"
}
