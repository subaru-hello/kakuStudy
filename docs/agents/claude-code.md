# Claude Code Rules

- Claude Code では hook が使える環境なら、編集後に `npm run verify` または最小限の差分検証を自動実行に寄せる
- hook がない環境でも、最終的な品質ゲートは `npm run verify` とする
- verify 失敗時は、stderr や検証結果を手掛かりに自己修正する
- `AGENTS.md` と `CLAUDE.md` には長文ルールを書かず、共有ルールと差分ルールへ委譲する
