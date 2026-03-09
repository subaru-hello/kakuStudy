# ADR 0007: Delivery Workflow

- Status: `Accepted`
- Date: `2026-03-09`

## Context

今後は設計だけでなく実装も進めるため、変更をどう積み、どうレビューし、どう main に入れるかを先に固定しておく必要がある。
特にこのリポジトリでは、仕様判断を ADR と PRD に残しながら進める運用を採る。

## Decision

- 実装変更は適切な粒度で commit する
- 意味のある進捗ごとに commit を分ける
- 変更は task branch から `main` 向けの PR として出す
- PR description には 5W1H を必ず含める
- PR は approve を経てから `main` に merge する
- 実装中に入った重要な仕様判断や技術判断は、その都度 ADR または PRD に反映する
- 実装完了時には、コード差分だけでなく関連ドキュメントの更新も review 対象に含める

## Commit Granularity

- 1 commit 1 意図を基本とする
- 例として、schema 追加、API 実装、画面反映、テスト追加は分ける
- 無関係な修正は同じ commit や PR に混ぜない

## PR Requirements

- What: 何を変えたか
- Why: なぜ必要か
- Who: 影響対象ユーザー、運用者、開発者
- When: いつ効く変更か、移行タイミング
- Where: 影響範囲、対象画面、対象 API、対象データ
- How: 実装方法、検証方法、ロールバック方法

## Rationale

- commit を小さく保つと review と rollback が容易になる
- PR description を 5W1H で固定すると、仕様意図と変更意図が抜けにくい
- 実装と同時に ADR、PRD を更新することで、後から判断経緯を追いやすい

## Consequences

### Positive

- レビューしやすくなる
- 仕様と実装の乖離が減る
- main へ入る変更の説明責任が明確になる

### Negative

- 小さい変更でも PR 作成コストは発生する
- ドキュメント更新を省けなくなる

## Notes

- approve の実施方法は repository 権限と branch protection に従う
- 自動 merge を使う場合でも、PR description と review 完了を前提にする
