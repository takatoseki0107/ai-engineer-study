#!/bin/bash
set -euo pipefail

LOG=/var/log/user-data-setup.log
exec > >(tee -a $LOG) 2>&1

echo "=== [1/3] Java 21 インストール ==="
dnf install -y java-21-amazon-corretto

echo "=== [2/3] Nginx インストール・設定 ==="
dnf install -y nginx

# Nginx の設定：フロントエンド静的配信 + Spring Boot へのリバースプロキシ
cat > /etc/nginx/conf.d/taskmanagement.conf << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name "";

    # React SPA の静的ファイルを配信
    root /var/www/taskmanagement;
    index index.html;

    # React SPA：未知のパスはすべて index.html にフォールバック
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Spring Boot API へのリバースプロキシ
    # EC2 内部の通信（localhost:8080）なので外部に 8080 を公開しなくてよい
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Spring Boot Actuator（ヘルスチェック）
    location /actuator/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINXEOF

# フロントエンド配信ディレクトリを作成（デプロイ前の仮ページ）
mkdir -p /var/www/taskmanagement
cat > /var/www/taskmanagement/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>TaskManagement</title></head>
<body>
<h1>TaskManagement サーバー起動中</h1>
<p>フロントエンドのビルドファイルをデプロイしてください。</p>
<p><a href="/actuator/health">バックエンド ヘルスチェック</a></p>
</body>
</html>
HTMLEOF

chown -R nginx:nginx /var/www/taskmanagement
systemctl enable nginx
systemctl start nginx

echo "=== [3/3] Spring Boot サービス設定 ==="
mkdir -p /opt/taskmanagement
chown ec2-user:ec2-user /opt/taskmanagement

# systemd サービスファイルを作成
# .env ファイルから環境変数を読み込んで Spring Boot を起動する
cat > /etc/systemd/system/taskmanagement.service << 'SVCEOF'
[Unit]
Description=TaskManagement Backend (Spring Boot)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/taskmanagement
EnvironmentFile=/opt/taskmanagement/.env
ExecStart=/usr/bin/java -jar /opt/taskmanagement/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable taskmanagement
# JAR がまだないため起動しない。JAR デプロイ後に手動で start する

echo "=== user_data setup complete ==="
