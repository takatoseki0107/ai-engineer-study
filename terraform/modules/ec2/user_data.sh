#!/bin/bash
set -euo pipefail

# Amazon Linux 2023 に Java 21 をインストール
dnf install -y java-21-amazon-corretto

# アプリケーションディレクトリを作成
mkdir -p /opt/taskmanagement

# ec2-user がアプリディレクトリを所有できるようにする
chown ec2-user:ec2-user /opt/taskmanagement

# systemd サービスファイルを作成
# systemd：Linux のサービス管理ツール。自動起動・クラッシュ時の自動再起動などを担う
cat > /etc/systemd/system/taskmanagement.service << 'EOF'
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
EOF

# サービスを有効化（次回起動時に自動スタートするように）
# ※ JAR ファイルがまだないため、この時点では start しない
systemctl daemon-reload
systemctl enable taskmanagement

echo "user_data setup complete"
