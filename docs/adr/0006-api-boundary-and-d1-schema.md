# ADR 0006: API Boundary And D1 Schema

- Status: `Accepted`
- Date: `2026-03-09`

## Context

同期モデルが固まったため、次は API の責務と D1 の保存構造を決める必要がある。
このアプリは UI から見た CRUD ではなく、オフライン同期、画像アップロード、entitlement 参照が本質的なバックエンド責務になる。

## Decision

- API は screen 単位ではなく capability 単位で分ける
- v1 の API 領域は `entitlement` `uploads` `sync` `me` に限定する
- バイナリ画像は `R2`、構造化データは `D1` に保存する
- D1 は正規化しすぎず、`study item + masks` を中心に置く
- 同期の push は `study item snapshot` 単位で扱う
- サーバー側は `op_id` による冪等性を必須とする
- pull は `cursor` ベースの変更取得とする
- Worker は認証、入力検証、冪等制御、D1 書き込み、R2 アップロード許可を担当する

## API Surface

- `GET /v1/me`
- `GET /v1/entitlement`
- `POST /v1/uploads/request`
- `POST /v1/sync/push`
- `GET /v1/sync/pull`

## D1 Tables

- `users`
- `devices`
- `study_items`
- `study_masks`
- `study_sessions`
- `entitlements`
- `sync_ops`

## Rationale

- capability 単位の API にすると、モバイル UI の変化で API が崩れにくい
- 画像バイナリを D1 に入れず R2 に分離することで、同期処理と保存コストを抑えやすい
- snapshot push と cursor pull の組み合わせが、オフラインファーストの実装に最も素直である

## Consequences

### Positive

- API の責務が明確になる
- D1 スキーマとアプリのローカルモデルを対応づけやすい
- idempotency と tombstone を API レベルで扱いやすい

### Negative

- pull cursor と op ledger の管理が必要になる
- study item 単位の同期なので、細粒度差分より転送量は増える

## Follow-Up

- Clerk 導入時の `users` 生成タイミングを決める
- store purchase と `entitlements` 更新の webhook 設計を切る
- D1 migration の運用ルールを決める

## References

- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/d1/
- https://developers.cloudflare.com/r2/how-r2-works/
