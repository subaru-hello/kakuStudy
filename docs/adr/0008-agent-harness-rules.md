# ADR 0008: Agent Harness Rules

- Status: `Accepted`
- Date: `2026-03-09`

## Context

Codex と Claude Code の両方で安全に開発を進めるには、長い自然言語ルールを増やすより、短いポインタ、決定論的な検証、共有ルールと agent 別ルールの分離が重要になる。

## Decision

- `AGENTS.md` と `CLAUDE.md` は短いポインタとして運用する
- 共有ルールは `docs/agents/shared-rules.md` に集約する
- agent 固有ルールは `docs/agents/codex.md` と `docs/agents/claude-code.md` に分離する
- リポジトリで強制できる品質ゲートは `npm run verify` と CI に寄せる
- 仕様判断は PRD と ADR に残し、agent ルールへ長文で重複記述しない

## Rationale

- ポインタ型にすると腐敗が機械的に検出しやすい
- 共通ルールと差分を分けることで、agent 間で整合を保ちやすい
- Codex は reactive hook 前提ではないため、batch verify と CI を主軸にした方が堅い
- Claude Code は hook を活用できるが、hook がなくても同じ verify コマンドで運用できるようにしておく方が portable である

## Consequences

### Positive

- ルールの重複が減る
- Codex と Claude Code のどちらでも同じ品質ゲートを使える
- PRD、ADR、テスト、CI が source of truth として機能しやすくなる

### Negative

- ルールを読む入口が複数ファイルに分かれる
- hook 連携そのものは Claude Code 側の環境設定に依存する

## References

- https://nyosegawa.github.io/posts/harness-engineering-best-practices-2026/
