# GitHub Copilot Billing Viewer

GitHub公式の「Copilot Billing preview」サイトの提供終了に伴い、GitHub上でダウンロードできるCopilot使用量CSV/TSVをブラウザ上で安全に可視化・分析するために開発されたWebアプリケーションです。

---

## 🌟 主な特徴

- **🔒 100% 完全ローカル・クライアントサイド処理**
  - アップロードされたCSV/TSVファイルは一切サーバーに送信されず、すべて利用者のブラウザ内（JavaScript）でのみパース・集計されます。社内の機密情報や請求データが外部に漏洩する心配はありません。
- **🌓 ダークモード & ライトモード対応**
  - 画面上部のトグルボタン（☀️ / 🌙）でワンクリック切り替え可能。お好みの作業環境に合わせて閲覧できます。
- **📊 充実した可視化ダッシュボード**
  - **KPIサマリー**: 総コスト (Gross Amount)、実質請求額 (Net Amount)、割引/無料枠 (Discount Amount)、消費AIクレジット、総トークン数、キャッシュヒット率、アクティブユーザー数。
  - **日別推移チャート**: 日毎のコスト・クレジット推移やアクティブユーザー数の増減グラフ。
  - **最新モデル別シェア**: Claude Sonnet 5、Claude Sonnet 4.6、Claude 3.7 Sonnet、GPT-5.4、GPT-4o、Gemini 3.8 Flash、o3-mini などの利用比率・コスト割合（円グラフ/横棒グラフ）。
  - **トークン分析**: Input / Output / Cache Read / Cache Write トークンの日別積層推移。
  - **ユーザー別ランキング & ドリルダウン**: 利用上位ユーザーのランキング、ユーザー名クリックによる個別利用推移・モデル内訳モーダル。
  - **コストセンター & リポジトリ分析**: 部署別・リポジトリ別の使用量集計。
  - **明細レコード探索**: ページネーション、カラムソート、検索、フィルタリング。
- **⚡ 即座に試せる最新サンプルデータ搭載**
  - CSVファイルが手元にない場合でも、「サンプルデータ」ボタンをクリックするだけで、Claude Sonnet 5の実例データを含むリアルな最新デモデータを即座にプレビューできます。
- **📥 CSVエクスポート機能**
  - フィルタリングされた明細や、ユーザー別・モデル別・コストセンター別の集計結果をワンクリックでCSVダウンロード可能。

---

## 🚀 起動方法

### 開発サーバーの起動

```bash
npm install
npm run dev
```

ブラウザで表示されるローカルURL（通常 `http://localhost:5173/`）にアクセスしてください。

### プロダクションビルド

```bash
npm run build
```

`dist/` ディレクトリに静的ファイル（HTML/CSS/JS）が生成されます。GitHub Pages、S3、社内Webサーバーなど、あらゆる静的ホスティング環境でそのまま配信可能です。

---

## 📋 対応しているCSVカラム

GitHubからエクスポートされる以下のカラム形式に完全対応しています（大文字小文字やアンダースコア/スペースの違いも自動判定）：

| カラム名 | 説明 | 例 |
| :--- | :--- | :--- |
| `date` | 利用日 | `2026/8/7` |
| `username` | 利用ユーザーID | `user001` |
| `product` | プロダクト | `copilot` |
| `sku` | SKU | `copilot_ai_credit` |
| `model` | AIモデル名 | `Claude Sonnet 5` / `GPT-5.4` / `Gemini 3.8 Flash` など |
| `quantity` | 数量（AIクレジット数等） | `597.55188` |
| `unit_type` | 単位 | `ai-credits` |
| `applied_cost_per_quantity` | 単価 | `0.01` |
| `gross_amount` | 定価換算総額 ($) | `5.9755188` |
| `discount_amount` | 割引/割当額 ($) | `5.9755188` |
| `net_amount` | 実質請求額 ($) | `0` |
| `total_monthly_quota` | 月間クォータ | `1900` |
| `organization` | 組織名 | `aaaaaa` |
| `repository` | リポジトリ名 | `backend-service` |
| `cost_center_name` | コストセンター名 | `Engineering` |
| `aic_quantity` | AIC数量 | `0` |
| `aic_gross_amount` | AIC総額 | `0` |
| `input` | 入力トークン数 | `15325` |
| `output` | 出力トークン数 | `84650` |
| `cache_read` | キャッシュ読み込みトークン数 | `16113319` |
| `cache_write` | キャッシュ書き込みトークン数 | `750282` |

---

## 🛠 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 8
- **スタイリング**: Tailwind CSS v4
- **グラフ描画**: Recharts
- **CSVパース**: PapaParse
- **アイコン**: Lucide React
