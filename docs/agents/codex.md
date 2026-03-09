# Codex Rules

- Codex では reactive hook を前提にしない
- ファイル編集後の品質担保は `npm run verify` と CI で行う
- verify で失敗した場合は、失敗箇所をもとに追加修正する
- PRD と ADR の更新が必要な変更では、ドキュメント更新を同じ作業単位で行う
- batch 実行を前提に、最終的な差分説明では実行した検証結果を明記する
