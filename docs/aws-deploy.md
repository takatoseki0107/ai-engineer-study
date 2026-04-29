# AWS デプロイ手順書

AWS + Terraform + AWS CLI を使って TaskManagement を本番環境にデプロイする手順です。
**AWS・Terraform 未経験者向けに解説を含めています。**

---

## 概念解説

### IaC（Infrastructure as Code）とは

インフラ（サーバー・DB・ネットワーク等）をコードで定義し、Git で管理できるようにする考え方です。
「AWS マネジメントコンソールで手動設定する」代わりに、コードを書いて `terraform apply` を実行するだけで
同じ環境が何度でも再現できます。

### Terraform とは

IaC を実現するツールです。HCL（HashiCorp Configuration Language）という記法で AWS リソースを定義します。

```
terraform init   → プラグインのダウンロード（初回のみ）
terraform plan   → 「今から何を作るか」を表示（実際には何も変わらない）
terraform apply  → 実際にリソースを作成・変更
terraform destroy → すべてのリソースを削除（後片付け）
```

### 今回のアーキテクチャ

```
Internet
  │
  ├──► ALB (HTTP:80) ──► EC2 t3.micro (Spring Boot:8080)
  │                              │
  └──► S3 + CloudFront (HTTPS)  RDS PostgreSQL db.t3.micro
  （React SPA 静的ファイル）      （プライベートサブネット内）

VPC 10.0.0.0/16
  ├── パブリックサブネット  10.0.1.0/24 (ap-northeast-1a) ← EC2, ALB
  ├── パブリックサブネット  10.0.2.0/24 (ap-northeast-1c) ← ALB 用（マルチAZ必須）
  ├── プライベートサブネット 10.0.10.0/24 (ap-northeast-1a) ← RDS
  └── プライベートサブネット 10.0.11.0/24 (ap-northeast-1c) ← RDS Subnet Group
```

### AWS 用語早見表

| 用語 | 説明 |
|------|------|
| VPC | AWS 内の独立したネットワーク空間 |
| サブネット | VPC を分割したネットワーク。パブリック（インターネット到達可）とプライベート（不可）がある |
| Security Group | EC2・RDS への通信を許可・拒否するファイアウォール |
| IGW（Internet Gateway） | VPC からインターネットへの出口 |
| ALB（Application Load Balancer） | トラフィックを EC2 に転送するロードバランサー |
| IAM Role | EC2 等に与える「権限セット」。Secrets Manager へのアクセスに使う |
| Secrets Manager | パスワード・API キーを安全に保管するサービス |
| RDS | AWS が管理するマネージド DB サービス |
| S3 | オブジェクトストレージ。静的ファイルを置く場所 |
| CloudFront | CDN。S3 の前段に配置してキャッシュ・HTTPS を提供 |

---

## Phase 0: 事前準備

### Step 1: AWS CLI のインストールと設定

```bash
# macOS
brew install awscli

# AWS コンソールで IAM ユーザーのアクセスキーを取得してから実行
# IAM → ユーザー → セキュリティ認証情報 → アクセスキー作成（CLI 用）
aws configure
# AWS Access Key ID: [取得したキー ID]
# AWS Secret Access Key: [取得したシークレットキー]
# Default region name: ap-northeast-1
# Default output format: json

# 設定が正しいか確認（自分のアカウント情報が表示されれば OK）
aws sts get-caller-identity
```

### Step 2: Terraform のインストール

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# バージョン確認（1.9.x 以上であれば OK）
terraform version
```

### Step 3: EC2 SSH キーペアの作成

```bash
# ローカルに SSH キーを生成
ssh-keygen -t ed25519 -f ~/.ssh/taskmanagement-prod -N ""

# AWS に公開鍵を登録
aws ec2 import-key-pair \
  --key-name "taskmanagement-prod" \
  --public-key-material fileb://~/.ssh/taskmanagement-prod.pub \
  --region ap-northeast-1

# 秘密鍵のパーミッション制限（SSH 接続時に必要）
chmod 600 ~/.ssh/taskmanagement-prod
```

---

## Phase 1: Terraform で AWS インフラを構築

### Step 1: 変数ファイルの作成

```bash
cd terraform/

# サンプルをコピー
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvars を編集して実際の値を設定
# ※ このファイルは .gitignore で Git 管理対象外です（パスワードが含まれるため）
```

`terraform.tfvars` に設定する値：

| 変数 | 説明 | 設定例 |
|------|------|--------|
| `db_password` | DB パスワード（強力な値を設定） | `MyStr0ngP@ssword!` |
| `jwt_secret` | JWT 署名鍵（256 ビット以上のランダム文字列） | `openssl rand -hex 32` で生成 |
| `ec2_key_pair_name` | Step 3 で登録したキーペア名 | `taskmanagement-prod` |
| `my_ip_cidr` | SSH を許可する自分の IP | `curl ifconfig.me` で確認して `/32` を付ける |

```bash
# JWT シークレットの生成例
openssl rand -hex 32
```

### Step 2: Terraform の実行

```bash
# プラグインをダウンロード（初回のみ）
terraform init

# 何が作られるか確認（実際には何も変わらない）
terraform plan

# インフラを作成（"yes" を入力して実行）
# RDS の作成に 5〜10 分かかります
terraform apply

# 作成されたリソースの情報を確認
terraform output
```

---

## Phase 2: バックエンド（Spring Boot）のデプロイ

```bash
# ローカルで JAR をビルド
cd backend/
./gradlew bootJar

# terraform output から各値を取得
cd ../terraform/
EC2_IP=$(terraform output -raw ec2_public_ip)
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
DB_PASS=$(terraform output -raw db_password)
DB_USER=$(terraform output -raw db_username)
JWT=$(terraform output -raw jwt_secret)

# JAR を EC2 に転送
scp -i ~/.ssh/taskmanagement-prod \
  ../backend/build/libs/taskmanagement-*.jar \
  ec2-user@${EC2_IP}:/opt/taskmanagement/app.jar

# EC2 上に環境変数ファイルを作成してサービスを起動
ssh -i ~/.ssh/taskmanagement-prod ec2-user@${EC2_IP} "
cat > /opt/taskmanagement/.env << 'ENVEOF'
DB_URL=jdbc:postgresql://${RDS_ENDPOINT}:5432/taskmanagement
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT}
JPA_DDL_AUTO=update
CORS_ALLOWED_ORIGIN=http://${ALB_DNS}
ENVEOF
sudo systemctl start taskmanagement
sudo systemctl status taskmanagement
"

# ヘルスチェック
curl http://${ALB_DNS}/actuator/health
# → {"status":"UP"} が返れば成功
```

---

## Phase 3: フロントエンド（React）のデプロイ

```bash
cd ../terraform/
ALB_DNS=$(terraform output -raw alb_dns_name)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
CF_URL=$(terraform output -raw cloudfront_url)

# ALB の URL を API エンドポイントとして本番ビルド
cd ../frontend/
VITE_API_BASE_URL=http://${ALB_DNS} npm run build

# ビルド結果を S3 にアップロード
aws s3 sync dist/ s3://${S3_BUCKET}/ --delete

# CloudFront のキャッシュを無効化（即時反映）
aws cloudfront create-invalidation \
  --distribution-id ${CF_ID} \
  --paths "/*"

echo "フロントエンドの URL: https://${CF_URL}"
```

---

## Phase 4: 動作確認

```bash
cd terraform/
ALB_DNS=$(terraform output -raw alb_dns_name)
CF_URL=$(terraform output -raw cloudfront_url)

# 1. バックエンドのヘルスチェック
curl http://${ALB_DNS}/actuator/health
# → {"status":"UP"}

# 2. ユーザー登録のテスト
curl -X POST http://${ALB_DNS}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 3. ブラウザでフロントエンドを開く
echo "https://${CF_URL}"
```

---

## バックエンドの更新手順

コードを修正した後の再デプロイ：

```bash
# 再ビルド
cd backend/
./gradlew bootJar

# EC2 に転送して再起動
cd ../terraform/
EC2_IP=$(terraform output -raw ec2_public_ip)
scp -i ~/.ssh/taskmanagement-prod \
  ../backend/build/libs/taskmanagement-*.jar \
  ec2-user@${EC2_IP}:/opt/taskmanagement/app.jar
ssh -i ~/.ssh/taskmanagement-prod ec2-user@${EC2_IP} "sudo systemctl restart taskmanagement"
```

## フロントエンドの更新手順

```bash
cd frontend/
cd ../terraform/
ALB_DNS=$(terraform output -raw alb_dns_name)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)

cd ../frontend/
VITE_API_BASE_URL=http://${ALB_DNS} npm run build
aws s3 sync dist/ s3://${S3_BUCKET}/ --delete
aws cloudfront create-invalidation --distribution-id ${CF_ID} --paths "/*"
```

---

## 後片付け（AWS リソースの全削除）

学習が終わったらリソースを削除して課金を止めます：

```bash
cd terraform/
terraform destroy
# "yes" を入力 → すべての AWS リソースが削除される
```

---

## トラブルシューティング

### Spring Boot が起動しない

```bash
# EC2 に SSH してログを確認
ssh -i ~/.ssh/taskmanagement-prod ec2-user@${EC2_IP}
sudo journalctl -u taskmanagement -f
```

### ALB ヘルスチェックが失敗する

1. EC2 のサービスが起動しているか確認: `sudo systemctl status taskmanagement`
2. 8080 ポートで起動しているか確認: `curl localhost:8080/actuator/health`
3. Security Group の 8080 ポートが ALB から許可されているか確認

### RDS に接続できない

1. EC2 から RDS エンドポイントへの接続テスト:
   ```bash
   # EC2 に SSH してから実行
   dnf install -y postgresql15
   psql -h ${RDS_ENDPOINT} -U taskuser -d taskmanagement
   ```
2. Security Group で EC2 SG からの 5432 が許可されているか確認
3. `.env` の `DB_URL` が正しいか確認

### フロントエンドで API エラーが出る

ブラウザの開発者ツール（Network タブ）で API リクエストの向き先を確認。
`VITE_API_BASE_URL` が正しく設定されてビルドされているかを確認する。
