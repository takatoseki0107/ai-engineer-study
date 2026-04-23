# CLAUDE.md — TaskManagement プロジェクト作業ルール

このファイルは Claude Code がこのリポジトリで作業する際に必ず従うルールを定義します。

---

## 絶対ルール（例外なし）

### 1. 作業開始前に必ず GitHub Issue を作成する

いかなる作業（機能追加・バグ修正・リファクタリング・ドキュメント更新）も、
GitHub Issue を作成してから着手する。Issue なしでコードを書いてはならない。

```bash
gh issue create --title "タイトル" --body "概要" --label "feature"
```

Issue 番号を必ず控える。以降のブランチ名・コミット・PR すべてに使用する。

### 2. ブランチ命名規則

必ず `main` から派生させ、以下の形式で命名する:

| 種別 | 形式 | 例 |
|------|------|----|
| 機能追加 | `feat/issue-{番号}-{概要}` | `feat/issue-12-add-task-api` |
| バグ修正 | `fix/issue-{番号}-{概要}` | `fix/issue-34-fix-login-error` |
| ドキュメント | `docs/issue-{番号}-{概要}` | `docs/issue-5-update-readme` |
| 雑務・設定 | `chore/issue-{番号}-{概要}` | `chore/issue-8-setup-ci` |

概要部分は英小文字・ハイフン区切り・最大30文字。

```bash
git switch main
git pull origin main
git switch -c feat/issue-12-add-task-api
```

### 3. `main` への直接プッシュ禁止

`git push origin main` は絶対に実行しない。
`git push --force` / `git push -f` も禁止。
必ずブランチを作成し、Pull Request 経由でマージする。

### 4. コミットメッセージ規則（Conventional Commits）

形式: `<type>(<scope>): <概要>`

`type` は以下から選択:
- `feat` — 新機能
- `fix` — バグ修正
- `docs` — ドキュメントのみの変更
- `style` — コードの意味に影響しない変更（フォーマット等）
- `refactor` — バグ修正でも機能追加でもないコード変更
- `test` — テストの追加・修正
- `chore` — ビルドプロセス・補助ツールの変更

`scope` は変更対象（`backend`, `frontend`, `db`, `ci`, `docs` 等）

```
# 良い例
feat(backend): タスク一覧取得APIを追加
fix(frontend): タスク削除後に画面が更新されない問題を修正
docs(readme): セットアップ手順を更新
chore(ci): GitHub Actions ワークフローを追加

# 悪い例
updated files
fix bug
作業した
```

### 5. Pull Request のルール

- PR タイトル: コミットメッセージと同じ形式
- PR 本文: 必ず `Closes #<Issue番号>` または `Fixes #<Issue番号>` を含める
- PR テンプレートをすべて埋める（省略不可）
- CI が通過するまでマージしない

---

## 推奨ワークフロー（一連の流れ）

```
1. gh issue create ...                    # Issue 作成、番号を控える
2. git switch -c feat/issue-N-xxx         # main から派生してブランチ作成
3. # 実装
4. git add <files>                        # 変更をステージング
5. git commit -m "feat(scope): 概要"
6. git push origin feat/issue-N-xxx
7. gh pr create ...                       # PR 作成（テンプレート記入）
8. CI 通過を確認
9. GitHub 上でマージ
10. git switch main && git pull origin main
```

---

## プロジェクト構成

```
TaskManagement/
├── frontend/         # React + TypeScript + Vite
├── backend/          # Java 21 + Spring Boot 3 + Gradle
├── docs/             # 要件定義・設計書
├── docker-compose.yml   # PostgreSQL 16
└── CLAUDE.md
```

### フロントエンド開発コマンド

```bash
cd frontend
npm install
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run lint     # Lint チェック
```

### バックエンド開発コマンド

```bash
cd backend
./gradlew build -x test  # ビルド
./gradlew test           # テスト実行（要 DB 起動）
./gradlew bootRun        # 開発サーバー起動
```

### DB 起動

```bash
docker compose up -d
```

---

## やってはいけないこと（禁止事項）

- `git push origin main` — 直接プッシュ禁止
- `git push --force` / `git push -f` — 強制プッシュ禁止
- `git reset --hard` — 作業履歴の破壊禁止
- Issue なしでブランチを作る — Issue First 原則
- テンプレートを空のままで PR を作る — テンプレート記入必須
- CI が赤いままでマージを提案する — CI グリーン必須
