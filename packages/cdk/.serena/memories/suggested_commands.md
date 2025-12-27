# 推奨コマンド

## テスト
```bash
npm test              # 全テストを実行 (Vitest)
npm run build         # TypeScriptをコンパイル
```

## CDK操作
```bash
npm run synth         # CloudFormationテンプレートを生成
cdk synth            # 上記と同じ

npm run deploy        # AWSにデプロイ
cdk deploy           # 上記と同じ

npm run destroy       # デプロイしたスタックを削除
cdk destroy          # 上記と同じ

npm run cdk -- <command>  # 任意のCDKコマンドを実行
```

## 開発ワークフロー
```bash
npm run watch         # TypeScriptを監視モードでコンパイル
```

## システムコマンド (macOS/Darwin)
```bash
ls -la                # ディレクトリの詳細表示
find . -name "*.ts"   # ファイル検索
grep -r "pattern" .   # パターン検索
git status            # Gitステータス確認
```

## デプロイ前チェックリスト
1. `npm test` - 全テストが成功することを確認
2. `npm run build` - TypeScriptのコンパイルエラーがないことを確認
3. `npm run synth` - CloudFormationテンプレートが正しく生成されることを確認
4. `cdk deploy` - AWSにデプロイ
