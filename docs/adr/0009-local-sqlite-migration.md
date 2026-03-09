# ADR 0009: Local SQLite Migration

- Status: `Accepted`
- Date: `2026-03-10`

## Context

現状のローカル保存は SecureStore に 1 件の JSON を丸ごと保存している。
この構造では、オフラインファースト、再編集、段階的な同期、学習履歴の追加が難しい。
一方で既存ユーザーの端末には SecureStore 上のデータが残っている可能性がある。

## Decision

- ローカルの正規ストアは `expo-sqlite` に移行する
- データアクセスは repository 層に集約し、画面は SQL を持たない
- app 起動時に SQLite を初期化する
- 既存の SecureStore データは一度だけ SQLite に移行する
- migration 成功後は legacy key を削除し、migration 完了フラグを残す
- 画面側は `listStudyItems` `getStudyItemById` `saveStudyItem` `deleteStudyItemById` を使う

## Rationale

- 画面から storage 詳細を切り離せる
- 今後の同期、学習履歴、entitlement cache を同じ DB に載せやすい
- legacy data migration を app 起動時に吸収すれば、既存データを落とさずに移行できる

## Consequences

### Positive

- オフライン保存の土台が ADR 0003 と一致する
- 以後の API 実装や sync queue 実装が追加しやすくなる
- 既存ユーザーのデータ継続性を確保できる

### Negative

- 起動時の初期化と migration 失敗ハンドリングが必要になる
- schema 変更時に migration 運用が必要になる
