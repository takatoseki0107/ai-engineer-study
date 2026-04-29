# S3 + CloudFront でフロントエンド（React SPA）を配信する構成
#
# S3：オブジェクトストレージ。npm run build で生成した dist/ ファイルを置く場所。
# CloudFront：CDN（コンテンツデリバリーネットワーク）。
#   S3 の前段に配置してキャッシュ・HTTPS を提供する。
#   OAC（Origin Access Control）により、CloudFront 経由のアクセスのみ S3 に届く。

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${random_id.suffix.hex}"

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# バケット名の衝突を防ぐためのランダムサフィックス
resource "random_id" "suffix" {
  byte_length = 4
}

# パブリックアクセスを完全にブロック（CloudFront 経由のみ許可する）
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# OAC（Origin Access Control）：CloudFront が S3 にアクセスするための認証設定
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for ${var.project_name} frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront ディストリビューション
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.project_name} frontend"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # SPA（シングルページアプリ）のルーティング対応
  # React Router 等で /tasks などのパスに直接アクセスしたとき、
  # S3 が 403 を返してしまう問題を /index.html にリダイレクトして解決する
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # price_class：CloudFront のエッジロケーション（配信拠点）の範囲
  # PriceClass_200 はアジア・北米・ヨーロッパをカバーし、コストを抑えられる
  price_class = "PriceClass_200"

  viewer_certificate {
    cloudfront_default_certificate = true # 独自ドメインなしの場合はデフォルト証明書を使用
  }

  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}

# S3 バケットポリシー：CloudFront からのアクセスのみ許可
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
