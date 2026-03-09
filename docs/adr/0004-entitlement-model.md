# ADR 0004: Entitlement Model

- Status: `Accepted`
- Date: `2026-03-08`

## Context

最初からサブスク導線を入れるため、購入前後の状態、オフライン時の挙動、認証との関係を先に決める必要がある。

## Decision

- entitlement の状態は以下を採用する
- `anonymous_free`
- `signed_in_free`
- `premium_active`
- `premium_grace`
- `premium_expired`
- 無料利用は匿名で開始できる
- プレミアム購入、復元、同期利用時にはアカウント紐付けを要求する
- オンライン時の権限ソースはサーバー、オフライン時の権限ソースはローカルキャッシュとする
- purchase と restore の結果は Cloudflare Workers で受け、D1 に entitlement を保存する
- 認証導入時の優先候補は `Clerk` とする

## Rationale

- 無料体験の開始障壁を下げられる
- 一方で、同期や復元のようなアカウント前提機能には整合した ID が必要になる
- entitlement を状態として明示すると、UI 制御とオフライン制御を実装しやすい

## Consequences

### Positive

- 匿名体験と将来のアカウント移行を両立できる
- オフラインでも直近の権限に基づく制御が可能になる
- 課金復元と同期の責任境界が明確になる

### Negative

- 匿名から認証済みへの移行設計が必要になる
- grace period と expired の挙動を厳密に決める必要がある

## References

- https://clerk.com/expo-authentication
- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/d1/
