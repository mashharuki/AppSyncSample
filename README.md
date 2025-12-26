# AppSync + DynamoDB + CDKによるサンプルダッシュボードアプリ

## 概要

このリポジトリは、AppSync + DynamoDB を組み合わせて複数のテーブルを跨いだGraphQL APIをAWS上に作成し、そのAPIを利用してダッシュボードを作成してみる学習目的のリポジトリです。

## シナリオ

複数のテーブルにまたがってDynamoDB上にデータを登録している。

最近、ダッシュボード画面を実装しDynamoDB上のデータを取得したいという需要が出てきたが、テーブル結合ができないのでなんとか代わりの方法がないか模索していたところ、AppSync + DynamoDBという組み合わせを思いついた。

## 技術スタック

- AWS
  - CDK
  - DynamoDB
  - AppSync
  - S3
- フロントエンド
  - React
  - Vite
  - TypeScript
  - GraphQL用のライブラリ
- 全体
  - Biome
  - monorepo
  - pnpm

## Claude Code + cc-sddでSpec駆動開発を実行する方法

```bash
/kiro:spec-impl appsync-multi-table-dashboard 1.1(実行するタスク番号を決める)
```

## mcpの設定ファイルを指定して起動する方法

```bash
claude --mcp-config=./.claude/.mcp.json
```