# Agent Entry

このファイルはポインタです。詳細は以下だけを読むこと。

1. `docs/agents/shared-rules.md`
2. `docs/agents/codex.md`
3. `docs/PRD.md`
4. `docs/adr/` 配下の `Accepted` な ADR

## Startup Routine

- まず変更対象に関係する ADR と PRD だけを読む
- 実装前に、追加の判断が入るなら ADR または PRD を更新する
- 変更後は `npm run verify` を実行する
- verify が通らない、または実行できない場合は理由を明示する
- 変更は小さい commit に分け、PR では 5W1H を埋める
