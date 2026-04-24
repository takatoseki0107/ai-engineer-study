---
name: start-servers
description: バックエンド（Spring Boot :8080）とフロントエンド（Vite :5173）の開発サーバーを起動する。ポート競合が発生した場合は競合プロセスを停止してからデフォルトポートで起動する。
---

# 開発サーバー起動スキル

バックエンドとフロントエンドの両サーバーを起動する。
**必ずこの手順を順番に実行すること。別ポートでの起動は禁止。**

## ポート定義

| サーバー | ポート | 起動ディレクトリ | 起動コマンド |
|----------|--------|-----------------|-------------|
| バックエンド（Spring Boot） | 8080 | `backend/` | `./gradlew bootRun` |
| フロントエンド（Vite） | 5173 | `frontend/` | `npm run dev` |

## 実行手順

### Step 1: ポート競合チェック＆解放

```bash
# ポート8080の競合確認
lsof -ti:8080

# 競合プロセスが存在する場合は停止
lsof -ti:8080 | xargs kill

# ポート5173の競合確認
lsof -ti:5173

# 競合プロセスが存在する場合は停止
lsof -ti:5173 | xargs kill
```

**重要ルール:**
- 競合があった場合は必ず停止してからデフォルトポートで起動する
- 別ポート（例: 8081, 5174）での一時起動は禁止（Vite proxy 設定と不整合が生じる）

### Step 2: バックエンド起動

```bash
cd /Users/setakato/TaskManagement/backend
./gradlew bootRun
```

バックグラウンドで起動し、ポート 8080 が LISTEN 状態になるまで待機する:

```bash
lsof -ti:8080
```

### Step 3: フロントエンド起動

```bash
cd /Users/setakato/TaskManagement/frontend
npm run dev
```

バックグラウンドで起動し、ポート 5173 が LISTEN 状態になるまで待機する:

```bash
lsof -ti:5173
```

### Step 4: 疎通確認

```bash
# バックエンドAPIの確認
curl -s http://localhost:8080/api/tasks | head -c 200

# フロントエンドの確認
open http://localhost:5173
```

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| ポート競合 | `lsof -ti:<port> \| xargs kill` で解放してから再起動 |
| DB接続エラー | `docker compose up -d`（プロジェクトルートで実行）してからバックエンドを再起動 |
| Gradleビルド失敗 | `./gradlew clean build -x test` でキャッシュをクリアしてリビルド |
| npm依存関係エラー | `cd frontend && npm install` を実行してから再起動 |
