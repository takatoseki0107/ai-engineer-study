---
name: quality-check
description: フロントエンド（ESLint・型チェック）、バックエンド（Checkstyle・ビルド）、Terraform（fmt・validate）の品質チェックを順番に実行し、エラーがあれば修正する。
---

# 品質チェックスキル

コードを PR にまとめる前や実装後に実行する品質レビューポイント。
**必ずすべてのステップを順番に実行し、エラーがなくなるまで修正すること。**

## チェック項目一覧

| # | 対象 | ツール | コマンド | チェック内容 |
|---|------|--------|---------|------------|
| 1 | フロントエンド | ESLint | `npm run lint` | コードスタイル・React Hooks ルール |
| 2 | フロントエンド | TypeScript | `npx tsc --noEmit` | 型エラー（strict モード） |
| 3 | バックエンド | Checkstyle | `./gradlew checkstyleMain` | Java コードスタイル（v10.21.4） |
| 4 | バックエンド | Gradle | `./gradlew build -x test` | コンパイル・アセンブル確認 |
| 5 | Terraform | fmt | `terraform fmt -check -recursive` | HCL フォーマット規則 |
| 6 | Terraform | validate | `terraform validate` | 構成の構文・参照整合性 |

---

## 実行手順

### Step 1: フロントエンド ESLint

```bash
cd /Users/setakato/TaskManagement/frontend
npm run lint
```

**エラーが出た場合:**
- 自動修正可能なものは `npm run lint -- --fix` で修正する
- 手動修正が必要なものはコードを修正してから再実行する
- `eslint-disable` コメントによる握りつぶしは禁止

### Step 2: フロントエンド 型チェック

```bash
cd /Users/setakato/TaskManagement/frontend
npx tsc --noEmit
```

**エラーが出た場合:**
- 型エラーを実装で解消する（`as any` / `@ts-ignore` による抑制は禁止）
- 外部ライブラリの型が不足している場合は `@types/*` パッケージを追加する

### Step 3: バックエンド Checkstyle

```bash
cd /Users/setakato/TaskManagement/backend
./gradlew checkstyleMain
```

レポートは `backend/build/reports/checkstyle/main.html` に出力される。

**エラーが出た場合:**
- レポートを確認して違反箇所を特定する
- インデント・命名規則・空白・インポート順などを修正する
- Checkstyle 設定ファイルは `backend/config/checkstyle/checkstyle.xml` を参照する

### Step 4: バックエンド ビルド確認

```bash
cd /Users/setakato/TaskManagement/backend
./gradlew build -x test
```

**エラーが出た場合:**
- コンパイルエラーはエラーメッセージを確認して実装を修正する
- キャッシュが原因と思われる場合は `./gradlew clean build -x test` を実行する

### Step 5: Terraform フォーマットチェック

```bash
cd /Users/setakato/TaskManagement/terraform
terraform fmt -check -recursive
```

**エラーが出た場合:**
- `terraform fmt -recursive` を実行してフォーマットを自動修正する
- 修正後に `terraform fmt -check -recursive` を再実行してグリーンを確認する

### Step 6: Terraform 構成検証

```bash
cd /Users/setakato/TaskManagement/terraform
terraform validate
```

**エラーが出た場合:**
- エラーメッセージに記載されたファイルと行番号を確認して修正する
- 変数参照・モジュール間の依存・リソース属性名の誤りが主な原因

---

## 修正フロー

```
Step 1 実行
    │
    ├── エラーあり → 修正 → Step 1 再実行（グリーンになるまで）
    │
    ▼
Step 2 実行
    │
    ├── エラーあり → 修正 → Step 2 再実行（グリーンになるまで）
    │
    ▼
Step 3 実行
    │
    ├── エラーあり → レポート確認 → 修正 → Step 3 再実行（グリーンになるまで）
    │
    ▼
Step 4 実行
    │
    ├── エラーあり → 修正 → Step 4 再実行（グリーンになるまで）
    │
    ▼
Step 5 実行
    │
    ├── エラーあり → terraform fmt -recursive → Step 5 再実行
    │
    ▼
Step 6 実行
    │
    ├── エラーあり → 修正 → Step 6 再実行（グリーンになるまで）
    │
    ▼
全ステップ グリーン → 完了
```

---

## 完了条件

以下がすべて達成されていること:

- [ ] `npm run lint` — エラー0件
- [ ] `npx tsc --noEmit` — エラー0件
- [ ] `./gradlew checkstyleMain` — BUILD SUCCESSFUL
- [ ] `./gradlew build -x test` — BUILD SUCCESSFUL
- [ ] `terraform fmt -check -recursive` — 差分なし
- [ ] `terraform validate` — Success!

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `npm run lint` でコマンドが見つからない | `cd frontend && npm install` を実行してから再試行 |
| `npx tsc` でバージョンエラー | `npx tsc --version` で確認。`frontend/node_modules` が存在しない場合は `npm install` |
| Checkstyle が設定ファイルを見つけられない | `backend/config/checkstyle/checkstyle.xml` が存在するか確認 |
| Gradle ビルドがキャッシュ起因で失敗 | `./gradlew clean build -x test` でクリーンビルド |
| `terraform validate` でモジュールが見つからない | `terraform init` を実行してプロバイダーを再取得する |
