# AI-DLCと仕様駆動開発

AI-DLC（AI開発ライフサイクル）におけるKiro流の仕様駆動開発の実装

## プロジェクトのコンテキスト

### パス
- ステアリング（指針）: `.kiro/steering/`
- 仕様書: `.kiro/specs/`

### ステアリングと仕様書の違い

**ステアリング** (`.kiro/steering/`) - プロジェクト全体のルールとコンテキストでAIをガイドします
**仕様書** (`.kiro/specs/`) - 個々の機能の開発プロセスを形式化します

### アクティブな仕様書
- `.kiro/specs/` を確認して、現在進行中の仕様書をチェックしてください
- `/kiro:spec-status [feature-name]` を使用して進捗を確認できます

## 開発ガイドライン
- 思考プロセスは英語で行い、回答の生成は日本語で行ってください。プロジェクトファイル（例：requirements.md, design.md, tasks.md, research.md, validation reports）に書き込まれるすべてのMarkdownコンテンツは、この仕様書で設定されたターゲット言語（spec.json.languageを参照）で記述する必要があります。
- 毎回プロジェクトをアクティベートしてください。
- オンボーディングされていない場合は、オンボーディングしてください。

## 最小ワークフロー
- フェーズ 0（任意）: `/kiro:steering`, `/kiro:steering-custom`
- フェーズ 1（仕様策定）:
  - `/kiro:spec-init "description"` （初期化）
  - `/kiro:spec-requirements {feature}` （要件定義）
  - `/kiro:validate-gap {feature}` （任意: 既存コードベースとのギャップ分析）
  - `/kiro:spec-design {feature} [-y]` （設計）
  - `/kiro:validate-design {feature}` （任意: 設計レビュー）
  - `/kiro:spec-tasks {feature} [-y]` （タスク分解）
- フェーズ 2（実装）: `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` （任意: 実装後の検証）
- 進捗確認: `/kiro:spec-status {feature}` （いつでも使用可能）

## 開発ルール
- 3段階の承認ワークフロー: 要件定義 → 設計 → タスク分解 → 実装
- 各フェーズで人間のレビューが必要です。意図的にファストトラック（承認スキップ）する場合のみ `-y` を使用してください
- ステアリング（指針）を常に最新に保ち、`/kiro:spec-status` で整合性を確認してください
- ユーザーの指示に正確に従い、その範囲内で自律的に行動してください：必要なコンテキストを収集し、今回の実行で要求された作業をエンドツーエンドで完了させてください。質問は、不可欠な情報が欠けている場合や、指示が決定的に曖昧な場合にのみ行ってください。
- タスクを一つ消化したらSerenaのメモリーを最新化してください。
- また後続するタスクに変更すべき点がないかどうか必ず考慮するようにしてください。
  - もしある場合にはその内容を私に説明し、承認した場合には後続のタスクを更新してください。

## ステアリング設定
- `.kiro/steering/` 全体をプロジェクトメモリとして読み込みます
- デフォルトファイル: `product.md`, `tech.md`, `structure.md`
- カスタムファイルもサポートされています（`/kiro:steering-custom` で管理）
