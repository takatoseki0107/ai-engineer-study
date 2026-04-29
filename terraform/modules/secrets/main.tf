# AWS Secrets Manager
# DB パスワードや JWT 鍵などのシークレット情報を安全に保管するサービス。
# EC2 は IAM ロール経由でここから動的に値を取得できるため、
# パスワードをファイルにハードコードする必要がなくなる。

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/db_credentials"
  description             = "TaskManagement RDS 接続情報"
  recovery_window_in_days = 0 # 学習用：即時削除を許可（本番では 7〜30 が推奨）
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    dbname   = "taskmanagement"
  })
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/jwt"
  description             = "TaskManagement JWT 署名鍵"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    JWT_SECRET = var.jwt_secret
  })
}
