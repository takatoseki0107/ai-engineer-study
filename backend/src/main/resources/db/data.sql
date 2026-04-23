INSERT INTO tasks (title, description, priority, status, due_date, position, created_at, updated_at)
SELECT '要件定義を完了する', 'プロジェクトの要件をドキュメントにまとめる', 'high', 'done', '2026-04-01', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = '要件定義を完了する');

INSERT INTO tasks (title, description, priority, status, due_date, position, created_at, updated_at)
SELECT 'バックエンドAPIを実装する', 'Spring BootでREST APIを構築する', 'high', 'in_progress', '2026-04-30', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'バックエンドAPIを実装する');

INSERT INTO tasks (title, description, priority, status, due_date, position, created_at, updated_at)
SELECT 'フロントエンドを実装する', 'React + TypeScript でUIを構築する', 'medium', 'todo', '2026-05-15', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'フロントエンドを実装する');

INSERT INTO tasks (title, description, priority, status, due_date, position, created_at, updated_at)
SELECT 'E2Eテストを書く', 'PlaywrightでE2Eテストを追加する', 'low', 'todo', '2026-05-31', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'E2Eテストを書く');

INSERT INTO tasks (title, description, priority, status, due_date, position, created_at, updated_at)
SELECT 'デプロイ設定を行う', 'Dockerコンテナを本番環境にデプロイする', 'medium', 'todo', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'デプロイ設定を行う');
