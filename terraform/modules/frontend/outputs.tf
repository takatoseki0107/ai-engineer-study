output "cloudfront_url" {
  description = "CloudFront ドメイン名（フロントエンドアクセス先）"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューション ID（キャッシュ無効化に使用）"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_bucket_name" {
  description = "フロントエンド静的ファイルを置く S3 バケット名"
  value       = aws_s3_bucket.frontend.bucket
}
