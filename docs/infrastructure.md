# インフラ構成

TaskManagement の AWS インフラ構成を記載する。
インフラは Terraform で管理しており、構成コードは [terraform/](../terraform/) を参照。

---

## 構成図

```
インターネット
    │
    │ HTTP:80 / SSH:22（my_ip_cidr からのみ許可）
    ▼
┌─────────────────────────────────────────────────┐
│  VPC (10.0.0.0/16)  ap-northeast-1              │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │  パブリックサブネット (10.0.1.0/24)   │       │
│  │  ap-northeast-1a                     │       │
│  │                                      │       │
│  │  ┌────────────────────────────────┐  │       │
│  │  │  EC2 t2.micro                  │  │       │
│  │  │  ├── Nginx :80                 │  │       │
│  │  │  │    ├── /        → React SPA │  │       │
│  │  │  │    └── /api/*   → :8080     │  │       │
│  │  │  └── Spring Boot :8080（内部）  │  │       │
│  │  └────────────────────────────────┘  │       │
│  └──────────────────────────────────────┘       │
│                    │ ポート 5432                  │
│  ┌─────────────────┴────────────────────┐       │
│  │  プライベートサブネット               │       │
│  │  ap-northeast-1a (10.0.10.0/24)      │       │
│  │  ap-northeast-1c (10.0.11.0/24)      │       │
│  │                                      │       │
│  │  ┌────────────────────────────────┐  │       │
│  │  │  RDS PostgreSQL 16             │  │       │
│  │  │  db.t3.micro                   │  │       │
│  │  │  publicly_accessible = false   │  │       │
│  │  └────────────────────────────────┘  │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

---

## AWS リソース一覧

### ネットワーク

| リソース | 名前 | 概要 |
|----------|------|------|
| VPC | `{project}-vpc` | CIDR `10.0.0.0/16`、DNS ホスト名有効 |
| パブリックサブネット | `{project}-public-a` | `10.0.1.0/24`、ap-northeast-1a、EC2 配置 |
| プライベートサブネット | `{project}-private-a` | `10.0.10.0/24`、ap-northeast-1a、RDS 配置 |
| プライベートサブネット | `{project}-private-c` | `10.0.11.0/24`、ap-northeast-1c、RDS 配置（Multi-AZ 対応） |
| インターネットゲートウェイ | `{project}-igw` | VPC からインターネットへの出口 |
| ルートテーブル | `{project}-public-rt` | パブリックサブネット用、デフォルトルートを IGW に向ける |

### セキュリティグループ

| リソース | 名前 | インバウンドルール |
|----------|------|------------------|
| EC2 用 SG | `{project}-ec2-sg` | SSH(22)・HTTP(80) を `my_ip_cidr` からのみ許可 |
| RDS 用 SG | `{project}-rds-sg` | PostgreSQL(5432) を EC2 SG からのみ許可、CIDR 指定なし |

### コンピューティング

| リソース | スペック | 概要 |
|----------|---------|------|
| EC2 | t2.micro、Amazon Linux 2023 | Java 21・Nginx をプロビジョニング済み、Spring Boot を systemd で管理 |

**EC2 上のサービス構成：**

```
Nginx :80
  ├── /           → /var/www/taskmanagement/（React 静的ファイル）
  ├── /api/*      → http://localhost:8080（Spring Boot へプロキシ）
  └── /actuator/* → http://localhost:8080（ヘルスチェック）

Spring Boot :8080（外部非公開、Nginx 経由のみ）
  環境変数は /opt/taskmanagement/.env から読み込み
  systemd サービス名: taskmanagement
```

### データベース

| リソース | スペック | 概要 |
|----------|---------|------|
| RDS | PostgreSQL 16、db.t3.micro | プライベートサブネット配置、`publicly_accessible=false` |

---

## セキュリティ設計

- **EC2 へのアクセス**：SSH(22)・HTTP(80) ともに `my_ip_cidr`（作業者の IP）からのみ許可
- **RDS へのアクセス**：EC2 SG からの PostgreSQL(5432) のみ許可。CIDR ルールなし
- **Spring Boot の 8080 ポート**：セキュリティグループで外部公開せず、EC2 内の Nginx が localhost 経由でプロキシ
- **RDS のパブリックアクセス**：`publicly_accessible = false` + プライベートサブネット配置で二重に遮断

---

## Terraform ディレクトリ構成

```
terraform/
├── main.tf                   # ルートモジュール（全モジュールを組み合わせ）
├── variables.tf              # 入力変数定義
├── outputs.tf                # 出力値（EC2 IP・RDS エンドポイント等）
├── versions.tf               # Terraform・プロバイダーバージョン固定
├── terraform.tfvars.example  # 変数設定サンプル（git 管理対象）
├── terraform.tfvars          # 実際の設定値（.gitignore で除外）
└── modules/
    ├── vpc/                  # VPC・サブネット・IGW・ルートテーブル
    ├── security_groups/      # EC2 用・RDS 用セキュリティグループ
    ├── ec2/                  # EC2 インスタンス・user_data.sh
    └── rds/                  # RDS インスタンス・DB サブネットグループ
```

---

## インフラ操作コマンド

```bash
cd terraform

# 初期化（初回・モジュール追加時）
terraform init

# 変更内容の確認
terraform plan

# インフラ構築・更新
terraform apply

# 全リソース削除
terraform destroy

# フォーマット修正
terraform fmt -recursive

# 構成検証
terraform validate
```

---

## 環境変数（EC2 上の .env）

Spring Boot は EC2 内の `/opt/taskmanagement/.env` から以下の環境変数を読み込む。

| 変数名 | 概要 |
|--------|------|
| `DB_URL` | RDS の JDBC 接続 URL |
| `DB_USERNAME` | DB マスターユーザー名 |
| `DB_PASSWORD` | DB マスターパスワード |
| `JWT_SECRET` | JWT 署名鍵（256 bit 以上） |
| `JPA_DDL_AUTO` | Hibernate DDL モード（`update` 推奨） |
