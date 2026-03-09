# ADR 0005: Sync Model

- Status: `Accepted`
- Date: `2026-03-09`

## Context

このアプリはオフラインファーストであり、ローカルだけで学習が完結しなければならない。
一方で、プレミアムには同期とバックアップを含めるため、ローカル更新とクラウド同期の責任分離を先に定める必要がある。

## Decision

- ローカルデータを操作時の一次ソースとする
- クラウドは複数端末共有とバックアップのための同期先とする
- 同期対象は認証済みユーザーのみとする
- 同期単位は `study item` とし、マスク単位ではなく教材全体の snapshot を送る
- すべてのローカル更新は `sync_queue` に append する
- 各同期イベントは `op_id` `device_id` `study_item_id` `revision` `updated_at` を持つ
- 画像本体は `R2`、教材メタデータとマスク情報は `Workers -> D1` に保存する
- 削除は hard delete ではなく tombstone として同期する
- 競合解決は初期実装では `study item` 単位の last-write-wins とする
- 同期は app foreground、保存完了、ネットワーク復帰、手動再試行で発火する
- 非同期の派生処理は `Queues`、複数段階の回復処理や再実行制御は `Workflows` を使う

## Sync Flow

- ユーザー操作でローカル SQLite を更新する
- 同時に `sync_queue` にイベントを積む
- オンライン時に Worker API へ順次送信する
- 画像が未アップロードなら先に R2 へ送る
- API は `op_id` を使って冪等に処理する
- 成功時にローカル queue を ack し、server revision を保存する
- 失敗時は queue を保持したまま再試行する

## Rationale

- UI の即時性を保ちながら、同期を後追いにできる
- このアプリでは同時共同編集より、単一ユーザーの複数端末利用が中心なので、教材単位の snapshot 同期で十分に単純化できる
- マスク 1 つずつを operation 化するより、教材全体 revision の方がデバッグしやすい
- tombstone を使うことで削除済み教材の復活を防げる

## Consequences

### Positive

- オフライン時でも学習体験が止まらない
- 同期失敗時の復旧経路が単純になる
- サーバー側の API と DB モデルを薄く保てる

### Negative

- 同じ教材を複数端末で連続編集した場合、先の変更が上書きされる可能性がある
- snapshot 同期なので、大きい教材では差分同期より転送量が増える

## Follow-Up

- `study item` revision の採番方式を決める
- tombstone 保持期間を決める
- 手動コンフリクト解決 UI が必要かを後で再判断する

## References

- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/d1/
- https://developers.cloudflare.com/r2/how-r2-works/
- https://developers.cloudflare.com/queues/
- https://developers.cloudflare.com/workflows/
