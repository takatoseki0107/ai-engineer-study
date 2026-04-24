# TaskManagement

タスクをカンバンボード形式で管理する Web アプリケーション。  
バックエンド（Spring Boot）とフロントエンド（React + Vite）で構成される。

---

## 技術スタック

### バックエンド

| 技術 | バージョン |
|------|-----------|
| Java (Eclipse Temurin) | 21.0.6 |
| Spring Boot | 3.5.0 |
| Gradle Wrapper | 8.14.4 |
| Spring Data JPA | Spring Boot 管理 |
| PostgreSQL ドライバ | Spring Boot 管理 |
| Lombok | Spring Boot 管理 |

### フロントエンド

| 技術 | バージョン |
|------|-----------|
| Node.js | 25.9.0 |
| npm | 11.12.1 |
| React | 19.2.5 |
| TypeScript | 6.0.3 |
| Vite | 8.0.10 |
| Tailwind CSS | 4.2.4 |
| Axios | 1.15.2 |

### インフラ

| 技術 | バージョン |
|------|-----------|
| PostgreSQL | 16.13 |
| Docker / Docker Compose | — |

---

## アーキテクチャ

```
ブラウザ (React + Vite :5173)
    │  /api/* → proxy
    ▼
バックエンド (Spring Boot :8080)
    │  JPA
    ▼
PostgreSQL (:5432)
```

- フロントエンドの `/api/*` リクエストは Vite の開発サーバーがバックエンドへプロキシする
- CORS 設定によりフロントエンドオリジン（`http://localhost:5173`）からのアクセスを許可

---

## ディレクトリ構成

```
TaskManagement/
├── backend/                  # Spring Boot アプリケーション
│   └── src/main/java/com/example/taskmanagement/
│       ├── config/           # CorsConfig
│       ├── controller/       # TaskController (GET /api/tasks)
│       ├── domain/           # Task エンティティ、Priority / Status 列挙
│       ├── dto/              # TaskResponse
│       ├── exception/        # GlobalExceptionHandler, TaskNotFoundException
│       ├── repository/       # TaskRepository (JPA)
│       └── service/          # TaskService
├── frontend/                 # React + Vite アプリケーション
│   └── src/
│       ├── api/              # taskApi.ts (Axios)
│       ├── components/       # Board, Column, TaskCard, FilterBar
│       └── types/            # task.ts
├── docker-compose.yml        # PostgreSQL 16
└── CLAUDE.md                 # Claude Code 作業ルール
```

---

## セットアップ

### 前提条件

- Java 21
- Node.js 20 以上
- Docker / Docker Compose

### 1. DB 起動

```bash
docker compose up -d
```

### 2. バックエンド起動

```bash
cd backend
./gradlew bootRun
```

`http://localhost:8080` で起動。

### 3. フロントエンド起動

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` で起動。

---

## API 仕様

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/tasks` | 全タスク取得 |
| GET | `/api/tasks/{id}` | ID 指定でタスク取得 |
| GET | `/api/tasks/status/{status}` | ステータス絞り込みでタスク取得 |

### ステータス値

| 値 | 意味 |
|----|------|
| `todo` | 未着手 |
| `in_progress` | 進行中 |
| `done` | 完了 |

### タスクレスポンス例

```json
{
  "id": 1,
  "title": "要件定義を完了する",
  "description": "プロジェクトの要件をドキュメントにまとめる",
  "priority": "high",
  "status": "done",
  "dueDate": "2026-04-01",
  "position": 1
}
```

---

## 開発コマンド

### バックエンド

```bash
cd backend
./gradlew build -x test   # ビルド
./gradlew test            # テスト（要 DB 起動）
./gradlew bootRun         # 開発サーバー起動
```

### フロントエンド

```bash
cd frontend
npm run dev     # 開発サーバー起動
npm run build   # プロダクションビルド
npm run lint    # Lint チェック
```

---

## ポート競合時の対処

```bash
lsof -ti:8080 | xargs kill   # バックエンドポートを解放
lsof -ti:5173 | xargs kill   # フロントエンドポートを解放
```

別ポートでの起動は Vite proxy 設定と不整合が生じるため禁止。
