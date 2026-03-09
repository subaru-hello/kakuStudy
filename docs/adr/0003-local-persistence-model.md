# ADR 0003: Local Persistence Model

- Status: `Accepted`
- Date: `2026-03-08`

## Context

このアプリはオフラインファーストであり、教材、マスク、学習履歴、同期キューをローカルに保持する必要がある。
既存実装は key-value 保存で成り立っているが、今後はデータ構造が増え、更新粒度も細かくなる。

## Decision

- ローカルの正規データストアは `expo-sqlite` とする
- 教材、マスク、学習イベント、同期キューは SQLite のテーブルとして持つ
- 小さなフラグや軽量キャッシュには `expo-sqlite/kv-store` を使ってよい
- `SecureStore` は認証トークン、復元に必要な秘密情報などの限定用途にする
- `react-native-mmkv` は今回の正規ストアには採用しない

## Proposed Local Tables

- `study_items`
- `study_masks`
- `study_sessions`
- `sync_queue`
- `entitlement_cache`

## Rationale

- `expo-sqlite` は Expo 公式の SQLite 実装で、SQL、prepared statements、SQLite ベースの kv-store を提供している
- このアプリは 1 件の JSON を丸ごと保存するより、教材とマスクを正規化した方が整合性と編集性が高い
- MMKV は高速だが key-value 中心で、今回必要な関連データや検索条件の扱いには不向き
- Expo ベースのプロジェクトとして、追加のネイティブ前提を増やしすぎない方が保守しやすい

## Consequences

### Positive

- オフライン時の CRUD と再編集が扱いやすくなる
- 同期キューや学習履歴を同じストアで扱える
- 位置ズレ修正やデータ移行の実装がしやすくなる

### Negative

- スキーマ設計と migration が必要になる
- key-value 一発保存より初期実装は重くなる

## References

- https://docs.expo.dev/versions/latest/sdk/sqlite/
- https://github.com/mrousavy/react-native-mmkv
