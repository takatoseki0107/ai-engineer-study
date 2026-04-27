# API 仕様書

## 概要

| 項目 | 値 |
|------|-----|
| ベース URL | `http://localhost:8080` |
| フロントエンドからのアクセス | `/api/*`（Vite proxy 経由） |
| データ形式 | JSON（`Content-Type: application/json`） |
| 文字コード | UTF-8 |

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/tasks` | 全タスク取得 |
| GET | `/api/tasks/{id}` | タスク1件取得 |
| GET | `/api/tasks/status/{status}` | ステータス絞り込み取得 |
| POST | `/api/tasks` | タスク新規登録 |
| PUT | `/api/tasks/{id}` | タスク全項目更新 |
| PATCH | `/api/tasks/{id}/status` | ステータス変更 |
| PATCH | `/api/tasks/{id}/position` | 並び順変更 |
| DELETE | `/api/tasks/{id}` | タスク削除 |

---

## 共通仕様

### 共通レスポンスヘッダー

```
Content-Type: application/json
```

### エラーレスポンス形式

すべてのエラーレスポンスは以下の JSON 形式で返す。

```json
{
  "error": "エラーメッセージ"
}
```

### 共通エラー

| ステータス | 発生条件 |
|-----------|---------|
| 400 Bad Request | リクエストボディのバリデーション違反、不正な列挙値 |
| 404 Not Found | 指定した ID のタスクが存在しない |

---

## タスクオブジェクト

API レスポンスで返されるタスクの共通フォーマット。

```json
{
  "id": 1,
  "title": "要件定義を完了する",
  "description": "プロジェクトの要件をドキュメントにまとめる",
  "priority": "high",
  "status": "done",
  "dueDate": "2026-04-01",
  "position": 1,
  "createdAt": "2026-04-23T18:11:38.348849",
  "updatedAt": "2026-04-23T18:11:38.348849"
}
```

### フィールド定義

| フィールド | 型 | NULL | 説明 |
|-----------|-----|------|------|
| `id` | number | 不可 | タスク識別子 |
| `title` | string | 不可 | タスクタイトル（最大 255 文字） |
| `description` | string \| null | 可 | 詳細説明 |
| `priority` | string \| null | 可 | 優先度。値は[優先度値](#優先度値)参照 |
| `status` | string | 不可 | ステータス。値は[ステータス値](#ステータス値)参照 |
| `dueDate` | string \| null | 可 | 期日（`YYYY-MM-DD` 形式） |
| `position` | number | 不可 | カラム内の表示順（1 始まり） |
| `createdAt` | string | 不可 | 作成日時（ISO 8601） |
| `updatedAt` | string | 不可 | 最終更新日時（ISO 8601） |

### ステータス値

| 値 | 意味 | カラム表示名 |
|----|------|------------|
| `todo` | 未着手 | Todo |
| `in_progress` | 進行中 | 進行中 |
| `done` | 完了 | 完了 |

### 優先度値

| 値 | 意味 | バッジ色 |
|----|------|---------|
| `high` | 高 | 赤 |
| `medium` | 中 | 黄 |
| `low` | 低 | 緑 |

---

## エンドポイント詳細

---

### GET /api/tasks

全タスクを `position` 昇順で返す。

#### リクエスト

パラメータなし。

#### レスポンス

**200 OK**

```json
[
  {
    "id": 1,
    "title": "要件定義を完了する",
    "description": "プロジェクトの要件をドキュメントにまとめる",
    "priority": "high",
    "status": "done",
    "dueDate": "2026-04-01",
    "position": 1,
    "createdAt": "2026-04-23T18:11:38.348849",
    "updatedAt": "2026-04-23T18:11:38.348849"
  },
  {
    "id": 2,
    "title": "バックエンドAPIを実装する",
    "description": null,
    "priority": "high",
    "status": "in_progress",
    "dueDate": "2026-04-30",
    "position": 2,
    "createdAt": "2026-04-23T18:11:38.348849",
    "updatedAt": "2026-04-23T18:11:38.348849"
  }
]
```

タスクが0件の場合は空配列 `[]` を返す。

---

### GET /api/tasks/{id}

指定した ID のタスクを1件返す。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | number | タスク ID |

#### レスポンス

**200 OK** — タスクオブジェクト

```json
{
  "id": 1,
  "title": "要件定義を完了する",
  "description": "プロジェクトの要件をドキュメントにまとめる",
  "priority": "high",
  "status": "done",
  "dueDate": "2026-04-01",
  "position": 1,
  "createdAt": "2026-04-23T18:11:38.348849",
  "updatedAt": "2026-04-23T18:11:38.348849"
}
```

**404 Not Found**

```json
{ "error": "Task not found with id: 999" }
```

---

### GET /api/tasks/status/{status}

指定したステータスのタスクを `position` 昇順で返す。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `status` | string | ステータス値（`todo` / `in_progress` / `done`） |

#### レスポンス

**200 OK** — タスクオブジェクトの配列（タスクが0件の場合は空配列）

**400 Bad Request** — 不正なステータス値を指定した場合

```json
{ "error": "無効なステータスです: invalid_status" }
```

---

### POST /api/tasks

タスクを新規登録する。

#### リクエストボディ

```json
{
  "title": "フロントエンドを実装する",
  "description": "React + Vite でカンバンボードを構築する",
  "priority": "medium",
  "dueDate": "2026-05-15"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `title` | string | 必須 | 空文字不可・255文字以内 |
| `description` | string \| null | 任意 | — |
| `priority` | string \| null | 任意 | `high` / `medium` / `low` のいずれか |
| `dueDate` | string \| null | 任意 | `YYYY-MM-DD` 形式 |

- `priority` を省略または `null` で送信した場合は未設定として登録する
- `dueDate` を省略または `null` で送信した場合は期日なしとして登録する
- 新規タスクのステータスは必ず `todo` になる
- `position` は既存タスクの最大 position + 1 を自動採番する（タスクが0件の場合は 1）

#### レスポンス

**201 Created**

```
Location: /api/tasks/{id}
```

```json
{
  "id": 6,
  "title": "フロントエンドを実装する",
  "description": "React + Vite でカンバンボードを構築する",
  "priority": "medium",
  "status": "todo",
  "dueDate": "2026-05-15",
  "position": 6,
  "createdAt": "2026-04-27T10:00:00.000000",
  "updatedAt": "2026-04-27T10:00:00.000000"
}
```

**400 Bad Request** — バリデーション違反

```json
{ "error": "タイトルは必須です" }
```

```json
{ "error": "タイトルは255文字以内で入力してください" }
```

```json
{ "error": "無効な優先度です: invalid" }
```

---

### PUT /api/tasks/{id}

指定した ID のタスクの内容（タイトル・説明・優先度・期日）を更新する。

> ステータス・並び順の変更には専用の PATCH エンドポイントを使用すること。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | number | タスク ID |

#### リクエストボディ

```json
{
  "title": "フロントエンドの実装を完了する",
  "description": "カンバンボードと編集モーダルを実装した",
  "priority": "high",
  "dueDate": "2026-05-10"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `title` | string | 必須 | 空文字不可・255文字以内 |
| `description` | string \| null | 必須 | `null` で説明をクリアする |
| `priority` | string \| null | 必須 | `null` で優先度をクリアする |
| `dueDate` | string \| null | 必須 | `null` で期日をクリアする |

#### レスポンス

**200 OK** — 更新後のタスクオブジェクト

**400 Bad Request** — バリデーション違反（POST と同じ形式）

**404 Not Found** — 指定 ID のタスクが存在しない

---

### PATCH /api/tasks/{id}/status

指定した ID のタスクのステータスを変更する。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | number | タスク ID |

#### リクエストボディ

```json
{
  "status": "in_progress"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `status` | string | 必須 | `todo` / `in_progress` / `done` のいずれか |

#### レスポンス

**200 OK** — 更新後のタスクオブジェクト

**400 Bad Request**

```json
{ "error": "ステータスは必須です" }
```

```json
{ "error": "無効なステータスです: invalid" }
```

**404 Not Found** — 指定 ID のタスクが存在しない

---

### PATCH /api/tasks/{id}/position

指定した ID のタスクの並び順を変更する。

> ドラッグ&ドロップ操作時にフロントエンドから呼び出される。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | number | タスク ID |

#### リクエストボディ

```json
{
  "position": 2
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| `position` | number | 必須 | 1 以上の整数 |

#### レスポンス

**200 OK** — 更新後のタスクオブジェクト

**400 Bad Request**

```json
{ "error": "ポジションは1以上である必要があります" }
```

**404 Not Found** — 指定 ID のタスクが存在しない

---

### DELETE /api/tasks/{id}

指定した ID のタスクを物理削除する。

#### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `id` | number | タスク ID |

#### レスポンス

**204 No Content** — 削除成功（レスポンスボディなし）

**404 Not Found**

```json
{ "error": "Task not found with id: 999" }
```

---

## フロントエンドの API 呼び出し対応表

| フロントエンド操作 | 呼び出す API |
|-----------------|------------|
| 画面初期表示・フィルター変更 | `GET /api/tasks` または `GET /api/tasks/status/{status}` |
| タスク新規登録 | `POST /api/tasks` |
| タスク編集モーダル「保存」 | `PUT /api/tasks/{id}` |
| カード間カラム移動（DnD） | `PATCH /api/tasks/{id}/status` → `PATCH /api/tasks/{id}/position` |
| 同カラム内並び替え（DnD） | `PATCH /api/tasks/{id}/position` のみ |
| ゴミ箱ボタンで削除 | `DELETE /api/tasks/{id}` |
