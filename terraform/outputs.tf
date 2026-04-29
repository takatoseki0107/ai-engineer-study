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
