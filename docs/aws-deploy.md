# AWS デプロイ手順書（Step 1: EC2 単体構成）

AWS + Terraform を使って TaskManagement を EC2 にデプロイする手順です。
段階的に進めるため、まずは EC2 1台でバックエンド・フロントエンド両方を動かします。

---

## アーキテクチャ

```
あなたのPC（my_ip_cidr で制限）
  │
  │ HTTP:80（Nginx）/ SSH:22
  ▼
EC2 t2.micro（パブリックIP）
  ├── Nginx :80
  │     ├── /         → React 静的ファイル（/var/www/taskmanagement）
  │     ├── /api/*    → localhost:8080 にプロキシ
  │     └── /actuator/* → localhost:8080 にプロキシ
  └── Spring Boot :8080（EC2 内部のみ、外部非公開）
```

**セキュリティ方針**: SSH・HTTP ともに `my_ip_cidr`（自分のPCのIP）からのみ許可。
Spring Boot の 8080 ポートは外部に公開せず、Nginx 経由でのみアクセス可能。

---

## 使用する AWS サービスと無料枠

| サービス | スペック | 無料枠 |
|---|---|---|
| EC2 | t2.micro | 12ヶ月・月750時間無料 |
| VPC / セキュリティグループ / IGW | — | 永続無料 |

---

## Phase 0: 事前準備

### 0-1. AWS CLI のインストールと設定

```bash
# macOS
brew install awscli

# 設定（アクセスキーは AWS コンソール > IAM > セキュリティ認証情報で発行）
aws configure
# AWS Access Key ID: <アクセスキーID>
# AWS Secret Access Key: <シークレットアクセスキー>
# Default region name: ap-northeast-1
# Default output format: json
```

### 0-2. Terraform のインストール

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# バージョン確認
terraform version  # >= 1.9.0 であること
```

### 0-3. SSH キーペアの作成・AWS への登録

```bash
# ローカルで SSH キーを生成
ssh-keygen -t ed25519 -f ~/.ssh/taskmanagement-key -N ""

# AWS に公開鍵を登録
aws ec2 import-key-pair \
  --key-name "taskmanagement-key" \
  --public-key-material fileb://~/.ssh/taskmanagement-key.pub \
  --region ap-northeast-1

# 登録確認
aws ec2 describe-key-pairs --key-names taskmanagement-key --region ap-northeast-1
```

---

## Phase 1: Terraform でインフラ構築

### 1-1. terraform.tfvars の設定

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

[terraform/terraform.tfvars](../terraform/terraform.tfvars) を編集：

```hcl
aws_region        = "ap-northeast-1"
project_name      = "taskmanagement"
ec2_key_pair_name = "taskmanagement-key"

# 自分のグローバル IP を確認してから設定
# curl ifconfig.me
my_ip_cidr = "xxx.xxx.xxx.xxx/32"
```

### 1-2. Terraform の初期化と適用

```bash
cd terraform

# プロバイダーのダウンロード（初回のみ）
terraform init

# 作成されるリソースの確認（実際には何も変更しない）
terraform plan

# インフラ構築（yes と入力して確定）
terraform apply
```

完了すると以下が出力されます：

```
Outputs:
  ec2_public_ip    = "xxx.xxx.xxx.xxx"
  app_url          = "http://xxx.xxx.xxx.xxx"
  api_health_url   = "http://xxx.xxx.xxx.xxx/actuator/health"
```

### 1-3. EC2 の起動完了を確認

EC2 起動直後は User Data（初期セットアップスクリプト）が実行中です。
SSH で接続してログを確認します：

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

# SSH 接続（User Data 完了まで 2〜3 分かかる場合があります）
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP

# EC2 内でセットアップログを確認
sudo cat /var/log/user-data-setup.log
# 末尾に "=== user_data setup complete ===" が出ていれば成功
```

### 1-4. Nginx の動作確認

```bash
# Nginx が起動していることを確認
curl http://$EC2_IP/
# "TaskManagement サーバー起動中" というページが返ってくればOK

# SSH 内でサービス状態確認
sudo systemctl status nginx
```

---

## Phase 2: バックエンド（Spring Boot）のデプロイ

### 2-1. JAR ファイルをビルド

```bash
cd backend
./gradlew bootJar -x test

# ビルド結果を確認
ls build/libs/*.jar
```

### 2-2. EC2 に JAR を転送

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

scp -i ~/.ssh/taskmanagement-key \
  backend/build/libs/taskmanagement-*.jar \
  ec2-user@$EC2_IP:/opt/taskmanagement/app.jar
```

### 2-3. 環境変数ファイル（.env）を作成

Spring Boot はこのファイルから設定を読み込みます。
EC2 に SSH した上で作成してください：

```bash
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP

# EC2 内で実行
cat > /opt/taskmanagement/.env << 'EOF'
# データベース設定（Step 1 では EC2 内 H2 などを使う場合はURLを調整）
DB_URL=jdbc:postgresql://localhost:5432/taskmanagement
DB_USERNAME=taskuser
DB_PASSWORD=<強力なパスワード>

# JWT 署名鍵（openssl rand -hex 32 で生成）
JWT_SECRET=<256ビット以上のランダム文字列>

# Spring Boot 設定
JPA_DDL_AUTO=update
CORS_ALLOWED_ORIGIN=http://<EC2_IP>
EOF

chmod 600 /opt/taskmanagement/.env
```

### 2-4. Spring Boot を起動

```bash
# EC2 内で実行
sudo systemctl start taskmanagement
sudo systemctl status taskmanagement
```

### 2-5. バックエンドの動作確認

```bash
# Nginx 経由でアクセス（推奨）
curl http://$EC2_IP/actuator/health
# {"status":"UP"} が返れば成功
```

---

## Phase 3: フロントエンドのデプロイ

### 3-1. React をビルド

フロントエンドとバックエンドは同じ EC2・同じ Origin（`http://<EC2_IP>`）で動くため、
`VITE_API_BASE_URL` の設定は不要です。Nginx が `/api/*` を Spring Boot にプロキシします。

```bash
cd frontend
npm install
npm run build
# dist/ にビルド済みファイルが生成される
```

### 3-2. ビルドファイルを EC2 に転送

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

scp -i ~/.ssh/taskmanagement-key \
  -r frontend/dist/* \
  ec2-user@$EC2_IP:/var/www/taskmanagement/
```

### 3-3. 動作確認

ブラウザで `http://<EC2_IP>` にアクセスしてアプリが表示されることを確認します。

---

## 更新デプロイ手順

### バックエンドを更新する場合

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

# JAR を再ビルド・転送
cd backend && ./gradlew bootJar -x test
scp -i ~/.ssh/taskmanagement-key \
  build/libs/taskmanagement-*.jar \
  ec2-user@$EC2_IP:/opt/taskmanagement/app.jar

# サービスを再起動
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP \
  "sudo systemctl restart taskmanagement"
```

### フロントエンドを更新する場合

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

cd frontend && npm run build
scp -i ~/.ssh/taskmanagement-key \
  -r dist/* \
  ec2-user@$EC2_IP:/var/www/taskmanagement/
# Nginx の再起動は不要（静的ファイルを置き換えるだけで即反映）
```

---

## 注意事項

### EC2 の IP アドレスについて

EC2 を**停止→起動**するとパブリック IP が変わります。

```bash
# 再起動後の IP を確認
cd terraform && terraform output ec2_public_ip
```

IP が変わったら `.env` の `CORS_ALLOWED_ORIGIN` と、
フロントを別ホストで動かす場合は `VITE_API_BASE_URL` も更新してください。

### EC2 の停止・削除

```bash
# EC2 を一時停止（課金が止まる。IP は変わる）
aws ec2 stop-instances --instance-ids <インスタンスID>

# インフラをすべて削除（学習終了時）
cd terraform && terraform destroy
```

---

## トラブルシューティング

### User Data のログを確認する

```bash
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP
sudo cat /var/log/user-data-setup.log
```

### Spring Boot のログを確認する

```bash
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP
journalctl -u taskmanagement -f        # リアルタイムで見る
journalctl -u taskmanagement --no-pager -n 50  # 直近50行
```

### Nginx のログを確認する

```bash
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP
sudo journalctl -u nginx -f
sudo cat /var/log/nginx/error.log
```

### Nginx の設定を再読み込みする

```bash
ssh -i ~/.ssh/taskmanagement-key ec2-user@$EC2_IP
sudo nginx -t                        # 設定ファイルの構文チェック
sudo systemctl reload nginx          # 設定を再読み込み（サービスは止めない）
```
