# タスク完了時のチェックリスト

## 必須ステップ
1. ✅ **テストを実行**: `npm test`
   - 全97テストが成功することを確認
   - テストが失敗した場合は修正してから次に進む

2. ✅ **TypeScriptのビルド**: `npm run build`
   - コンパイルエラーがないことを確認
   - 型エラーがあれば修正する

3. ✅ **CloudFormationテンプレート生成**: `npm run synth`
   - エラーなくシンセサイズできることを確認
   - 生成されたテンプレートを確認 (`cdk.out/`)

## デプロイ前の確認
4. ✅ **変更内容の確認**:
   - `git status` で変更ファイルを確認
   - `git diff` で変更内容をレビュー

5. ✅ **リゾルバーの構文チェック**:
   - `util.dynamodb.toMapValues()`を使用しているか
   - Pipeline Functionで`ctx.stash`を使用しているか
   - エラーハンドリングが適切か

## デプロイ
6. ✅ **デプロイ実行**: `cdk deploy`
   - 両方のスタックが成功することを確認
   - AppSyncSampleDynamoDBStack
   - AppSyncSampleAppSyncStack

7. ✅ **デプロイ後の確認**:
   - GraphQL API URLとAPI Keyが出力されることを確認
   - CloudFormation Outputsを確認

## コミット (必要に応じて)
8. ✅ **変更をコミット**:
   ```bash
   git add .
   git commit -m "説明的なコミットメッセージ"
   ```

## メモリーの更新 (Serena使用時)
9. ✅ **Serenaメモリーを更新**:
   - 重要な実装パターンを記録
   - 解決した問題と解決方法を記録
   - 後続タスクに影響する変更を記録

## トラブルシューティング
### テストが失敗した場合
- エラーメッセージを確認
- 関連するテストファイルを確認
- 変更したコードとテストの整合性を確認

### デプロイが失敗した場合
- CloudFormationのエラーメッセージを確認
- AWSドキュメントで正しい構文を確認
- リゾルバーコードの構文エラーをチェック

### よくあるエラー
1. **DynamoDB KeySchemaエラー**: partitionKeyとsortKeyが同じ名前
2. **AppSyncリゾルバーエラー**: VTL形式を使用している
3. **Pipeline Functionエラー**: `ctx.arguments`に直接アクセスしている
4. **PutItemエラー**: `item`パラメータを使用している
5. **BatchGetItemエラー**: `{ keys, consistentRead }`形式を使用している
