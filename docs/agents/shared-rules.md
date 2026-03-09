# Shared Agent Rules

## Source Of Truth

- 実行結果、テスト、CI を最優先する
- 次に `Accepted` な ADR を優先する
- 次に `docs/PRD.md` を優先する
- `AGENTS.md` と `CLAUDE.md` はポインタであり、詳細仕様を書かない

## Working Rules

- 変更前に対象領域の ADR、PRD、既存コードを読む
- 追加の意思決定が入るなら、コードより先に ADR または PRD を更新する
- 無関係な変更を混ぜない
- リンター、型チェック、テストを無効化して通さない
- verify 失敗時は設定を弱めず、原因を修正する
- 新しい仕様や回帰は可能な限りテストで固定する
- 既存で test が無い場合でも、変更で壊れやすい箇所には新規テスト追加を優先する

## Validation

- 標準検証コマンドは `npm run verify`
- 個別確認は `npm run typecheck` `npm run lint` `npm run test:ci`
- verify が実行できない場合は、依存関係不足、環境不足、既存失敗のどれかを明示する

## Delivery

- 1 commit 1 意図を基本にする
- PR description は 5W1H を埋める
- main に入る前に review と approve を通す
